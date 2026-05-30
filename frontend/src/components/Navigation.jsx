const items = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'patients', label: 'Pacientes' },
  { id: 'budgets', label: 'Orçamentos' },
  { id: 'financial', label: 'Financeiro' },
  { id: 'appointments', label: 'Agenda' },
];

export default function Navigation({ activePage, onChangePage }) {
  return (
    <nav className="navigation" aria-label="Navegação principal">
      {items.map((item) => (
        <button
          key={item.id}
          className={activePage === item.id ? 'active' : ''}
          type="button"
          onClick={() => onChangePage(item.id)}
        >
          {item.label}
        </button>
      ))}
    </nav>
  );
}
