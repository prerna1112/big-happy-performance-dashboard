import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { MetricPicker } from './MetricPicker';

describe('MetricPicker', () => {
  it('selects and clears metrics, then restores focus when closed', async () => {
    const user = userEvent.setup();
    const onToggleMetric = vi.fn();
    const onClear = vi.fn();
    render(
      <MetricPicker
        selectedMetrics={['impressions', 'ctr']}
        onToggleMetric={onToggleMetric}
        onClear={onClear}
      />,
    );

    const trigger = screen.getByRole('button', { name: /Metrics\s*2/ });
    await user.click(trigger);
    const search = screen.getByRole('textbox', { name: 'Search metrics' });
    await waitFor(() => expect(search).toHaveFocus());

    await user.click(screen.getByRole('checkbox', { name: 'Clicks' }));
    expect(onToggleMetric).toHaveBeenCalledWith('clicks');
    await user.click(screen.getByRole('button', { name: 'Clear all' }));
    expect(onClear).toHaveBeenCalledOnce();

    await user.click(screen.getByRole('button', { name: 'Close' }));
    await waitFor(() => expect(trigger).toHaveFocus());
  });

  it('dismisses with Escape and returns focus to the trigger', async () => {
    const user = userEvent.setup();
    render(
      <MetricPicker selectedMetrics={['impressions']} onToggleMetric={vi.fn()} onClear={vi.fn()} />,
    );

    const trigger = screen.getByRole('button', { name: /Metrics\s*1/ });
    await user.click(trigger);
    await user.keyboard('{Escape}');

    await waitFor(() => expect(trigger).toHaveFocus());
    expect(screen.queryByRole('dialog', { name: 'Choose chart metrics' })).not.toBeInTheDocument();
  });
});
