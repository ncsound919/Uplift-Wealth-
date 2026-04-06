export type Page = 'dashboard' | 'portfolio' | 'academy' | 'revenue' | 'planner';

interface NavigationProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

export default function Navigation({ currentPage, onNavigate }: NavigationProps) {
  const navItems: { id: Page; label: string }[] = [
    { id: 'dashboard', label: '📊 Dashboard' },
    { id: 'portfolio', label: '💼 Portfolio' },
    { id: 'academy', label: '🎓 Academy' },
    { id: 'revenue', label: '💰 Revenue Hub' },
    { id: 'planner', label: '📈 Financial Planner' },
  ];

  return (
    <nav className="navigation">
      <span className="nav-logo">Uplift Wealth</span>
      <ul className="nav-menu">
        {navItems.map((item) => (
          <li key={item.id} className="nav-item">
            <a
              className={`nav-link ${currentPage === item.id ? 'active' : ''}`}
              onClick={(e) => {
                e.preventDefault();
                onNavigate(item.id);
              }}
              href={`#${item.id}`}
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
