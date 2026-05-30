import Navigation from './Navigation.jsx';

export default function Layout({ activePage, onChangePage, children }) {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div>
          <span className="logo">SO</span>
          <h1>Sistema Odontológico</h1>
          <p>Gestão simples para clínicas odontológicas.</p>
        </div>
        <Navigation activePage={activePage} onChangePage={onChangePage} />
      </aside>
      <main className="content">{children}</main>
    </div>
  );
}
