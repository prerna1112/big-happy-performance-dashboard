import { useCallback, useEffect, useRef, useState } from 'react';
import { CalendarDays, Check, ChevronDown, X } from 'lucide-react';
import { groupingLabels } from '../../data/config';
import { availableDateRange } from '../../data/normalize';
import { useDismissibleLayer } from '../../hooks/useDismissibleLayer';
import type { TimeGrouping } from '../../types/analytics';

interface TimeControlProps {
  grouping: TimeGrouping;
  startDate: string;
  endDate: string;
  onGroupingChange: (grouping: TimeGrouping) => void;
  onDateRangeChange: (startDate: string, endDate: string) => void;
}

const groupings = Object.entries(groupingLabels) as Array<[TimeGrouping, string]>;

export const TimeControl = ({
  grouping,
  startDate,
  endDate,
  onGroupingChange,
  onDateRangeChange,
}: TimeControlProps) => {
  const [open, setOpen] = useState(false);
  const [draftStart, setDraftStart] = useState(startDate);
  const [draftEnd, setDraftEnd] = useState(endDate);
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
      rootRef.current?.querySelector<HTMLElement>('.option-row--selected')?.focus();
    });
    return () => window.cancelAnimationFrame(frame);
  }, [open]);

  const applyRange = (): void => {
    if (draftStart <= draftEnd) {
      onDateRangeChange(draftStart, draftEnd);
      closeAndRestoreFocus();
    }
  };

  const compactDate = (value: string): string => {
    const [year, month, day] = value.split('-');
    return `${month}/${day}/${year?.slice(2)}`;
  };

  return (
    <div className="popover-anchor" ref={rootRef}>
      <button
        ref={triggerRef}
        type="button"
        className="control-button"
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => setOpen((value) => !value)}
      >
        <CalendarDays aria-hidden="true" size={16} />
        {grouping === 'day'
          ? `${compactDate(startDate)} – ${compactDate(endDate)}`
          : groupingLabels[grouping]}
        <ChevronDown aria-hidden="true" size={16} />
      </button>
      {open ? (
        <div className="popover time-popover" role="dialog" aria-label="Choose time grouping">
          <div className="popover__heading">
            <div>
              <p className="popover__eyebrow">Horizontal axis</p>
              <strong>Group results by</strong>
            </div>
            <button
              className="icon-button icon-button--small"
              type="button"
              onClick={closeAndRestoreFocus}
            >
              <span className="sr-only">Close time settings</span>
              <X aria-hidden="true" size={16} />
            </button>
          </div>
          <div className="option-list" role="group" aria-label="Time grouping">
            {groupings.map(([key, label]) => (
              <button
                key={key}
                className={key === grouping ? 'option-row option-row--selected' : 'option-row'}
                type="button"
                aria-pressed={key === grouping}
                onClick={() => onGroupingChange(key)}
              >
                <span>{label}</span>
                {key === grouping ? <Check aria-hidden="true" size={16} /> : null}
              </button>
            ))}
          </div>
          <div className="date-range-fields">
            <label>
              Start date
              <input
                type="date"
                min={availableDateRange.min}
                max={draftEnd}
                value={draftStart}
                onChange={(event) => setDraftStart(event.target.value)}
              />
            </label>
            <label>
              End date
              <input
                type="date"
                min={draftStart}
                max={availableDateRange.max}
                value={draftEnd}
                onChange={(event) => setDraftEnd(event.target.value)}
              />
            </label>
          </div>
          <div className="popover__footer popover__footer--end">
            <button
              className="button button--primary"
              type="button"
              onClick={applyRange}
              disabled={draftStart > draftEnd}
            >
              Apply dates
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
};
