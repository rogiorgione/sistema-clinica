import { useState } from 'react';
import Layout from './components/Layout.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Patients from './pages/Patients.jsx';
import Budgets from './pages/Budgets.jsx';
import Financial from './pages/Financial.jsx';
import Appointments from './pages/Appointments.jsx';

const pages = {
  dashboard: <Dashboard />,
  patients: <Patients />,
  budgets: <Budgets />,
  financial: <Financial />,
  appointments: <Appointments />,
};

export default function App() {
  const [activePage, setActivePage] = useState('dashboard');

  return (
    <Layout activePage={activePage} onChangePage={setActivePage}>
      {pages[activePage]}
    </Layout>
  );
}
