import React from 'react';
import { Sparkles } from 'lucide-react';
import { cn } from '../lib/utils';

export function ConnectingTheDotsArticle() {
  return (
    <div className="max-w-[1600px] mx-auto p-4 md:p-8 space-y-10">

      {/* ARTICLE HERO HEADER */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-indigo-950 border border-indigo-900/40 rounded-3xl p-6 md:p-10 text-white shadow-xl relative overflow-hidden space-y-6">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-3 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-900/60 border border-indigo-700/50 text-indigo-300 text-xs font-black uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Curriculum Feature Article • 2026 Systems Architecture</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-black tracking-tight font-display text-white leading-tight">
            Connecting the Dots: How America's Financial Systems Actually Work Together
          </h1>

          <p className="text-base md:text-lg text-slate-300 max-w-3xl font-medium leading-relaxed">
            It's easy to think about "the Fed," "your credit score," "your bank," and "that fintech app on your phone" as separate things. They aren't. They're one connected machine—six modules turning against each other.
          </p>
        </div>
      </div>

      {/* ARTICLE BODY & SECTIONS */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-10 space-y-10 shadow-sm text-slate-800 dark:text-slate-200 font-sans leading-relaxed">

        {/* Intro Section */}
        <section className="space-y-4 border-b border-slate-200 dark:border-slate-800 pb-8">
          <p className="text-base md:text-lg font-medium text-slate-700 dark:text-slate-300 leading-relaxed">
            Think of America's financial system like a water system for an entire city. There's a reservoir at the top of a hill, pipes that carry pressure down through every neighborhood, meters on every house that decide who gets how much, and a utility inspector who's supposed to make sure nobody's water gets shut off unfairly.
          </p>
          <p className="text-sm md:text-base text-slate-600 dark:text-slate-400">
            If you don't understand how the pressure at the top connects to the meter on your house, every price change feels random. Once you see the pipe, it stops feeling random. Here is the pipe, module by module.
          </p>
        </section>

        {/* MODULE 1 */}
        <section className="space-y-4 pt-2">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800/80 text-amber-800 dark:text-amber-300 font-black text-xs uppercase rounded-full">
              Module 1
            </span>
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white font-display">
              1. The Federal Reserve sets the water pressure at the top of the hill
            </h2>
          </div>

          <p className="text-sm md:text-base leading-relaxed">
            The Federal Reserve doesn't print cash and hand it to banks. What it actually does is set the <strong className="text-amber-600 dark:text-amber-400">federal funds rate</strong>—the rate banks charge each other to borrow reserves overnight—using a small toolkit: interest paid on reserves held at the Fed (which sets a floor, since no bank will lend to another for less than it can earn risk-free from the Fed itself), an overnight reverse repo facility, and the discount rate as a backstop.
          </p>

          <div className="bg-amber-50 dark:bg-amber-950/40 p-4 md:p-5 rounded-2xl border border-amber-200 dark:border-amber-800/60 text-xs md:text-sm space-y-2">
            <span className="font-black text-amber-900 dark:text-amber-300 uppercase tracking-wider block">
              2026 Monetary Policy Context
            </span>
            <p className="text-amber-900/90 dark:text-amber-200/90">
              As of the FOMC's meeting on June 17, 2026—the first under Fed Chair Kevin Warsh—the target range sits at <strong>3.50% to 3.75%</strong>, held steady in a unanimous 12–0 vote, with inflation running around 4.2%.
            </p>
          </div>

          <p className="text-sm md:text-base leading-relaxed">
            <strong>The pipe analogy:</strong> the Fed doesn't set your interest rate any more than a reservoir sets the water pressure at your kitchen sink. It sets the pressure at the top of the hill. Every pipe downstream—your bank, your card issuer, your mortgage lender—builds their price for you on top of that pressure. Banks typically set their <strong>prime rate</strong> about three points above the federal funds rate (~6.5% today). Your card APR, auto loan rate, and any variable-rate debt get built on top of prime, adjusted for your personal risk.
          </p>
        </section>

        {/* MODULE 2 */}
        <section className="space-y-4 border-t border-slate-200 dark:border-slate-800 pt-8">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-blue-100 dark:bg-blue-950/60 border border-blue-300 dark:border-blue-800/80 text-blue-800 dark:text-blue-300 font-black text-xs uppercase rounded-full">
              Module 2
            </span>
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white font-display">
              2. Banks don't store money—they manufacture it, on the spot, when they approve you
            </h2>
          </div>

          <p className="text-sm md:text-base leading-relaxed">
            This is the part almost every finance explainer gets wrong. The textbook version most people were taught: a bank takes your $1,000 deposit, keeps 10% in the vault, and lends out the rest. That's the <em>fractional reserve</em> model, and it describes a system that used to exist. It doesn't anymore. The Federal Reserve set the reserve requirement to <strong>zero percent</strong> in March 2020, and it has stayed at zero through 2026.
          </p>

          <div className="bg-blue-50 dark:bg-blue-950/40 p-4 md:p-5 rounded-2xl border border-blue-200 dark:border-blue-800/60 text-xs md:text-sm space-y-2">
            <span className="font-black text-blue-900 dark:text-blue-300 uppercase tracking-wider block">
              Bank of England Landmark Research
            </span>
            <p className="text-blue-900/90 dark:text-blue-200/90 italic">
              "Banks do not act simply as intermediaries, lending out deposits that savers place with them, and nor do they 'multiply up' central bank money to create new loans and deposits."
            </p>
          </div>

          <p className="text-sm md:text-base leading-relaxed">
            <strong>A better analogy than the vault:</strong> think of a bank less like a warehouse holding inventory and more like a court clerk with the authority to issue an official document. When you get approved for a loan, the bank doesn't reach into a safe—it writes a new deposit into your account, on the spot. What actually limits a bank isn't "how much cash is in the vault"—it's <strong>capital requirements</strong> and regulatory risk rules.
          </p>
        </section>

        {/* MODULE 3 */}
        <section className="space-y-4 border-t border-slate-200 dark:border-slate-800 pt-8">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800/80 text-emerald-800 dark:text-emerald-300 font-black text-xs uppercase rounded-full">
              Module 3
            </span>
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white font-display">
              3. Your credit score is the meter on your house
            </h2>
          </div>

          <p className="text-sm md:text-base leading-relaxed">
            Three companies—Equifax, Experian, and TransUnion—collect your payment history, account ages, balances, and credit mix, and feed it into a scoring formula. <strong>FICO</strong> is the dominant model, while <strong>VantageScore</strong> has been closing the gap. A 2026 study found that VantageScore 4.0's newer model—which looks at the <em>trend</em> of your balances over time—identifies roughly 5 million creditworthy borrowers that FICO's models miss entirely.
          </p>

          <p className="text-sm md:text-base leading-relaxed">
            <strong>The meter analogy:</strong> your credit score is the reading the utility company looks at before deciding your rate. Roughly 53 million Americans are considered "credit invisible" or unscorable under traditional models.
          </p>
        </section>

        {/* MODULE 4 */}
        <section className="space-y-4 border-t border-slate-200 dark:border-slate-800 pt-8">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-purple-100 dark:bg-purple-950/60 border border-purple-300 dark:border-purple-800/80 text-purple-800 dark:text-purple-300 font-black text-xs uppercase rounded-full">
              Module 4
            </span>
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white font-display">
              4. Fintech apps are new faucets on the same pipes
            </h2>
          </div>

          <p className="text-sm md:text-base leading-relaxed">
            Cash App, Chime, and Varo run on a <strong>Banking-as-a-Service</strong> model: a partner bank sits behind the scenes actually holding FDIC-insured deposits and moving the money. Transfers clear through ACH, card networks, and increasingly <strong>FedNow</strong>, the Fed's real-time payment rail.
          </p>

          <div className="bg-purple-50 dark:bg-purple-950/40 p-4 md:p-5 rounded-2xl border border-purple-200 dark:border-purple-800/60 text-xs md:text-sm space-y-2">
            <span className="font-black text-purple-900 dark:text-purple-300 uppercase tracking-wider block">
              Case Study: July 2025 Algorithmic Settlement
            </span>
            <p className="text-purple-900/90 dark:text-purple-200/90">
              The Massachusetts Attorney General reached a <strong>$2.5 million settlement</strong> with Earnest Operations after alleging its AI underwriting model penalized applicants who attended Historically Black Colleges and Universities (HBCUs).
            </p>
          </div>
        </section>

        {/* MODULE 5 */}
        <section className="space-y-4 border-t border-slate-200 dark:border-slate-800 pt-8">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-rose-100 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800/80 text-rose-800 dark:text-rose-300 font-black text-xs uppercase rounded-full">
              Module 5
            </span>
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white font-display">
              5. Regulators are the utility inspector—and in 2026, the inspector's job changed
            </h2>
          </div>

          <p className="text-sm md:text-base leading-relaxed">
            Four federal agencies police the boundary: Fed, FDIC, OCC, and CFPB. On April 22, 2026, the CFPB finalized a rule stripping the <strong>"effects test"</strong> (disparate impact) out of Regulation B under ECOA, taking effect <strong>July 21, 2026</strong>. In response, State AGs (like NJ and NY) are stepping in to enforce state-level fair lending laws.
          </p>
        </section>

        {/* MODULE 6 */}
        <section className="space-y-4 border-t border-slate-200 dark:border-slate-800 pt-8">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-teal-100 dark:bg-teal-950/60 border border-teal-300 dark:border-teal-800/80 text-teal-800 dark:text-teal-300 font-black text-xs uppercase rounded-full">
              Module 6
            </span>
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white font-display">
              6. Community institutions are a second, smaller pipe running to the same reservoir
            </h2>
          </div>

          <p className="text-sm md:text-base leading-relaxed">
            Black-owned banks, credit unions, and CDFIs draw from the same system physics but make localized lending decisions. There are roughly 22 Black-owned banks left in the U.S. in 2026, controlling well under 1% of total banking assets. Formalized lending circles (like Mission Asset Fund) convert grassroots community trust into bureau-visible credit history.
          </p>
        </section>

        {/* RECAP SUMMARY */}
        <div className="bg-slate-900 text-white p-6 md:p-8 rounded-3xl space-y-4 border border-slate-800">
          <h3 className="text-xl font-black font-display text-indigo-400">The Full Loop Traced In One Pass</h3>
          <ol className="space-y-2 text-xs md:text-sm text-slate-300 list-decimal list-inside leading-relaxed">
            <li><strong>The Fed</strong> sets the pressure at the top of the hill (3.50%–3.75%).</li>
            <li><strong>Banks</strong> build prices on top of that pressure and decide who to create new deposit money for.</li>
            <li><strong>Credit bureaus and scoring models</strong> compress history into a house meter reading.</li>
            <li><strong>Fintech apps</strong> run on the same pipes as steps 1–3, delivering faster digital faucets.</li>
            <li><strong>Regulators</strong> decide how closely anyone checks whether steps 2–4 are fair.</li>
            <li><strong>Community institutions</strong> provide localized pipes to the same reservoir.</li>
          </ol>
        </div>

      </div>
    </div>
  );
}

