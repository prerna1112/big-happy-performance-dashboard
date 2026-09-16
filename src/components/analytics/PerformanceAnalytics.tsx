import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, ChevronUp, Download, Maximize2, Minus, Plus, RotateCcw } from 'lucide-react';
import { metricDefinitionMap } from '../../data/config';
import { useAnalyticsState } from '../../hooks/useAnalyticsState';
import { escapeCsvCell } from '../../utils/analytics';
import { FilterMenu } from './FilterMenu';
import { MetricPicker } from './MetricPicker';
import { MetricSummary } from './MetricSummary';
import { PerformanceChart } from './PerformanceChart';
import { TimeControl } from './TimeControl';

interface PerformanceAnalyticsProps {
  onNotify: (message: string) => void;
}

export const PerformanceAnalytics = ({ onNotify }: PerformanceAnalyticsProps) => {
  const { state, dispatch, availableEntities, selectedEntities, chartData } = useAnalyticsState();
  const [collapsed, setCollapsed] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const expandTriggerRef = useRef<HTMLButtonElement>(null);
  const canZoom = chartData.length > 2;
  const selectedNames = useMemo(
    () => selectedEntities.map((entity) => entity.name),
    [selectedEntities],
  );
  const exportUrl = useMemo(() => {
    if (chartData.length === 0 || state.selectedMetrics.length === 0) return '';
    const headings = [
      'Period',
      ...state.selectedMetrics.map((metric) => metricDefinitionMap[metric].label),
    ];
    const rows = chartData.map((datum) => [
      datum.bucket,
      ...state.selectedMetrics.map((metric) => datum[metric]),
    ]);
    const csv = [headings, ...rows].map((row) => row.map(escapeCsvCell).join(',')).join('\n');
    return `data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`;
  }, [chartData, state.selectedMetrics]);

  useEffect(() => {
    if (!fullscreen) return;
    const section = sectionRef.current;
    if (!section) return;
    const previousOverflow = document.body.style.overflow;
    const backgroundElements = Array.from(
      document.querySelectorAll<HTMLElement>(
        '.app-header, .sidebar, .deal-header, .summary-scroller',
      ),
    ).filter((element) => !section.contains(element));
    const previousInert = backgroundElements.map((element) => element.inert);
    const expandTrigger = expandTriggerRef.current;
    document.body.style.overflow = 'hidden';
    backgroundElements.forEach((element) => {
      element.inert = true;
    });

    const getFocusable = (): HTMLElement[] =>
      Array.from(
        section.querySelectorAll<HTMLElement>(
          'a[href], button:not(:disabled), input:not(:disabled), select:not(:disabled)',
        ),
      );
    window.setTimeout(() => getFocusable()[0]?.focus(), 0);

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setFullscreen(false);
        return;
      }
      if (event.key !== 'Tab') return;
      const focusable = getFocusable();
      const first = focusable[0];
      const last = focusable.at(-1);
      if (!first || !last) return;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
      backgroundElements.forEach((element, index) => {
        element.inert = previousInert[index] ?? false;
      });
      window.setTimeout(() => expandTrigger?.focus(), 0);
    };
  }, [fullscreen]);

  return (
    <section
      ref={sectionRef}
      className={`surface analytics-card ${fullscreen ? 'analytics-card--fullscreen' : ''}`}
      aria-labelledby="analytics-title"
      aria-modal={fullscreen || undefined}
      role={fullscreen ? 'dialog' : undefined}
      tabIndex={fullscreen ? -1 : undefined}
    >
      <div className="analytics-card__heading">
        <div>
          <p className="eyebrow">Interactive reporting</p>
          <h2 id="analytics-title">Performance Analytics</h2>
        </div>
        <div className="analytics-heading__actions">
          <a
            className={`button button--muted ${exportUrl ? '' : 'button--disabled'}`}
            href={exportUrl || undefined}
            download="big-happy-performance.csv"
            aria-label="Export CSV"
            aria-disabled={!exportUrl}
            onClick={(event) => {
              if (!exportUrl) event.preventDefault();
              else onNotify('Performance data exported as CSV.');
            }}
          >
            <Download aria-hidden="true" size={16} />
            <span>Export CSV</span>
          </a>
          <button
            ref={expandTriggerRef}
            className="icon-button"
            type="button"
            aria-label={fullscreen ? 'Exit expanded chart view' : 'Expand chart view'}
            onClick={() => setFullscreen((value) => !value)}
          >
            <Maximize2 aria-hidden="true" size={18} />
          </button>
          <button
            className="icon-button"
            type="button"
            aria-expanded={!collapsed}
            aria-controls="analytics-content"
            aria-label={collapsed ? 'Expand analytics' : 'Collapse analytics'}
            onClick={() => setCollapsed((value) => !value)}
          >
            {collapsed ? <ChevronDown aria-hidden="true" /> : <ChevronUp aria-hidden="true" />}
          </button>
        </div>
      </div>

      {!collapsed ? (
        <div id="analytics-content">
          <div className="analytics-toolbar">
            <div className="analytics-toolbar__group" aria-label="Chart filters">
              <FilterMenu
                dimension={state.activeDimension}
                entities={availableEntities}
                selectedIds={state.selectedEntityIds}
                onDimensionChange={(dimension) => dispatch({ type: 'set-dimension', dimension })}
                onToggleEntity={(id) => dispatch({ type: 'toggle-entity', id })}
                onClear={() => dispatch({ type: 'clear-filter' })}
              />
              <MetricPicker
                selectedMetrics={state.selectedMetrics}
                onToggleMetric={(metric) => dispatch({ type: 'toggle-metric', metric })}
                onClear={() => dispatch({ type: 'clear-metrics' })}
              />
              <TimeControl
                grouping={state.grouping}
                startDate={state.startDate}
                endDate={state.endDate}
                onGroupingChange={(grouping) => dispatch({ type: 'set-grouping', grouping })}
                onDateRangeChange={(startDate, endDate) =>
                  dispatch({ type: 'set-date-range', startDate, endDate })
                }
              />
            </div>
            <div className="zoom-controls" aria-label="Chart zoom controls">
              <button
                className="zoom-button"
                type="button"
                aria-label="Zoom out"
                onClick={() => dispatch({ type: 'zoom-out' })}
                disabled={!canZoom || (state.zoomStart === 0 && state.zoomEnd === 100)}
              >
                <Minus aria-hidden="true" />
                Zoom out
              </button>
              <span>{Math.round(state.zoomEnd - state.zoomStart)}%</span>
              <button
                className="zoom-button"
                type="button"
                aria-label="Zoom in"
                onClick={() => dispatch({ type: 'zoom-in' })}
                disabled={!canZoom || state.zoomEnd - state.zoomStart <= 20}
              >
                <Plus aria-hidden="true" />
                Zoom in
              </button>
              <button
                className="icon-button icon-button--small"
                type="button"
                aria-label="Reset zoom"
                onClick={() => dispatch({ type: 'set-zoom', start: 0, end: 100 })}
                disabled={!canZoom || (state.zoomStart === 0 && state.zoomEnd === 100)}
              >
                <RotateCcw aria-hidden="true" />
              </button>
            </div>
          </div>
          {state.selectedEntityIds.length > 0 ? (
            <div className="active-filter-summary">
              <span>
                Showing {state.selectedEntityIds.length} of {availableEntities.length}
              </span>
              {selectedEntities.map((entity) => (
                <span className="filter-chip" key={entity.id}>
                  {entity.name}
                </span>
              ))}
              <button
                className="text-button"
                type="button"
                onClick={() => dispatch({ type: 'clear-filter' })}
              >
                Clear
              </button>
            </div>
          ) : null}
          <MetricSummary data={chartData} metrics={state.selectedMetrics} />
          <PerformanceChart
            data={chartData}
            metrics={state.selectedMetrics}
            selectedEntityNames={selectedNames}
            zoomStart={state.zoomStart}
            zoomEnd={state.zoomEnd}
            onZoomChange={(start, end) => dispatch({ type: 'set-zoom', start, end })}
          />
          <p className="chart-note">
            Metrics are calculated from the supplied sample data. Select a filter category to
            compare packages, placements, targeting, creative, or products without double-counting
            across dimensions.
          </p>
        </div>
      ) : null}
    </section>
  );
};
