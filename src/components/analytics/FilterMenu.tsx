import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Check, ChevronDown, Search, X } from 'lucide-react';
import { dimensionLabels } from '../../data/config';
import { useDismissibleLayer } from '../../hooks/useDismissibleLayer';
import type { AnalyticsEntity, DimensionKey } from '../../types/analytics';

interface FilterMenuProps {
  dimension: DimensionKey;
  entities: AnalyticsEntity[];
  selectedIds: string[];
  onDimensionChange: (dimension: DimensionKey) => void;
  onToggleEntity: (id: string) => void;
  onClear: () => void;
}

const dimensions = Object.entries(dimensionLabels) as Array<[DimensionKey, string]>;

export const FilterMenu = ({
  dimension,
  entities,
  selectedIds,
  onDimensionChange,
  onToggleEntity,
  onClear,
}: FilterMenuProps) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const rootRef = useRef<HTMLDivElement>(null);
  const activeTriggerRef = useRef<HTMLButtonElement | null>(null);
  const dismiss = useCallback(() => setOpen(false), []);
  const closeAndRestoreFocus = useCallback(() => {
    setOpen(false);
    window.setTimeout(() => activeTriggerRef.current?.focus(), 0);
  }, []);
  useDismissibleLayer(rootRef, dismiss, open);
  useEffect(() => {
    if (!open) return;
    const frame = window.requestAnimationFrame(() => {
      rootRef.current?.querySelector<HTMLInputElement>('.search-field input')?.focus();
    });
    return () => window.cancelAnimationFrame(frame);
  }, [open]);
  const filteredEntities = useMemo(
    () =>
      entities.filter((entity) =>
        `${entity.name} ${entity.description ?? ''}`.toLowerCase().includes(query.toLowerCase()),
      ),
    [entities, query],
  );

  return (
    <div className="popover-anchor filter-menu" ref={rootRef}>
      <div className="dimension-triggers" aria-label="Performance filters">
        {dimensions.map(([key, label]) => (
          <button
            key={key}
            type="button"
            className={`control-button dimension-trigger ${key === dimension && selectedIds.length > 0 ? 'control-button--active' : ''}`}
            aria-expanded={key === dimension ? open : false}
            aria-haspopup="dialog"
            onClick={(event) => {
              activeTriggerRef.current = event.currentTarget;
              if (key !== dimension) onDimensionChange(key);
              setOpen(key === dimension ? (value) => !value : true);
              setQuery('');
            }}
          >
            {label}
            {key === dimension && selectedIds.length > 0 ? (
              <span className="count-badge">{selectedIds.length}</span>
            ) : null}
            <ChevronDown aria-hidden="true" size={14} />
          </button>
        ))}
      </div>

      {open ? (
        <div
          className="popover filter-popover"
          role="dialog"
          aria-label={`${dimensionLabels[dimension]} filters`}
        >
          <div className="filter-popover__dimensions" role="group" aria-label="Filter category">
            {dimensions.map(([key, label]) => (
              <button
                key={key}
                type="button"
                aria-pressed={key === dimension}
                className={
                  key === dimension ? 'dimension-tab dimension-tab--active' : 'dimension-tab'
                }
                onClick={() => {
                  onDimensionChange(key);
                  setQuery('');
                }}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="filter-popover__content">
            <div className="popover__heading">
              <div>
                <p className="popover__eyebrow">Filter chart by</p>
                <strong>{dimensionLabels[dimension]}</strong>
              </div>
              <button
                className="icon-button icon-button--small"
                type="button"
                onClick={closeAndRestoreFocus}
              >
                <span className="sr-only">Close filter menu</span>
                <X aria-hidden="true" size={16} />
              </button>
            </div>
            <label className="search-field">
              <Search aria-hidden="true" size={16} />
              <span className="sr-only">Search {dimensionLabels[dimension]}</span>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={`Search ${dimensionLabels[dimension].toLowerCase()}`}
              />
            </label>
            <div
              className="check-list"
              role="group"
              aria-label={`Available ${dimensionLabels[dimension]}`}
            >
              {filteredEntities.length > 0 ? (
                filteredEntities.map((entity) => {
                  const checked = selectedIds.includes(entity.id);
                  return (
                    <label className="check-row" key={entity.id}>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => onToggleEntity(entity.id)}
                      />
                      <span className="custom-checkbox">
                        {checked ? <Check aria-hidden="true" size={13} /> : null}
                      </span>
                      <span>
                        <strong>{entity.name}</strong>
                        {entity.description ? <small>{entity.description}</small> : null}
                      </span>
                    </label>
                  );
                })
              ) : (
                <p className="empty-message">No matching filters.</p>
              )}
            </div>
            <div className="popover__footer">
              <button
                className="text-button"
                type="button"
                onClick={onClear}
                disabled={selectedIds.length === 0}
              >
                Clear all
              </button>
              <button
                className="button button--primary"
                type="button"
                onClick={closeAndRestoreFocus}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
