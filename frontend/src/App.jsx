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

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<Layout />}>
          <Route path="/" element={<OperatingSystem />} />
          <Route path="/legacy-dashboard" element={<Dashboard />} />
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
