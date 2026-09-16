import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { metricDefinitionMap } from '../../data/config';
import { calculateMetricTrend, formatMetricValue, summarizeMetric } from '../../utils/analytics';
import type { ChartDatum, MetricKey } from '../../types/analytics';

interface MetricSummaryProps {
  data: ChartDatum[];
  metrics: MetricKey[];
}

export const MetricSummary = ({ data, metrics }: MetricSummaryProps) => (
  <div className="metric-summary" aria-label="Selected metric totals">
    {metrics.map((metric) => {
      const value = summarizeMetric(data, metric);
      const trend = calculateMetricTrend(data, metric);
      const positive = trend >= 0;
      return (
        <article className="metric-summary__item" key={metric}>
          <span
            className="metric-summary__swatch"
            style={{ backgroundColor: metricDefinitionMap[metric].color }}
            aria-hidden="true"
          />
          <div>
            <p>{metricDefinitionMap[metric].label}</p>
            <strong>{formatMetricValue(metric, value, true)}</strong>
          </div>
          <span className={positive ? 'delta delta--positive' : 'delta delta--negative'}>
            {positive ? <ArrowUpRight aria-hidden="true" /> : <ArrowDownRight aria-hidden="true" />}
            {Math.abs(trend).toFixed(1)}%
          </span>
        </article>
      );
    })}
  </div>
);
