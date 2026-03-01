import Link from 'next/link';
import { Check } from 'lucide-react';

const tiers = [
    {
        name: 'Free',
        id: 'tier-free',
        href: '/search',
        priceMonthly: '$0',
        description: 'Perfect for testing the waters and small projects.',
        features: ['100 results per month', 'CSV export only', '1 concurrent job', 'Standard support'],
        mostPopular: false,
        cta: 'Start for free'
    },
    {
        name: 'Starter',
        id: 'tier-starter',
        href: '#',
        priceMonthly: '$19',
        description: 'Ideal for independent marketers and local agencies.',
        features: [
            '3,000 results per month',
            'Excel & CSV exports',
            'Hyperlinks included',
            '5 concurrent jobs',
            'Priority email support'
        ],
        mostPopular: true,
        cta: 'Upgrade to Starter'
    },
    {
        name: 'Pro',
        id: 'tier-pro',
        href: '#',
        priceMonthly: '$49',
        description: 'For power users needing bulk data continuously.',
        features: [
            '15,000 results per month',
            'Excel & CSV exports',
            'Unlimited concurrent jobs',
            'Batch processing mode',
            '24/7 Priority support'
        ],
        mostPopular: false,
        cta: 'Upgrade to Pro'
    },
]

export default function PricingPage() {
    return (
        <div className="bg-slate-50 py-24 sm:py-32">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="mx-auto max-w-4xl text-center">
                    <h2 className="text-base font-semibold leading-7 text-blue-600">Pricing</h2>
                    <p className="mt-2 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
                        Pricing plans that scale with you
                    </p>
                </div>
                <p className="mx-auto mt-6 max-w-2xl text-center text-lg leading-8 text-slate-600">
                    No hidden fees or complex APIs. Just pure data extraction power. Every plan includes our anti-detection technology to ensure reliable results.
                </p>
                <div className="isolate mx-auto mt-16 grid max-w-md grid-cols-1 gap-y-8 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-3 lg:gap-x-8 lg:gap-y-0">
                    {tiers.map((tier) => (
                        <div
                            key={tier.id}
                            className={`rounded-3xl p-8 xl:p-10 ${tier.mostPopular ? 'ring-2 ring-blue-600 bg-white scale-105 shadow-xl shadow-blue-900/5' : 'ring-1 ring-slate-200 bg-white/60'}`}
                        >
                            <div className="flex items-center justify-between gap-x-4">
                                <h3
                                    id={tier.id}
                                    className={`text-lg font-semibold leading-8 ${tier.mostPopular ? 'text-blue-600' : 'text-slate-900'}`}
                                >
                                    {tier.name}
                                </h3>
                                {tier.mostPopular ? (
                                    <p className="rounded-full bg-blue-100/50 px-2.5 py-1 text-xs font-semibold leading-5 text-blue-600">
                                        Most popular
                                    </p>
                                ) : null}
                            </div>
                            <p className="mt-4 text-sm leading-6 text-slate-600">{tier.description}</p>
                            <p className="mt-6 flex items-baseline gap-x-1">
                                <span className="text-4xl font-bold tracking-tight text-slate-900">{tier.priceMonthly}</span>
                                <span className="text-sm font-semibold leading-6 text-slate-600">/mo</span>
                            </p>
                            <Link
                                href={tier.href}
                                aria-describedby={tier.id}
                                className={`mt-6 block rounded-xl px-3 py-3 text-center text-sm font-semibold leading-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${tier.mostPopular
                                        ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md focus-visible:outline-blue-600'
                                        : 'bg-white text-blue-600 ring-1 ring-inset ring-blue-200 hover:ring-blue-300 hover:bg-blue-50'
                                    }`}
                            >
                                {tier.cta}
                            </Link>
                            <ul role="list" className="mt-8 space-y-3 text-sm leading-6 text-slate-600 xl:mt-10">
                                {tier.features.map((feature) => (
                                    <li key={feature} className="flex gap-x-3 text-slate-700">
                                        <Check className={`h-6 w-5 flex-none ${tier.mostPopular ? 'text-blue-600' : 'text-blue-500'}`} aria-hidden="true" />
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
