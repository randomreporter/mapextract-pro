FROM node:20

WORKDIR /app

# Install scraper dependencies and chromium with OS dependencies
COPY scraper/package*.json ./scraper/
RUN cd scraper && npm install
RUN npx playwright install --with-deps chromium

# Install backend dependencies
COPY backend/package*.json ./backend/
RUN cd backend && npm install

# Copy source files
COPY scraper/ ./scraper/
COPY backend/ ./backend/

EXPOSE 3001

CMD ["node", "./backend/server.js"]
