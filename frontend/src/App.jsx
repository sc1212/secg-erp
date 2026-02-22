import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';
import Financials from './pages/Financials';
import Payments from './pages/Payments';
import Vendors from './pages/Vendors';
import CRM from './pages/CRM';
import Team from './pages/Team';
import MorningBriefing from './pages/MorningBriefing';
import Calendar from './pages/Calendar';
import DailyLogs from './pages/DailyLogs';
import Fleet from './pages/Fleet';
import Inventory from './pages/Inventory';
import Documents from './pages/Documents';
import Safety from './pages/Safety';
import Warranties from './pages/Warranties';
import ProtectedRoute from './components/auth/ProtectedRoute';
import MissionControl from './pages/MissionControl';
import Calendar from './pages/Calendar';
import DailyLogs from './pages/DailyLogs';
import Weather from './pages/Weather';
import Documents from './pages/Documents';
import Inventory from './pages/Inventory';
import Fleet from './pages/Fleet';
import Safety from './pages/Safety';
import Warranties from './pages/Warranties';
import Scorecard from './pages/Scorecard';
import ClientPortal from './pages/ClientPortal';
import MorningBriefing from './pages/MorningBriefing';
import Draws from './pages/Draws';
import TimeClock from './pages/TimeClock';
import Decisions from './pages/Decisions';
import Exceptions from './pages/Exceptions';
import Permits from './pages/Permits';
import ProfitFade from './pages/ProfitFade';
import CashFlow from './pages/CashFlow';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/morning-briefing" element={<MorningBriefing />} />

          <Route path="/mission-control" element={<OperatingSystem />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/daily-logs" element={<DailyLogs />} />
          <Route path="/fleet" element={<Fleet />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/documents" element={<Documents />} />
          <Route path="/safety" element={<Safety />} />
          <Route path="/warranties" element={<Warranties />} />

        <Route element={<Layout />}>
          {/* Command */}
          <Route path="/" element={<Dashboard />} />
          <Route path="/mission" element={<MissionControl />} />
          <Route path="/briefing" element={<MorningBriefing />} />

          {/* Operations */}
          <Route path="/projects" element={<Projects />} />
          <Route path="/projects/:id" element={<ProjectDetail />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/daily-logs" element={<DailyLogs />} />
          <Route path="/fleet" element={<Fleet />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/permits" element={<Permits />} />

          {/* Finance */}
          <Route path="/financials" element={<Financials />} />
          <Route path="/payments" element={<Payments />} />
          <Route path="/vendors" element={<Vendors />} />
          <Route path="/draws" element={<Draws />} />
          <Route path="/profit-fade" element={<ProfitFade />} />
          <Route path="/cash-flow" element={<CashFlow />} />

          {/* People */}
          <Route path="/team" element={<Team />} />
          <Route path="/timeclock" element={<TimeClock />} />
          <Route path="/crm" element={<CRM />} />

          {/* Compliance */}
          <Route path="/documents" element={<Documents />} />
          <Route path="/safety" element={<Safety />} />
          <Route path="/warranties" element={<Warranties />} />

          {/* Phase 0 — Decision / Exception queues */}
          <Route path="/decisions" element={<Decisions />} />
          <Route path="/exceptions" element={<Exceptions />} />

          {/* Legacy routes (still accessible, not in main sidebar) */}
          <Route path="/weather" element={<Weather />} />
          <Route path="/scorecard" element={<Scorecard />} />
          <Route path="/portal" element={<ClientPortal />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
