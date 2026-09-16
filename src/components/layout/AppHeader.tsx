import { useCallback, useRef, useState } from 'react';
import { Bell, Menu, MoreVertical, UserRound } from 'lucide-react';
import bigHappyLogo from '../../assets/big-happy-logo.svg';
import parkLogo from '../../assets/park-logo.png';
import { useDismissibleLayer } from '../../hooks/useDismissibleLayer';

interface AppHeaderProps {
  onToggleNavigation: () => void;
  onNotify: (message: string) => void;
}

export const AppHeader = ({ onToggleNavigation, onNotify }: AppHeaderProps) => {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const dismissNotifications = useCallback(() => setNotificationsOpen(false), []);
  useDismissibleLayer(notificationsRef, dismissNotifications, notificationsOpen);

  return (
    <header className="app-header">
      <div className="app-header__brand">
        <button
          className="icon-button app-header__menu"
          type="button"
          onClick={onToggleNavigation}
          aria-label="Toggle navigation"
        >
          <Menu aria-hidden="true" />
        </button>
        <img className="brand-logo" src={bigHappyLogo} alt="Big Happy" />
        <span className="brand-divider" aria-hidden="true" />
        <img className="park-logo" src={parkLogo} alt="PARK" />
      </div>

      <div className="app-header__actions">
        <div className="popover-anchor" ref={notificationsRef}>
          <button
            className="icon-button notification-button"
            type="button"
            aria-label="Notifications, 3 unread"
            aria-expanded={notificationsOpen}
            onClick={() => setNotificationsOpen((open) => !open)}
          >
            <Bell aria-hidden="true" />
            <span className="notification-badge">3</span>
          </button>
          {notificationsOpen ? (
            <div className="notification-panel popover" role="region" aria-label="Notifications">
              <p className="popover__eyebrow">Notifications</p>
              <strong>Campaign data is ready</strong>
              <p>Metrics were refreshed from the provided sample dataset.</p>
            </div>
          ) : null}
        </div>
        <button
          className="icon-button app-header__more"
          type="button"
          aria-label="More options"
          onClick={() => onNotify('More options are outside this assessment view.')}
        >
          <MoreVertical aria-hidden="true" />
        </button>
        <button
          className="profile-button"
          type="button"
          aria-label="Open user profile"
          onClick={() => onNotify('User profile is outside this assessment view.')}
        >
          <UserRound aria-hidden="true" />
        </button>
      </div>
    </header>
  );
};
