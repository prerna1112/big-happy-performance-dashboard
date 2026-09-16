import { useMemo, useReducer } from 'react';
import { analyticsCatalog, availableDateRange } from '../data/normalize';
import { aggregateAnalytics } from '../utils/analytics';
import type { AnalyticsState, DimensionKey, MetricKey, TimeGrouping } from '../types/analytics';

type AnalyticsAction =
  | { type: 'set-dimension'; dimension: DimensionKey }
  | { type: 'toggle-entity'; id: string }
  | { type: 'clear-filter' }
  | { type: 'toggle-metric'; metric: MetricKey }
  | { type: 'clear-metrics' }
  | { type: 'set-grouping'; grouping: TimeGrouping }
  | { type: 'set-date-range'; startDate: string; endDate: string }
  | { type: 'set-zoom'; start: number; end: number }
  | { type: 'zoom-in' }
  | { type: 'zoom-out' };

const initialState: AnalyticsState = {
  activeDimension: 'packages',
  selectedEntityIds: [],
  selectedMetrics: ['impressions', 'ctr'],
  grouping: 'day',
  startDate: availableDateRange.min,
  endDate: availableDateRange.max,
  zoomStart: 0,
  zoomEnd: 100,
};

const reducer = (state: AnalyticsState, action: AnalyticsAction): AnalyticsState => {
  switch (action.type) {
    case 'set-dimension':
      return {
        ...state,
        activeDimension: action.dimension,
        selectedEntityIds: [],
        zoomStart: 0,
        zoomEnd: 100,
      };
    case 'toggle-entity': {
      const selectedEntityIds = state.selectedEntityIds.includes(action.id)
        ? state.selectedEntityIds.filter((id) => id !== action.id)
        : [...state.selectedEntityIds, action.id];
      return { ...state, selectedEntityIds, zoomStart: 0, zoomEnd: 100 };
    }
    case 'clear-filter':
      return { ...state, selectedEntityIds: [], zoomStart: 0, zoomEnd: 100 };
    case 'toggle-metric':
      return {
        ...state,
        selectedMetrics: state.selectedMetrics.includes(action.metric)
          ? state.selectedMetrics.filter((metric) => metric !== action.metric)
          : [...state.selectedMetrics, action.metric],
      };
    case 'clear-metrics':
      return { ...state, selectedMetrics: [] };
    case 'set-grouping':
      return { ...state, grouping: action.grouping, zoomStart: 0, zoomEnd: 100 };
    case 'set-date-range':
      return {
        ...state,
        startDate: action.startDate,
        endDate: action.endDate,
        zoomStart: 0,
        zoomEnd: 100,
      };
    case 'set-zoom':
      return { ...state, zoomStart: action.start, zoomEnd: action.end };
    case 'zoom-in': {
      const span = state.zoomEnd - state.zoomStart;
      if (span <= 20) return state;
      const adjustment = Math.max(5, span * 0.15);
      return {
        ...state,
        zoomStart: Math.min(state.zoomStart + adjustment, 80),
        zoomEnd: Math.max(state.zoomEnd - adjustment, 20),
      };
    }
    case 'zoom-out': {
      const span = state.zoomEnd - state.zoomStart;
      const adjustment = Math.max(5, span * 0.2);
      return {
        ...state,
        zoomStart: Math.max(0, state.zoomStart - adjustment),
        zoomEnd: Math.min(100, state.zoomEnd + adjustment),
      };
    }
  }
};

export const useAnalyticsState = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const availableEntities = analyticsCatalog[state.activeDimension];
  const selectedEntityIdSet = useMemo(
    () => new Set(state.selectedEntityIds),
    [state.selectedEntityIds],
  );
  const selectedEntities = useMemo(
    () =>
      state.selectedEntityIds.length === 0
        ? availableEntities
        : availableEntities.filter((entity) => selectedEntityIdSet.has(entity.id)),
    [availableEntities, selectedEntityIdSet, state.selectedEntityIds.length],
  );
  const chartData = useMemo(
    () => aggregateAnalytics(selectedEntities, state.grouping, state.startDate, state.endDate),
    [selectedEntities, state.grouping, state.startDate, state.endDate],
  );

  return { state, dispatch, availableEntities, selectedEntities, chartData };
};
