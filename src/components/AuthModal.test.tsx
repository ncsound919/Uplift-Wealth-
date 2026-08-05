import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AuthModal } from './AuthModal';

const mockLoginWithEmail = vi.fn();
const mockLoginWithGoogle = vi.fn();

vi.mock('../lib/apiClient', () => ({
  apiClient: {
    loginWithEmail: (...args: any[]) => mockLoginWithEmail(...args),
    loginWithGoogle: (...args: any[]) => mockLoginWithGoogle(...args),
  },
}));

vi.mock('motion/react', () => ({
  motion: {
    div: ({ children, ...props }: any) => {
      const { animate, transition, initial, exit, ...rest } = props;
      return <div {...rest}>{children}</div>;
    },
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

describe('AuthModal', () => {
  const mockOnClose = vi.fn();
  const mockOnSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns null when isOpen is false', () => {
    const { container } = render(<AuthModal isOpen={false} onClose={mockOnClose} onSuccess={mockOnSuccess} />);
    expect(container.innerHTML).toBe('');
  });

  it('renders login form when isOpen is true', () => {
    render(<AuthModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />);
    expect(screen.getByText('Welcome Back')).toBeInTheDocument();
  });

  it('shows email input with placeholder when no default', () => {
    render(<AuthModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />);
    const emailInput = screen.getByPlaceholderText('name@example.com');
    expect(emailInput).toBeInTheDocument();
    expect(emailInput).toHaveValue('');
  });

  it('shows password input (empty by default)', () => {
    render(<AuthModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />);
    const passwordInput = screen.getByPlaceholderText('••••••••');
    expect(passwordInput).toBeInTheDocument();
    expect(passwordInput).toHaveValue('');
  });

  it('shows Sign In button in login mode', () => {
    render(<AuthModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />);
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('shows Google sign-in button with default email', () => {
    render(<AuthModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />);
    expect(screen.getByText(/Continue with Google/)).toBeInTheDocument();
  });

  it('toggles to signup mode', () => {
    render(<AuthModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />);
    fireEvent.click(screen.getByText('Sign Up'));
    expect(screen.getByText('Create Your Account')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
  });

  it('shows full name field in signup mode', () => {
    render(<AuthModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />);
    fireEvent.click(screen.getByText('Sign Up'));
    expect(screen.getByPlaceholderText('Your Full Name')).toBeInTheDocument();
  });

  it('shows name input empty by default in signup mode', () => {
    render(<AuthModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />);
    fireEvent.click(screen.getByText('Sign Up'));
    const nameInput = screen.getByPlaceholderText('Your Full Name');
    expect(nameInput).toBeInTheDocument();
    expect(nameInput).toHaveValue('');
  });

  it('toggles back to login mode from signup', () => {
    render(<AuthModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />);
    fireEvent.click(screen.getByText('Sign Up'));
    fireEvent.click(screen.getByText('Sign In'));
    expect(screen.getByText('Welcome Back')).toBeInTheDocument();
  });

  it('calls onClose when close button clicked', () => {
    render(<AuthModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />);
    const buttons = screen.getAllByRole('button');
    const closeBtn = buttons.find(b => b.querySelector('svg'));
    if (closeBtn) fireEvent.click(closeBtn);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('calls loginWithEmail on form submit', async () => {
    mockLoginWithEmail.mockResolvedValue({ user: { id: 'u1', name: 'Test' } });
    render(<AuthModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />);
    fireEvent.change(screen.getByPlaceholderText('name@example.com'), { target: { value: 'ncsound919@gmail.com' } });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    await waitFor(() => {
      expect(mockLoginWithEmail).toHaveBeenCalledWith('ncsound919@gmail.com', 'password123', undefined);
    });
  });

  it('calls onSuccess after successful login', async () => {
    mockLoginWithEmail.mockResolvedValue({ user: { id: 'u1', name: 'Test User' } });
    render(<AuthModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />);
    fireEvent.change(screen.getByPlaceholderText('name@example.com'), { target: { value: 'ncsound919@gmail.com' } });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalledWith({ id: 'u1', name: 'Test User' });
    });
  });

  it('calls onClose after successful login', async () => {
    mockLoginWithEmail.mockResolvedValue({ user: { id: 'u1', name: 'Test User' } });
    render(<AuthModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />);
    fireEvent.change(screen.getByPlaceholderText('name@example.com'), { target: { value: 'ncsound919@gmail.com' } });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('calls loginWithGoogle on Google button click', async () => {
    mockLoginWithGoogle.mockResolvedValue({ user: { id: 'u1', name: 'Test User' } });
    render(<AuthModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />);
    fireEvent.click(screen.getByText(/Continue with Google/));
    await waitFor(() => {
      expect(mockLoginWithGoogle).toHaveBeenCalled();
    });
  });

  it('calls onSuccess after Google sign-in', async () => {
    mockLoginWithGoogle.mockResolvedValue({ user: { id: 'u1', name: 'Google User' } });
    render(<AuthModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />);
    fireEvent.click(screen.getByText(/Continue with Google/));
    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalledWith({ id: 'u1', name: 'Google User' });
    });
  });

  it('shows error message on login failure', async () => {
    mockLoginWithEmail.mockRejectedValue(new Error('Invalid credentials'));
    render(<AuthModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />);
    fireEvent.change(screen.getByPlaceholderText('name@example.com'), { target: { value: 'ncsound919@gmail.com' } });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    expect(await screen.findByText('Invalid credentials')).toBeInTheDocument();
  });

  it('shows default error message when no message provided', async () => {
    mockLoginWithEmail.mockRejectedValue(new Error());
    render(<AuthModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />);
    fireEvent.change(screen.getByPlaceholderText('name@example.com'), { target: { value: 'ncsound919@gmail.com' } });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    expect(await screen.findByText('Authentication failed. Please try again.')).toBeInTheDocument();
  });

  it('shows error message on Google sign-in failure', async () => {
    mockLoginWithGoogle.mockRejectedValue(new Error('Google SSO failed.'));
    render(<AuthModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />);
    fireEvent.click(screen.getByText(/Continue with Google/));
    expect(await screen.findByText('Google SSO failed.')).toBeInTheDocument();
  });

  it('calls loginWithEmail with name on signup', async () => {
    mockLoginWithEmail.mockResolvedValue({ user: { id: 'u1', name: 'FinTech Scholar' } });
    render(<AuthModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />);
    fireEvent.click(screen.getByText('Sign Up'));
    fireEvent.change(screen.getByPlaceholderText('Your Full Name'), { target: { value: 'FinTech Scholar' } });
    fireEvent.change(screen.getByPlaceholderText('name@example.com'), { target: { value: 'ncsound919@gmail.com' } });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /create account/i }));
    await waitFor(() => {
      expect(mockLoginWithEmail).toHaveBeenCalledWith('ncsound919@gmail.com', 'password123', 'FinTech Scholar');
    });
  });

  it('shows authenticating text while loading', async () => {
    mockLoginWithEmail.mockImplementation(() => new Promise(() => {}));
    render(<AuthModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />);
    fireEvent.change(screen.getByPlaceholderText('name@example.com'), { target: { value: 'ncsound919@gmail.com' } });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    expect(await screen.findByText('Authenticating...')).toBeInTheDocument();
  });

  it('uses custom defaultEmail prop', () => {
    render(<AuthModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} defaultEmail="test@example.com" />);
    expect(screen.getByDisplayValue('test@example.com')).toBeInTheDocument();
  });

  it('shows sync description text', () => {
    render(<AuthModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />);
    expect(screen.getByText(/Sync your learning progress/)).toBeInTheDocument();
  });

  it('closes the modal when Escape key is pressed', () => {
    render(<AuthModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />);
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('closes the modal when backdrop is clicked', () => {
    render(<AuthModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />);
    const backdrop = screen.getByText('Welcome Back').closest('[class*="fixed"]');
    if (backdrop) fireEvent.click(backdrop);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('updates the full name field', () => {
    render(<AuthModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />);
    fireEvent.click(screen.getByText('Sign Up'));
    const nameInput = screen.getByPlaceholderText('Your Full Name');
    fireEvent.change(nameInput, { target: { value: 'Alice Smith' } });
    expect(screen.getByDisplayValue('Alice Smith')).toBeInTheDocument();
  });

  it('updates the email field', () => {
    render(<AuthModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />);
    const emailInput = screen.getByPlaceholderText('name@example.com');
    fireEvent.change(emailInput, { target: { value: 'new@example.com' } });
    expect(screen.getByDisplayValue('new@example.com')).toBeInTheDocument();
  });

  it('updates the password field', () => {
    render(<AuthModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />);
    const passwordInput = screen.getByPlaceholderText('••••••••');
    fireEvent.change(passwordInput, { target: { value: 'hunter2' } });
    expect(screen.getByDisplayValue('hunter2')).toBeInTheDocument();
  });
});
