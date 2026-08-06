export interface StatePortal {
  name: string;
  url: string;
  cost: number;
  rating: number;
  franchiseTax: string;
  pros: string;
  cons: string;
}

export const STATE_PORTALS: Record<string, StatePortal> = {
  Delaware: {
    name: 'Delaware Division of Corporations',
    url: 'https://corp.delaware.gov/onlineservices/',
    cost: 90,
    rating: 5,
    franchiseTax: '$300 flat (LLC) or $175+ sliding scale (Corp)',
    pros: 'Gold standard for institutional venture capital; elite Court of Chancery solves corporate disputes swiftly.',
    cons: 'Requires keeping a registered agent ($45-$150/yr) and paying annual franchise taxes regardless of income.',
  },
  Wyoming: {
    name: 'Wyoming Secretary of State',
    url: 'https://wyobiz.wyo.gov/',
    cost: 100,
    rating: 5,
    franchiseTax: '$60 flat (under $300k assets)',
    pros: 'Industry-leading asset privacy; zero state personal or corporate income tax; extremely low ongoing fees.',
    cons: 'Lacks the specialized dispute courts of Delaware; major VCs will ask you to flip to Delaware before funding.',
  },
  California: {
    name: 'California Secretary of State (bizfile)',
    url: 'https://bizfileonline.sos.ca.gov/',
    cost: 70,
    rating: 3,
    franchiseTax: '$800/yr minimum (Franchise Tax Board)',
    pros: 'Proximity to the tech capital of the world, making local physical banking and state licensing integrations smoother.',
    cons: 'Oversized $800/yr minimum tax penalty even if pre-revenue; heavy state-level regulatory overhead.',
  },
  Texas: {
    name: 'Texas Secretary of State',
    url: 'https://www.sos.state.tx.us/corp/sosdirect.shtml',
    cost: 300,
    rating: 4,
    franchiseTax: '0.75% of taxable margin (exempt under $2.47M revenue)',
    pros: 'Massive, hyper-growth economy; friendly corporate laws; no state-level personal income tax.',
    cons: 'High upfront filing fee ($300); complex annual franchise tax information report filing requirement.',
  },
  'New York': {
    name: 'New York Department of State',
    url: 'https://apps.dos.ny.gov/reonline/',
    cost: 200,
    rating: 3,
    franchiseTax: '$25+ sliding scale (LLC filing fee)',
    pros: 'Access to the global financial epicenter of Wall Street; strong pool of FinTech talent and resources.',
    cons: 'Archaic and expensive LLC "publication requirement" costing $800-$1,500 in local newspaper ads.',
  },
  Florida: {
    name: 'Florida Sunbiz Portal',
    url: 'https://dos.myflorida.com/sunbiz/',
    cost: 125,
    rating: 4,
    franchiseTax: 'Zero annual state corporate franchise tax for LLCs',
    pros: 'Rapidly emerging FinTech and crypto startup corridors; zero state personal income tax; fast online filing.',
    cons: 'Relatively high annual report fee ($138.75) due every year by May 1st or face a brutal $400 late penalty.',
  },
};
