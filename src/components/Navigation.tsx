interface NavigationProps {
  currentPage: string;
  onNavigate: (page: any) => void;
}

export default function Navigation({ currentPage, onNavigate }: NavigationProps) {
  const navItems = [
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
