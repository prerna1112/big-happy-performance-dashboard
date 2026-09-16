import { metricDefinitionMap } from '../data/config';
import type {
  AnalyticsEntity,
  ChartDatum,
  MetricKey,
  MetricPoint,
  TimeGrouping,
} from '../types/analytics';

interface MutableAggregate {
  bucket: string;
  sortKey: string;
  impressions: number;
  clicks: number;
  qr_clicks: number;
  vcrWeighted: number;
  timeWeighted: number;
  ssp_spend: number;
  ssp_impressions: number;
  revenue: number;
  breakdown: Record<string, MutableEntityAggregate>;
}

interface MutableEntityAggregate {
  impressions: number;
  clicks: number;
  qr_clicks: number;
  vcrWeighted: number;
  timeWeighted: number;
  ssp_spend: number;
  ssp_impressions: number;
  revenue: number;
}

const monthFormatter = new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric' });
const shortDateFormatter = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' });
const weekdayFormatter = new Intl.DateTimeFormat('en-US', { weekday: 'short' });

const parseDate = (value: string): Date => new Date(`${value}T00:00:00`);

const toIsoDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const weekStart = (date: Date): Date => {
  const result = new Date(date);
  const day = (result.getDay() + 6) % 7;
  result.setDate(result.getDate() - day);
  return result;
};

const bucketFor = (
  dateValue: string,
  grouping: TimeGrouping,
): { bucket: string; sortKey: string } => {
  const date = parseDate(dateValue);
  if (grouping === 'day') {
    return { bucket: shortDateFormatter.format(date), sortKey: dateValue };
  }
  if (grouping === 'week') {
    const start = weekStart(date);
    return { bucket: `Week of ${shortDateFormatter.format(start)}`, sortKey: toIsoDate(start) };
  }
  if (grouping === 'month') {
    return {
      bucket: monthFormatter.format(date),
      sortKey: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
    };
  }
  if (grouping === 'quarter') {
    const quarter = Math.floor(date.getMonth() / 3) + 1;
    return {
      bucket: `Q${quarter} ${date.getFullYear()}`,
      sortKey: `${date.getFullYear()}-${quarter}`,
    };
  }
  const weekday = (date.getDay() + 6) % 7;
  return { bucket: weekdayFormatter.format(date), sortKey: String(weekday) };
};

const emptyEntityAggregate = (): MutableEntityAggregate => ({
  impressions: 0,
  clicks: 0,
  qr_clicks: 0,
  vcrWeighted: 0,
  timeWeighted: 0,
  ssp_spend: 0,
  ssp_impressions: 0,
  revenue: 0,
});

const applyPoint = (
  aggregate: MutableEntityAggregate | MutableAggregate,
  point: MetricPoint,
): void => {
  aggregate.impressions += point.impressions;
  aggregate.clicks += point.clicks;
  aggregate.qr_clicks += point.qr_clicks;
  aggregate.vcrWeighted += point.vcr * point.impressions;
  aggregate.timeWeighted += point.time_spent * point.impressions;
  aggregate.ssp_spend += point.ssp_spend;
  aggregate.ssp_impressions += point.ssp_impressions;
  aggregate.revenue += point.revenue;
};

const finalizeMetrics = (
  aggregate: MutableEntityAggregate,
): Partial<Record<MetricKey, number>> => ({
  impressions: aggregate.impressions,
  clicks: aggregate.clicks,
  qr_clicks: aggregate.qr_clicks,
  ctr: aggregate.impressions === 0 ? 0 : (aggregate.clicks / aggregate.impressions) * 100,
  vcr: aggregate.impressions === 0 ? 0 : aggregate.vcrWeighted / aggregate.impressions,
  time_spent: aggregate.impressions === 0 ? 0 : aggregate.timeWeighted / aggregate.impressions,
  ssp_spend: aggregate.ssp_spend,
  ssp_impressions: aggregate.ssp_impressions,
  revenue: aggregate.revenue,
});

export const aggregateAnalytics = (
  entities: AnalyticsEntity[],
  grouping: TimeGrouping,
  startDate: string,
  endDate: string,
): ChartDatum[] => {
  const buckets = new Map<string, MutableAggregate>();

  for (const entity of entities) {
    for (const point of entity.metrics) {
      if (point.date < startDate || point.date > endDate) continue;
      const descriptor = bucketFor(point.date, grouping);
      const current = buckets.get(descriptor.sortKey) ?? {
        ...emptyEntityAggregate(),
        bucket: descriptor.bucket,
        sortKey: descriptor.sortKey,
        breakdown: {},
      };
      applyPoint(current, point);
      const entityAggregate = current.breakdown[entity.name] ?? emptyEntityAggregate();
      applyPoint(entityAggregate, point);
      current.breakdown[entity.name] = entityAggregate;
      buckets.set(descriptor.sortKey, current);
    }
  }

  return [...buckets.values()]
    .sort((left, right) => left.sortKey.localeCompare(right.sortKey))
    .map((aggregate) => {
      const totalMetrics = finalizeMetrics(aggregate);
      const breakdown = Object.fromEntries(
        Object.entries(aggregate.breakdown).map(([name, value]) => [name, finalizeMetrics(value)]),
      );
      return {
        bucket: aggregate.bucket,
        sortKey: aggregate.sortKey,
        impressions: totalMetrics.impressions ?? 0,
        clicks: totalMetrics.clicks ?? 0,
        qr_clicks: totalMetrics.qr_clicks ?? 0,
        ctr: totalMetrics.ctr ?? 0,
        vcr: totalMetrics.vcr ?? 0,
        time_spent: totalMetrics.time_spent ?? 0,
        ssp_spend: totalMetrics.ssp_spend ?? 0,
        ssp_impressions: totalMetrics.ssp_impressions ?? 0,
        revenue: totalMetrics.revenue ?? 0,
        breakdown,
      };
    });
};

export const summarizeMetric = (data: ChartDatum[], metric: MetricKey): number => {
  if (data.length === 0) return 0;
  if (metric === 'ctr') {
    const impressions = data.reduce((sum, datum) => sum + datum.impressions, 0);
    const clicks = data.reduce((sum, datum) => sum + datum.clicks, 0);
    return impressions === 0 ? 0 : (clicks / impressions) * 100;
  }
  if (metric === 'vcr' || metric === 'time_spent') {
    const impressions = data.reduce((sum, datum) => sum + datum.impressions, 0);
    return impressions === 0
      ? 0
      : data.reduce((sum, datum) => sum + datum[metric] * datum.impressions, 0) / impressions;
  }
  return data.reduce((sum, datum) => sum + datum[metric], 0);
};

export const calculateMetricTrend = (data: ChartDatum[], metric: MetricKey): number => {
  if (data.length < 2) return 0;
  const midpoint = Math.floor(data.length / 2);
  const previousValue = summarizeMetric(data.slice(0, midpoint), metric);
  const currentValue = summarizeMetric(data.slice(midpoint), metric);
  if (previousValue === 0) return currentValue === 0 ? 0 : 100;
  return ((currentValue - previousValue) / Math.abs(previousValue)) * 100;
};

const currencyFormatters = {
  compact: new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: 'compact',
    maximumFractionDigits: 1,
  }),
  standard: new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: 'standard',
    maximumFractionDigits: 2,
  }),
} as const;

const countFormatters = {
  compact: new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }),
  standard: new Intl.NumberFormat('en-US', {
    notation: 'standard',
    maximumFractionDigits: 0,
  }),
} as const;

export const formatMetricValue = (metric: MetricKey, value: number, compact = false): string => {
  const definition = metricDefinitionMap[metric];
  if (definition.axis === 'percentage') return `${value.toFixed(1)}%`;
  if (metric === 'time_spent') return `${Math.round(value).toLocaleString()}s`;
  if (definition.axis === 'amount') {
    return currencyFormatters[compact ? 'compact' : 'standard'].format(value);
  }
  return countFormatters[compact ? 'compact' : 'standard'].format(value);
};

export const escapeCsvCell = (value: string | number): string => {
  const text = String(value);
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
};
