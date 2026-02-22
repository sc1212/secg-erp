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
import MissionControl from './pages/MissionControl';
import Calendar from './pages/Calendar';
import DailyLogs from './pages/DailyLogs';
import Weather from './pages/Weather';
import Documents from './pages/Documents';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/mission" element={<MissionControl />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/projects/:id" element={<ProjectDetail />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/daily-logs" element={<DailyLogs />} />
          <Route path="/weather" element={<Weather />} />
          <Route path="/financials" element={<Financials />} />
          <Route path="/payments" element={<Payments />} />
          <Route path="/vendors" element={<Vendors />} />
          <Route path="/crm" element={<CRM />} />
          <Route path="/team" element={<Team />} />
          <Route path="/documents" element={<Documents />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
