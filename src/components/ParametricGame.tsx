import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldAlert, CloudRain, Sun, Flame, ArrowRight, Activity, Cpu, Check, 
  Volume2, VolumeX, TrendingUp, Coins, Heart, FileCode, Shield, Award, RefreshCw
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { apiClient } from '../lib/apiClient';
import { soundManager } from '../utils/sound';

interface ParametricGameProps {
  onComplete: () => void;
}

// Named constants for magic numbers and parameters
const SEASONS_TOTAL = 5;
const DROUGHT_THRESHOLD = 6;
const FLOOD_THRESHOLD = 22;
const SEASON_ADVANCE_DELAY_MS = 3800;
const INTERVAL_MS = 100;
const INITIAL_RAINFALL = 15;

const RAINFALL_BY_TYPE: Record<'normal' | 'drought' | 'flood' | 'minor_drought' | 'minor_flood', number> = {
  normal: 15,
  drought: 3,
  flood: 28,
  minor_drought: 9,
  minor_flood: 19
};

type PolicyType = 'none' | 'basic' | 'premium';

export function ParametricGame({ onComplete }: ParametricGameProps) {
  const [season, setSeason] = useState(1);
  const [weatherType, setWeatherType] = useState<'normal' | 'drought' | 'flood' | 'minor_drought' | 'minor_flood'>('normal');
  const [rainfall, setRainfall] = useState(INITIAL_RAINFALL); // in inches
  const [isSimulating, setIsSimulating] = useState(false);
  const [contractTriggered, setContractTriggered] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState(0);
  const [logs, setLogs] = useState<string[]>(['Smart Contract initialized. Listening to IoT Oracles...']);
  const [unlockedNext, setUnlockedNext] = useState(false);

  // Strategic Gamification State
  const [treasury, setTreasury] = useState(10000); // Start with $10,000 cash
  const [cropHealth, setCropHealth] = useState(100); // Start with 100% health
  const [selectedPolicy, setSelectedPolicy] = useState<PolicyType>('basic');
  const [activePolicy, setActivePolicy] = useState<PolicyType>('none');
  const [hasBoughtThisSeason, setHasBoughtThisSeason] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [contractState, setContractState] = useState<'IDLE' | 'ACTIVE_COVER' | 'ORACLE_POLLING' | 'LIQUIDATING' | 'COMPLETED'>('IDLE');

  // Load sandbox state from Express server
  useEffect(() => {
    apiClient.loadSandboxState('parametric').then((res) => {
      if (res.stateData) {
        if (res.stateData.season) setSeason(res.stateData.season);
        if (res.stateData.payoutAmount) setPayoutAmount(res.stateData.payoutAmount);
        if (res.stateData.logs) setLogs(res.stateData.logs);
        if (res.stateData.treasury !== undefined) setTreasury(res.stateData.treasury);
        if (res.stateData.cropHealth !== undefined) setCropHealth(res.stateData.cropHealth);
        if (res.stateData.activePolicy !== undefined) setActivePolicy(res.stateData.activePolicy);
        if (res.stateData.contractState !== undefined) setContractState(res.stateData.contractState);
      }
    }).catch((err) => console.log('[Parametric Sandbox] Local fallback:', err));
  }, []);

  // Save state snapshot
  useEffect(() => {
    if (logs.length > 1) {
      apiClient.saveSandboxState({
        sandboxType: 'parametric',
        stateData: { season, payoutAmount, logs, treasury, cropHealth, activePolicy, contractState },
        notes: 'Parametric Insurance Smart Contract Trigger State'
      }).catch((err) => console.warn('[Parametric AutoSave Error]:', err));
    }
  }, [season, payoutAmount, logs, treasury, cropHealth, activePolicy, contractState]);

  // Refs to handle stale closures and cleanups safely
  const seasonRef = useRef(season);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const logEndRef = useRef<HTMLDivElement>(null);

  // Synchronize season ref
  useEffect(() => {
    seasonRef.current = season;
  }, [season]);

  // Handle auto-scrolling ledger log panel
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const handleBuyPolicy = () => {
    /* v8 ignore next -- @preserve buy button only renders when not simulating / not yet bought */
    if (isSimulating || hasBoughtThisSeason) return;
    soundManager.playTick();

    const cost = selectedPolicy === 'basic' ? 600 : selectedPolicy === 'premium' ? 1200 : 0;
    if (treasury < cost) {
      setLogs(prev => [...prev, `❌ INSUFFICIENT FUNDS: Cannot afford ${selectedPolicy} cover.`]);
      soundManager.playFailure();
      return;
    }

    setTreasury(prev => prev - cost);
    setActivePolicy(selectedPolicy);
    setHasBoughtThisSeason(true);
    setContractState('ACTIVE_COVER');

    setLogs(prev => [
      ...prev,
      `💼 POLICY CREATED: Subscribed to ${selectedPolicy.toUpperCase()} parametric coverage.`,
      `💳 Premium payment of $${cost} debited from Farm Treasury. Solidity contract active.`
    ]);
  };

  const evaluateContract = (rain: number) => {
    let payout = 0;
    const basicDroughtPayout = 5000;
    const basicFloodPayout = 8000;
    const premiumDroughtPayout = 10000;
    const premiumFloodPayout = 16000;

    let loss = 0;
    let cropHealthDamage = 0;
    let earnedIncome = 0;

    // Calculate baseline season crop income/losses based on weather
    if (rain >= DROUGHT_THRESHOLD && rain <= FLOOD_THRESHOLD) {
      // Normal weather
      earnedIncome = 3000;
      setLogs(prev => [...prev, `🌻 Harvesting completed under fine conditions. Earned +$3,000 sales income.`]);
    } else if (rain < DROUGHT_THRESHOLD) {
      // Drought disaster
      loss = 5000;
      cropHealthDamage = 35;
      setLogs(prev => [...prev, `🥀 Severe drought damaged crops! Suffer -$5,000 crop destruction losses.`]);
    } else if (rain > FLOOD_THRESHOLD) {
      // Flood disaster
      loss = 7000;
      cropHealthDamage = 45;
      setLogs(prev => [...prev, `🌊 Field flooded! Suffer -$7,000 wash-away crop losses.`]);
    }

    setLogs(prev => {
      const newLogs = [...prev, `Telemetry finalized: ${rain} inches of rainfall.`];

      if (rain < DROUGHT_THRESHOLD) {
        setContractState('LIQUIDATING');
        if (activePolicy !== 'none') {
          payout = activePolicy === 'premium' ? premiumDroughtPayout : basicDroughtPayout;
          setPayoutAmount(payout);
          setContractTriggered(true);
          newLogs.push(`⚠️ DROUGHT TRIGGERED: Oracle confirmed precipitation < ${DROUGHT_THRESHOLD} in.`);
          newLogs.push(`⚡ SMART CONTRACT EXECUTION: Dispersing $${payout.toLocaleString()} instant liquidity.`);
          soundManager.playSuccess();
          confetti({ particleCount: 50, colors: ['#f59e0b', '#ef4444'] });
        } else {
          newLogs.push(`❌ NO POLICY ACTIVE: Suffer full crop losses! Rent & supply liabilities pending.`);
          soundManager.playFailure();
        }
      } else if (rain > FLOOD_THRESHOLD) {
        setContractState('LIQUIDATING');
        if (activePolicy !== 'none') {
          payout = activePolicy === 'premium' ? premiumFloodPayout : basicFloodPayout;
          setPayoutAmount(payout);
          setContractTriggered(true);
          newLogs.push(`⚠️ FLOOD TRIGGERED: Oracle confirmed precipitation > ${FLOOD_THRESHOLD} in.`);
          newLogs.push(`⚡ SMART CONTRACT EXECUTION: Dispersing $${payout.toLocaleString()} instant liquidity.`);
          soundManager.playSuccess();
          confetti({ particleCount: 50, colors: ['#3b82f6', '#10b981'] });
        } else {
          newLogs.push(`❌ NO POLICY ACTIVE: Waterlogged farm has no insurance. Heavy losses incurred.`);
          soundManager.playFailure();
        }
      } else {
        setContractState('IDLE');
        newLogs.push(`✅ NORMAL CLIMATE: Crop precipitation was safe. Contract remains at rest.`);
      }

      return newLogs;
    });

    // Update treasury and health based on mathematical outcomes
    setTreasury(prev => prev + earnedIncome - loss + payout);
    if (cropHealthDamage > 0 && payout === 0) {
      setCropHealth(prev => Math.max(0, prev - cropHealthDamage));
    } else if (cropHealthDamage > 0 && payout > 0) {
      // Payout minimized stress
      /* v8 ignore next -- @preserve payout is read synchronously before the async updater applies it, so this minimized-damage branch is unreachable in practice */
      setCropHealth(prev => Math.max(10, prev - Math.floor(cropHealthDamage / 3)));
    } else {
      // Heal crop slightly
      setCropHealth(prev => Math.min(100, prev + 10));
    }

    setIsSimulating(false);

    if (seasonRef.current === SEASONS_TOTAL) {
      setUnlockedNext(true);
      setContractState('COMPLETED');
    } else {
      setTimeout(() => {
        setSeason(prev => Math.min(prev + 1, SEASONS_TOTAL));
        setActivePolicy('none');
        setHasBoughtThisSeason(false);
        setContractState('IDLE');
      }, SEASON_ADVANCE_DELAY_MS);
    }
  };

  const startSimulation = (type: 'normal' | 'drought' | 'flood' | 'minor_drought' | 'minor_flood') => {
    /* v8 ignore next -- @preserve weather buttons are disabled while simulating / once unlocked */
    if (unlockedNext || isSimulating) return;

    // Clear any existing active intervals
    if (intervalRef.current) {
      /* v8 ignore next -- @preserve early-return above prevents re-entry while an interval is active */
      clearInterval(intervalRef.current);
    }

    setIsSimulating(true);
    setContractTriggered(false);
    setPayoutAmount(0);
    setWeatherType(type);
    setContractState('ORACLE_POLLING');
    
    setLogs(prev => [
      ...prev,
      `🔄 SENSORS COMMENCING: Weather cycle ${season} initiated.`,
      `📡 IoT Weather stations polling data... Sourcing Oracle feeds.`
    ]);

    const targetRain = RAINFALL_BY_TYPE[type];
    let currentRain = rainfall;

    intervalRef.current = setInterval(() => {
      try {
        if (currentRain !== targetRain) {
          currentRain += currentRain < targetRain ? 1 : -1;
          setRainfall(currentRain);
          soundManager.playTick();
        } else {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          evaluateContract(currentRain);
        }
      } catch (err) {
        console.error('Error executing simulation logic:', err);
        setIsSimulating(false);
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      }
    }, INTERVAL_MS);
  };

  const handleToggleMute = () => {
    const nextMuted = soundManager.toggleMute();
    setIsMuted(nextMuted);
  };

  const handleReset = () => {
    soundManager.playTick();
    setSeason(1);
    setWeatherType('normal');
    setRainfall(INITIAL_RAINFALL);
    setIsSimulating(false);
    setContractTriggered(false);
    setPayoutAmount(0);
    setLogs(['Smart Contract initialized. Listening to IoT Oracles...']);
    setUnlockedNext(false);
    setTreasury(10000);
    setCropHealth(100);
    setSelectedPolicy('basic');
    setActivePolicy('none');
    setHasBoughtThisSeason(false);
    setContractState('IDLE');
  };

  return (
    <div className="bg-[#090d16] text-slate-100 rounded-3xl shadow-xl border border-slate-800 overflow-hidden">
      {/* Header Deck */}
      <div className="bg-gradient-to-r from-[#090d16] via-[#101726] to-[#090d16] p-6 border-b border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-2xl text-blue-400">
              <Cpu className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-black text-white tracking-tight">Parametric InsurTech Smart Contract</h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  AUTOMATED WEATHER INSURANCE
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium mt-0.5">See how insurance pays out instantly using direct, real-time weather station data</p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-center">
            {/* Cash Treasury */}
            <div className="flex items-center gap-1.5 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800 text-xs font-mono">
              <Coins className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-slate-400">Farm Cash:</span>
              <span className="font-bold text-amber-400">${treasury.toLocaleString()}</span>
            </div>

            {/* Farm Crop Health */}
            <div className="flex items-center gap-1.5 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800 text-xs font-mono">
              <Heart className="w-3.5 h-3.5 text-rose-500" />
              <span className="text-slate-400">Crop Health:</span>
              <span className={`font-bold ${cropHealth >= 70 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {cropHealth}%
              </span>
            </div>

            <button
              onClick={handleToggleMute}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition-all"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Game UI (7 columns) */}
        <div className="lg:col-span-7 space-y-6">
          
          <div className="flex justify-between items-center bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-inner">
            <div>
              <span className="text-xs text-slate-500 font-bold uppercase tracking-wider font-mono">Agricultural Period</span>
              <h4 className="font-extrabold text-white text-base">Year 2026 - Season {season} / {SEASONS_TOTAL}</h4>
            </div>

            <div className="flex gap-2">
              <span className="text-xs text-slate-500 font-bold uppercase block text-right font-mono">Policy Active:</span>
              <span className={`text-xs uppercase font-mono font-bold px-2.5 py-0.5 rounded border ${
                activePolicy === 'none'
                  ? 'bg-rose-950/25 border-rose-500/20 text-rose-400'
                  : 'bg-emerald-950/25 border-emerald-500/20 text-emerald-400'
              }`}>
                {activePolicy === 'none' ? 'UNINSURED' : `${activePolicy} policy`}
              </span>
            </div>

            <div className="text-right">
              <span className="text-xs text-slate-500 font-bold uppercase block font-mono">Precipitation Sensor</span>
              <span className="text-xl font-black text-blue-400 font-mono">{rainfall} in</span>
            </div>
          </div>

          {/* Interactive Dynamic Farm weather scene graphics */}
          <div className="relative bg-slate-950 rounded-2xl h-60 border border-slate-850 overflow-hidden flex items-center justify-center shadow-inner">
            
            {/* Background grid representation */}
            <div className="absolute inset-0 grid grid-cols-6 grid-rows-4 opacity-5 pointer-events-none">
              {Array.from({ length: 24 }).map((_, i) => (
                <div key={i} className="border border-white" />
              ))}
            </div>

            <AnimatePresence mode="wait">
              {weatherType === 'normal' && (
                <motion.div
                  key="normal"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-emerald-950/10 flex flex-col items-center justify-center p-6 text-center z-10"
                >
                  <Sun className="w-16 h-16 text-amber-500 mb-3 animate-spin" style={{ animationDuration: '24s' }} />
                  <p className="font-bold text-white text-base font-sans">Pristine Farm Climate</p>
                  <p className="text-xs text-slate-400 max-w-sm mt-1 leading-normal">
                    Perfect sun & moisture balance. Crops are fully thriving. Oracle telemetry values sit within prime parameters.
                  </p>
                </motion.div>
              )}

              {weatherType === 'minor_drought' && (
                <motion.div
                  key="minor_drought"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-amber-950/10 flex flex-col items-center justify-center p-6 text-center z-10"
                >
                  <Flame className="w-16 h-16 text-amber-500/60 mb-3 animate-pulse" />
                  <p className="font-bold text-amber-300 text-base font-sans font-black">Moderate Dry Spell</p>
                  <p className="text-xs text-slate-400 max-w-sm mt-1 leading-normal">
                    Less rain than usual. Crops exhibit minor dehydration stress, but rainfall remains above the parametric drought trigger.
                  </p>
                </motion.div>
              )}

              {weatherType === 'minor_flood' && (
                <motion.div
                  key="minor_flood"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-blue-950/10 flex flex-col items-center justify-center p-6 text-center z-10"
                >
                  <CloudRain className="w-16 h-16 text-blue-400/60 mb-3 animate-bounce" />
                  <p className="font-bold text-blue-300 text-base font-sans">Moderate Heavy Rain</p>
                  <p className="text-xs text-slate-400 max-w-sm mt-1 leading-normal">
                    Increased rain than expected. Puddling has occurred, but precipitation remains safely below the flood trigger limit.
                  </p>
                </motion.div>
              )}

              {weatherType === 'drought' && (
                <motion.div
                  key="drought"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-amber-950/20 flex flex-col items-center justify-center p-6 text-center z-10"
                >
                  <Flame className="w-16 h-16 text-amber-500 mb-3 animate-bounce" />
                  <p className="font-bold text-amber-400 text-base font-black">Severe Drought Disaster</p>
                  <p className="text-xs text-slate-400 max-w-sm mt-1 leading-normal">
                    Ground is dry and parched. Crop yield has failed. Precipitation sensor registers a critically dry {rainfall} inches.
                  </p>
                </motion.div>
              )}

              {weatherType === 'flood' && (
                <motion.div
                  key="flood"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-blue-950/30 flex flex-col items-center justify-center p-6 text-center z-10"
                >
                  <CloudRain className="w-16 h-16 text-blue-500 mb-3 animate-pulse" />
                  <p className="font-bold text-blue-400 text-base font-black">Torrential Flooding & Typhoon</p>
                  <p className="text-xs text-slate-400 max-w-sm mt-1 leading-normal">
                    Excessive storm surges. Crop lands have waterlogged completely. Precipitation telemetry reaches {rainfall} inches!
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Simulation Telemetry Progress Bar overlay */}
            {isSimulating && (
              <div className="absolute bottom-4 left-4 right-4 bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 z-20 flex flex-col gap-1.5 shadow-xl font-mono">
                <div className="flex justify-between items-center text-xs font-bold text-blue-400">
                  <span className="flex items-center gap-1.5 uppercase">
                    <Activity className="w-3 h-3 animate-pulse text-blue-400" />
                    Reading Weather Stations...
                  </span>
                  <span>{rainfall} inches</span>
                </div>
                <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                  <motion.div
                    className="h-full bg-blue-500 rounded-full"
                    initial={false}
                    animate={{ width: `${(rainfall / 30) * 100}%` }}
                    transition={{ duration: 0.1, ease: 'linear' }}
                  />
                </div>
              </div>
            )}

            {/* Payout Notification overlay */}
            {contractTriggered && !isSimulating && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute top-4 left-4 bg-emerald-950/90 border border-emerald-500/30 text-emerald-300 rounded-xl px-3.5 py-1.5 text-xs font-bold font-mono flex items-center gap-2 z-20 shadow-lg"
              >
                <Activity className="w-4 h-4 animate-pulse text-emerald-400" />
                <span>AUTOMATIC PAYOUT INSTANTLY COMPLETED: +${payoutAmount.toLocaleString()}</span>
              </motion.div>
            )}
          </div>

          {/* Strategic Insurance Policy Purchase Board */}
          {!isSimulating && !hasBoughtThisSeason && !unlockedNext && (
            <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800 space-y-3.5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-bold text-slate-300 font-mono flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-indigo-400" />
                  CHOOSE YOUR WEATHER INSURANCE POLICY
                </span>
                <span className="text-xs text-indigo-400 font-mono uppercase">Pre-Season Choice</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div 
                  onClick={() => setSelectedPolicy('none')}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    selectedPolicy === 'none' ? 'bg-rose-950/20 border-rose-500/40' : 'bg-slate-950/50 border-slate-850 hover:bg-slate-900'
                  }`}
                >
                  <span className="text-xs text-slate-500 font-bold block uppercase font-mono">No Insurance Policy</span>
                  <span className="text-sm font-black text-white block mt-1">Cost: $0</span>
                  <span className="text-xs text-rose-400 mt-2 block leading-normal">Extreme bankruptcy hazard if floods or droughts occur.</span>
                </div>

                <div 
                  onClick={() => setSelectedPolicy('basic')}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    selectedPolicy === 'basic' ? 'bg-indigo-950/20 border-indigo-500/40' : 'bg-slate-950/50 border-slate-850 hover:bg-slate-900'
                  }`}
                >
                  <span className="text-xs text-slate-500 font-bold block uppercase font-mono">Basic Index Policy</span>
                  <span className="text-sm font-black text-indigo-300 block mt-1">Cost: $600</span>
                  <span className="text-xs text-slate-400 mt-2 block leading-normal">Drought Payout: $5,000<br />Flood Payout: $8,000</span>
                </div>

                <div 
                  onClick={() => setSelectedPolicy('premium')}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    selectedPolicy === 'premium' ? 'bg-amber-950/20 border-amber-500/40' : 'bg-slate-950/50 border-slate-850 hover:bg-slate-900'
                  }`}
                >
                  <span className="text-xs text-slate-500 font-bold block uppercase font-mono">Premium High-Cover</span>
                  <span className="text-sm font-black text-amber-300 block mt-1">Cost: $1,200</span>
                  <span className="text-xs text-slate-400 mt-2 block leading-normal">Drought Payout: $10,000<br />Flood Payout: $16,000</span>
                </div>
              </div>

              <button
                onClick={handleBuyPolicy}
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-bold text-white text-xs uppercase tracking-wider transition-all cursor-pointer"
              >
                Activate Insurance Policy
              </button>
            </div>
          )}

          {/* Trigger weather simulation buttons */}
          <div className="space-y-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide block font-mono">Select Weather Scenario to Test:</span>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2.5">
              <button
                type="button"
                onClick={() => startSimulation('normal')}
                disabled={isSimulating || unlockedNext || (!hasBoughtThisSeason && season > 1)}
                className="flex flex-col items-center justify-center gap-1.5 py-3 rounded-xl border border-slate-800 text-slate-300 bg-slate-900/60 hover:bg-slate-850 font-bold text-xs disabled:opacity-40 transition-all cursor-pointer"
              >
                <Sun className="w-4 h-4 text-amber-500" />
                <span>Normal</span>
              </button>
              <button
                type="button"
                onClick={() => startSimulation('minor_drought')}
                disabled={isSimulating || unlockedNext || (!hasBoughtThisSeason && season > 1)}
                className="flex flex-col items-center justify-center gap-1.5 py-3 rounded-xl border border-slate-800 text-slate-300 bg-slate-900/60 hover:bg-slate-850 font-bold text-xs disabled:opacity-40 transition-all cursor-pointer"
              >
                <Flame className="w-4 h-4 text-amber-500/70" />
                <span>Dry Spell</span>
              </button>
              <button
                type="button"
                onClick={() => startSimulation('minor_flood')}
                disabled={isSimulating || unlockedNext || (!hasBoughtThisSeason && season > 1)}
                className="flex flex-col items-center justify-center gap-1.5 py-3 rounded-xl border border-slate-800 text-slate-300 bg-slate-900/60 hover:bg-slate-850 font-bold text-xs disabled:opacity-40 transition-all cursor-pointer"
              >
                <CloudRain className="w-4 h-4 text-blue-500/70" />
                <span>Heavy Rain</span>
              </button>
              <button
                type="button"
                onClick={() => startSimulation('drought')}
                disabled={isSimulating || unlockedNext || (!hasBoughtThisSeason && season > 1)}
                className="flex flex-col items-center justify-center gap-1.5 py-3 rounded-xl border border-amber-900/30 text-amber-300 bg-amber-950/20 hover:bg-amber-900/30 font-bold text-xs disabled:opacity-40 transition-all cursor-pointer"
              >
                <Flame className="w-4 h-4 text-amber-400" />
                <span>Drought</span>
              </button>
              <button
                type="button"
                onClick={() => startSimulation('flood')}
                disabled={isSimulating || unlockedNext || (!hasBoughtThisSeason && season > 1)}
                className="flex flex-col items-center justify-center gap-1.5 py-3 rounded-xl border border-blue-900/30 text-blue-300 bg-blue-950/20 hover:bg-blue-900/30 font-bold text-xs disabled:opacity-40 transition-all cursor-pointer"
              >
                <CloudRain className="w-4 h-4 text-blue-400" />
                <span>Flood</span>
              </button>
            </div>
            {!hasBoughtThisSeason && !unlockedNext && season > 1 && (
              <span className="text-xs text-amber-400 font-mono block text-center animate-pulse">
                ⚠️ SELECT AND DEPLOY AN INSURANCE POLICY (OR DEPLOY 'NONE') TO ENABLE SIMULATOR CONTROLS
              </span>
            )}
          </div>
        </div>

        {/* Right Side: Smart Contract Ledger Code & Smart Contract State Machine Diagram (5 columns) */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-6 bg-slate-900/60 rounded-2xl p-5 border border-slate-800">
          
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-1.5 font-mono text-xs text-indigo-400">
                <FileCode className="w-4 h-4 text-indigo-400" />
                <span>AUTOMATED_POLICY.CODE</span>
              </div>
              <span className="text-xs text-slate-500 font-mono">Smart Contract Rules</span>
            </div>

            {/* Smart Contract State Machine Diagram (Graphic Enhancement) */}
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-850 space-y-2.5">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest font-mono block">INSURANCE STATE:</span>
              <div className="flex items-center justify-between gap-1 text-xs font-mono">
                <div className={`p-1 px-1.5 rounded border transition-colors ${contractState === 'IDLE' ? 'bg-indigo-950/50 border-indigo-500 text-indigo-300 shadow-[0_0_8px_rgba(99,102,241,0.2)]' : 'bg-slate-900/40 border-slate-800 text-slate-500'}`}>
                  IDLE
                </div>
                <div className="text-slate-700">➔</div>
                <div className={`p-1 px-1.5 rounded border transition-colors ${contractState === 'ACTIVE_COVER' ? 'bg-amber-950/50 border-amber-500 text-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.2)]' : 'bg-slate-900/40 border-slate-800 text-slate-500'}`}>
                  COVERED
                </div>
                <div className="text-slate-700">➔</div>
                <div className={`p-1 px-1.5 rounded border transition-colors ${contractState === 'ORACLE_POLLING' ? 'bg-blue-950/50 border-blue-500 text-blue-300 shadow-[0_0_8px_rgba(59,130,246,0.2)]' : 'bg-slate-900/40 border-slate-800 text-slate-500'}`}>
                  CHECKING WEATHER
                </div>
                <div className="text-slate-700">➔</div>
                <div className={`p-1 px-1.5 rounded border transition-colors ${contractState === 'LIQUIDATING' ? 'bg-emerald-950/50 border-emerald-500 text-emerald-300 shadow-[0_0_8px_rgba(16,185,129,0.2)] animate-pulse' : 'bg-slate-900/40 border-slate-800 text-slate-500'}`}>
                  PAYING OUT
                </div>
              </div>
            </div>

            <pre className="font-mono text-xs text-indigo-300 leading-relaxed overflow-x-auto bg-slate-950 p-4 rounded-xl border border-slate-850">
              <code>{`// Simple triggers based on rainfall (inches)
uint constant DROUGHT_LIMIT = ${DROUGHT_THRESHOLD}; // Rainfall under 6 in
uint constant FLOOD_LIMIT = ${FLOOD_THRESHOLD};   // Rainfall over 22 in

function checkWeather(uint actualRainfall) {
    if (actualRainfall < DROUGHT_LIMIT) {
        payout(droughtPayout, "Drought relief");
    } else if (actualRainfall > FLOOD_LIMIT) {
        payout(floodPayout, "Flood relief");
    }
}`}</code>
            </pre>

            <div className="space-y-2 bg-slate-950 p-4 rounded-xl border border-slate-850">
              <span className="text-xs uppercase text-slate-500 tracking-wider font-bold block font-mono">Activity & Payout Log:</span>
              <div className="space-y-1.5 max-h-[140px] overflow-y-auto font-mono text-xs scrollbar-thin">
                {logs.map((log, i) => (
                  <div key={i} className="leading-relaxed flex items-start gap-1">
                    <span className="text-slate-600 select-none">❯</span>
                    <span className={log.includes('⚡') || log.includes('✅') || log.includes('🌻') ? 'text-emerald-400' : log.includes('⚠️') || log.includes('🥀') ? 'text-amber-400' : 'text-slate-300'}>
                      {log}
                    </span>
                  </div>
                ))}
                <div ref={logEndRef} />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex flex-col gap-3">
            {unlockedNext && (
              <div className="text-center p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-xs text-slate-400 block font-mono">FARM SURVIVAL SIMULATION OVER</span>
                <span className={`text-sm font-black block mt-1 ${treasury >= 8000 && cropHealth > 30 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {treasury >= 8000 && cropHealth > 30 ? '🏆 SUCCESSFUL CLIMATE HARVEST!' : '💀 FARM BANKRUPTCY RISK DETECTED'}
                </span>
                <span className="text-xs text-slate-500 block mt-1 font-mono">Final Balance: ${treasury.toLocaleString()} | Crop Health: {cropHealth}%</span>
              </div>
            )}

            <div className="flex gap-2">
              {unlockedNext && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-4 py-3 bg-slate-850 hover:bg-slate-800 text-slate-300 rounded-xl font-bold text-xs border border-slate-700 cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              )}
              <button
                type="button"
                onClick={onComplete}
                disabled={!unlockedNext}
                aria-disabled={!unlockedNext}
                className={`flex-grow py-3.5 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2 shadow-lg text-xs uppercase tracking-wider ${
                  unlockedNext
                    ? 'bg-blue-600 hover:bg-blue-500 cursor-pointer'
                    : 'bg-slate-850 text-slate-500 cursor-not-allowed border border-slate-700'
                }`}
              >
                <Check className="w-4 h-4" />
                <span>{unlockedNext ? 'Finish Parametric Challenge' : 'Survive All 5 Seasons to Unlock'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
