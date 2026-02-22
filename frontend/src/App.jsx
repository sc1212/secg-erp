import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Login from './pages/Login';

import Dashboard from './pages/Dashboard';
import MissionControl from './pages/MissionControl';
import MorningBriefing from './pages/MorningBriefing';

import Projects from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';
import Calendar from './pages/Calendar';
import DailyLogs from './pages/DailyLogs';
import Fleet from './pages/Fleet';
import Inventory from './pages/Inventory';
import Permits from './pages/Permits';

import Financials from './pages/Financials';
import Payments from './pages/Payments';
import Vendors from './pages/Vendors';
import Draws from './pages/Draws';
import ProfitFade from './pages/ProfitFade';
import CashFlow from './pages/CashFlow';

import Team from './pages/Team';
import TimeClock from './pages/TimeClock';
import CRM from './pages/CRM';

import Documents from './pages/Documents';
import Safety from './pages/Safety';
import Warranties from './pages/Warranties';

import Decisions from './pages/Decisions';
import Exceptions from './pages/Exceptions';

import PurchaseOrders from './pages/PurchaseOrders';
import CostCodes from './pages/CostCodes';
import AccountingSync from './pages/AccountingSync';
import PeriodClose from './pages/PeriodClose';
import PnLByJob from './pages/PnLByJob';
import HistoricalCosts from './pages/HistoricalCosts';

import Weather from './pages/Weather';
import Scorecard from './pages/Scorecard';
import ClientPortal from './pages/ClientPortal';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          {/* Command */}
          <Route path="/" element={<Dashboard />} />
          <Route path="/mission-control" element={<MissionControl />} />
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

          {/* Decision / Exception queues */}
          <Route path="/decisions" element={<Decisions />} />
          <Route path="/exceptions" element={<Exceptions />} />

          {/* Financial detail pages */}
          <Route path="/purchase-orders" element={<PurchaseOrders />} />
          <Route path="/cost-codes" element={<CostCodes />} />
          <Route path="/accounting" element={<AccountingSync />} />
          <Route path="/period-close" element={<PeriodClose />} />
          <Route path="/pl-by-job" element={<PnLByJob />} />
          <Route path="/historical-costs" element={<HistoricalCosts />} />

          {/* Legacy */}
          <Route path="/weather" element={<Weather />} />
          <Route path="/scorecard" element={<Scorecard />} />
          <Route path="/portal" element={<ClientPortal />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
