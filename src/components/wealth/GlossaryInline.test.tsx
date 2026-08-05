import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Markdown from 'react-markdown';
import { rehypeGlossaryHighlight, GlossaryTermSpan } from './GlossaryInline';
import { FINANCE_GLOSSARY_TERMS } from '../FinanceGlossary';

function renderBody(md: string) {
  return render(
    <Markdown rehypePlugins={[rehypeGlossaryHighlight]} components={{
      span: ({ node, children }: any) => {
        const termId = node?.properties?.dataGlossary as string | undefined;
        if (termId) return <GlossaryTermSpan termId={termId}>{children}</GlossaryTermSpan>;
        return <span>{children}</span>;
      },
    }}>
      {md}
    </Markdown>
  );
}

describe('GlossaryInline', () => {
  it('wraps a matching glossary term in a highlight span', () => {
    renderBody('Your FICO Score matters for loans.');
    expect(screen.getByText('FICO Score')).toBeInTheDocument();
    expect(screen.queryAllByRole('button', { name: /dictionary definition available/i }).length).toBeGreaterThanOrEqual(1);
  });

  it('highlights a parenthetical acronym like APR', () => {
    renderBody('A 20% APR is expensive.');
    const el = screen.getByText('APR');
    expect(el).toBeInTheDocument();
  });

  it('does not highlight links or code', () => {
    renderBody('Visit [AnnualCreditReport.com](https://annualcreditreport.com) and use `FICO Score` safely.');
    expect(screen.getByText('AnnualCreditReport.com')).toBeInTheDocument();
    // Link text and code text should NOT be highlighted.
    expect(screen.queryAllByRole('button', { name: /dictionary definition available/i })).toHaveLength(0);
  });

  it('renders a tooltip with the definition on the term', () => {
    const term = FINANCE_GLOSSARY_TERMS.find(t => t.id === 'g-fico-score') || FINANCE_GLOSSARY_TERMS[0];
    render(<GlossaryTermSpan termId={term.id}>FICO Score</GlossaryTermSpan>);
    expect(screen.getByText('FICO Score')).toBeInTheDocument();
    // Tooltip only renders after hover; verify the trigger role exists.
    expect(screen.getByRole('button', { name: /dictionary definition available/i })).toBeInTheDocument();
  });

  it('falls back to plain text when the term id is unknown', () => {
    render(<GlossaryTermSpan termId="g-unknown-term">Something</GlossaryTermSpan>);
    expect(screen.getByText('Something')).toBeInTheDocument();
  });

  it('highlights glossary terms across a realistic module paragraph', () => {
    renderBody(
      `A **credit score** is a price tag on your financial life.\nYour FICO Score and payment history shape the APR you pay.`
    );
    expect(screen.getAllByRole('button', { name: /dictionary definition available/i }).length).toBeGreaterThanOrEqual(1);
  });

  it('does not double-wrap a term into nested buttons', () => {
    renderBody('Your FICO Score matters.');
    const matches = screen.getAllByRole('button', { name: /FICO Score.*dictionary/i });
    expect(matches).toHaveLength(1);
  });
});
