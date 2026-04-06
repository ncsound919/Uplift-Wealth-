export type Page = 'dashboard' | 'portfolio' | 'academy' | 'revenue' | 'planner' | 'strategies';

interface NavigationProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

export default function Navigation({ currentPage, onNavigate }: NavigationProps) {
  const navItems: { id: Page; label: string }[] = [
    { id: 'dashboard', label: '📊 Dashboard' },
    { id: 'portfolio', label: '💼 Portfolio' },
    { id: 'strategies', label: '📈 Strategies' },
    { id: 'academy', label: '🎓 Academy' },
    { id: 'revenue', label: '💰 Revenue Hub' },
    { id: 'planner', label: '🎯 Planner' },
  ];

  return (
    <nav className="navigation">
      <span className="nav-logo">Uplift Wealth</span>
      <ul className="nav-menu">
        {navItems.map((item) => (
          <li key={item.id} className="nav-item">
            <button
              type="button"
              className={`nav-link ${currentPage === item.id ? 'active' : ''}`}
              onClick={() => {
                onNavigate(item.id);
              }}
            >
              {item.label}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
