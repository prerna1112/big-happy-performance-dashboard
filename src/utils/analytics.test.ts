import { describe, expect, it } from 'vitest';
import {
  aggregateAnalytics,
  calculateMetricTrend,
  escapeCsvCell,
  formatMetricValue,
  summarizeMetric,
} from './analytics';
import type { AnalyticsEntity } from '../types/analytics';

const entities: AnalyticsEntity[] = [
  {
    id: 'one',
    name: 'Package One',
    dimension: 'packages',
    metrics: [
      {
        date: '2026-01-01',
        impressions: 100,
        clicks: 10,
        qr_clicks: 2,
        vcr: 50,
        time_spent: 10,
        ssp_spend: 25,
        ssp_impressions: 90,
        revenue: 30,
      },
      {
        date: '2026-01-02',
        impressions: 300,
        clicks: 15,
        qr_clicks: 3,
        vcr: 70,
        time_spent: 20,
        ssp_spend: 40,
        ssp_impressions: 280,
        revenue: 50,
      },
    ],
  },
  {
    id: 'two',
    name: 'Package Two',
    dimension: 'packages',
    metrics: [
      {
        date: '2026-01-01',
        impressions: 100,
        clicks: 5,
        qr_clicks: 1,
        vcr: 60,
        time_spent: 30,
        ssp_spend: 20,
        ssp_impressions: 95,
        revenue: 22,
      },
    ],
  },
];

describe('analytics aggregation', () => {
  it('aggregates additive values and derives rates from totals', () => {
    const data = aggregateAnalytics(entities, 'day', '2026-01-01', '2026-01-02');

    expect(data).toHaveLength(2);
    expect(data[0]).toMatchObject({ impressions: 200, clicks: 15, ctr: 7.5, ssp_spend: 45 });
    expect(data[0]?.vcr).toBe(55);
    expect(data[0]?.breakdown['Package One']?.impressions).toBe(100);
    expect(summarizeMetric(data, 'ctr')).toBe(6);
    expect(calculateMetricTrend(data, 'impressions')).toBe(50);
  });

  it('groups records and respects inclusive date boundaries', () => {
    const data = aggregateAnalytics(entities, 'week', '2026-01-02', '2026-01-02');

    expect(data).toHaveLength(1);
    expect(data[0]?.impressions).toBe(300);
  });

  it('orders month and weekday buckets and handles zero-impression rates', () => {
    const monthData = aggregateAnalytics(entities, 'month', '2026-01-01', '2026-01-02');
    const weekdayData = aggregateAnalytics(entities, 'weekday', '2026-01-01', '2026-01-02');
    const zeroEntity: AnalyticsEntity = {
      id: 'zero',
      name: 'Zero',
      dimension: 'packages',
      metrics: [
        {
          date: '2026-01-01',
          impressions: 0,
          clicks: 0,
          qr_clicks: 0,
          vcr: 75,
          time_spent: 20,
          ssp_spend: 0,
          ssp_impressions: 0,
          revenue: 0,
        },
      ],
    };
    const zeroData = aggregateAnalytics([zeroEntity], 'day', '2026-01-01', '2026-01-01');

    expect(monthData.map((datum) => datum.bucket)).toEqual(['Jan 2026']);
    expect(weekdayData.map((datum) => datum.bucket)).toEqual(['Thu', 'Fri']);
    expect(zeroData[0]).toMatchObject({ ctr: 0, vcr: 0, time_spent: 0 });
  });

  it('groups quarter data and returns an empty result outside the available range', () => {
    const quarterData = aggregateAnalytics(entities, 'quarter', '2026-01-01', '2026-01-02');
    const emptyData = aggregateAnalytics(entities, 'day', '2027-01-01', '2027-01-31');

    expect(quarterData).toHaveLength(1);
    expect(quarterData[0]).toMatchObject({ bucket: 'Q1 2026', impressions: 500, clicks: 30 });
    expect(emptyData).toEqual([]);
  });

  it('calculates weighted summaries and positive, negative, and zero-baseline trends', () => {
    const data = aggregateAnalytics(entities, 'day', '2026-01-01', '2026-01-02');

    expect(summarizeMetric(data, 'vcr')).toBe(64);
    expect(summarizeMetric(data, 'time_spent')).toBe(20);
    expect(
      calculateMetricTrend(
        [
          { ...data[0]!, clicks: 10 },
          { ...data[1]!, clicks: 5 },
        ],
        'clicks',
      ),
    ).toBe(-50);
    expect(calculateMetricTrend([], 'clicks')).toBe(0);
    expect(
      calculateMetricTrend(
        [
          { ...data[0]!, clicks: 0 },
          { ...data[1]!, clicks: 4 },
        ],
        'clicks',
      ),
    ).toBe(100);
  });
});

describe('analytics formatting', () => {
  it('formats metric types and escapes CSV cells', () => {
    expect(formatMetricValue('ctr', 3.25)).toBe('3.3%');
    expect(formatMetricValue('ssp_spend', 42)).toBe('$42.00');
    expect(formatMetricValue('ssp_spend', 2750, true)).toBe('$2.8K');
    expect(formatMetricValue('time_spent', 42.6)).toBe('43s');
    expect(formatMetricValue('impressions', 12500, true)).toBe('12.5K');
    expect(escapeCsvCell('Package, One')).toBe('"Package, One"');
    expect(escapeCsvCell('A "quoted" value')).toBe('"A ""quoted"" value"');
    expect(escapeCsvCell('Line one\nLine two')).toBe('"Line one\nLine two"');
  });
});
