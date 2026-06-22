import { useEffect, useState } from 'react';
import { clearStoredSession, onSessionExpired } from './api/client.js';
import Layout from './components/Layout.jsx';
import Appointments from './pages/Appointments.jsx';
import Budgets from './pages/Budgets.jsx';
import Dashboard from './pages/Dashboard.jsx';
import ExecutivePanel from './pages/ExecutivePanel.jsx';
import Financial from './pages/Financial.jsx';
import Login from './pages/Login.jsx';
import MarketingAI from './pages/MarketingAI.jsx';
import AssistantAI from './pages/AssistantAI.jsx';
import ContentCalendar from './pages/ContentCalendar.jsx';
import CommercialCenter from './pages/CommercialCenter.jsx';
import TrafficCenter from './pages/TrafficCenter.jsx';
import OperationalModulePage from './pages/OperationalModulePage.jsx';
import Patients from './pages/Patients.jsx';
import PremiumOS from './pages/PremiumOS.jsx';
import { groups } from './modules.js';

const marketingResources = {
  marketing: 'calendar',
  'lead-capture': 'capture',
  'content-calendar': 'calendar',
  captions: 'captions',
  reels: 'reels',
  stories: 'stories',
  metrics: 'metrics',
  crm: 'crm',
  tasks: 'agenda',
  whatsapp: 'whatsapp',
};
const pageLabels = Object.fromEntries(groups.flatMap((group) => group.items));
const fixedPages = {
  appointments: Appointments,
  budgets: Budgets,
  dashboard: Dashboard,
  executive: ExecutivePanel,
  financial: Financial,
  patients: Patients,
  'premium-os': PremiumOS,
};

function getStoredSessionUser() {
  const token = localStorage.getItem('belleart_token');
  const storedUser = localStorage.getItem('belleart_user');

  if (!token || !storedUser) {
    clearStoredSession();
    return null;
  }

  try {
    return JSON.parse(storedUser);
  } catch {
    clearStoredSession();
    return null;
  }
}

export default function App() {
  const [user, setUser] = useState(getStoredSessionUser);
  const [activePage, setActivePage] = useState('dashboard');

  useEffect(() => onSessionExpired(() => {
    setActivePage('dashboard');
    setUser(null);
  }), []);

  function handleLogin(sessionUser) {
    if (!localStorage.getItem('belleart_token')) {
      clearStoredSession();
      setUser(null);
      return;
    }

    setActivePage('dashboard');
    setUser(sessionUser);
  }

  function handleLogout() {
    clearStoredSession();
    setActivePage('dashboard');
    setUser(null);
  }

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  const PageComponent = fixedPages[activePage];
  const readOnly = user.role === 'leitura' || activePage === 'audit';
  if (activePage === 'ai-assistant') {
    return (
      <Layout activePage={activePage} onChangePage={setActivePage} user={user} onLogout={handleLogout}>
        <AssistantAI readOnly={readOnly} />
      </Layout>
    );
  }
  if (activePage === 'content-calendar') {
    return (
      <Layout activePage={activePage} onChangePage={setActivePage} user={user} onLogout={handleLogout}>
        <ContentCalendar readOnly={readOnly} />
      </Layout>
    );
  }
  const trafficPages = ['trafficCenter', 'trafficCampaigns', 'trafficPlatforms', 'trafficLeads', 'trafficMetrics', 'trafficRoi', 'socialIntegrations', 'apiSettings'];
  const commercialPages = ['commercial', 'pipeline', 'leads', 'followup', 'objections', 'crmCampaigns', 'commercialReports', 'commercialDashboard'];
  const page = trafficPages.includes(activePage) ? (
    <TrafficCenter page={activePage} readOnly={readOnly} />
  ) : commercialPages.includes(activePage) ? (
    <CommercialCenter page={activePage} readOnly={readOnly} />
  ) : marketingResources[activePage] ? (
    <MarketingAI resource={marketingResources[activePage]} readOnly={readOnly} />
  ) : PageComponent ? (
    <PageComponent />
  ) : (
    <OperationalModulePage
      title={pageLabels[activePage] || 'Módulo'}
      path={activePage}
      readOnly={readOnly}
    />
  );

  return (
    <Layout
      activePage={activePage}
      onChangePage={setActivePage}
      user={user}
      onLogout={handleLogout}
    >
      {page}
    </Layout>
  );
}
