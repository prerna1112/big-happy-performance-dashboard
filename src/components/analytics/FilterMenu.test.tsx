import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { analyticsCatalog } from '../../data/normalize';
import { FilterMenu } from './FilterMenu';

describe('FilterMenu', () => {
  it('searches, selects, clears and changes dimensions', async () => {
    const user = userEvent.setup();
    const onToggleEntity = vi.fn();
    const onClear = vi.fn();
    const onDimensionChange = vi.fn();
    render(
      <FilterMenu
        dimension="packages"
        entities={analyticsCatalog.packages}
        selectedIds={[]}
        onDimensionChange={onDimensionChange}
        onToggleEntity={onToggleEntity}
        onClear={onClear}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Packages' }));
    const search = screen.getByRole('textbox', { name: 'Search Packages' });
    await user.type(search, analyticsCatalog.packages[0]?.name.slice(0, 4) ?? '');
    const firstPackage = analyticsCatalog.packages[0];
    expect(firstPackage).toBeDefined();
    await user.click(screen.getByText(firstPackage?.name ?? ''));
    expect(onToggleEntity).toHaveBeenCalledWith(firstPackage?.id);
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Creative' }));
    expect(onDimensionChange).toHaveBeenCalledWith('creative');
    expect(onClear).not.toHaveBeenCalled();
  });
});
