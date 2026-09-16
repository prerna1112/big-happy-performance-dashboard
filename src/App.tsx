import { lazy, Suspense, useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import { DealHeader, type DealDetails } from './components/dashboard/DealHeader';
import { SummaryCards } from './components/dashboard/SummaryCards';
import { AppHeader } from './components/layout/AppHeader';
import { Modal } from './components/layout/Modal';
import { Sidebar } from './components/layout/Sidebar';
import { Toast } from './components/layout/Toast';
import { analyticsCatalog, availableDateRange } from './data/normalize';
import { aggregateAnalytics } from './utils/analytics';

const initialDetails: DealDetails = {
  title: 'New Business Testing 2026',
  advertiser: 'Big Happy Coffee Co.',
  agency: 'Independent',
};

const PerformanceAnalytics = lazy(() =>
  import('./components/analytics/PerformanceAnalytics').then((module) => ({
    default: module.PerformanceAnalytics,
  })),
);

const initialChartData = aggregateAnalytics(
  analyticsCatalog.packages,
  'day',
  availableDateRange.min,
  availableDateRange.max,
);

export default function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileNavigationOpen, setMobileNavigationOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [summaryCollapsed, setSummaryCollapsed] = useState(false);
  const [details, setDetails] = useState(initialDetails);
  const [draftDetails, setDraftDetails] = useState(initialDetails);
  const [toast, setToast] = useState('');
  const editTriggerRef = useRef<HTMLButtonElement>(null);

  const notify = useCallback((message: string) => setToast(message), []);
  const openMobileNavigation = useCallback(() => setMobileNavigationOpen(true), []);
  const closeMobileNavigation = useCallback(() => setMobileNavigationOpen(false), []);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(''), 4200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    if (!mobileNavigationOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileNavigationOpen]);

  const openEditor = (): void => {
    setDraftDetails(details);
    setEditOpen(true);
  };

  const saveDetails = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    setDetails(draftDetails);
    setEditOpen(false);
    notify('Deal details updated.');
  };

  return (
    <div className="app-shell">
      <a
        className="skip-link"
        href="#main-content"
        onClick={(event) => {
          event.preventDefault();
          const main = document.getElementById('main-content');
          main?.focus();
        }}
      >
        Skip to main content
      </a>
      <div inert={mobileNavigationOpen ? true : undefined}>
        <AppHeader onToggleNavigation={openMobileNavigation} onNotify={notify} />
      </div>
      <Sidebar
        collapsed={sidebarCollapsed}
        mobileOpen={mobileNavigationOpen}
        onToggleCollapsed={() => setSidebarCollapsed((value) => !value)}
        onCloseMobile={closeMobileNavigation}
        onNavigate={(label) => {
          closeMobileNavigation();
          if (label !== 'Park Ranger') notify(`${label} is outside this assessment view.`);
        }}
      />
      <main
        inert={mobileNavigationOpen ? true : undefined}
        id="main-content"
        tabIndex={-1}
        className={sidebarCollapsed ? 'main-content main-content--wide' : 'main-content'}
      >
        <DealHeader
          details={details}
          summaryCollapsed={summaryCollapsed}
          onToggleSummary={() => setSummaryCollapsed((value) => !value)}
          editButtonRef={editTriggerRef}
          onEdit={openEditor}
          onNotify={notify}
        />
        {!summaryCollapsed ? <SummaryCards data={initialChartData} /> : null}
        <Suspense
          fallback={
            <section
              className="surface analytics-loading"
              aria-label="Loading performance analytics"
            >
              <span />
              <span />
              <span />
            </section>
          }
        >
          <PerformanceAnalytics onNotify={notify} />
        </Suspense>
      </main>

      <Modal
        title="Edit deal details"
        open={editOpen}
        returnFocusRef={editTriggerRef}
        onClose={() => setEditOpen(false)}
      >
        <form className="edit-form" onSubmit={saveDetails}>
          <label>
            Deal name
            <input
              required
              value={draftDetails.title}
              onChange={(event) =>
                setDraftDetails((value) => ({ ...value, title: event.target.value }))
              }
            />
          </label>
          <label>
            Advertiser
            <input
              required
              value={draftDetails.advertiser}
              onChange={(event) =>
                setDraftDetails((value) => ({ ...value, advertiser: event.target.value }))
              }
            />
          </label>
          <label>
            Agency
            <input
              required
              value={draftDetails.agency}
              onChange={(event) =>
                setDraftDetails((value) => ({ ...value, agency: event.target.value }))
              }
            />
          </label>
          <div className="modal__actions">
            <button
              className="button button--muted"
              type="button"
              onClick={() => setEditOpen(false)}
            >
              Cancel
            </button>
            <button className="button button--primary" type="submit">
              Save changes
            </button>
          </div>
        </form>
      </Modal>
      {toast ? <Toast message={toast} onDismiss={() => setToast('')} /> : null}
    </div>
  );
}
