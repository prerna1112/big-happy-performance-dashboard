export type MetricKey =
  | 'impressions'
  | 'clicks'
  | 'qr_clicks'
  | 'ctr'
  | 'vcr'
  | 'time_spent'
  | 'ssp_spend'
  | 'ssp_impressions'
  | 'revenue';

export type DimensionKey = 'packages' | 'placements' | 'targeting' | 'creative' | 'format';

export type TimeGrouping = 'day' | 'week' | 'month' | 'quarter' | 'weekday';

export interface MetricPoint {
  date: string;
  impressions: number;
  clicks: number;
  qr_clicks: number;
  vcr: number;
  time_spent: number;
  ssp_spend: number;
  ssp_impressions: number;
  revenue: number;
}

export interface AnalyticsEntity {
  id: string;
  name: string;
  dimension: DimensionKey;
  metrics: MetricPoint[];
  description?: string;
}

export interface SampleDataResponse {
  status: string;
  message: string;
  data: {
    package_metrics: Array<{
      package_id: number;
      package_name: string;
      metrics: MetricPoint[];
    }>;
    placement_metrics: Array<{
      placement_id: number;
      placement_name: string;
      dsp_provider: string;
      deal_id: number;
      deal_name: string;
      metrics: MetricPoint[];
    }>;
    creative_metrics: Array<{
      creative_id: number;
      creative_name: string;
      metrics: MetricPoint[];
    }>;
    targeting_metrics: Array<{
      targeting_applied: string;
      metrics: MetricPoint[];
    }>;
    format_metrics: Array<{
      format: string;
      metrics: MetricPoint[];
    }>;
  };
}

export interface MetricDefinition {
  key: MetricKey;
  label: string;
  shortLabel: string;
  group: 'big-happy' | 'third-party';
  chartType: 'bar' | 'line';
  axis: 'count' | 'percentage' | 'amount' | 'duration';
  color: string;
}

export interface ChartDatum {
  bucket: string;
  sortKey: string;
  impressions: number;
  clicks: number;
  qr_clicks: number;
  ctr: number;
  vcr: number;
  time_spent: number;
  ssp_spend: number;
  ssp_impressions: number;
  revenue: number;
  breakdown: Record<string, Partial<Record<MetricKey, number>>>;
}

export interface AnalyticsState {
  activeDimension: DimensionKey;
  selectedEntityIds: string[];
  selectedMetrics: MetricKey[];
  grouping: TimeGrouping;
  startDate: string;
  endDate: string;
  zoomStart: number;
  zoomEnd: number;
}
