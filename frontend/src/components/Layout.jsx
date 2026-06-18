import Navigation from './Navigation.jsx';

export default function Layout({ activePage, onChangePage, user, onLogout, children }) {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <header>
          <span className="logo" aria-hidden="true">BA</span>
          <h1>BELLEART OS</h1>
          <p>Clínica, marketing e gestão em um só lugar.</p>
        </header>

        <Navigation
          activePage={activePage}
          onChangePage={onChangePage}
          user={user}
        />

        <footer className="user-box">
          <strong>{user.name}</strong>
          <small>{user.role}</small>
          <button className="secondary" type="button" onClick={onLogout}>
            Sair
          </button>
        </footer>
      </aside>

      <main className="content">{children}</main>
    </div>
  );
}
