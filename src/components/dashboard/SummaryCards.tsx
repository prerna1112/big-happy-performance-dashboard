import { useCallback, useRef, useState, type CSSProperties } from 'react';
import {
  Activity,
  BarChart3,
  CircleDollarSign,
  Eye,
  Filter,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { useDismissibleLayer } from '../../hooks/useDismissibleLayer';
import { calculateMetricTrend, formatMetricValue, summarizeMetric } from '../../utils/analytics';
import type { ChartDatum } from '../../types/analytics';

interface SummaryCardsProps {
  data: ChartDatum[];
}

interface BudgetCardProps {
  title: string;
  deliveredValue: number;
  budget: number;
}

const referenceTargets = {
  flightDays: 30,
  contractedImpressions: 293_251,
  ioBudget: 52_250,
  dealBudget: 26_250,
} as const;

const BudgetCard = ({ title, deliveredValue, budget }: BudgetCardProps) => {
  const [expanded, setExpanded] = useState(true);
  const [filterOpen, setFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);
  const closeFilter = useCallback(() => setFilterOpen(false), []);
  useDismissibleLayer(filterRef, closeFilter, filterOpen);
  const progress = Math.min(100, (deliveredValue / budget) * 100);
  const projectedPacing = Math.min(100, progress * 1.05);
  const evenDailySpend = budget / referenceTargets.flightDays;
  const averageDailySpend = deliveredValue / referenceTargets.flightDays;
  const requiredDailySpend = Math.max(0, budget - deliveredValue) / referenceTargets.flightDays;
  const detailsId = `${title.toLowerCase().replaceAll(' ', '-')}-details`;

  return (
    <article className="summary-card budget-card">
      <div className="summary-card__header">
        <span className="summary-card__icon summary-card__icon--blue">
          <CircleDollarSign aria-hidden="true" />
        </span>
        <h3>{title}</h3>
        <div className="popover-anchor budget-card__filter" ref={filterRef}>
          <button
            type="button"
            className="chip-button"
            aria-expanded={filterOpen}
            onClick={() => setFilterOpen((open) => !open)}
          >
            Flights <Filter aria-hidden="true" size={14} />
          </button>
          {filterOpen ? (
            <div className="popover popover--compact empty-popover" role="status">
              No flight results
            </div>
          ) : null}
        </div>
      </div>
      <div
        className="gauge"
        style={{ '--gauge-progress': `${progress * 1.8}deg` } as CSSProperties}
      >
        <div className="gauge__center">
          <strong>{formatMetricValue('ssp_spend', deliveredValue, true)}</strong>
          <span>of {formatMetricValue('ssp_spend', budget, true)}</span>
        </div>
      </div>
      <div className="budget-card__pacing">
        <span>Average pacing</span>
        <strong>
          <TrendingUp aria-hidden="true" size={15} /> {progress.toFixed(1)}%
        </strong>
        <span>Projected pacing</span>
        <strong>
          <TrendingUp aria-hidden="true" size={15} /> {projectedPacing.toFixed(1)}%
        </strong>
      </div>
      <button
        className="disclosure-button"
        type="button"
        aria-expanded={expanded}
        aria-controls={detailsId}
        onClick={() => setExpanded((value) => !value)}
      >
        See {expanded ? 'less' : 'more'}
      </button>
      {expanded ? (
        <dl className="budget-card__details" id={detailsId}>
          <div>
            <dt>Even daily spend</dt>
            <dd>{formatMetricValue('ssp_spend', evenDailySpend)}</dd>
          </div>
          <div>
            <dt>Average daily spend</dt>
            <dd>{formatMetricValue('ssp_spend', averageDailySpend)}</dd>
          </div>
          <div>
            <dt>Daily spend for budget</dt>
            <dd>{formatMetricValue('ssp_spend', requiredDailySpend)}</dd>
          </div>
          <div>
            <dt>Remaining budget</dt>
            <dd>{formatMetricValue('ssp_spend', budget - deliveredValue)}</dd>
          </div>
        </dl>
      ) : null}
    </article>
  );
};

export const SummaryCards = ({ data }: SummaryCardsProps) => {
  const [benchmarkVisible, setBenchmarkVisible] = useState(false);
  const impressions = summarizeMetric(data, 'impressions');
  const ctr = summarizeMetric(data, 'ctr');
  const vcr = summarizeMetric(data, 'vcr');
  const timeSpent = summarizeMetric(data, 'time_spent');
  const impressionTrend = calculateMetricTrend(data, 'impressions');
  const ctrTrend = calculateMetricTrend(data, 'ctr');
  const contracted = referenceTargets.contractedImpressions;
  const deliveredPercent = Math.min(100, Math.round((impressions / contracted) * 100));
  const ioSpend = summarizeMetric(data, 'ssp_spend');
  const dealDeliveredValue = summarizeMetric(data, 'revenue');

  return (
    <section
      className="summary-scroller"
      id="summary-cards"
      aria-labelledby="summary-title"
      tabIndex={0}
    >
      <h2 id="summary-title" className="sr-only">
        Deal performance summary
      </h2>
      <p className="summary-scroll-hint">Swipe horizontally to view all summary cards</p>
      <div className="summary-grid">
        <div className="summary-stack">
          <article className="summary-card impressions-card">
            <div className="summary-card__header">
              <span className="summary-card__icon summary-card__icon--green">
                <Eye aria-hidden="true" />
              </span>
              <h3>Impressions</h3>
              <span className={impressionTrend >= 0 ? 'trend' : 'trend trend--negative'}>
                <span className="sr-only">{impressionTrend >= 0 ? 'Increased' : 'Decreased'} </span>
                {impressionTrend >= 0 ? (
                  <TrendingUp aria-hidden="true" size={16} />
                ) : (
                  <TrendingDown aria-hidden="true" size={16} />
                )}{' '}
                {Math.abs(impressionTrend).toFixed(1)}%
              </span>
            </div>
            <div className="impressions-card__value">
              <strong>{formatMetricValue('impressions', impressions)}</strong>
              <button
                className="benchmark-button"
                type="button"
                onClick={() => setBenchmarkVisible((visible) => !visible)}
                aria-expanded={benchmarkVisible}
              >
                <BarChart3 aria-hidden="true" size={17} />
                <span className="sr-only">View impression benchmark</span>
              </button>
              {benchmarkVisible ? (
                <span className="benchmark-message" role="status">
                  No benchmark values available.
                </span>
              ) : null}
            </div>
          </article>

          <article className="summary-card performance-card">
            <div className="summary-card__header">
              <span className="summary-card__icon">
                <Activity aria-hidden="true" />
              </span>
              <h3>Performance</h3>
              <span className={ctrTrend >= 0 ? 'trend' : 'trend trend--negative'}>
                <span className="sr-only">{ctrTrend >= 0 ? 'Increased' : 'Decreased'} </span>
                {ctrTrend >= 0 ? (
                  <TrendingUp aria-hidden="true" size={16} />
                ) : (
                  <TrendingDown aria-hidden="true" size={16} />
                )}{' '}
                {Math.abs(ctrTrend).toFixed(1)}%
              </span>
            </div>
            <dl className="mini-metrics">
              <div>
                <dt>Big Scroller</dt>
                <dd>N/A</dd>
              </div>
              <div>
                <dt>Sunrise</dt>
                <dd>N/A</dd>
              </div>
              <div>
                <dt>Avg CTR</dt>
                <dd>{formatMetricValue('ctr', ctr)}</dd>
              </div>
              <div>
                <dt>Avg Time Spent</dt>
                <dd>{formatMetricValue('time_spent', timeSpent)}</dd>
              </div>
              <div>
                <dt>Avg VCR</dt>
                <dd>{formatMetricValue('vcr', vcr)}</dd>
              </div>
            </dl>
          </article>
        </div>

        <article className="summary-card delivery-card">
          <div className="summary-card__header">
            <span className="summary-card__icon">
              <BarChart3 aria-hidden="true" />
            </span>
            <h3>Campaign Delivery</h3>
          </div>
          <div
            className="delivery-ring"
            role="img"
            aria-label={`${deliveredPercent}% delivered`}
            style={{ '--delivery-progress': `${deliveredPercent * 3.6}deg` } as CSSProperties}
          >
            <div>
              <strong>{deliveredPercent}%</strong>
              <span>Delivered</span>
            </div>
          </div>
          <dl className="delivery-card__legend">
            <div>
              <dt>
                <span className="legend-dot legend-dot--blue" />
                Delivered
              </dt>
              <dd>{formatMetricValue('impressions', impressions)}</dd>
            </div>
            <div>
              <dt>
                <span className="legend-dot" />
                Contracted
              </dt>
              <dd>{formatMetricValue('impressions', contracted)}</dd>
            </div>
          </dl>
        </article>

        <BudgetCard title="IO Budget" deliveredValue={ioSpend} budget={referenceTargets.ioBudget} />
        <BudgetCard
          title="Deal Budget"
          deliveredValue={dealDeliveredValue}
          budget={referenceTargets.dealBudget}
        />
      </div>
    </section>
  );
};
