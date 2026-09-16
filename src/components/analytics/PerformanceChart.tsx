import { useId, type CSSProperties } from 'react';
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { TooltipContentProps } from 'recharts';
import { metricDefinitionMap } from '../../data/config';
import { formatMetricValue } from '../../utils/analytics';
import type { ChartDatum, MetricKey } from '../../types/analytics';

interface PerformanceChartProps {
  data: ChartDatum[];
  metrics: MetricKey[];
  selectedEntityNames: string[];
  zoomStart: number;
  zoomEnd: number;
  onZoomChange?: (start: number, end: number) => void;
}

interface ChartTooltipProps extends TooltipContentProps {
  metrics: MetricKey[];
  selectedEntityNames: string[];
}

const isChartDatum = (value: unknown): value is ChartDatum =>
  typeof value === 'object' && value !== null && 'bucket' in value && 'breakdown' in value;

const ChartTooltip = ({
  active,
  payload,
  label,
  metrics,
  selectedEntityNames,
}: ChartTooltipProps) => {
  if (!active || payload.length === 0) return null;
  const rawDatum: unknown = payload[0]?.payload as unknown;
  const datum = isChartDatum(rawDatum) ? rawDatum : null;

  return (
    <div className="chart-tooltip">
      <p className="chart-tooltip__date">{label}</p>
      <div className="chart-tooltip__totals">
        {metrics.map((metric) => (
          <div key={metric}>
            <span>
              <i style={{ backgroundColor: metricDefinitionMap[metric].color }} />
              {metricDefinitionMap[metric].label}
            </span>
            <strong>{formatMetricValue(metric, datum?.[metric] ?? 0)}</strong>
          </div>
        ))}
      </div>
      {datum && selectedEntityNames.length > 1 ? (
        <div className="chart-tooltip__breakdown">
          <p>Breakdown</p>
          {selectedEntityNames.slice(0, 4).map((name) => (
            <div className="chart-tooltip__entity" key={name}>
              <span>{name}</span>
              <dl>
                {metrics.map((metric) => (
                  <div key={metric}>
                    <dt>{metricDefinitionMap[metric].label}</dt>
                    <dd>{formatMetricValue(metric, datum.breakdown[name]?.[metric] ?? 0, true)}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ))}
          {selectedEntityNames.length > 4 ? (
            <small>+{selectedEntityNames.length - 4} more</small>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};

const axisFormatter = (value: number): string =>
  new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value);

export const PerformanceChart = ({
  data,
  metrics,
  selectedEntityNames,
  zoomStart,
  zoomEnd,
  onZoomChange,
}: PerformanceChartProps) => {
  const labelId = useId();
  const endIndex = Math.max(0, data.length - 1);
  const brushStart = Math.round((zoomStart / 100) * endIndex);
  const brushEnd = Math.round((zoomEnd / 100) * endIndex);
  const visibleData = data.slice(brushStart, brushEnd + 1);
  const axes = new Set(metrics.map((metric) => metricDefinitionMap[metric].axis));
  const rightAxisCount = Number(axes.has('percentage')) + Number(axes.has('amount'));
  const leftAxisCount = Number(axes.has('count')) + Number(axes.has('duration'));

  if (metrics.length === 0) {
    return (
      <div className="chart-empty" role="status">
        <div className="chart-empty__art" aria-hidden="true">
          <span />
          <span />
          <span />
          <i />
        </div>
        <h3>Choose a metric to build your chart</h3>
        <p>Open the Metrics menu and select one or more performance measures.</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="chart-empty" role="status">
        <h3>No data in this range</h3>
        <p>Try broadening the dates or clearing the active filters.</p>
      </div>
    );
  }

  return (
    <figure className="chart-frame" aria-labelledby={labelId}>
      <p className="sr-only" id={labelId}>
        Performance chart comparing{' '}
        {metrics.map((metric) => metricDefinitionMap[metric].label).join(', ')} across {data.length}{' '}
        time periods. {visibleData.length} periods are currently visible.
      </p>
      <div className="chart-plot">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={visibleData}
            margin={{
              top: 20,
              right: rightAxisCount > 1 ? 92 : axes.has('amount') ? 56 : 24,
              bottom: 12,
              left: leftAxisCount > 1 ? 50 : 8,
            }}
          >
            <CartesianGrid vertical={false} stroke="#e6eaf1" strokeDasharray="2 4" />
            <XAxis
              dataKey="bucket"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#59677f', fontSize: 11 }}
              minTickGap={24}
            />
            {axes.has('count') ? (
              <YAxis
                yAxisId="count"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#59677f', fontSize: 11 }}
                tickFormatter={axisFormatter}
                width={48}
                label={{ value: 'Count', angle: -90, position: 'insideLeft', fill: '#59677f' }}
              />
            ) : null}
            {axes.has('percentage') ? (
              <YAxis
                yAxisId="percentage"
                orientation="right"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#59677f', fontSize: 11 }}
                tickFormatter={(value: number) => `${value}%`}
                width={42}
                label={{
                  value: 'Percentage',
                  angle: 90,
                  position: 'insideRight',
                  fill: '#59677f',
                }}
              />
            ) : null}
            {axes.has('amount') ? (
              <YAxis
                yAxisId="amount"
                orientation="right"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#59677f', fontSize: 11 }}
                tickFormatter={(value: number) => `$${axisFormatter(value)}`}
                width={58}
                label={{
                  value: 'Amount ($)',
                  angle: 90,
                  position: 'insideRight',
                  fill: '#59677f',
                }}
              />
            ) : null}
            {axes.has('duration') ? (
              <YAxis
                yAxisId="duration"
                orientation="left"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#59677f', fontSize: 11 }}
                tickFormatter={(value: number) => `${axisFormatter(value)}s`}
                width={50}
                label={{ value: 'Seconds', angle: -90, position: 'insideLeft', fill: '#59677f' }}
              />
            ) : null}
            <Tooltip
              content={(props) => (
                <ChartTooltip
                  {...props}
                  metrics={metrics}
                  selectedEntityNames={selectedEntityNames}
                />
              )}
              cursor={{ fill: 'rgba(36, 63, 125, 0.05)' }}
              isAnimationActive={false}
            />
            {metrics.map((metric) => {
              const definition = metricDefinitionMap[metric];
              return definition.chartType === 'bar' ? (
                <Bar
                  key={metric}
                  dataKey={metric}
                  name={definition.label}
                  yAxisId={definition.axis}
                  fill={definition.color}
                  radius={[8, 8, 0, 0]}
                  maxBarSize={32}
                  isAnimationActive={false}
                />
              ) : (
                <Line
                  key={metric}
                  type="monotone"
                  dataKey={metric}
                  name={definition.label}
                  yAxisId={definition.axis}
                  stroke={definition.color}
                  strokeDasharray={metric === 'ctr' ? '6 6' : undefined}
                  strokeWidth={3}
                  dot={{ r: 3, fill: definition.color, stroke: definition.color, strokeWidth: 2 }}
                  activeDot={{ r: 5 }}
                  isAnimationActive={false}
                />
              );
            })}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <div className="chart-range" aria-label="Chart visible range">
        <div className="chart-range__labels" aria-hidden="true">
          <span>{visibleData[0]?.bucket}</span>
          <span>{visibleData.at(-1)?.bucket}</span>
        </div>
        <div
          className="chart-range__track"
          style={
            {
              '--range-start': `${zoomStart}%`,
              '--range-end': `${zoomEnd}%`,
            } as CSSProperties
          }
        >
          <input
            type="range"
            min="0"
            max="100"
            step="1"
            value={zoomStart}
            aria-label="Start of visible chart range"
            aria-valuetext={visibleData[0]?.bucket}
            onChange={(event) =>
              onZoomChange?.(Math.min(Number(event.target.value), zoomEnd - 5), zoomEnd)
            }
          />
          <input
            type="range"
            min="0"
            max="100"
            step="1"
            value={zoomEnd}
            aria-label="End of visible chart range"
            aria-valuetext={visibleData.at(-1)?.bucket}
            onChange={(event) =>
              onZoomChange?.(zoomStart, Math.max(Number(event.target.value), zoomStart + 5))
            }
          />
        </div>
      </div>
      <table className="sr-only">
        <caption>Performance analytics values by period</caption>
        <thead>
          <tr>
            <th scope="col">Period</th>
            {metrics.map((metric) => (
              <th scope="col" key={metric}>
                {metricDefinitionMap[metric].label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {visibleData.map((datum) => (
            <tr key={datum.sortKey}>
              <th scope="row">{datum.bucket}</th>
              {metrics.map((metric) => (
                <td key={metric}>{formatMetricValue(metric, datum[metric])}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
};
