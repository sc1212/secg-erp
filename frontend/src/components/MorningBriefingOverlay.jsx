import { useState, useEffect } from 'react';
import { useApi } from '../hooks/useApi';
import { api } from '../lib/api';
import { money } from '../lib/format';
import { Sun, Cloud, CloudRain, AlertTriangle, ChevronRight } from 'lucide-react';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

const DEMO_BRIEFING = {
  weather: {
    location: 'Murfreesboro, TN',
    temp: 48,
    conditions: 'Partly Cloudy',
    high: 55,
    low: 38,
    precipitation: 0,
    alerts: ['Freeze warning tonight \u2014 protect exposed pipes'],
  },
  changes: [
    { text: '3 new invoices synced from QuickBooks ($14,280)', link: '/financials?tab=ap', icon: '\u{1F4E5}' },
    { text: 'Vendor payment processed \u2014 Miller Concrete ($8,400)', link: '/payments', icon: '\u{1F4B3}' },
    { text: 'Connor submitted daily log \u2014 Riverside Custom', link: '/daily-logs', icon: '\u{1F4DD}' },
    { text: 'COI expiring in 3 days \u2014 Williams Electric', link: '/vendors?tab=compliance', icon: '\u{26A0}\u{FE0F}' },
  ],
  numbers: {
    cash: 247800,
    ar: 186400,
    ap_due: 42600,
    active_projects: 7,
    margin_good: 3,
    margin_watch: 2,
    margin_bad: 1,
  },
  attention: [
    { text: 'Draw request ready \u2014 Oak Creek ($45,000)', link: '/draws', severity: 'critical' },
    { text: '2 vendor invoices awaiting approval ($6,200)', link: '/payments', severity: 'warning' },
    { text: 'Punch list items overdue \u2014 Magnolia (5 items)', link: '/decisions', severity: 'warning' },
  ],
};

const WEATHER_ICONS = { 'Sunny': Sun, 'Clear': Sun, 'Partly Cloudy': Cloud, 'Cloudy': Cloud, 'Rain': CloudRain };

export default function MorningBriefingOverlay({ onDismiss, onNavigate }) {
  const [visible, setVisible] = useState(false);
  const { data } = useApi(() => api.morningBriefing(), []);
  const briefing = data || DEMO_BRIEFING;

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const WeatherIcon = WEATHER_ICONS[briefing.weather?.conditions] || Cloud;

  const handleDismiss = () => {
    setVisible(false);
    setTimeout(onDismiss, 300);
  };

  return (
    <div className={`briefing-overlay${visible ? ' visible' : ''}`} onClick={(e) => { if (e.target === e.currentTarget) handleDismiss(); }}>
      <div className={`briefing-modal${visible ? ' visible' : ''}`}>
        {/* Greeting */}
        <div className="briefing-greeting">
          <div className="briefing-hello">
            <Sun size={22} style={{ color: 'var(--status-warning)' }} />
            <span>{getGreeting()}, Samuel.</span>
          </div>
          <div className="briefing-date">{today}</div>
        </div>

        <div className="briefing-divider" />

        {/* Weather */}
        {briefing.weather && (
          <>
            <div className="briefing-section">
              <div className="briefing-section-label">WEATHER \u2014 {briefing.weather.location}</div>
              <div className="briefing-weather-main">
                <WeatherIcon size={28} style={{ color: 'var(--text-secondary)' }} />
                <span className="briefing-temp">{briefing.weather.temp}\u00B0F</span>
                <span className="briefing-conditions">{briefing.weather.conditions}</span>
                <span className="briefing-hilo">H {briefing.weather.high}\u00B0 / L {briefing.weather.low}\u00B0</span>
                <span className="briefing-precip">{briefing.weather.precipitation}% {'\u{1F327}\u{FE0F}'}</span>
              </div>
              {briefing.weather.alerts?.map((alert, i) => (
                <div key={i} className="briefing-weather-alert">
                  <AlertTriangle size={13} />
                  <span>{alert}</span>
                </div>
              ))}
            </div>
            <div className="briefing-divider" />
          </>
        )}

        {/* What Changed */}
        <div className="briefing-section">
          <div className="briefing-section-label">WHAT CHANGED SINCE YOUR LAST LOGIN</div>
          {briefing.changes?.map((item, i) => (
            <button
              key={i}
              className="briefing-change-item"
              onClick={() => onNavigate(item.link)}
            >
              <span className="briefing-change-icon">{item.icon}</span>
              <span className="briefing-change-text">{item.text}</span>
              <ChevronRight size={14} className="briefing-arrow" />
            </button>
          ))}
        </div>

        <div className="briefing-divider" />

        {/* Key Numbers */}
        <div className="briefing-section">
          <div className="briefing-section-label">KEY NUMBERS</div>
          <div className="briefing-numbers">
            <div className="briefing-number">
              <span className="briefing-number-label">Cash</span>
              <span className="briefing-number-value">{money(briefing.numbers?.cash ?? 0)}</span>
            </div>
            <div className="briefing-number">
              <span className="briefing-number-label">AR</span>
              <span className="briefing-number-value">{money(briefing.numbers?.ar ?? 0)}</span>
            </div>
            <div className="briefing-number">
              <span className="briefing-number-label">AP Due</span>
              <span className="briefing-number-value" style={{ color: 'var(--status-loss)' }}>{money(briefing.numbers?.ap_due ?? 0)}</span>
            </div>
            <div className="briefing-number">
              <span className="briefing-number-label">Active Jobs</span>
              <span className="briefing-number-value">{briefing.numbers?.active_projects ?? 0}</span>
            </div>
            <div className="briefing-number">
              <span className="briefing-number-label">Margin Health</span>
              <span className="briefing-number-value" style={{ fontSize: 13 }}>
                {briefing.numbers?.margin_good ?? 0} {'\u2705'} {briefing.numbers?.margin_watch ?? 0} {'\u26A0\uFE0F'} {briefing.numbers?.margin_bad ?? 0} {'\u{1F534}'}
              </span>
            </div>
          </div>
        </div>

        <div className="briefing-divider" />

        {/* Needs Attention */}
        <div className="briefing-section">
          <div className="briefing-section-label">NEEDS YOUR ATTENTION ({briefing.attention?.length ?? 0})</div>
          {briefing.attention?.map((item, i) => (
            <button
              key={i}
              className="briefing-attention-item"
              onClick={() => onNavigate(item.link)}
            >
              <span className={`briefing-attention-dot ${item.severity}`} />
              <span className="briefing-attention-text">{item.text}</span>
              <ChevronRight size={14} className="briefing-arrow" />
            </button>
          ))}
        </div>

        {/* Actions */}
        <div className="briefing-actions">
          <button className="briefing-btn-primary" onClick={handleDismiss}>Go to Dashboard</button>
          <button className="briefing-btn-secondary" onClick={handleDismiss}>Don&apos;t show today</button>
        </div>
      </div>
    </div>
  );
}
