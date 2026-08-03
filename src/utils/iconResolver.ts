import {
  Wallet,
  Building2,
  Code2,
  ShieldCheck,
  CreditCard,
  Cpu,
  Network,
  LineChart,
  Shield,
  Landmark,
  Scale,
  Coins,
  Award,
  BookOpen,
  Globe
} from 'lucide-react';

import { ComponentType } from 'react';

const ICON_MAP: Record<string, ComponentType<{ size?: number; strokeWidth?: number }>> = {
  Wallet, Building2, Code2, ShieldCheck, CreditCard, Cpu, Network,
  LineChart, Shield, Landmark, Scale, Coins, Award, BookOpen, Globe,
};

export function resolveIcon(icon: ComponentType | string | undefined): ComponentType {
  if (typeof icon === 'string') {
    return ICON_MAP[icon] || Landmark;
  }
  return icon || Landmark;
}
