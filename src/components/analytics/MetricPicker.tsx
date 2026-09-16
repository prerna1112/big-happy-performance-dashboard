import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Check, ChevronDown, Search, SlidersHorizontal, X } from 'lucide-react';
import { metricDefinitions } from '../../data/config';
import { useDismissibleLayer } from '../../hooks/useDismissibleLayer';
import type { MetricKey } from '../../types/analytics';

interface MetricPickerProps {
  selectedMetrics: MetricKey[];
  onToggleMetric: (metric: MetricKey) => void;
  onClear: () => void;
}

export const MetricPicker = ({ selectedMetrics, onToggleMetric, onClear }: MetricPickerProps) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dismiss = useCallback(() => setOpen(false), []);
  const closeAndRestoreFocus = useCallback(() => {
    setOpen(false);
    window.setTimeout(() => triggerRef.current?.focus(), 0);
  }, []);
  useDismissibleLayer(rootRef, dismiss, open);
  useEffect(() => {
    if (!open) return;
    const frame = window.requestAnimationFrame(() => {
      rootRef.current?.querySelector<HTMLInputElement>('.search-field input')?.focus();
    });
    return () => window.cancelAnimationFrame(frame);
  }, [open]);
  const visibleDefinitions = useMemo(
    () =>
      metricDefinitions.filter((metric) =>
        metric.label.toLowerCase().includes(query.toLowerCase()),
      ),
    [query],
  );

  return (
    <div className="popover-anchor" ref={rootRef}>
      <button
        ref={triggerRef}
        type="button"
        className={`control-button ${selectedMetrics.length > 0 ? 'control-button--active' : ''}`}
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => setOpen((value) => !value)}
      >
        <SlidersHorizontal aria-hidden="true" size={16} />
        Metrics
        <span className="count-badge">{selectedMetrics.length}</span>
        <ChevronDown aria-hidden="true" size={16} />
      </button>
      {open ? (
        <div className="popover metric-popover" role="dialog" aria-label="Choose chart metrics">
          <div className="popover__heading">
            <div>
              <p className="popover__eyebrow">Chart configuration</p>
              <strong>Choose metrics</strong>
            </div>
            <button
              className="icon-button icon-button--small"
              type="button"
              onClick={closeAndRestoreFocus}
            >
              <span className="sr-only">Close metrics menu</span>
              <X aria-hidden="true" size={16} />
            </button>
          </div>
          <label className="search-field">
            <Search aria-hidden="true" size={16} />
            <span className="sr-only">Search metrics</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search metrics"
            />
          </label>
          {(['big-happy', 'third-party'] as const).map((group) => {
            const groupMetrics = visibleDefinitions.filter((metric) => metric.group === group);
            if (groupMetrics.length === 0) return null;
            return (
              <div className="metric-group" key={group}>
                <p>{group === 'big-happy' ? 'Big Happy metrics' : 'Third-party metrics'}</p>
                {groupMetrics.map((metric) => {
                  const checked = selectedMetrics.includes(metric.key);
                  return (
                    <label className="check-row check-row--metric" key={metric.key}>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => onToggleMetric(metric.key)}
                      />
                      <span className="custom-checkbox">
                        {checked ? <Check aria-hidden="true" size={13} /> : null}
                      </span>
                      <span
                        className="metric-swatch"
                        style={{ backgroundColor: metric.color }}
                        aria-hidden="true"
                      />
                      <span>{metric.label}</span>
                    </label>
                  );
                })}
              </div>
            );
          })}
          <div className="popover__footer">
            <button
              className="text-button"
              type="button"
              onClick={onClear}
              disabled={selectedMetrics.length === 0}
            >
              Clear all
            </button>
            <button className="button button--primary" type="button" onClick={closeAndRestoreFocus}>
              Close
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
};
