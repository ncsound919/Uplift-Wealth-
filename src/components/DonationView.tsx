import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Heart, 
  Copy, 
  Check, 
  ExternalLink, 
  DollarSign, 
  Users, 
  BookOpen, 
  Layers, 
  ArrowLeft,
  Video
} from 'lucide-react';
import { YouTubeVideoPlayer } from './YouTubeVideoPlayer';

export interface DonationTier {
  amount: number;
  label: string;
  impact: string;
  impactLevel: number;
}

export const DONATION_TIERS: DonationTier[] = [
  { amount: 10, label: "Supporter", impact: "Maintains 100 student sandbox sessions", impactLevel: 25 },
  { amount: 25, label: "Builder", impact: "Sponsors 1 full HBCU student course license", impactLevel: 50 },
  { amount: 50, label: "Community Champion", impact: "Funds alternative credit lab development", impactLevel: 75 },
  { amount: 100, label: "Institutional Partner", impact: "Sponsors MDI open-banking sandbox expansion", impactLevel: 100 }
];

interface ImpactCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  colorClass: string;
}

function ImpactCard({ icon: Icon, title, description, colorClass }: ImpactCardProps) {
  return (
    <motion.div 
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2 }}
      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-3"
    >
      <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${colorClass}`}>
        <Icon className="w-5 h-5" />
      </div>
      <h3 className="text-base font-black text-slate-900 dark:text-white">{title}</h3>
      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
        {description}
      </p>
    </motion.div>
  );
}

interface TierCardProps {
  item: DonationTier;
  selected: boolean;
  onSelect: () => void;
}

function TierCard({ item, selected, onSelect }: TierCardProps) {
  return (
    <div
      role="radio"
      aria-checked={selected}
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect();
        }
      }}
      className={`p-4 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden focus:outline-hidden focus:ring-2 focus:ring-emerald-500 ${
        selected
          ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 dark:border-emerald-500 ring-2 ring-emerald-500/20 shadow-md"
          : "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
      }`}
    >
      {selected && (
        <div className="absolute top-0 right-0 w-16 h-16 pointer-events-none">
          <div className="absolute transform rotate-45 bg-emerald-500 text-slate-950 text-xs font-black uppercase tracking-tighter text-center py-0.5 right-[-35px] top-[14px] w-[120px] shadow-xs">
            Selected
          </div>
        </div>
      )}

      <span className="text-2xl font-black text-slate-900 dark:text-white block mb-0.5">${item.amount}</span>
      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 block mb-1">{item.label}</span>
      <span className="text-xs text-slate-500 dark:text-slate-400 leading-tight block mb-3 min-h-[32px]">{item.impact}</span>

      {/* Progress impact bar */}
      <div className="space-y-1 pt-2 border-t border-slate-200/60 dark:border-slate-800">
        <div className="flex justify-between items-center text-xs text-slate-400 font-bold uppercase tracking-wider">
          <span>Impact Scale</span>
          <span>{item.impactLevel}%</span>
        </div>
        <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
            style={{ width: `${item.impactLevel}%` }}
          />
        </div>
      </div>
    </div>
  );
}

interface DonationViewProps {
  onBackToDashboard?: () => void;
}

export function DonationView({ onBackToDashboard }: DonationViewProps) {
  const [copied, setCopied] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState<number | null>(25);
  const cashtag = "$helptools";

  const handleCopyCashtag = () => {
    navigator.clipboard.writeText(cashtag);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSelectTier = (amount: number) => {
    setSelectedAmount(amount);
    // Server-side logging for donation intent
    fetch('/api/donation-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, timestamp: new Date().toISOString() })
    }).catch(() => {
      // Client-only silent fallback
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-4xl mx-auto p-4 md:p-6 space-y-8"
    >
      
      {/* Top Bar with Return button */}
      {onBackToDashboard && (
        <button
          onClick={onBackToDashboard}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer shadow-3xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Syllabus</span>
        </button>
      )}

      {/* Main Hero Header */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 md:p-10 border border-indigo-900/60 shadow-xl text-white space-y-6 text-center relative overflow-hidden">
        
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-black uppercase tracking-wider">
          <Heart className="w-3.5 h-3.5 text-emerald-400 fill-current animate-pulse" />
          <span>Open-Source Community Donation</span>
        </div>

        <h1 className="text-3xl md:text-5xl font-black tracking-tight max-w-2xl mx-auto">
          Fueling Open Financial Tools for the Community
        </h1>

        <p className="text-sm md:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
          This platform is 100% free and open-access. We build interactive financial simulators, credit underwriting labs, and market tools to empower the Black community and close the racial wealth gap through technical education.
        </p>

        {/* Support Channels Grid: CashApp/Chime, Venmo, Instagram */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto pt-2">
          
          {/* CashApp / Chimesign Card */}
          <div className="bg-slate-950/90 border border-emerald-500/40 rounded-2xl p-5 shadow-xl space-y-3 flex flex-col justify-between">
            <div className="space-y-1">
              <span className="text-xs font-black text-emerald-400 uppercase tracking-widest block">CashApp & Chimesign</span>
              <span className="text-2xl font-black text-white block tracking-tight">{cashtag}</span>
              <p className="text-xs text-slate-400 leading-tight">Direct support via CashApp or Chime handles.</p>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <button
                onClick={handleCopyCashtag}
                className="w-full px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md active:scale-95"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied $helptools' : 'Copy $helptools'}</span>
              </button>

              <a
                href="https://cash.app/$helptools"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 border border-slate-800 transition-colors"
              >
                <span>Open CashApp</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Venmo Card */}
          <div className="bg-slate-950/90 border border-blue-500/40 rounded-2xl p-5 shadow-xl space-y-3 flex flex-col justify-between">
            <div className="space-y-1">
              <span className="text-xs font-black text-blue-400 uppercase tracking-widest block">Venmo Handle</span>
              <span className="text-2xl font-black text-white block tracking-tight">@ncsound</span>
              <p className="text-xs text-slate-400 leading-tight">Support directly on Venmo for community projects.</p>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText('@ncsound');
                  alert('Venmo handle @ncsound copied to clipboard!');
                }}
                className="w-full px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md active:scale-95"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy @ncsound</span>
              </button>

              <a
                href="https://venmo.com/ncsound"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 border border-slate-800 transition-colors"
              >
                <span>Open Venmo</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Instagram Contact Card */}
          <div className="bg-slate-950/90 border border-pink-500/40 rounded-2xl p-5 shadow-xl space-y-3 flex flex-col justify-between">
            <div className="space-y-1">
              <span className="text-xs font-black text-pink-400 uppercase tracking-widest block">Instagram Contact</span>
              <span className="text-2xl font-black text-white block tracking-tight">@ncsound</span>
              <p className="text-xs text-slate-400 leading-tight">Connect with the founder directly on Instagram for updates.</p>
            </div>

            <div className="pt-2">
              <a
                href="https://instagram.com/ncsound"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full px-4 py-2 rounded-xl bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:opacity-90 text-white font-black text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md hover:scale-102 active:scale-95"
              >
                <span>Visit Instagram Page</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

        </div>
      </div>

      {/* Suggested Donation Amounts & Impact */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
        <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
          <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-500" />
            <span>Select Your Pledge Level</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Every contribution directly funds server uptime, simulator development, and open-access educational materials.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4" role="radiogroup" aria-label="Donation pledge levels">
          {DONATION_TIERS.map((item) => (
            <TierCard
              key={item.amount}
              item={item}
              selected={selectedAmount === item.amount}
              onSelect={() => handleSelectTier(item.amount)}
            />
          ))}
        </div>

        {selectedAmount && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ duration: 0.2 }}
            className="bg-slate-50 dark:bg-slate-950 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4"
          >
            <div className="space-y-1 text-center sm:text-left">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Ready to send ${selectedAmount}?</span>
              <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                Send <strong className="text-emerald-600 dark:text-emerald-400">${selectedAmount}</strong> on CashApp to <strong className="font-bold">{cashtag}</strong>.
              </p>
            </div>
            <a
              href={`https://cash.app/$helptools/${selectedAmount}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center gap-2 shrink-0 shadow-md transition-all cursor-pointer hover:scale-105 active:scale-95"
            >
              <span>Donate ${selectedAmount} via CashApp</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </motion.div>
        )}
      </div>

      {/* Featured Owner Speech Video (2016 Black Unity & Awareness Summit) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-xs font-black uppercase tracking-wider">
                Founder Keynote • 2016
              </span>
              <span className="text-xs font-bold text-slate-400">Black Unity & Awareness Summit</span>
            </div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Video className="w-5 h-5 text-indigo-500" />
              <span>Owner's Keynote: Mindset & Vision</span>
            </h2>
          </div>
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 uppercase tracking-wider self-start md:self-auto">
            Founder Speech
          </span>
        </div>

        <p className="text-xs md:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
          Speech by the owner at the 2016 Black Unity and Awareness Summit. This address speaks directly to the mindset, leadership philosophy, and core community values behind our mission.
        </p>

        <YouTubeVideoPlayer
          videoId="U0h80UGOq84"
          title="2016 Black Unity & Awareness Summit Speech"
          description="Owner's keynote address on mindset, leadership, and community uplift at the 2016 Summit."
        />
      </div>

      {/* Why We Are Donation-Based */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ImpactCard
          icon={Users}
          title="Black Community Focus"
          description="Addressing credit invisibility, discriminatory FICO barriers, and wealth disparities by providing tools that teach cash-flow underwriting and wealth creation."
          colorClass="bg-blue-100 dark:bg-blue-900/40 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400"
        />

        <ImpactCard
          icon={BookOpen}
          title="100% Free & Open Access"
          description="No subscriptions, no hidden paywalls, and no corporate advertising. Every student, builder, and organizer gets complete access to all 12 modules."
          colorClass="bg-emerald-100 dark:bg-emerald-900/40 border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400"
        />

        <ImpactCard
          icon={Layers}
          title="Interactive Sandboxes"
          description="Hands-on trading simulators, underwriting games, parametric smart contract triggers, and venture pitch canvas builders built for practical mastery."
          colorClass="bg-purple-100 dark:bg-purple-900/40 border-purple-200 dark:border-purple-800 text-purple-600 dark:text-purple-400"
        />
      </div>

    </motion.div>
  );
}

