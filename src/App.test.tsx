import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import React from 'react';

const { apiClientMock, mockNavigate, mockConfetti, currentPath } = vi.hoisted(() => ({
  apiClientMock: {
    getStoredUser: vi.fn().mockReturnValue(null),
    getProgress: vi.fn().mockResolvedValue({ completedLessons: [], completedModules: [] }),
    saveProgress: vi.fn().mockResolvedValue(undefined),
    saveLessonProgress: vi.fn().mockResolvedValue(undefined),
    logout: vi.fn(),
  },
  mockNavigate: vi.fn(),
  mockConfetti: vi.fn(),
  // Configurable pathname so route-sync effects can be exercised for each route.
  currentPath: { value: '/' },
}));

vi.mock('react-router-dom', () => ({
  useLocation: () => ({ pathname: currentPath.value, search: '', hash: '', state: null }),
  useNavigate: () => mockNavigate,
  MemoryRouter: ({ children }: any) => <div>{children}</div>,
}));

vi.mock('motion/react', () => {
  const Div = React.forwardRef(({ children, ...props }: any, ref: any) => <div ref={ref} {...props}>{children}</div>);
  Div.displayName = 'MotionDiv';
  return { motion: new Proxy({}, { get: () => Div }), AnimatePresence: ({ children }: any) => <div>{children}</div> };
});

vi.mock('canvas-confetti', () => ({ default: mockConfetti }));

vi.mock('./lib/apiClient', () => ({
  apiClient: apiClientMock,
}));

vi.mock('./lib/analytics', () => ({ capture: vi.fn() }));

vi.mock('./data/courseData', () => ({
  courseModules: [
    { id: 'module-1', level: 'beginner', title: 'Test Module 1', description: 'First module', icon: 'div', color: 'red', lessons: [{ id: 'm1-l1', title: 'Lesson 1', type: 'text' }] },
    { id: 'module-2', level: 'beginner', title: 'Test Module 2', description: 'Second module', icon: 'div', color: 'blue', lessons: [{ id: 'm2-l1', title: 'Lesson 1', type: 'quiz' }] },
    { id: 'module-3', level: 'expert', title: 'Test Module 3', description: 'Third module', icon: 'div', color: 'purple', lessons: [{ id: 'm3-l1', title: 'Lesson 1', type: 'text' }] },
    { id: 'module-4', level: 'expert', title: 'Test Module 4', description: 'Fourth module', icon: 'div', color: 'amber', lessons: [{ id: 'm4-l1', title: 'Lesson 1', type: 'text' }] },
    { id: 'module-5', level: 'intermediate', title: 'Test Module 5', description: 'Fifth module', icon: 'div', color: 'green', lessons: [{ id: 'm5-l1', title: 'Lesson 1', type: 'game' }] },
    { id: 'module-6', level: 'expert', title: 'Test Module 6', description: 'Sixth module', icon: 'div', color: 'indigo', lessons: [{ id: 'm6-l1', title: 'Lesson 1', type: 'text' }] },
    { id: 'module-7', level: 'expert', title: 'Test Module 7', description: 'Seventh module', icon: 'div', color: 'pink', lessons: [{ id: 'm7-l1', title: 'Lesson 1', type: 'text' }] },
    { id: 'module-8', level: 'expert', title: 'Test Module 8', description: 'Eighth module', icon: 'div', color: 'slate', lessons: [{ id: 'm8-l1', title: 'Lesson 1', type: 'text' }] },
    { id: 'module-12', level: 'beginner', title: 'Capstone Module', description: 'Final capstone', icon: 'div', color: 'gold', lessons: [{ id: 'm12-l1', title: 'Capstone Lesson', type: 'text' }] },
  ],
  CourseLevel: { BEGINNER: 'beginner', INTERMEDIATE: 'intermediate', EXPERT: 'expert' },
}));

vi.mock('./components/Dashboard', () => ({
  Dashboard: ({ onSelectModule, onSelectLevel, onCreateCustomModule, onEditCustomModule, onDeleteCustomModule }: any) => (
    <div data-testid="dashboard-mock">
      Dashboard
      <button data-testid="select-module" onClick={() => onSelectModule?.('module-1')}>Module 1</button>
      <button data-testid="select-module-5" onClick={() => onSelectModule?.('module-5')}>Module 5</button>
      <button data-testid="select-dots" onClick={() => onSelectModule?.('dots_article')}>Dots</button>
      <button data-testid="select-glossary-from-dash" onClick={() => onSelectModule?.('glossary')}>Glossary</button>
      <button data-testid="select-custom" onClick={() => onSelectModule?.('custom-1')}>Custom</button>
      <button data-testid="select-level" onClick={() => onSelectLevel?.('intermediate')}>Intermediate</button>
      <button data-testid="create-custom" onClick={() => onCreateCustomModule?.()}>Create Custom</button>
      <button data-testid="edit-custom" onClick={() => onEditCustomModule?.({ id: 'custom-1', title: 'Custom Mod', level: 'beginner', lessons: [], description: '', icon: null as any, color: '' })}>Edit Custom</button>
      <button data-testid="delete-custom" onClick={() => onDeleteCustomModule?.('custom-1')}>Delete Custom</button>
    </div>
  ),
}));

vi.mock('./components/SearchModal', () => ({
  SearchModal: ({ isOpen, onClose }: any) => isOpen ? (
    <div data-testid="search-modal-mock">
      Search
      <button data-testid="search-close" onClick={onClose}>Close Search</button>
    </div>
  ) : null,
}));

vi.mock('./components/AuthModal', () => ({
  AuthModal: ({ isOpen, onSuccess, onClose }: any) => isOpen ? (
    <div data-testid="auth-modal-mock">
      <button data-testid="auth-success" onClick={() => onSuccess?.({ name: 'Signed In User', email: 'signed@test.com', picture: '' })}>Authorize Now</button>
      <button data-testid="auth-close" onClick={onClose}>Close Auth</button>
    </div>
  ) : null,
}));

vi.mock('./components/Certificate', () => ({
  Certificate: ({ userName, moduleTitle, onClose }: any) => (
    <div data-testid="certificate-mock">
      <span data-testid="cert-user">{userName}</span>
      <span data-testid="cert-module">{moduleTitle}</span>
      <button data-testid="cert-close" onClick={onClose}>Close Certificate</button>
    </div>
  ),
}));

vi.mock('./components/LanguageSwitcher', () => ({
  LanguageSwitcher: () => <div data-testid="language-switcher-mock">Language</div>,
}));

vi.mock('./components/LoadingFallback', () => ({
  LoadingFallback: () => <div data-testid="loading-fallback-mock">Loading</div>,
}));

vi.mock('./components/PageMeta', () => ({
  PageMeta: () => null,
}));

// Mock all lazy-loaded components
vi.mock('./components/ModuleView', () => ({
  ModuleView: ({ module, onBack, onComplete, onLessonComplete }: any) => (
    <div data-testid="module-view-mock">
      <span data-testid="module-view-title">{module?.title}</span>
      <button data-testid="module-back" onClick={onBack}>Back</button>
      <button data-testid="complete-module" onClick={() => onComplete(module?.id)}>Complete Module</button>
      <button data-testid="complete-lesson-quiz" onClick={() => onLessonComplete('m2-l1', 'quiz')}>Complete Quiz</button>
      <button data-testid="complete-lesson-game" onClick={() => onLessonComplete('m5-l1', 'game')}>Complete Game</button>
      <button data-testid="complete-lesson-text" onClick={() => onLessonComplete('m1-l1', 'text')}>Complete Text</button>
    </div>
  ),
}));
vi.mock('./components/ModuleBuilder', () => ({
  ModuleBuilder: ({ initialModule, onSave, onCancel }: any) => (
    <div data-testid="module-builder-mock">
      <button data-testid="save-module" onClick={() => onSave({ id: initialModule?.id || 'custom-new', title: initialModule ? 'Updated Custom' : 'New Custom', level: 'expert', lessons: [{ id: 'c-l1', title: 'CL1', type: 'text' }], description: 'New desc', icon: null as any, color: 'purple' })}>Save</button>
      <button data-testid="cancel-module" onClick={onCancel}>Cancel</button>
    </div>
  ),
}));
vi.mock('./components/KnowledgeBase', () => ({ KnowledgeBase: () => <div data-testid="knowledge-mock">Knowledge Base</div> }));
vi.mock('./components/AdminDashboard', () => ({ AdminDashboard: () => <div data-testid="admin-mock">Admin</div> }));
vi.mock('./components/ArchitectureOfExtraction', () => ({ ArchitectureOfExtraction: () => <div data-testid="architecture-mock">Architecture</div> }));
vi.mock('./components/DonationView', () => ({ DonationView: ({ onBackToDashboard }: any) => <div data-testid="donation-mock"><button data-testid="donation-back" onClick={onBackToDashboard}>Back</button>Donation</div> }));
vi.mock('./components/FintechStarterMap', () => ({ FintechStarterMap: ({ onNavigateToSim, onNavigateToBusinessBuilder }: any) => (
  <div data-testid="map-mock">
    <button data-testid="map-to-sim" onClick={onNavigateToSim}>To Sim</button>
    <button data-testid="map-to-builder" onClick={onNavigateToBusinessBuilder}>To Builder</button>
    Map
  </div>
) }));
vi.mock('./components/FinanceGlossary', () => ({ FinanceGlossary: () => <div data-testid="glossary-mock">Glossary</div> }));
vi.mock('./components/ConnectingTheDotsArticle', () => ({ ConnectingTheDotsArticle: () => <div data-testid="dots-mock">Dots</div> }));
vi.mock('./components/FintechBusinessBuilder', () => ({ FintechBusinessBuilder: ({ onAwardXp, onCompleteCapstone }: any) => (
  <div data-testid="builder-mock">
    <button data-testid="builder-xp" onClick={() => onAwardXp?.(50, 'testing')}>Award XP</button>
    <button data-testid="builder-capstone" onClick={() => onCompleteCapstone?.()}>Capstone</button>
    Builder
  </div>
) }));
vi.mock('./components/ProgressDashboard', () => ({
  ProgressDashboard: ({ onSelectModule, modules }: any) => (
    <div data-testid="progress-mock">
      Progress
      <span data-testid="progress-modules-count">{modules?.length ?? 0}</span>
      <button data-testid="select-module-progress" onClick={() => onSelectModule?.('module-2')}>Progress Module 2</button>
    </div>
  ),
}));
vi.mock('./components/TradingGame', () => ({ TradingGame: () => <div data-testid="game-mock">Trading</div> }));
vi.mock('./components/UnderwritingGame', () => ({ UnderwritingGame: () => <div data-testid="game-mock">Underwriting</div> }));
vi.mock('./components/ParametricGame', () => ({ ParametricGame: () => <div data-testid="game-mock">Parametric</div> }));
vi.mock('./components/FraudGame', () => ({ FraudGame: () => <div data-testid="game-mock">Fraud</div> }));
vi.mock('./components/PopQuizGame', () => ({ PopQuizGame: ({ onExit }: any) => <div data-testid="game-mock">Pop Quiz<button data-testid="popquiz-exit" onClick={onExit}>Exit Quiz</button></div> }));
vi.mock('./components/WealthBuilding', () => ({ WealthBuilding: () => <div data-testid="wealth-mock">Wealth Building</div> }));
vi.mock('./components/wealth/CreditMastery', () => ({ CreditMastery: () => <div data-testid="wealth-credit-mock">Credit</div> }));
vi.mock('./components/wealth/InvestingIRAs', () => ({ InvestingIRAs: () => <div data-testid="wealth-investing-mock">Investing</div> }));
vi.mock('./components/wealth/RealEstate', () => ({ RealEstate: () => <div data-testid="wealth-realestate-mock">Real Estate</div> }));
vi.mock('./components/wealth/BusinessBuilding', () => ({ BusinessBuilding: () => <div data-testid="wealth-business-mock">Business</div> }));
vi.mock('./components/wealth/GroupEconomics', () => ({ GroupEconomics: () => <div data-testid="wealth-groupecon-mock">Group</div> }));
vi.mock('./components/wealth/SideHustles', () => ({ SideHustles: () => <div data-testid="wealth-sidehustles-mock">Side Hustles</div> }));
vi.mock('./components/wealth/EmergencyFund', () => ({ EmergencyFund: () => <div data-testid="wealth-emergencyfund-mock">Emergency Fund</div> }));
vi.mock('./components/NotFound', () => ({ NotFound: () => <div data-testid="not-found-mock">Not Found</div> }));
vi.mock('./components/StudentProfile', () => ({
  StudentProfile: ({ xp, streak, onOpenGame, onNavigateToDashboard }: any) => (
    <div data-testid="student-profile-mock">
      <span data-testid="profile-xp">{xp}</span>
      <span data-testid="profile-streak">{streak}</span>
      <button data-testid="profile-open-game" onClick={() => onOpenGame?.('trading')}>Open Stock Sim</button>
      <button data-testid="profile-to-dash" onClick={() => onNavigateToDashboard?.()}>To Dashboard</button>
    </div>
  ),
}));
vi.mock('./components/GamesHub', () => ({
  GamesHub: ({ onSelectGame }: any) => (
    <div data-testid="games-hub-mock">
      <button data-testid="games-select-trading" onClick={() => onSelectGame?.('trading')}>Trading</button>
      <button data-testid="games-select-underwriting" onClick={() => onSelectGame?.('underwriting')}>Underwriting</button>
      <button data-testid="games-select-parametric" onClick={() => onSelectGame?.('parametric')}>Parametric</button>
      <button data-testid="games-select-fraud" onClick={() => onSelectGame?.('fraud')}>Fraud</button>
      <button data-testid="games-select-popquiz" onClick={() => onSelectGame?.('popquiz')}>Pop Quiz</button>
    </div>
  ),
}));
vi.mock('./components/StandaloneGameView', () => ({
  StandaloneGameView: ({ activeDirectGame, onAddXp, onBackToDashboard }: any) => (
    <div data-testid="standalone-game-mock">
      <span data-testid="active-game">{activeDirectGame}</span>
      <button data-testid="game-add-xp" onClick={() => onAddXp?.(150, 'sim complete')}>Award XP</button>
      <button data-testid="game-back" onClick={() => onBackToDashboard?.()}>Return to Syllabus</button>
    </div>
  ),
}));
vi.mock('./components/ErrorBoundary', () => ({
  ErrorBoundary: ({ children }: any) => <div>{children}</div>,
}));

describe('App', () => {
  beforeEach(() => {
    vi.useRealTimers();
    localStorage.clear();
    currentPath.value = '/';
    apiClientMock.getStoredUser.mockReturnValue(null);
    apiClientMock.getProgress.mockResolvedValue({ completedLessons: [], completedModules: [] });
    apiClientMock.saveLessonProgress.mockResolvedValue(undefined);
    mockConfetti.mockClear();
    mockNavigate.mockClear();
  });

  const renderApp = async () => {
    const AppModule = await import('./App');
    const App = AppModule.default;
    return render(<App />);
  };

  // Renders App as if the browser was at the given pathname, so the
  // route-sync effect picks up the URL on initial load.
  const renderAt = async (path: string) => {
    currentPath.value = path;
    await renderApp();
  };

  it('renders the sidebar with branding', async () => {
    await renderApp();
    const brands = screen.getAllByText(/Overlay/i);
    expect(brands.length).toBeGreaterThanOrEqual(1);
  });

  it('renders the mobile header', async () => {
    await renderApp();
    const wealth = screen.getAllByText(/Wealth/i);
    expect(wealth.length).toBeGreaterThanOrEqual(1);
  });

  it('shows sidebar navigation links', async () => {
    await renderApp();
    expect(screen.getByText(/Learning Pathways/i)).toBeInTheDocument();
    expect(screen.getByText(/Finance Dictionary/i)).toBeInTheDocument();
  });

  it('shows sign in button when no user', async () => {
    await renderApp();
    expect(screen.getByText(/Sign In/i)).toBeInTheDocument();
  });

  it('renders the Dashboard by default', async () => {
    await renderApp();
    expect(screen.getByTestId('dashboard-mock')).toBeInTheDocument();
  });

  it('toggles dark mode', async () => {
    await renderApp();
    fireEvent.click(screen.getByText(/Settings/i));
    const toggle = screen.getByText(/Light Mode/i);
    fireEvent.click(toggle);
    expect(localStorage.getItem('is_dark_mode')).toBe('false');
  });

  it('opens auth modal on sign in click', async () => {
    await renderApp();
    fireEvent.click(screen.getByText(/Sign In/i));
    expect(screen.getByTestId('auth-modal-mock')).toBeInTheDocument();
  });

  it('opens search modal with Ctrl+K', async () => {
    await renderApp();
    fireEvent.keyDown(window, { key: 'k', metaKey: true });
    expect(screen.getByTestId('search-modal-mock')).toBeInTheDocument();
  });

  it('shows games hub link in sidebar', async () => {
    await renderApp();
    const games = screen.getAllByText(/Games/i);
    expect(games.length).toBeGreaterThanOrEqual(1);
  });

  it('navigates to knowledge view via direct route', async () => {
    await renderAt('/knowledge');
    await waitFor(() => expect(screen.getByTestId('knowledge-mock')).toBeInTheDocument());
  });

  it('navigates to architecture view via direct route', async () => {
    await renderAt('/architecture');
    await waitFor(() => expect(screen.getByTestId('architecture-mock')).toBeInTheDocument());
  });

  it('navigates to glossary view', async () => {
    await renderApp();
    fireEvent.click(screen.getByText(/Finance Dictionary/i));
    await waitFor(() => expect(screen.getByTestId('glossary-mock')).toBeInTheDocument());
  });

  it('navigates to business builder view', async () => {
    await renderApp();
    fireEvent.click(screen.getByText(/Business Builder/i));
    await waitFor(() => expect(screen.getByTestId('builder-mock')).toBeInTheDocument());
  });

  it('navigates to donate view', async () => {
    await renderApp();
    const support = screen.getByText(/^Support$/i);
    fireEvent.click(support);
    await waitFor(() => expect(screen.getByTestId('donation-mock')).toBeInTheDocument());
  });

  it('navigates to profile view', async () => {
    await renderApp();
    fireEvent.click(screen.getByText(/My Student Profile/i));
    await waitFor(() => expect(screen.getByTestId('progress-mock')).toBeInTheDocument(), { timeout: 15000 });
  });

  it('toggles mobile menu', async () => {
    await renderApp();
    const menuBtn = screen.getByLabelText(/Open navigation menu/i);
    fireEvent.click(menuBtn);
    const closeBtn = screen.getByLabelText(/Close navigation menu/i);
    expect(closeBtn).toBeInTheDocument();
  });

  it('sidebar has correct mobile CSS class', async () => {
    await renderApp();
    const sidebar = screen.getByRole('navigation', { name: /Main navigation/i });
    expect(sidebar.className).toContain('-translate-x-full');
    expect(sidebar.className).toContain('md:translate-x-0');
  });

  it('navigates to map view via direct route', async () => {
    await renderAt('/map');
    await waitFor(() => expect(screen.getByTestId('map-mock')).toBeInTheDocument());
  });

  it('navigates to admin view', async () => {
    await renderApp();
    fireEvent.click(screen.getByText(/Admin/i));
    await waitFor(() => expect(screen.getByTestId('admin-mock')).toBeInTheDocument());
  });

const getGamesButton = () => {
    const gameElements = screen.getAllByText(/^Games$/);
    return gameElements.find(el => el.closest('button'))?.closest('button');
  };

  it('navigates to games hub', async () => {
    await renderApp();
    fireEvent.click(getGamesButton()!);
    await waitFor(() => expect(screen.getByTestId('games-hub-mock')).toBeInTheDocument());
  });

  it('opens stock trading game from games hub', async () => {
    await renderApp();
    fireEvent.click(getGamesButton()!);
    await waitFor(() => expect(screen.getByTestId('games-hub-mock')).toBeInTheDocument());
    fireEvent.click(screen.getByTestId('games-select-trading'));
    await waitFor(() => expect(screen.getByTestId('standalone-game-mock')).toBeInTheDocument());
    expect(screen.getByTestId('active-game')).toHaveTextContent('trading');
  });

  it('returns to dashboard from standalone game', async () => {
    await renderApp();
    fireEvent.click(getGamesButton()!);
    await waitFor(() => screen.getByTestId('games-hub-mock'));
    fireEvent.click(screen.getByTestId('games-select-trading'));
    await waitFor(() => expect(screen.getByTestId('standalone-game-mock')).toBeInTheDocument());
    fireEvent.click(screen.getByTestId('game-back'));
    await waitFor(() => expect(screen.getByTestId('dashboard-mock')).toBeInTheDocument());
  });

  it('toggles sidebar collapse', async () => {
    await renderApp();
    const collapseBtn = screen.getByLabelText(/Collapse sidebar/i);
    fireEvent.click(collapseBtn);
    expect(screen.getByLabelText(/Expand sidebar/i)).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText(/Expand sidebar/i));
    expect(screen.getByLabelText(/Collapse sidebar/i)).toBeInTheDocument();
  });

  it('shows sign out when user is logged in', async () => {
    apiClientMock.getStoredUser.mockReturnValue({ name: 'Test User', email: 'test@test.com', picture: '' });
    await renderApp();
    await waitFor(() => expect(screen.getByText(/Sign Out/i)).toBeInTheDocument());
    fireEvent.click(screen.getByTitle(/Sign Out/i));
    await waitFor(() => expect(screen.getByText(/Sign In/i)).toBeInTheDocument());
  });

  it('opens connecting the dots article via direct route', async () => {
    await renderAt('/article');
    await waitFor(() => expect(screen.getByTestId('dots-mock')).toBeInTheDocument());
  });

  it('navigates via game routes', async () => {
    const AppModule = await import('./App');
    const App = AppModule.default;
    render(<App />);
    fireEvent.click(getGamesButton()!);
    await waitFor(() => screen.getByTestId('games-hub-mock'));
    fireEvent.click(screen.getByTestId('games-select-underwriting'));
    await waitFor(() => expect(screen.getByTestId('standalone-game-mock')).toBeInTheDocument());
  });

  it('renders dark mode by default', async () => {
    localStorage.removeItem('is_dark_mode');
    await renderApp();
    fireEvent.click(screen.getByText(/Settings/i));
    expect(screen.getByText(/Light Mode/i)).toBeInTheDocument();
  });

  it('toggles back to dark mode', async () => {
    localStorage.setItem('is_dark_mode', 'false');
    await renderApp();
    fireEvent.click(screen.getByText(/Settings/i));
    expect(screen.getByText(/Dark Mode/i)).toBeInTheDocument();
    fireEvent.click(screen.getByText(/Dark Mode/i));
    expect(screen.getByText(/Light Mode/i)).toBeInTheDocument();
  });

  it('shows wealth building section on learning pathways', async () => {
    await renderApp();
    const wealth = screen.getByTestId('wealth-mock');
    expect(wealth).toBeInTheDocument();
  });

  it('navigates to wealth building hub via direct route', async () => {
    await renderAt('/wealth-building');
    await waitFor(() => expect(screen.getByTestId('wealth-mock')).toBeInTheDocument());
  });

  // ─── New Tests: Module Navigation & Completion ─────────────────────────

  it('navigates to module view when selecting a module from dashboard', async () => {
    await renderApp();
    fireEvent.click(screen.getByTestId('select-module'));
    await waitFor(() => expect(screen.getByTestId('module-view-mock')).toBeInTheDocument());
    expect(screen.getByTestId('module-view-title')).toHaveTextContent('Test Module 1');
  });

  it('completes a module, awards badge, and shows certificate', async () => {
    await renderApp();
    fireEvent.click(screen.getByTestId('select-module'));
    await waitFor(() => expect(screen.getByTestId('module-view-mock')).toBeInTheDocument());

    fireEvent.click(screen.getByTestId('complete-module'));
    await waitFor(() => expect(screen.getByTestId('certificate-mock')).toBeInTheDocument(), { timeout: 2000 });

    expect(screen.getByTestId('cert-module')).toHaveTextContent('Test Module 1');
    expect(JSON.parse(localStorage.getItem('completed_modules') || '[]')).toContain('module-1');
    expect(JSON.parse(localStorage.getItem('user_badges') || '[]')).toContain('wise_wizard');
  });

  it('completes module-5 without awarding a badge (no badge mapping)', async () => {
    await renderApp();

    fireEvent.click(screen.getByTestId('select-module-5'));
    await waitFor(() => expect(screen.getByTestId('module-view-mock')).toBeInTheDocument());
    expect(screen.getByTestId('module-view-title')).toHaveTextContent('Test Module 5');

    fireEvent.click(screen.getByTestId('complete-module'));
    await waitFor(() => expect(screen.getByTestId('certificate-mock')).toBeInTheDocument(), { timeout: 2000 });

    expect(JSON.parse(localStorage.getItem('completed_modules') || '[]')).toContain('module-5');
  });

  it('handleLessonComplete awards XP, increments streak, and shows toast', async () => {
    await renderApp();
    fireEvent.click(screen.getByTestId('select-module'));
    await waitFor(() => expect(screen.getByTestId('module-view-mock')).toBeInTheDocument());

    fireEvent.click(screen.getByTestId('complete-lesson-text'));

    const xp = parseInt(localStorage.getItem('user_xp') || '0', 10);
    expect(xp).toBeGreaterThanOrEqual(50);

    const streak = parseInt(localStorage.getItem('user_streak') || '0', 10);
    expect(streak).toBeGreaterThanOrEqual(4);

    expect(screen.getByText(/XP Earned/i)).toBeInTheDocument();
  });

  it('awards different XP for quiz and game lesson types', async () => {
    await renderApp();
    fireEvent.click(screen.getByTestId('select-module'));
    await waitFor(() => expect(screen.getByTestId('module-view-mock')).toBeInTheDocument());

    fireEvent.click(screen.getByTestId('complete-lesson-quiz'));
    const xpAfterQuiz = parseInt(localStorage.getItem('user_xp') || '0', 10);
    expect(xpAfterQuiz).toBeGreaterThanOrEqual(100);

    fireEvent.click(screen.getByTestId('complete-lesson-game'));
    const xpAfterGame = parseInt(localStorage.getItem('user_xp') || '0', 10);
    expect(xpAfterGame).toBeGreaterThanOrEqual(250);
  });

  it('shows level-up toast and fires confetti when XP threshold crossed', async () => {
    await renderApp();
    fireEvent.click(screen.getByTestId('select-module'));
    await waitFor(() => expect(screen.getByTestId('module-view-mock')).toBeInTheDocument());

    fireEvent.click(screen.getByTestId('complete-lesson-game'));

    await waitFor(() => expect(screen.getByText(/Level Up/i)).toBeInTheDocument());
    expect(screen.getByText(/reached Level 2/i)).toBeInTheDocument();
    expect(mockConfetti).toHaveBeenCalled();
  });

  // ─── Reset Progress ────────────────────────────────────────────────────

  it('resets all progress and clears localStorage on reset', async () => {
    localStorage.setItem('completed_modules', JSON.stringify(['module-1']));
    localStorage.setItem('user_xp', '500');
    localStorage.setItem('user_streak', '10');
    localStorage.setItem('user_badges', JSON.stringify(['wise_wizard']));
    localStorage.setItem('game_time_seconds', '3600');

    await renderApp();

    const resetBtn = screen.getByText('Reset Progress').closest('button');
    expect(resetBtn).toBeTruthy();
    fireEvent.click(resetBtn!);

    await waitFor(() => expect(screen.getByTestId('dashboard-mock')).toBeInTheDocument());

    expect(localStorage.getItem('completed_modules')).toBeNull();
    expect(localStorage.getItem('user_xp')).toBeNull();
    expect(localStorage.getItem('user_streak')).toBeNull();
    expect(localStorage.getItem('user_badges')).toBeNull();
    expect(localStorage.getItem('game_time_seconds')).toBeNull();
  });

  // ─── Custom Modules CRUD ───────────────────────────────────────────────

  it('creates a new custom module via ModuleBuilder', async () => {
    await renderApp();

    fireEvent.click(screen.getByTestId('create-custom'));
    await waitFor(() => expect(screen.getByTestId('module-builder-mock')).toBeInTheDocument());

    fireEvent.click(screen.getByTestId('save-module'));
    await waitFor(() => expect(screen.getByTestId('dashboard-mock')).toBeInTheDocument());

    const customModules = JSON.parse(localStorage.getItem('custom_modules') || '[]');
    expect(customModules).toHaveLength(1);
    expect(customModules[0].id).toBe('custom-new');
    expect(customModules[0].title).toBe('New Custom');
    expect(customModules[0].level).toBe('expert');
  });

  it('edits an existing custom module', async () => {
    localStorage.setItem('custom_modules', JSON.stringify([{ id: 'custom-1', title: 'Old Title', level: 'beginner', lessons: [], description: 'Old desc', icon: 'div', color: 'gray' }]));

    await renderApp();

    fireEvent.click(screen.getByTestId('edit-custom'));
    await waitFor(() => expect(screen.getByTestId('module-builder-mock')).toBeInTheDocument());

    fireEvent.click(screen.getByTestId('save-module'));
    await waitFor(() => expect(screen.getByTestId('dashboard-mock')).toBeInTheDocument());

    const customModules = JSON.parse(localStorage.getItem('custom_modules') || '[]');
    expect(customModules).toHaveLength(1);
    expect(customModules[0].title).toBe('Updated Custom');
  });

  it('deletes a custom module', async () => {
    localStorage.setItem('custom_modules', JSON.stringify([{ id: 'custom-1', title: 'Custom Mod', level: 'beginner', lessons: [], description: '', icon: 'div', color: 'gray' }]));

    await renderApp();

    fireEvent.click(screen.getByTestId('delete-custom'));

    const customModules = JSON.parse(localStorage.getItem('custom_modules') || '[]');
    expect(customModules).toHaveLength(0);
  });

  // ─── Level Filtering ───────────────────────────────────────────────────

  it('filters modules when activeLevel changes', async () => {
    await renderApp();

    fireEvent.click(screen.getByText(/My Student Profile/i));
    await waitFor(() => expect(screen.getByTestId('progress-mock')).toBeInTheDocument());
    expect(screen.getByTestId('progress-modules-count')).toHaveTextContent('3');

    fireEvent.click(screen.getByText(/Learning Pathways/i));
    await waitFor(() => expect(screen.getByTestId('dashboard-mock')).toBeInTheDocument());

    fireEvent.click(screen.getByTestId('select-level'));

    fireEvent.click(screen.getByText(/My Student Profile/i));
    await waitFor(() => expect(screen.getByTestId('progress-mock')).toBeInTheDocument());
    expect(screen.getByTestId('progress-modules-count')).toHaveTextContent('1');
  });

  // ─── Auth Success ──────────────────────────────────────────────────────

  it('sets currentUser on auth modal onSuccess', async () => {
    await renderApp();

    fireEvent.click(screen.getByText(/Sign In/i));
    expect(screen.getByTestId('auth-modal-mock')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('auth-success'));

    await waitFor(() => expect(screen.getByText(/Sign Out/i)).toBeInTheDocument());
    expect(screen.queryByText(/Sign In/i)).not.toBeInTheDocument();
  });

  // ─── Multiple Game Route Navigations ───────────────────────────────────

  it('navigates to underwriting game from games hub', async () => {
    await renderApp();
    fireEvent.click(getGamesButton()!);
    await waitFor(() => expect(screen.getByTestId('games-hub-mock')).toBeInTheDocument());
    fireEvent.click(screen.getByTestId('games-select-underwriting'));
    await waitFor(() => expect(screen.getByTestId('standalone-game-mock')).toBeInTheDocument());
    expect(screen.getByTestId('active-game')).toHaveTextContent('underwriting');
  });

  it('navigates to fraud game from games hub', async () => {
    await renderApp();
    fireEvent.click(getGamesButton()!);
    await waitFor(() => expect(screen.getByTestId('games-hub-mock')).toBeInTheDocument());
    fireEvent.click(screen.getByTestId('games-select-fraud'));
    await waitFor(() => expect(screen.getByTestId('standalone-game-mock')).toBeInTheDocument());
    expect(screen.getByTestId('active-game')).toHaveTextContent('fraud');
  });

  it('navigates to parametric game from games hub', async () => {
    await renderApp();
    fireEvent.click(getGamesButton()!);
    await waitFor(() => expect(screen.getByTestId('games-hub-mock')).toBeInTheDocument());
    fireEvent.click(screen.getByTestId('games-select-parametric'));
    await waitFor(() => expect(screen.getByTestId('standalone-game-mock')).toBeInTheDocument());
    expect(screen.getByTestId('active-game')).toHaveTextContent('parametric');
  });

  it('navigates to pop quiz game from games hub', async () => {
    await renderApp();
    fireEvent.click(getGamesButton()!);
    await waitFor(() => expect(screen.getByTestId('games-hub-mock')).toBeInTheDocument());
    fireEvent.click(screen.getByTestId('games-select-popquiz'));
    await waitFor(() => expect(screen.getByTestId('standalone-game-mock')).toBeInTheDocument());
    expect(screen.getByTestId('active-game')).toHaveTextContent('popquiz');
  });

  // ─── Game Timer ────────────────────────────────────────────────────────

  it('saves game timer to localStorage when leaving module', async () => {
    localStorage.setItem('game_time_seconds', '15');
    await renderApp();

    fireEvent.click(screen.getByTestId('select-module'));
    await waitFor(() => expect(screen.getByTestId('module-view-mock')).toBeInTheDocument());

    fireEvent.click(screen.getByText(/My Student Profile/i));
    await waitFor(() => expect(screen.getByTestId('progress-mock')).toBeInTheDocument());

    const saved = parseInt(localStorage.getItem('game_time_seconds') || '0', 10);
    expect(saved).toBeGreaterThanOrEqual(15);
  });

  it('stops game timer and saves when navigating away from module', async () => {
    localStorage.setItem('game_time_seconds', '99');
    await renderApp();

    fireEvent.click(screen.getByTestId('select-module'));
    await waitFor(() => expect(screen.getByTestId('module-view-mock')).toBeInTheDocument());

    fireEvent.click(screen.getByText(/My Student Profile/i));
    await waitFor(() => expect(screen.getByTestId('progress-mock')).toBeInTheDocument());

    expect(parseInt(localStorage.getItem('game_time_seconds') || '0', 10)).toBeGreaterThanOrEqual(99);
  });

  // ─── Dark Mode Persistence ─────────────────────────────────────────────

  it('reads dark mode false from localStorage on mount', async () => {
    localStorage.setItem('is_dark_mode', 'false');
    await renderApp();
    fireEvent.click(screen.getByText(/Settings/i));
    expect(screen.getByText(/Dark Mode/i)).toBeInTheDocument();
  });

  it('reads dark mode true from localStorage on mount', async () => {
    localStorage.setItem('is_dark_mode', 'true');
    await renderApp();
    fireEvent.click(screen.getByText(/Settings/i));
    expect(screen.getByText(/Light Mode/i)).toBeInTheDocument();
  });

  // ─── Toast Notifications ───────────────────────────────────────────────

  it('displays toast with XP points badge', async () => {
    await renderApp();
    fireEvent.click(screen.getByTestId('select-module'));
    await waitFor(() => expect(screen.getByTestId('module-view-mock')).toBeInTheDocument());

      fireEvent.click(screen.getByTestId('complete-lesson-text'));

    expect(screen.getByText(/XP Earned/i)).toBeInTheDocument();
    expect(screen.getByText(/\+50 XP/i)).toBeInTheDocument();
  });

  it('does not show level-up toast for small XP gains', async () => {
    await renderApp();
    fireEvent.click(screen.getByTestId('select-module'));
    await waitFor(() => expect(screen.getByTestId('module-view-mock')).toBeInTheDocument());

    fireEvent.click(screen.getByTestId('complete-lesson-text'));

    expect(screen.getByText(/XP Earned/i)).toBeInTheDocument();
    expect(screen.queryByText(/Level Up/i)).not.toBeInTheDocument();
    expect(mockConfetti).not.toHaveBeenCalled();
  });

  // ─── Certificate Modal Close ───────────────────────────────────────────

  it('closes certificate modal when close button is clicked', async () => {
    await renderApp();
    fireEvent.click(screen.getByTestId('select-module'));
    await waitFor(() => expect(screen.getByTestId('module-view-mock')).toBeInTheDocument());

    fireEvent.click(screen.getByTestId('complete-module'));
    await waitFor(() => expect(screen.getByTestId('certificate-mock')).toBeInTheDocument(), { timeout: 2000 });

    fireEvent.click(screen.getByTestId('cert-close'));
    await waitFor(() => expect(screen.queryByTestId('certificate-mock')).not.toBeInTheDocument());
  });

  // ─── Module Navigation from Profile ────────────────────────────────────

  it('triggers module navigation from profile progress dashboard', async () => {
    await renderApp();

    fireEvent.click(screen.getByText(/My Student Profile/i));
    await waitFor(() => expect(screen.getByTestId('progress-mock')).toBeInTheDocument());

    fireEvent.click(screen.getByTestId('select-module-progress'));

    expect(mockNavigate).toHaveBeenCalledWith('/module/2');
  });

  // ─── Dashboard Special Routes (glossary / dots_article) ──────────────

  it('navigates to glossary via dashboard onSelectModule', async () => {
    await renderApp();
    fireEvent.click(screen.getByTestId('select-glossary-from-dash'));
    await waitFor(() => expect(screen.getByTestId('glossary-mock')).toBeInTheDocument());
    expect(mockNavigate).toHaveBeenCalledWith('/glossary');
  });

  it('navigates to dots article via dashboard onSelectModule', async () => {
    await renderApp();
    fireEvent.click(screen.getByTestId('select-dots'));
    await waitFor(() => expect(screen.getByTestId('dots-mock')).toBeInTheDocument());
    expect(mockNavigate).toHaveBeenCalledWith('/article');
  });

  // ─── Auth Modal Close ────────────────────────────────────────────────

  it('closes auth modal when onClose is triggered', async () => {
    await renderApp();
    fireEvent.click(screen.getByText(/Sign In/i));
    expect(screen.getByTestId('auth-modal-mock')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('auth-close'));
    await waitFor(() => expect(screen.queryByTestId('auth-modal-mock')).not.toBeInTheDocument());
  });

  // ─── Search Modal Close ──────────────────────────────────────────────

  it('closes search modal when onClose is triggered', async () => {
    await renderApp();
    fireEvent.keyDown(window, { key: 'k', metaKey: true });
    expect(screen.getByTestId('search-modal-mock')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('search-close'));
    await waitFor(() => expect(screen.queryByTestId('search-modal-mock')).not.toBeInTheDocument());
  });

  // ─── Duplicate Lesson / Module Completion ────────────────────────────

  it('does not double-award XP for completing the same lesson twice', async () => {
    await renderApp();
    fireEvent.click(screen.getByTestId('select-module'));
    await waitFor(() => expect(screen.getByTestId('module-view-mock')).toBeInTheDocument());

    fireEvent.click(screen.getByTestId('complete-lesson-text'));
    const xpAfterFirst = parseInt(localStorage.getItem('user_xp') || '0', 10);

    fireEvent.click(screen.getByTestId('complete-lesson-text'));
    const xpAfterSecond = parseInt(localStorage.getItem('user_xp') || '0', 10);

    expect(xpAfterSecond).toBe(xpAfterFirst);
  });

  it('does not re-award badge or show certificate for already-completed module', async () => {
    await renderApp();
    fireEvent.click(screen.getByTestId('select-module'));
    await waitFor(() => expect(screen.getByTestId('module-view-mock')).toBeInTheDocument());

    fireEvent.click(screen.getByTestId('complete-module'));
    await waitFor(() => expect(screen.getByTestId('certificate-mock')).toBeInTheDocument(), { timeout: 2000 });

    fireEvent.click(screen.getByTestId('cert-close'));
    await waitFor(() => expect(screen.queryByTestId('certificate-mock')).not.toBeInTheDocument());

    fireEvent.click(screen.getByText(/Learning Pathways/i));
    await waitFor(() => expect(screen.getByTestId('dashboard-mock')).toBeInTheDocument());

    fireEvent.click(screen.getByTestId('select-module'));
    await waitFor(() => expect(screen.getByTestId('module-view-mock')).toBeInTheDocument());

    fireEvent.click(screen.getByTestId('complete-module'));

    expect(screen.queryByTestId('certificate-mock')).not.toBeInTheDocument();
    const badges = JSON.parse(localStorage.getItem('user_badges') || '[]');
    expect(badges.filter((b: string) => b === 'wise_wizard').length).toBe(1);
  });

  // ─── Mobile Overlay ─────────────────────────────────────────────────

  it('closes mobile menu when overlay is clicked', async () => {
    await renderApp();
    fireEvent.click(screen.getByLabelText(/Open navigation menu/i));
    expect(screen.getByLabelText(/Close navigation menu/i)).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText(/Close navigation menu/i));
    expect(screen.getByLabelText(/Open navigation menu/i)).toBeInTheDocument();
  });

  // ─── ModuleView onBack ──────────────────────────────────────────────

  it('returns to dashboard when module back button is clicked', async () => {
    await renderApp();
    fireEvent.click(screen.getByTestId('select-module'));
    await waitFor(() => expect(screen.getByTestId('module-view-mock')).toBeInTheDocument());

    fireEvent.click(screen.getByTestId('module-back'));
    await waitFor(() => expect(screen.getByTestId('dashboard-mock')).toBeInTheDocument());
  });

  // ─── DonationView onBackToDashboard ─────────────────────────────────

  it('returns to dashboard from donate view via onBackToDashboard', async () => {
    await renderApp();
    fireEvent.click(screen.getByText(/^Support$/i));
    await waitFor(() => expect(screen.getByTestId('donation-mock')).toBeInTheDocument());

    fireEvent.click(screen.getByTestId('donation-back'));
    await waitFor(() => expect(screen.getByTestId('dashboard-mock')).toBeInTheDocument());
  });

  // ─── Business Builder Callbacks ─────────────────────────────────────

  it('awards XP and completes capstone via business builder', async () => {
    await renderApp();
    fireEvent.click(screen.getByText(/Business Builder/i));
    await waitFor(() => expect(screen.getByTestId('builder-mock')).toBeInTheDocument());

    fireEvent.click(screen.getByTestId('builder-xp'));

    fireEvent.click(screen.getByTestId('builder-capstone'));
    await waitFor(() => expect(screen.getByTestId('certificate-mock')).toBeInTheDocument(), { timeout: 2000 });
  });

  // ─── Fintech Starter Map Callbacks ──────────────────────────────────

  it('navigates to sim via fintech starter map (direct route)', async () => {
    await renderAt('/map');
    await waitFor(() => expect(screen.getByTestId('map-mock')).toBeInTheDocument());

    fireEvent.click(screen.getByTestId('map-to-sim'));
    await waitFor(() => expect(screen.getByText(/Return to Syllabus/i)).toBeInTheDocument());
  });

  it('navigates to business builder via fintech starter map (direct route)', async () => {
    await renderAt('/map');
    await waitFor(() => expect(screen.getByTestId('map-mock')).toBeInTheDocument());

    fireEvent.click(screen.getByTestId('map-to-builder'));
    await waitFor(() => expect(screen.getByTestId('builder-mock')).toBeInTheDocument());
  });

  it('cancels module builder and returns to dashboard', async () => {
    await renderApp();

    fireEvent.click(screen.getByTestId('create-custom'));
    await waitFor(() => expect(screen.getByTestId('module-builder-mock')).toBeInTheDocument());

    fireEvent.click(screen.getByTestId('cancel-module'));
    await waitFor(() => expect(screen.getByTestId('dashboard-mock')).toBeInTheDocument());
  });

  it('closes mobile menu via overlay click', async () => {
    await renderApp();

    const openBtn = screen.getByLabelText(/Open navigation menu/i);
    fireEvent.click(openBtn);
    expect(screen.getByLabelText(/Close navigation menu/i)).toBeInTheDocument();

    const overlay = document.querySelector('.fixed.inset-0');
    expect(overlay).toBeInTheDocument();
    if (overlay) fireEvent.click(overlay);

    await waitFor(() => expect(screen.getByLabelText(/Open navigation menu/i)).toBeInTheDocument());
  });

  it('exits pop quiz game via onExit callback', async () => {
    await renderApp();
    fireEvent.click(getGamesButton()!);
    await waitFor(() => expect(screen.getByTestId('games-hub-mock')).toBeInTheDocument());
    fireEvent.click(screen.getByTestId('games-select-popquiz'));
    await waitFor(() => expect(screen.getByTestId('standalone-game-mock')).toBeInTheDocument());

    fireEvent.click(screen.getByTestId('game-back'));
    await waitFor(() => expect(screen.getByTestId('dashboard-mock')).toBeInTheDocument());
  });

  // ─── URL Route-Sync Effects ──────────────────────────────────────────

  it('syncs /module/:id URL to module view', async () => {
    await renderAt('/module/2');
    await waitFor(() => expect(screen.getByTestId('module-view-mock')).toBeInTheDocument());
    expect(screen.getByTestId('module-view-title')).toHaveTextContent('Test Module 2');
  });

  it.each([
    ['/game/trading', 'standalone-game-mock'],
    ['/profile', 'student-profile-mock'],
    ['/knowledge', 'knowledge-mock'],
    ['/architecture', 'architecture-mock'],
    ['/glossary', 'glossary-mock'],
    ['/business-builder', 'builder-mock'],
    ['/map', 'map-mock'],
    ['/donate', 'donation-mock'],
    ['/article', 'dots-mock'],
    ['/wealth-building', 'wealth-mock'],
    ['/wealth-building/credit', 'wealth-credit-mock'],
    ['/wealth-building/investing', 'wealth-investing-mock'],
    ['/wealth-building/real-estate', 'wealth-realestate-mock'],
    ['/wealth-building/business', 'wealth-business-mock'],
    ['/wealth-building/group-economics', 'wealth-groupecon-mock'],
    ['/wealth-building/side-hustles', 'wealth-sidehustles-mock'],
    ['/wealth-building/emergency-fund', 'wealth-emergencyfund-mock'],
  ])('syncs %s URL to the matching view', async (path, testId) => {
    await renderAt(path);
    await waitFor(() => expect(screen.getByTestId(testId)).toBeInTheDocument());
  });

  it('syncs /builder URL to module builder', async () => {
    await renderAt('/builder');
    await waitFor(() => expect(screen.getByTestId('module-builder-mock')).toBeInTheDocument());
  });

  it('syncs /progress URL to profile and redirects to /profile', async () => {
    await renderAt('/progress');
    await waitFor(() => expect(screen.getByTestId('student-profile-mock')).toBeInTheDocument());
    expect(mockNavigate).toHaveBeenCalledWith('/profile');
  });

  it('shows not-found view for unknown routes', async () => {
    await renderAt('/totally/unknown');
    await waitFor(() => expect(screen.getByTestId('not-found-mock')).toBeInTheDocument());
  });

  // ─── Module Completion Badges via URL Routes ─────────────────────────

  it.each([
    [2, 'card_commander'],
    [3, 'api_architect'],
    [4, 'credit_analyst'],
    [6, 'weather_oracle'],
    [7, 'crypto_pioneer'],
    [8, 'compliance_officer'],
  ])('completing module %i unlocks the %s badge', async (moduleNum, badge) => {
    await renderAt(`/module/${moduleNum}`);
    await waitFor(() => expect(screen.getByTestId('module-view-mock')).toBeInTheDocument());
    fireEvent.click(screen.getByTestId('complete-module'));
    await waitFor(() => expect(screen.getByTestId('certificate-mock')).toBeInTheDocument(), { timeout: 2000 });
    expect(JSON.parse(localStorage.getItem('user_badges') || '[]')).toContain(badge);
  });

  // ─── Server Progress Sync ────────────────────────────────────────────

  it('merges server progress into local lesson/module completion', async () => {
    // Control when the server sync resolves so its state update lands inside act().
    let resolveProgress: (value: { completedLessons: string[]; completedModules: string[] }) => void = () => {};
    apiClientMock.getProgress.mockImplementation(() => new Promise((res) => { resolveProgress = res; }));

    await renderApp();
    await act(async () => {
      resolveProgress({ completedLessons: ['m1-l1'], completedModules: ['module-1'] });
      await Promise.resolve();
    });

    fireEvent.click(screen.getByTestId('select-module'));
    await waitFor(() => expect(screen.getByTestId('module-view-mock')).toBeInTheDocument());

    // m1-l1 was already synced as complete, so re-completing awards no XP.
    fireEvent.click(screen.getByTestId('complete-lesson-text'));
    expect(parseInt(localStorage.getItem('user_xp') || '0', 10)).toBe(0);
  });

  it('logs a message when server sync fails', async () => {
    apiClientMock.getProgress.mockRejectedValue(new Error('offline'));
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    await renderApp();
    await waitFor(() => expect(logSpy).toHaveBeenCalled());
    logSpy.mockRestore();
  });

  // ─── Corrupt localStorage JSON ───────────────────────────────────────

  it('handles corrupt JSON in localStorage state keys', async () => {
    localStorage.setItem('custom_modules', '{bad');
    localStorage.setItem('completed_modules', '{bad');
    localStorage.setItem('completed_lessons', '{bad');
    localStorage.setItem('user_badges', '{bad');
    await renderApp();
    expect(screen.getByTestId('dashboard-mock')).toBeInTheDocument();
  });

  // ─── Lesson Progress Save Failure ────────────────────────────────────

  it('logs a warning when saving lesson progress fails', async () => {
    apiClientMock.saveLessonProgress.mockRejectedValue(new Error('server down'));
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    await renderApp();
    fireEvent.click(screen.getByTestId('select-module'));
    await waitFor(() => expect(screen.getByTestId('module-view-mock')).toBeInTheDocument());
    fireEvent.click(screen.getByTestId('complete-lesson-text'));
    await waitFor(() => expect(warnSpy).toHaveBeenCalled());
    warnSpy.mockRestore();
  });

  // ─── Game Timer Tick ─────────────────────────────────────────────────

  it('ticks the game timer while a module is open', async () => {
    await renderApp();
    fireEvent.click(screen.getByTestId('select-module'));
    await waitFor(() => expect(screen.getByTestId('module-view-mock')).toBeInTheDocument());
    // Wait long enough for the 1s interval to fire at least once.
    await act(async () => { await new Promise((r) => setTimeout(r, 1150)); });
    fireEvent.click(screen.getByText(/My Student Profile/i));
    await waitFor(() => expect(screen.getByTestId('progress-mock')).toBeInTheDocument());
    expect(parseInt(localStorage.getItem('game_time_seconds') || '0', 10)).toBeGreaterThanOrEqual(1);
  });

  // ─── Standalone Game XP ──────────────────────────────────────────────

  it('awards XP when a standalone game reports completion', async () => {
    await renderApp();
    fireEvent.click(getGamesButton()!);
    await waitFor(() => expect(screen.getByTestId('games-hub-mock')).toBeInTheDocument());
    fireEvent.click(screen.getByTestId('games-select-trading'));
    await waitFor(() => expect(screen.getByTestId('standalone-game-mock')).toBeInTheDocument());
    fireEvent.click(screen.getByTestId('game-add-xp'));
    expect(parseInt(localStorage.getItem('user_xp') || '0', 10)).toBeGreaterThanOrEqual(150);
  });

  // ─── Student Profile Callbacks ───────────────────────────────────────

  it('opens a game from the student profile', async () => {
    await renderAt('/profile');
    await waitFor(() => expect(screen.getByTestId('student-profile-mock')).toBeInTheDocument());
    fireEvent.click(screen.getByTestId('profile-open-game'));
    await waitFor(() => expect(screen.getByTestId('standalone-game-mock')).toBeInTheDocument());
    expect(screen.getByTestId('active-game')).toHaveTextContent('trading');
  });

  it('navigates to dashboard from the student profile', async () => {
    await renderAt('/profile');
    await waitFor(() => expect(screen.getByTestId('student-profile-mock')).toBeInTheDocument());
    fireEvent.click(screen.getByTestId('profile-to-dash'));
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  // ─── Certificate Edge Cases ──────────────────────────────────────────

  it('computes certificate score from completed lessons', async () => {
    localStorage.setItem('completed_lessons', JSON.stringify(['m1-l1']));
    await renderApp();
    fireEvent.click(screen.getByTestId('select-module'));
    await waitFor(() => expect(screen.getByTestId('module-view-mock')).toBeInTheDocument());
    fireEvent.click(screen.getByTestId('complete-module'));
    await waitFor(() => expect(screen.getByTestId('certificate-mock')).toBeInTheDocument(), { timeout: 2000 });
  });

  it('renders no certificate when the completed module no longer exists', async () => {
    localStorage.setItem('custom_modules', JSON.stringify([
      { id: 'custom-1', title: 'Custom Mod', level: 'beginner', lessons: [{ id: 'c1-l1', title: 'L', type: 'text' }], description: '', icon: 'div', color: 'gray' },
    ]));
    await renderApp();
    fireEvent.click(screen.getByTestId('select-custom'));
    await waitFor(() => expect(screen.getByTestId('module-view-mock')).toBeInTheDocument());

    // Complete the custom module, then delete it before the certificate shows.
    fireEvent.click(screen.getByTestId('complete-module'));
    fireEvent.click(screen.getByTestId('module-back'));
    await waitFor(() => expect(screen.getByTestId('dashboard-mock')).toBeInTheDocument());
    fireEvent.click(screen.getByTestId('delete-custom'));

    await act(async () => { await new Promise((r) => setTimeout(r, 700)); });
    expect(screen.queryByTestId('certificate-mock')).not.toBeInTheDocument();
  });
});
