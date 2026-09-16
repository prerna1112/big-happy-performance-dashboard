import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import App from './App';

vi.mock('./components/analytics/PerformanceChart', () => ({
  PerformanceChart: () => <div data-testid="performance-chart">Chart</div>,
}));

describe('App', () => {
  it('collapses the KPI summary while keeping deal metadata visible', async () => {
    const user = userEvent.setup();
    render(<App />);

    expect(screen.getByRole('region', { name: 'Deal performance summary' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Collapse performance summary' }));
    expect(
      screen.queryByRole('region', { name: 'Deal performance summary' }),
    ).not.toBeInTheDocument();
    expect(screen.getByText('Boostr Deal ID')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Expand performance summary' })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
  });

  it('renders supplied-data dashboard and edits deal details', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('link', { name: 'Skip to main content' }));
    expect(screen.getByRole('main')).toHaveFocus();

    expect(
      await screen.findByRole('heading', { name: 'Performance Analytics' }),
    ).toBeInTheDocument();
    expect(await screen.findByTestId('performance-chart')).toBeInTheDocument();
    const exportLink = screen.getByRole('link', { name: 'Export CSV' });
    expect(exportLink).toHaveAttribute('download', 'big-happy-performance.csv');
    expect(exportLink).toHaveAttribute(
      'href',
      expect.stringContaining('Period%2CImpressions%2CCTR'),
    );
    await user.click(screen.getByRole('button', { name: 'Edit' }));
    const dealName = screen.getByRole('textbox', { name: 'Deal name' });
    await user.clear(dealName);
    await user.type(dealName, 'Updated campaign');
    await user.click(screen.getByRole('button', { name: 'Save changes' }));
    expect(screen.getByRole('heading', { name: 'Updated campaign' })).toBeInTheDocument();
  });

  it('updates metric selection, grouping and zoom state predictably', async () => {
    const user = userEvent.setup();
    render(<App />);
    await screen.findByRole('heading', { name: 'Performance Analytics' });

    const zoomControls = screen.getByLabelText('Chart zoom controls');
    const zoomIn = within(zoomControls).getByRole('button', { name: 'Zoom in' });
    await user.click(zoomIn);
    expect(within(zoomControls).getByText('70%')).toBeInTheDocument();
    await user.click(within(zoomControls).getByRole('button', { name: 'Reset zoom' }));
    expect(within(zoomControls).getByText('100%')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Metrics\s*2/ }));
    await user.click(screen.getByRole('checkbox', { name: 'Clicks' }));
    await user.click(screen.getByRole('button', { name: 'Close' }));
    expect(screen.getByRole('button', { name: /Metrics\s*3/ })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Export CSV' })).toHaveAttribute(
      'href',
      expect.stringContaining('Impressions%2CCTR%2CClicks'),
    );

    await user.click(screen.getByRole('button', { name: /01\/15\/26/ }));
    await user.click(screen.getByRole('button', { name: 'Month' }));
    await user.click(screen.getByRole('button', { name: 'Close time settings' }));
    expect(screen.getByRole('button', { name: 'Zoom in' })).toBeDisabled();
  });
});
