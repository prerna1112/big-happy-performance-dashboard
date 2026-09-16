import { useEffect, useRef } from 'react';
import {
  BarChart3,
  BriefcaseBusiness,
  ChevronLeft,
  ChevronRight,
  Gauge,
  Images,
  RefreshCcw,
  ScrollText,
  ShieldCheck,
  Target,
  Users,
  X,
} from 'lucide-react';
import { navigationItems } from '../../data/config';

const icons = [
  BriefcaseBusiness,
  Target,
  Users,
  ShieldCheck,
  Images,
  Gauge,
  BarChart3,
  RefreshCcw,
  Users,
  ScrollText,
] as const;

interface SidebarProps {
  collapsed: boolean;
  mobileOpen: boolean;
  onToggleCollapsed: () => void;
  onCloseMobile: () => void;
  onNavigate: (label: string) => void;
}

export const Sidebar = ({
  collapsed,
  mobileOpen,
  onToggleCollapsed,
  onCloseMobile,
  onNavigate,
}: SidebarProps) => {
  const sidebarRef = useRef<HTMLElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!mobileOpen) return;
    previousFocusRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const frame = window.requestAnimationFrame(() => {
      sidebarRef.current?.querySelector<HTMLElement>('.sidebar__mobile-close')?.focus();
    });
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') onCloseMobile();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      window.cancelAnimationFrame(frame);
      document.removeEventListener('keydown', handleKeyDown);
      previousFocusRef.current?.focus();
    };
  }, [mobileOpen, onCloseMobile]);

  return (
    <>
      {mobileOpen ? (
        <button
          className="sidebar-backdrop"
          type="button"
          onClick={onCloseMobile}
          aria-label="Close navigation"
        />
      ) : null}
      <aside
        ref={sidebarRef}
        className={`sidebar ${collapsed ? 'sidebar--collapsed' : ''} ${mobileOpen ? 'sidebar--mobile-open' : ''}`}
        aria-label="Primary navigation"
      >
        <div className="sidebar__controls">
          <button
            className="icon-button sidebar__desktop-toggle"
            type="button"
            onClick={onToggleCollapsed}
            aria-label={collapsed ? 'Expand navigation' : 'Collapse navigation'}
          >
            {collapsed ? <ChevronRight aria-hidden="true" /> : <ChevronLeft aria-hidden="true" />}
          </button>
          <button
            className="icon-button sidebar__mobile-close"
            type="button"
            onClick={onCloseMobile}
            aria-label="Close navigation"
          >
            <X aria-hidden="true" />
          </button>
        </div>
        <nav>
          <ul className="sidebar__list">
            {navigationItems.map((item, index) => {
              const Icon = icons[index];
              if (!Icon) return null;
              return (
                <li key={item}>
                  <button
                    type="button"
                    className={
                      item === 'Park Ranger'
                        ? 'sidebar__link sidebar__link--active'
                        : 'sidebar__link'
                    }
                    onClick={() => onNavigate(item)}
                    aria-current={item === 'Park Ranger' ? 'page' : undefined}
                    title={collapsed ? item : undefined}
                  >
                    <Icon aria-hidden="true" />
                    <span>{item}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>
    </>
  );
};
