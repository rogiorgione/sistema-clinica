import { allowed, groups } from '../modules.js';

export default function Navigation({ activePage, onChangePage, user }) {
  const visibleGroups = groups
    .map((group) => ({
      ...group,
      items: group.items.filter(([id]) => allowed(id, user)),
    }))
    .filter((group) => group.items.length > 0);

  return (
    <nav className="navigation" aria-label="Navegação principal">
      {visibleGroups.map((group) => (
        <section className="nav-group" key={group.label}>
          <h2>{group.label}</h2>
          {group.items.map(([id, label]) => (
            <button
              key={id}
              className={activePage === id ? 'active' : ''}
              type="button"
              aria-current={activePage === id ? 'page' : undefined}
              onClick={() => onChangePage(id)}
            >
              {label}
            </button>
          ))}
        </section>
      ))}
    </nav>
  );
}
