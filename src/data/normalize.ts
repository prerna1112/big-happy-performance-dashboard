import rawData from './sample-data.json';
import type { AnalyticsEntity, DimensionKey, SampleDataResponse } from '../types/analytics';

const response: SampleDataResponse = rawData;

export const analyticsCatalog: Record<DimensionKey, AnalyticsEntity[]> = {
  packages: response.data.package_metrics.map((item) => ({
    id: String(item.package_id),
    name: item.package_name,
    dimension: 'packages',
    metrics: item.metrics,
  })),
  placements: response.data.placement_metrics.map((item) => ({
    id: String(item.placement_id),
    name: item.placement_name,
    dimension: 'placements',
    description: `${item.dsp_provider} · ${item.deal_name}`,
    metrics: item.metrics,
  })),
  creative: response.data.creative_metrics.map((item) => ({
    id: String(item.creative_id),
    name: item.creative_name,
    dimension: 'creative',
    metrics: item.metrics,
  })),
  targeting: response.data.targeting_metrics.map((item, index) => ({
    id: `targeting-${index + 1}`,
    name: item.targeting_applied,
    dimension: 'targeting',
    metrics: item.metrics,
  })),
  format: response.data.format_metrics.map((item) => ({
    id: item.format.toLowerCase(),
    name: item.format.charAt(0) + item.format.slice(1).toLowerCase(),
    dimension: 'format',
    metrics: item.metrics,
  })),
};

const allDates = analyticsCatalog.packages.flatMap((entity) =>
  entity.metrics.map((metric) => metric.date),
);

export const availableDateRange = {
  min: [...allDates].sort()[0] ?? '',
  max: [...allDates].sort().at(-1) ?? '',
};
