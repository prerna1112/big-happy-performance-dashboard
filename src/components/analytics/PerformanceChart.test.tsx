import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { ChartDatum } from '../../types/analytics';
import { PerformanceChart } from './PerformanceChart';

const chartData: ChartDatum[] = Array.from({ length: 10 }, (_, index) => ({
  bucket: `Day ${index + 1}`,
  sortKey: `2026-01-${String(index + 1).padStart(2, '0')}`,
  impressions: (index + 1) * 100,
  clicks: index + 1,
  qr_clicks: index,
  ctr: index + 0.5,
  vcr: 60 + index,
  time_spent: 20 + index,
  ssp_spend: 10 + index,
  ssp_impressions: 90 + index,
  revenue: 15 + index,
  breakdown: {},
}));

describe('PerformanceChart', () => {
  it('exposes distinct, meaningful range handles and reports direct range changes', () => {
    const onZoomChange = vi.fn();
    render(
      <PerformanceChart
        data={chartData}
        metrics={['impressions']}
        selectedEntityNames={['Package One']}
        zoomStart={0}
        zoomEnd={100}
        onZoomChange={onZoomChange}
      />,
    );

    const start = screen.getByRole('slider', { name: 'Start of visible chart range' });
    const end = screen.getByRole('slider', { name: 'End of visible chart range' });
    expect(start).toHaveAttribute('aria-valuetext', 'Day 1');
    expect(end).toHaveAttribute('aria-valuetext', 'Day 10');

    fireEvent.change(start, { target: { value: '20' } });
    expect(onZoomChange).toHaveBeenCalledWith(20, 100);
  });

  it('exposes only the zoomed data window in its accessible table', () => {
    const { rerender } = render(
      <PerformanceChart
        data={chartData}
        metrics={['impressions', 'ctr']}
        selectedEntityNames={['Package One']}
        zoomStart={0}
        zoomEnd={100}
      />,
    );

    const fullTable = screen.getByRole('table', {
      name: 'Performance analytics values by period',
    });
    expect(within(fullTable).getAllByRole('row')).toHaveLength(11);
    expect(
      within(fullTable).getByRole('columnheader', { name: 'Impressions' }),
    ).toBeInTheDocument();
    expect(within(fullTable).getByRole('columnheader', { name: 'CTR' })).toBeInTheDocument();
    expect(within(fullTable).getByRole('rowheader', { name: 'Day 1' })).toBeInTheDocument();
    expect(within(fullTable).getByRole('rowheader', { name: 'Day 10' })).toBeInTheDocument();

    rerender(
      <PerformanceChart
        data={chartData}
        metrics={['impressions', 'ctr']}
        selectedEntityNames={['Package One']}
        zoomStart={20}
        zoomEnd={80}
      />,
    );

    const zoomedTable = screen.getByRole('table', {
      name: 'Performance analytics values by period',
    });
    expect(within(zoomedTable).getAllByRole('row')).toHaveLength(7);
    expect(within(zoomedTable).queryByRole('rowheader', { name: 'Day 1' })).not.toBeInTheDocument();
    expect(within(zoomedTable).getByRole('rowheader', { name: 'Day 3' })).toBeInTheDocument();
    expect(within(zoomedTable).getByRole('rowheader', { name: 'Day 8' })).toBeInTheDocument();
    expect(
      within(zoomedTable).queryByRole('rowheader', { name: 'Day 10' }),
    ).not.toBeInTheDocument();
  });

  it('renders deterministic empty states for missing metrics and missing data', () => {
    const { rerender } = render(
      <PerformanceChart
        data={chartData}
        metrics={[]}
        selectedEntityNames={[]}
        zoomStart={0}
        zoomEnd={100}
      />,
    );

    expect(screen.getByRole('status')).toHaveTextContent('Choose a metric to build your chart');
    expect(screen.queryByRole('table')).not.toBeInTheDocument();

    rerender(
      <PerformanceChart
        data={[]}
        metrics={['impressions']}
        selectedEntityNames={[]}
        zoomStart={0}
        zoomEnd={100}
      />,
    );

    expect(screen.getByRole('status')).toHaveTextContent('No data in this range');
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });
});
