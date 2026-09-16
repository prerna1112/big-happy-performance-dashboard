import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { DealHeader } from './DealHeader';

const details = {
  title: 'Test campaign',
  advertiser: 'Test advertiser',
  agency: 'Test agency',
};

describe('DealHeader', () => {
  it('requests summary collapse without hiding metadata and invokes the edit action', async () => {
    const user = userEvent.setup();
    const onEdit = vi.fn();
    const onToggleSummary = vi.fn();
    render(
      <DealHeader
        details={details}
        summaryCollapsed={false}
        onToggleSummary={onToggleSummary}
        onEdit={onEdit}
        onNotify={vi.fn()}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Collapse performance summary' }));
    expect(onToggleSummary).toHaveBeenCalledOnce();
    expect(screen.getByText('Boostr Deal ID')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Edit' }));
    expect(onEdit).toHaveBeenCalledOnce();
  });

  it('reports a useful fallback when clipboard access is unavailable', async () => {
    const user = userEvent.setup();
    const onNotify = vi.fn();
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: undefined });
    render(
      <DealHeader
        details={details}
        summaryCollapsed={false}
        onToggleSummary={vi.fn()}
        onEdit={vi.fn()}
        onNotify={onNotify}
      />,
    );

    await user.click(screen.getByRole('button', { name: '1999227' }));
    await waitFor(() =>
      expect(onNotify).toHaveBeenCalledWith('Copy was blocked by the browser. Deal ID: 1999227'),
    );
  });
});
