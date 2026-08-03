import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Award, Shield, FileText, DollarSign, Scale, Rocket, HelpCircle, Check, AlertCircle, RefreshCw } from 'lucide-react';
import { apiClient } from '../lib/apiClient';

interface CapstoneCanvasProps {
  onComplete: () => void;
}

export function CapstoneCanvas({ onComplete }: CapstoneCanvasProps) {
  // Setup state for Capstone Form
  const [startupName, setStartupName] = useState('');
  const [vertical, setVertical] = useState('payments');
  const [problem, setProblem] = useState('');
  const [targetMarket, setTargetMarket] = useState('gig-workers');
  const [revenueModel, setRevenueModel] = useState('interchange');
  const [regulatoryPath, setRegulatoryPath] = useState('baas');
  
  // Compliance checkboxes
  const [complianceChecklist, setComplianceChecklist] = useState({
    kyc: false,
    pci: false,
    mfa: false,
    aml: false,
    privacy: false
  });

  // Results state
  const [evaluated, setEvaluated] = useState(false);
  const [score, setScore] = useState(0);
  const [viability, setViability] = useState('Low');
  const [regComplexity, setRegComplexity] = useState('Low');
  const [feedbacks, setFeedbacks] = useState<string[]>([]);
  const [estimatedValuation, setEstimatedValuation] = useState(0);

  // Load capstone state from Express backend
  useEffect(() => {
    apiClient.loadSandboxState('capstone').then((res) => {
      if (res.stateData) {
        if (res.stateData.startupName) setStartupName(res.stateData.startupName);
        if (res.stateData.vertical) setVertical(res.stateData.vertical);
        if (res.stateData.problem) setProblem(res.stateData.problem);
        if (res.stateData.complianceChecklist) setComplianceChecklist(res.stateData.complianceChecklist);
        if (res.stateData.evaluated !== undefined) setEvaluated(res.stateData.evaluated);
        if (res.stateData.score !== undefined) setScore(res.stateData.score);
      }
    }).catch((err) => console.log('[Capstone Sandbox] Local fallback:', err));
  }, []);

  // Save capstone snapshot when evaluated or form updated
  useEffect(() => {
    if (startupName) {
      apiClient.saveSandboxState({
        sandboxType: 'capstone',
        stateData: { startupName, vertical, problem, targetMarket, revenueModel, regulatoryPath, complianceChecklist, evaluated, score },
        notes: `Capstone Pitch: ${startupName}`
      }).catch((err) => console.warn('[Capstone AutoSave Error]:', err));
    }
  }, [startupName, vertical, problem, targetMarket, revenueModel, regulatoryPath, complianceChecklist, evaluated, score]);

  const handleCheckboxChange = (key: keyof typeof complianceChecklist) => {
    setComplianceChecklist(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleEvaluate = () => {
    if (!startupName.trim()) {
      alert('Please enter a name for your fintech startup!');
      return;
    }

    // Interactive scoring matrix
    let baseScore = 60;
    const feedbackList: string[] = [];
    let complexity = 'Medium';
    let baseValuation = 1500000; // $1.5M standard seed-stage valuation

    // 1. Check Vertical vs Revenue model alignment
    if (vertical === 'payments') {
      if (revenueModel === 'interchange') {
        baseScore += 10;
        baseValuation += 500000;
        feedbackList.push("✅ Strong structural alignment: Payments products scale naturally using transaction interchange fees.");
      } else if (revenueModel === 'aum') {
        baseScore -= 10;
        feedbackList.push("⚠️ Model mismatch: Charging Assets Under Management (AUM) fees on a purely payment product is highly unusual and discourages usage.");
      } else if (revenueModel === 'interest') {
        baseScore += 5;
        feedbackList.push("ℹ️ Note: Payment flows can generate yield on overnight deposits, but interchange remains your primary growth driver.");
      }
    }

    if (vertical === 'neobank') {
      if (regulatoryPath === 'baas') {
        baseScore += 15;
        baseValuation += 1000000;
        feedbackList.push("✅ Viable path: Partnering with a sponsor bank via BaaS (Banking-as-a-Service) is the industry standard for rapid neobank market entry.");
      } else if (regulatoryPath === 'charter') {
        baseScore += 5;
        complexity = 'Extreme';
        baseValuation += 3000000;
        feedbackList.push("⚖️ Bold Strategy: Pursuing a full bank charter provides maximum autonomy and deposits power, but prepare for 2+ years of extreme regulatory oversight and heavy capital requirements.");
      } else if (regulatoryPath === 'none') {
        baseScore -= 30;
        feedbackList.push("🚨 CRITICAL ERROR: Attempting to run a Neobank with no bank partnership or license is a direct violation of banking laws. FDIC will shut you down on day one!");
      }
    }

    if (vertical === 'lending') {
      if (revenueModel === 'interest') {
        baseScore += 15;
        baseValuation += 800000;
        feedbackList.push("✅ Standard model: Lending thrives on the spread from lending out deposits or capital at competitive interest rates.");
      } else if (revenueModel === 'interchange') {
        baseScore -= 10;
        feedbackList.push("⚠️ Economics Warning: Lending programs (like BNPL) rely heavily on merchant fees or interest. Relying purely on interchange is unsustainable.");
      }
    }

    if (vertical === 'wealth') {
      if (revenueModel === 'aum') {
        baseScore += 15;
        baseValuation += 700000;
        feedbackList.push("✅ Standard alignment: Wealth and robo-advisory apps succeed with stable, predictable AUM recurring fees (e.g., 0.25% - 0.75%).");
      } else if (regulatoryPath === 'ria') {
        baseScore += 10;
        feedbackList.push("✅ Proper Registration: Registering as an Investment Advisor protects customer fiduciary duties and meets SEC guidelines.");
      }
    }

    // 2. Check Compliance & Safety checks
    const activeChecksCount = Object.values(complianceChecklist).filter(Boolean).length;
    baseScore += activeChecksCount * 4;
    baseValuation += activeChecksCount * 250000;

    if (!complianceChecklist.kyc) {
      baseScore -= 15;
      feedbackList.push("❌ Compliance Gap: Lacking KYC (Know Your Customer) systems opens your platform to severe financial fraud and regulatory fines.");
    } else {
      feedbackList.push("🛡️ Compliance strength: Robust KYC protocols established at login.");
    }

    if (!complianceChecklist.aml) {
      baseScore -= 15;
      feedbackList.push("❌ Financial Crime Risk: Missing Automated Transaction Monitoring / AML makes you an easy target for money launderers.");
    }

    if (vertical === 'payments' && !complianceChecklist.pci) {
      baseScore -= 10;
      feedbackList.push("⚠️ Security issue: Storing or routing card details without PCI-DSS validation creates major cardholder liabilities.");
    }

    // Calculate complex level
    if (regulatoryPath === 'charter') {
      complexity = 'Extreme';
    } else if (regulatoryPath === 'baas' || regulatoryPath === 'ria') {
      complexity = 'High';
    } else {
      complexity = 'Moderate';
    }

    // Establish viability index
    let finalViability = 'Moderate';
    if (baseScore >= 85) finalViability = 'High';
    else if (baseScore < 65) finalViability = 'Low (High Risk)';

    setScore(Math.min(100, Math.max(0, baseScore)));
    setViability(finalViability);
    setRegComplexity(complexity);
    setFeedbacks(feedbackList);
    setEstimatedValuation(baseValuation);
    setEvaluated(true);
  };

  const handleReset = () => {
    setStartupName('');
    setVertical('payments');
    setProblem('');
    setTargetMarket('gig-workers');
    setRevenueModel('interchange');
    setRegulatoryPath('baas');
    setComplianceChecklist({
      kyc: false,
      pci: false,
      mfa: false,
      aml: false,
      privacy: false
    });
    setEvaluated(false);
  };

  const getVerticalLabel = () => {
    switch (vertical) {
      case 'payments': return 'Payments & Remittance';
      case 'neobank': return 'Neobanking / BaaS';
      case 'lending': return 'BNPL & Underwriting';
      case 'wealth': return 'Wealth / Robo-Advisory';
      case 'insurtech': return 'Insurtech & Parametrics';
      case 'crypto': return 'Crypto & Digital Assets';
      default: return 'Fintech Product';
    }
  };

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-2xl shadow-sm overflow-hidden font-sans">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-indigo-700 to-indigo-900 p-6 text-white">
        <div className="flex items-center gap-3">
          <Award className="w-8 h-8 text-indigo-300" />
          <div>
            <h3 className="text-2xl font-black">Module 12: Capstone Project</h3>
            <p className="text-sm text-indigo-200 mt-1">
              Design, structure, and stress-test your proprietary fintech venture.
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Form Panel: 7 Columns */}
        <div className="lg:col-span-7 bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h4 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Rocket className="w-5 h-5 text-indigo-600" /> Startup Canvas Builder
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">Fill out each dimension to evaluate market viability and regulatory fit.</p>
          </div>

          <div className="space-y-4">
            {/* Startup Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">1. Startup Name</label>
              <input 
                type="text" 
                value={startupName}
                onChange={(e) => setStartupName(e.target.value)}
                placeholder="e.g., Payflow, Earned, LedgerShield"
                disabled={evaluated}
                className="w-full text-sm px-4 py-2.5 rounded-lg border border-slate-300 outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60"
              />
            </div>

            {/* Vertical & Target Market */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">2. Product Vertical</label>
                <select 
                  value={vertical}
                  onChange={(e) => setVertical(e.target.value)}
                  disabled={evaluated}
                  className="w-full text-sm px-3 py-2.5 rounded-lg border border-slate-300 outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  <option value="payments">Payments & Remittances</option>
                  <option value="neobank">Neobanking (BaaS)</option>
                  <option value="lending">BNPL & Alternative Credit</option>
                  <option value="wealth">Robo-Advisory & Investing</option>
                  <option value="insurtech">Insurtech (Parametric)</option>
                  <option value="crypto">Stablecoins & Tokenized Assets</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">3. Target Market</label>
                <select 
                  value={targetMarket}
                  onChange={(e) => setTargetMarket(e.target.value)}
                  disabled={evaluated}
                  className="w-full text-sm px-3 py-2.5 rounded-lg border border-slate-300 outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  <option value="gig-workers">Gig Economy Workers</option>
                  <option value="underbanked">Underbanked / Immigrant Communities</option>
                  <option value="gen-z">Gen-Z Micro-Investors</option>
                  <option value="smb">Small & Medium Businesses (SMBs)</option>
                  <option value="hnw">High-Net-Worth Individuals</option>
                </select>
              </div>
            </div>

            {/* Problem Statement */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">4. Problem to Solve</label>
              <textarea 
                value={problem}
                onChange={(e) => setProblem(e.target.value)}
                placeholder="Explain what friction your platform removes..."
                rows={2}
                disabled={evaluated}
                className="w-full text-sm p-3 rounded-lg border border-slate-300 outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60"
              />
            </div>

            {/* Revenue & Regulatory */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">5. Monetization Strategy</label>
                <select 
                  value={revenueModel}
                  onChange={(e) => setRevenueModel(e.target.value)}
                  disabled={evaluated}
                  className="w-full text-sm px-3 py-2.5 rounded-lg border border-slate-300 outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  <option value="interchange">Card Interchange Fees (0.5% - 2%)</option>
                  <option value="subscription">SaaS Monthly Subscription Fees</option>
                  <option value="interest">Interest Spread on Deposits / Lending</option>
                  <option value="aum">Assets Under Management (AUM) Fee</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">6. Regulatory Framework</label>
                <select 
                  value={regulatoryPath}
                  onChange={(e) => setRegulatoryPath(e.target.value)}
                  disabled={evaluated}
                  className="w-full text-sm px-3 py-2.5 rounded-lg border border-slate-300 outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  <option value="baas">Sponsor Bank BaaS Partnership</option>
                  <option value="charter">Full Commercial Bank Charter (FDIC)</option>
                  <option value="ria">Registered Investment Advisor (RIA)</option>
                  <option value="none">Unregulated (Minimal regulatory path)</option>
                </select>
              </div>
            </div>

            {/* Compliance & Security Grid */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">7. Core Compliance & Security Measures</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <label className={`flex items-center p-3 rounded-lg border cursor-pointer transition-colors ${complianceChecklist.kyc ? 'bg-indigo-50 border-indigo-200' : 'bg-slate-50 border-slate-200'} ${evaluated ? 'pointer-events-none opacity-80' : ''}`}>
                  <input 
                    type="checkbox" 
                    checked={complianceChecklist.kyc}
                    onChange={() => handleCheckboxChange('kyc')}
                    disabled={evaluated}
                    className="mr-2.5 h-4 w-4 text-indigo-600 border-slate-300 rounded"
                  />
                  <div>
                    <p className="text-xs font-bold text-slate-800">KYC/CIP Identity Verification</p>
                    <p className="text-xs text-slate-500">SSN check, driver license photo verification.</p>
                  </div>
                </label>

                <label className={`flex items-center p-3 rounded-lg border cursor-pointer transition-colors ${complianceChecklist.aml ? 'bg-indigo-50 border-indigo-200' : 'bg-slate-50 border-slate-200'} ${evaluated ? 'pointer-events-none opacity-80' : ''}`}>
                  <input 
                    type="checkbox" 
                    checked={complianceChecklist.aml}
                    onChange={() => handleCheckboxChange('aml')}
                    disabled={evaluated}
                    className="mr-2.5 h-4 w-4 text-indigo-600 border-slate-300 rounded"
                  />
                  <div>
                    <p className="text-xs font-bold text-slate-800">AML/FinCEN Screening</p>
                    <p className="text-xs text-slate-500">Anti-Money Laundering transaction alerts.</p>
                  </div>
                </label>

                <label className={`flex items-center p-3 rounded-lg border cursor-pointer transition-colors ${complianceChecklist.pci ? 'bg-indigo-50 border-indigo-200' : 'bg-slate-50 border-slate-200'} ${evaluated ? 'pointer-events-none opacity-80' : ''}`}>
                  <input 
                    type="checkbox" 
                    checked={complianceChecklist.pci}
                    onChange={() => handleCheckboxChange('pci')}
                    disabled={evaluated}
                    className="mr-2.5 h-4 w-4 text-indigo-600 border-slate-300 rounded"
                  />
                  <div>
                    <p className="text-xs font-bold text-slate-800">PCI-DSS Tokenization</p>
                    <p className="text-xs text-slate-500">Encrypt card data during transit/storage.</p>
                  </div>
                </label>

                <label className={`flex items-center p-3 rounded-lg border cursor-pointer transition-colors ${complianceChecklist.privacy ? 'bg-indigo-50 border-indigo-200' : 'bg-slate-50 border-slate-200'} ${evaluated ? 'pointer-events-none opacity-80' : ''}`}>
                  <input 
                    type="checkbox" 
                    checked={complianceChecklist.privacy}
                    onChange={() => handleCheckboxChange('privacy')}
                    disabled={evaluated}
                    className="mr-2.5 h-4 w-4 text-indigo-600 border-slate-300 rounded"
                  />
                  <div>
                    <p className="text-xs font-bold text-slate-800">GDPR & CCPA Safeguards</p>
                    <p className="text-xs text-slate-500">Rigorous financial data privacy standards.</p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex gap-3">
            {evaluated ? (
              <button
                type="button"
                onClick={handleReset}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold py-3 rounded-lg border border-slate-300 transition-colors flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" /> Reset Canvas
              </button>
            ) : (
              <button
                type="button"
                onClick={handleEvaluate}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg shadow-md transition-colors flex items-center justify-center gap-2"
              >
                🚀 Run Stress-Test & Evaluation
              </button>
            )}
          </div>
        </div>

        {/* Right Output Panel: 5 Columns */}
        <div className="lg:col-span-5 flex flex-col justify-between">
          {evaluated ? (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-slate-900 text-white rounded-xl p-6 border border-slate-800 flex-grow flex flex-col justify-between"
            >
              <div>
                <div className="border-b border-slate-800 pb-3 mb-4 flex justify-between items-center">
                  <div>
                    <span className="text-xs text-emerald-400 font-bold uppercase tracking-widest">{getVerticalLabel()}</span>
                    <h5 className="text-xl font-black">{startupName}</h5>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-400 block uppercase">Estimated Valuation</span>
                    <span className="text-sm font-bold text-emerald-300 font-mono">${estimatedValuation.toLocaleString()}</span>
                  </div>
                </div>

                {/* Score section */}
                <div className="grid grid-cols-3 gap-3 mb-6 bg-slate-950 p-4 rounded-lg border border-slate-800">
                  <div className="text-center">
                    <span className="text-xs text-slate-400 block uppercase font-bold">Launch Score</span>
                    <span className="text-2xl font-extrabold text-white font-mono">{score}/100</span>
                  </div>
                  <div className="text-center border-x border-slate-800">
                    <span className="text-xs text-slate-400 block uppercase font-bold">Viability</span>
                    <span className={`text-sm font-extrabold mt-1 block ${viability.includes('High') ? 'text-emerald-400' : 'text-amber-400'}`}>{viability}</span>
                  </div>
                  <div className="text-center">
                    <span className="text-xs text-slate-400 block uppercase font-bold">Reg. Hurdle</span>
                    <span className={`text-sm font-extrabold mt-1 block ${regComplexity === 'Extreme' ? 'text-red-400' : regComplexity === 'High' ? 'text-amber-400' : 'text-emerald-400'}`}>{regComplexity}</span>
                  </div>
                </div>

                {/* Feedbacks */}
                <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                  <h6 className="text-xs uppercase text-slate-400 tracking-wider font-bold mb-2">Systems Architecture Diagnostics:</h6>
                  {feedbacks.map((f, i) => (
                    <div key={i} className="text-xs leading-relaxed bg-slate-950/55 border border-slate-800 rounded-lg p-2.5 flex gap-2 items-start">
                      {f.includes('✅') || f.includes('🛡️') ? (
                        <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      ) : f.includes('🚨') || f.includes('❌') ? (
                        <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      ) : (
                        <HelpCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      )}
                      <p className="text-slate-300">{f.replace(/^[^\s]+\s/, '')}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-6 border-t border-slate-800 mt-6">
                <div className="bg-emerald-950/20 border border-emerald-900/50 p-3 rounded-lg mb-4 text-xs text-emerald-300">
                  🏆 <strong>Capstone Verified:</strong> Your model demonstrates critical regulatory and architectural competence required in high-growth fintech environments.
                </div>
                <button
                  onClick={onComplete}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-lg transition-colors"
                >
                  Submit Capstone Pitch & Graduate 🎓
                </button>
              </div>
            </motion.div>
          ) : (
            <div className="bg-slate-100 rounded-xl p-8 border border-dashed border-slate-300 flex-grow flex flex-col items-center justify-center text-center p-6 text-slate-500 h-full">
              <Scale className="w-16 h-16 text-slate-300 mb-4 animate-bounce" />
              <h5 className="font-bold text-slate-700 text-lg">Stress-Test Engine Idle</h5>
              <p className="text-xs text-slate-500 max-w-sm mt-1">
                Customize your Fintech startup specifications on the left, then trigger the deterministic compliance and economics review panel.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
