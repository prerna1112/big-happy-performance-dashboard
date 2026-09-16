import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import type { ChartDatum } from '../../types/analytics';
import { SummaryCards } from './SummaryCards';

const data: ChartDatum[] = [
  {
    bucket: 'Jan 1',
    sortKey: '2026-01-01',
    impressions: 100,
    clicks: 5,
    qr_clicks: 1,
    ctr: 5,
    vcr: 50,
    time_spent: 10,
    ssp_spend: 20,
    ssp_impressions: 90,
    revenue: 25,
    breakdown: {},
  },
  {
    bucket: 'Jan 2',
    sortKey: '2026-01-02',
    impressions: 150,
    clicks: 15,
    qr_clicks: 2,
    ctr: 10,
    vcr: 70,
    time_spent: 20,
    ssp_spend: 30,
    ssp_impressions: 140,
    revenue: 40,
    breakdown: {},
  },
];

describe('SummaryCards', () => {
  it('announces trend direction and exposes budget disclosure state', async () => {
    const user = userEvent.setup();
    render(<SummaryCards data={data} />);

    expect(screen.getAllByText('Increased')[0]?.parentElement).toHaveTextContent('Increased 50.0%');
    const disclosures = screen.getAllByRole('button', { name: 'See less' });
    expect(disclosures[0]).toHaveAttribute('aria-expanded', 'true');

    await user.click(disclosures[0]!);
    const collapsed = screen.getAllByRole('button', { name: 'See more' })[0];
    expect(collapsed).toHaveAttribute('aria-expanded', 'false');
    expect(collapsed).toHaveAttribute('aria-controls', 'io-budget-details');
    expect(document.getElementById('io-budget-details')).not.toBeInTheDocument();
  });
});
