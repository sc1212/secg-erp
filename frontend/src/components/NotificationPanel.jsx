import { X } from 'lucide-react';

function formatTimeAgo(ts) {
  if (!ts) return '';
  const diff = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 2) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs > 1 ? 's' : ''} ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return 'Yesterday';
  return `${days} days ago`;
}

function getTimeGroup(ts) {
  if (!ts) return 'Earlier';
  const diff = Date.now() - new Date(ts).getTime();
  const hrs = diff / 3600000;
  if (hrs < 24) return 'Today';
  if (hrs < 48) return 'Yesterday';
  return 'Earlier';
}

const SEVERITY_DOTS = {
  critical: { bg: 'var(--status-loss)', label: '\u{1F534}' },
  warning: { bg: 'var(--status-warning)', label: '\u{1F7E1}' },
  info: { bg: 'var(--status-info)', label: '\u{1F535}' },
  success: { bg: 'var(--status-profit)', label: '\u2705' },
};

export default function NotificationPanel({ notifications, onClickItem, onMarkAllRead, onClose }) {
  // Group by time
  const groups = {};
  notifications.forEach(n => {
    const group = getTimeGroup(n.created_at);
    if (!groups[group]) groups[group] = [];
    groups[group].push(n);
  });

  return (
    <div className="notif-panel" role="dialog" aria-label="Notifications">
      {/* Header */}
      <div className="notif-panel-header">
        <h3 className="notif-panel-title">Notifications</h3>
        <div className="flex items-center gap-2">
          <button className="notif-mark-all" onClick={onMarkAllRead}>Mark All</button>
          <button className="notif-close-btn" onClick={onClose}><X size={16} /></button>
        </div>
      </div>

      {/* Notification List */}
      <div className="notif-list">
        {notifications.length === 0 ? (
          <div className="notif-empty">All caught up! No new notifications.</div>
        ) : (
          Object.entries(groups).map(([groupLabel, items]) => (
            <div key={groupLabel}>
              <div className="notif-group-label">{groupLabel}</div>
              {items.map(n => {
                const sev = SEVERITY_DOTS[n.severity] || SEVERITY_DOTS.info;
                return (
                  <button
                    key={n.id}
                    className={`notif-item${!n.is_read ? ' unread' : ''}`}
                    onClick={() => onClickItem(n)}
                  >
                    <div className="notif-dot" style={{ background: sev.bg }} />
                    <div className="notif-content">
                      <div className="notif-item-title">{n.title}</div>
                      {n.body && <div className="notif-item-body">{n.body}</div>}
                      <div className="notif-item-time">{formatTimeAgo(n.created_at)}</div>
                    </div>
                    <span className="notif-arrow">\u2192</span>
                  </button>
                );
              })}
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="notif-panel-footer">
        <button className="notif-footer-link" onClick={() => { onClose(); }}>
          View Notification History \u2192
        </button>
      </div>
    </div>
  );
}
