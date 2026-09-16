import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { TimeControl } from './TimeControl';

describe('TimeControl', () => {
  it('changes grouping and applies a valid date range', async () => {
    const user = userEvent.setup();
    const onGroupingChange = vi.fn();
    const onDateRangeChange = vi.fn();
    render(
      <TimeControl
        grouping="day"
        startDate="2026-01-15"
        endDate="2026-02-13"
        onGroupingChange={onGroupingChange}
        onDateRangeChange={onDateRangeChange}
      />,
    );

    const trigger = screen.getByRole('button', { name: /01\/15\/26/ });
    await user.click(trigger);
    await user.click(screen.getByRole('button', { name: 'Week' }));
    expect(onGroupingChange).toHaveBeenCalledWith('week');

    fireEvent.change(screen.getByLabelText('Start date'), { target: { value: '2026-01-20' } });
    fireEvent.change(screen.getByLabelText('End date'), { target: { value: '2026-02-10' } });
    await user.click(screen.getByRole('button', { name: 'Apply dates' }));

    expect(onDateRangeChange).toHaveBeenCalledWith('2026-01-20', '2026-02-10');
    await waitFor(() => expect(trigger).toHaveFocus());
  });

  it('disables date application when the start is after the end', async () => {
    const user = userEvent.setup();
    render(
      <TimeControl
        grouping="day"
        startDate="2026-01-15"
        endDate="2026-02-13"
        onGroupingChange={vi.fn()}
        onDateRangeChange={vi.fn()}
      />,
    );

    await user.click(screen.getByRole('button', { name: /01\/15\/26/ }));
    fireEvent.change(screen.getByLabelText('Start date'), { target: { value: '2026-02-12' } });
    fireEvent.change(screen.getByLabelText('End date'), { target: { value: '2026-01-20' } });
    expect(screen.getByRole('button', { name: 'Apply dates' })).toBeDisabled();
  });
});
