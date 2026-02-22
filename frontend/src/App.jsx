import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import OperatingSystem from './pages/OperatingSystem';
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

          <Route path="/projects" element={<Projects />} />
          <Route path="/projects/:id" element={<ProjectDetail />} />
          <Route path="/financials" element={<Financials />} />
          <Route path="/payments" element={<Payments />} />
          <Route path="/vendors" element={<Vendors />} />
          <Route path="/crm" element={<CRM />} />
          <Route path="/team" element={<Team />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
