import { useState } from 'react';
import Layout from './components/Layout.jsx';
import Appointments from './pages/Appointments.jsx';
import Budgets from './pages/Budgets.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Financial from './pages/Financial.jsx';
import Login from './pages/Login.jsx';
import MarketingAI from './pages/MarketingAI.jsx';
import ModulePage from './pages/ModulePage.jsx';
import Patients from './pages/Patients.jsx';
import { groups } from './modules.js';

const marketingResources = {
  marketing: 'calendar',
  'content-calendar': 'calendar',
  captions: 'captions',
  reels: 'reels',
  stories: 'stories',
  metrics: 'metrics',
  crm: 'crm',
  tasks: 'agenda',
  whatsapp: 'whatsapp',
  'ai-assistant': 'reels',
};
const pageLabels = Object.fromEntries(groups.flatMap((group) => group.items));
const fixedPages = {
  appointments: Appointments,
  budgets: Budgets,
  dashboard: Dashboard,
  financial: Financial,
  patients: Patients,
};

function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem('belleart_user'));
  } catch {
    localStorage.removeItem('belleart_user');
    return null;
  }
}

export default function App() {
  const [user, setUser] = useState(getStoredUser);
  const [activePage, setActivePage] = useState('dashboard');

  function handleLogout() {
    localStorage.removeItem('belleart_token');
    localStorage.removeItem('belleart_user');
    setActivePage('dashboard');
    setUser(null);
  }

  if (!user) {
    return <Login onLogin={setUser} />;
  }

  const PageComponent = fixedPages[activePage];
  const readOnly = user.role === 'leitura' || ['audit', 'users'].includes(activePage);
  const page = marketingResources[activePage] ? (
    <MarketingAI resource={marketingResources[activePage]} readOnly={readOnly} />
  ) : PageComponent ? (
    <PageComponent />
  ) : (
    <ModulePage
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
