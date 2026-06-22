import { useEffect, useState } from 'react';
import { clearStoredSession, onSessionExpired } from './api/client.js';
import Layout from './components/Layout.jsx';
import Appointments from './pages/Appointments.jsx';
import Budgets from './pages/Budgets.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Financial from './pages/Financial.jsx';
import Login from './pages/Login.jsx';
import MarketingAI from './pages/MarketingAI.jsx';
import ContentCalendar from './pages/ContentCalendar.jsx';
import ModulePage from './pages/ModulePage.jsx';
import Patients from './pages/Patients.jsx';
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
  const readOnly = user.role === 'leitura' || ['audit', 'users'].includes(activePage);
  if (activePage === 'content-calendar') {
    return (
      <Layout activePage={activePage} onChangePage={setActivePage} user={user} onLogout={handleLogout}>
        <ContentCalendar readOnly={readOnly} />
      </Layout>
    );
  }
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
