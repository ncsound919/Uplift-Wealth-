import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { InstitutionalCurriculum } from './InstitutionalCurriculum';

vi.mock('react-router', () => ({ useNavigate: () => vi.fn() }));

describe('InstitutionalCurriculum', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders the curriculum title and module rows', () => {
    render(<InstitutionalCurriculum />);
    expect(screen.getByText('Institutional Classroom Curriculum')).toBeInTheDocument();
    expect(screen.getByText(/Curriculum — 16 modules/)).toBeInTheDocument();
    expect(screen.getAllByText(/Module \d+/).length).toBeGreaterThan(10);
  });

  it('includes the download/print CTA', () => {
    render(<InstitutionalCurriculum />);
    expect(screen.getByText('Download as PDF')).toBeInTheDocument();
  });

  it('calls window.print on the download button', () => {
    const printSpy = vi.spyOn(window, 'print').mockImplementation(() => {});
    render(<InstitutionalCurriculum />);
    screen.getByText('Download as PDF').click();
    expect(printSpy).toHaveBeenCalled();
    printSpy.mockRestore();
  });

  it('mentions the adoption steps and pricing', () => {
    render(<InstitutionalCurriculum />);
    expect(screen.getByText(/How to adopt in 3 steps/)).toBeInTheDocument();
    expect(screen.getByText(/\$99\/mo · up to 50 seats/)).toBeInTheDocument();
  });
});
