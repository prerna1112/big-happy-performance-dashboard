import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { availableDateRange, analyticsCatalog } from '../../data/normalize';
import type { ChartDatum, MetricKey } from '../../types/analytics';
import { aggregateAnalytics, summarizeMetric } from '../../utils/analytics';
import { PerformanceAnalytics } from './PerformanceAnalytics';

vi.mock('./PerformanceChart', () => ({
  PerformanceChart: ({
    data,
    metrics,
    zoomStart,
    zoomEnd,
  }: {
    data: ChartDatum[];
    metrics: MetricKey[];
    zoomStart: number;
    zoomEnd: number;
  }) =>
    metrics.length === 0 ? (
      <div role="status">Choose a metric to build your chart</div>
    ) : (
      <div data-testid="chart-props">
        <span data-testid="chart-row-count">{data.length}</span>
        <span data-testid="chart-impressions">{summarizeMetric(data, 'impressions')}</span>
        <span data-testid="chart-metrics">{metrics.join(',')}</span>
        <span data-testid="chart-zoom">
          {zoomStart}-{zoomEnd}
        </span>
      </div>
    ),
}));

describe('PerformanceAnalytics integration', () => {
  it('filters supplied data before passing it to the chart', async () => {
    const user = userEvent.setup();
    render(<PerformanceAnalytics onNotify={vi.fn()} />);

    const expectedAll = aggregateAnalytics(
      analyticsCatalog.packages,
      'day',
      availableDateRange.min,
      availableDateRange.max,
    );
    expect(screen.getByTestId('chart-row-count')).toHaveTextContent(String(expectedAll.length));
    expect(screen.getByTestId('chart-impressions')).toHaveTextContent(
      String(summarizeMetric(expectedAll, 'impressions')),
    );

    await user.click(screen.getByRole('button', { name: 'Packages' }));
    const filterDialog = screen.getByRole('dialog', { name: 'Packages filters' });
    const selectedPackage = analyticsCatalog.packages[0];
    expect(selectedPackage).toBeDefined();
    await user.click(
      within(filterDialog).getByRole('checkbox', { name: selectedPackage?.name ?? '' }),
    );
    await user.click(within(filterDialog).getByRole('button', { name: 'Close' }));

    const expectedFiltered = aggregateAnalytics(
      selectedPackage ? [selectedPackage] : [],
      'day',
      availableDateRange.min,
      availableDateRange.max,
    );
    expect(screen.getByTestId('chart-row-count')).toHaveTextContent(
      String(expectedFiltered.length),
    );
    expect(screen.getByTestId('chart-impressions')).toHaveTextContent(
      String(summarizeMetric(expectedFiltered, 'impressions')),
    );
    expect(screen.getByText(/Showing 1 of 2/)).toBeInTheDocument();
  });

  it('shows a metric empty state and disables CSV export after clearing metrics', async () => {
    const user = userEvent.setup();
    render(<PerformanceAnalytics onNotify={vi.fn()} />);

    const exportControl = screen.getByLabelText('Export CSV');
    expect(exportControl).toHaveAttribute('aria-disabled', 'false');
    expect(exportControl).toHaveAttribute(
      'href',
      expect.stringContaining('Period%2CImpressions%2CCTR'),
    );

    await user.click(screen.getByRole('button', { name: /Metrics\s*2/ }));
    await user.click(screen.getByRole('button', { name: 'Clear all' }));

    expect(screen.getByRole('status')).toHaveTextContent('Choose a metric to build your chart');
    expect(screen.getByRole('button', { name: /Metrics\s*0/ })).toBeInTheDocument();
    expect(exportControl).toHaveAttribute('aria-disabled', 'true');
    expect(exportControl).not.toHaveAttribute('href');
  });

  it('updates and resets the zoom range', async () => {
    const user = userEvent.setup();
    render(<PerformanceAnalytics onNotify={vi.fn()} />);

    expect(screen.getByTestId('chart-zoom')).toHaveTextContent('0-100');
    await user.click(screen.getByRole('button', { name: 'Zoom in' }));
    expect(screen.getByTestId('chart-zoom')).toHaveTextContent('15-85');
    expect(screen.getByText('70%')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Reset zoom' }));
    expect(screen.getByTestId('chart-zoom')).toHaveTextContent('0-100');
    expect(screen.getByText('100%')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Reset zoom' })).toBeDisabled();
  });

  it('supports Escape and focus restoration in expanded chart view', async () => {
    const user = userEvent.setup();
    render(<PerformanceAnalytics onNotify={vi.fn()} />);

    const expand = screen.getByRole('button', { name: 'Expand chart view' });
    await user.click(expand);
    const expanded = screen.getByRole('dialog', { name: 'Performance Analytics' });
    expect(expanded).toHaveAttribute('aria-modal', 'true');
    expect(document.body.style.overflow).toBe('hidden');

    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog', { name: 'Performance Analytics' })).not.toBeInTheDocument();
    await waitFor(() => expect(expand).toHaveFocus());
    expect(document.body.style.overflow).toBe('');
  });
});
