import type { DimensionKey, MetricDefinition, MetricKey, TimeGrouping } from '../types/analytics';

export const metricDefinitions: MetricDefinition[] = [
  {
    key: 'impressions',
    label: 'Impressions',
    shortLabel: 'Impressions',
    group: 'big-happy',
    chartType: 'bar',
    axis: 'count',
    color: '#243f7d',
  },
  {
    key: 'clicks',
    label: 'Clicks',
    shortLabel: 'Clicks',
    group: 'big-happy',
    chartType: 'bar',
    axis: 'count',
    color: '#9a7410',
  },
  {
    key: 'qr_clicks',
    label: 'QR Clicks',
    shortLabel: 'QR Clicks',
    group: 'big-happy',
    chartType: 'bar',
    axis: 'count',
    color: '#805900',
  },
  {
    key: 'ctr',
    label: 'CTR',
    shortLabel: 'CTR',
    group: 'big-happy',
    chartType: 'line',
    axis: 'percentage',
    color: '#a37800',
  },
  {
    key: 'vcr',
    label: 'VCR',
    shortLabel: 'VCR',
    group: 'big-happy',
    chartType: 'line',
    axis: 'percentage',
    color: '#4f7c60',
  },
  {
    key: 'time_spent',
    label: 'Time Spent',
    shortLabel: 'Time Spent',
    group: 'big-happy',
    chartType: 'line',
    axis: 'duration',
    color: '#3678b6',
  },
  {
    key: 'ssp_spend',
    label: 'SSP Spend',
    shortLabel: 'SSP Spend',
    group: 'third-party',
    chartType: 'bar',
    axis: 'amount',
    color: '#667085',
  },
  {
    key: 'ssp_impressions',
    label: 'SSP Impressions',
    shortLabel: 'SSP Impressions',
    group: 'third-party',
    chartType: 'bar',
    axis: 'count',
    color: '#516a9f',
  },
  {
    key: 'revenue',
    label: 'Revenue',
    shortLabel: 'Revenue',
    group: 'third-party',
    chartType: 'bar',
    axis: 'amount',
    color: '#344562',
  },
];

export const metricDefinitionMap = Object.fromEntries(
  metricDefinitions.map((definition) => [definition.key, definition]),
) as Record<MetricKey, MetricDefinition>;

export const dimensionLabels: Record<DimensionKey, string> = {
  packages: 'Packages',
  placements: 'Placements',
  targeting: 'Targeting',
  creative: 'Creative',
  format: 'Product',
};

export const groupingLabels: Record<TimeGrouping, string> = {
  day: 'Date range',
  week: 'Week',
  month: 'Month',
  quarter: 'Quarter',
  weekday: 'Days of the week',
};

export const navigationItems = [
  'Sales',
  'Strategy',
  'AM',
  'PAS',
  'Creative Gallery',
  'Park Ranger',
  'Benchmarks',
  'Sync',
  'User Admin',
  'Activity Logs',
] as const;
