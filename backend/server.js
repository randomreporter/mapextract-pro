const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');
const { scrapeMaps } = require('../scraper/mapScraper');
const { exportExcel, exportCSV } = require('../scraper/exporter');

const { createClient } = require('@supabase/supabase-js');
const { Queue, Worker } = require('bullmq');
const IORedis = require('ioredis');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;

// Redis Connection (Upstash)
const redisConnection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', {
    maxRetriesPerRequest: null
});

// Setup Scrape Queue
const scrapeQueue = new Queue('scrapeQueue', { connection: redisConnection });

// Supabase Connection
const supabaseUrl = process.env.SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || 'placeholder';
const supabase = createClient(supabaseUrl, supabaseKey);

// In-memory job store fallback if DB fails
const jobs = new Map();

app.get('/health', (req, res) => {
    res.json({ status: 'ok', uptime: process.uptime() });
});

app.post('/api/scrape', async (req, res) => {
    const { keyword, location, maxResults = 10 } = req.body;

    if (!keyword || !location) {
        return res.status(400).json({ error: 'keyword and location are required' });
    }

    const jobId = uuidv4();
    jobs.set(jobId, {
        id: jobId,
        status: 'queued',
        progress: 0,
        results: [],
        error: null,
        createdAt: new Date().toISOString()
    });

    // Add job to BullMQ
    await scrapeQueue.add('scrapeMap', {
        jobId,
        keyword,
        location,
        maxResults,
        proxyUrl: process.env.PROXY_URL
    });

    res.status(202).json({ jobId });
});

// Worker to process jobs
const worker = new Worker('scrapeQueue', async jobData => {
    const { jobId, keyword, location, maxResults, proxyUrl } = jobData.data;
    const job = jobs.get(jobId);
    if (job) job.status = 'running';

    try {
        const results = await scrapeMaps({ keyword, location, maxResults, proxyUrl });
        if (job) {
            job.status = 'done';
            job.results = results;
            job.progress = 100;
        }
    } catch (error) {
        if (job) {
            job.status = 'failed';
            job.error = error.message;
        }
        throw error;
    }
}, { connection: redisConnection, concurrency: 3 });

worker.on('failed', (job, err) => {
    console.error(`Job ${job?.id || 'unknown'} failed with error: ${err.message}`);
});

app.get('/api/jobs', (req, res) => {
    const jobsList = Array.from(jobs.values()).map(job => ({
        id: job.id,
        status: job.status,
        resultCount: job.results.length,
        createdAt: job.createdAt
    }));
    res.json(jobsList);
});

app.get('/api/jobs/:id', (req, res) => {
    const job = jobs.get(req.params.id);
    if (!job) {
        return res.status(404).json({ error: 'Job not found' });
    }
    res.json(job);
});

app.get('/api/jobs/:id/export', async (req, res) => {
    const job = jobs.get(req.params.id);
    if (!job) {
        return res.status(404).json({ error: 'Job not found' });
    }
    if (job.status !== 'done') {
        return res.status(400).json({ error: 'Job is not complete yet' });
    }

    const format = req.query.format || 'xlsx';
    const filename = `job_${job.id}_${Date.now()}`;

    try {
        let filePath;
        if (format === 'csv') {
            filePath = await exportCSV(job.results, filename);
        } else {
            filePath = await exportExcel(job.results, filename);
        }
        res.download(filePath, `${filename}.${format}`, (err) => {
            if (err) console.error("Download error:", err);
            // Delete temp file after download
            setTimeout(() => {
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            }, 5000);
        });
    } catch (e) {
        res.status(500).json({ error: 'Failed to generate export' });
    }
});

app.listen(PORT, () => {
    console.log(`MapExtract API running on port ${PORT}`);
});
