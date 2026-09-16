import type { Ref } from 'react';
import { ChevronDown, ChevronUp, Pencil, RefreshCcw, Tag } from 'lucide-react';

export interface DealDetails {
  title: string;
  advertiser: string;
  agency: string;
}

interface DealHeaderProps {
  details: DealDetails;
  summaryCollapsed: boolean;
  onToggleSummary: () => void;
  editButtonRef?: Ref<HTMLButtonElement>;
  onEdit: () => void;
  onNotify: (message: string) => void;
}

const metadata = [
  { label: 'Boostr Deal ID', value: '1999227', link: true },
  { label: 'Deal Dates', value: '01/15/2026–02/13/2026', link: false },
  { label: 'Deal Budget', value: '$26,250', link: false },
  { label: 'IO Dates', value: '01/15/2026–03/31/2026', link: false },
  { label: 'IO Budget', value: '$52,250', link: false },
  { label: 'Type', value: 'Managed Service', link: false },
  { label: 'DSP', value: 'Xandr', link: false },
] as const;

export const DealHeader = ({
  details,
  summaryCollapsed,
  onToggleSummary,
  editButtonRef,
  onEdit,
  onNotify,
}: DealHeaderProps) => {
  const copyDealId = async (): Promise<void> => {
    try {
      if (!navigator.clipboard) throw new Error('Clipboard API unavailable');
      await navigator.clipboard.writeText('1999227');
      onNotify('Deal ID copied to clipboard.');
    } catch {
      onNotify('Copy was blocked by the browser. Deal ID: 1999227');
    }
  };

  return (
    <section className="surface deal-header" aria-labelledby="deal-title">
      <div className="deal-header__topline">
        <div>
          <p className="eyebrow">Active campaign</p>
          <h1 id="deal-title">{details.title}</h1>
          <p className="deal-header__date">DTC_01/15/2026–02/13/2026</p>
        </div>
        <div className="deal-actions" aria-label="Deal actions">
          <label className="select-field select-field--success">
            <span className="sr-only">Campaign state</span>
            <select defaultValue="Live" aria-label="Campaign state">
              <option>Live</option>
              <option>Paused</option>
              <option>Draft</option>
            </select>
          </label>
          <button
            className="button button--muted"
            type="button"
            onClick={() => onNotify('Sync queued. This local demo uses the bundled sample data.')}
          >
            <RefreshCcw aria-hidden="true" size={16} />
            <span>Sync to OMS</span>
          </button>
          <button
            className="button button--tag"
            type="button"
            onClick={() => onNotify('Peach Pod is attached to this deal.')}
          >
            <Tag aria-hidden="true" size={16} />
            <span>Peach Pod</span>
          </button>
          <label className="status-field">
            <span>Status</span>
            <select defaultValue="100" aria-label="Completion status">
              <option value="100">100%</option>
              <option value="75">75%</option>
              <option value="50">50%</option>
            </select>
          </label>
          <button
            ref={editButtonRef}
            className="button button--primary"
            type="button"
            onClick={onEdit}
          >
            <Pencil aria-hidden="true" size={16} />
            <span>Edit</span>
          </button>
          <button
            className="icon-button"
            type="button"
            aria-expanded={!summaryCollapsed}
            aria-controls="summary-cards"
            aria-label={
              summaryCollapsed ? 'Expand performance summary' : 'Collapse performance summary'
            }
            onClick={onToggleSummary}
          >
            {summaryCollapsed ? (
              <ChevronDown aria-hidden="true" size={20} />
            ) : (
              <ChevronUp aria-hidden="true" size={20} />
            )}
          </button>
        </div>
      </div>

      <dl className="deal-metadata" id="deal-metadata">
        {metadata.map((item) => (
          <div key={item.label}>
            <dt>{item.label}</dt>
            <dd title={item.value}>
              {item.link ? (
                <button type="button" className="text-link" onClick={() => void copyDealId()}>
                  {item.value}
                </button>
              ) : (
                item.value
              )}
            </dd>
          </div>
        ))}
        <div>
          <dt>Advertiser</dt>
          <dd title={details.advertiser}>{details.advertiser}</dd>
        </div>
        <div>
          <dt>Agency</dt>
          <dd title={details.agency}>{details.agency}</dd>
        </div>
      </dl>
    </section>
  );
};
