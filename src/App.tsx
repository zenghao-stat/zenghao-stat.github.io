import { useEffect, useMemo, useRef, useState } from 'react';
import {
  BookOpen,
  Code,
  Mail,
  Github,
  FileText,
  Menu,
  X,
  MapPin,
  GraduationCap,
  Award,
  Tag,
  Palette,
  Sun,
  Moon,
  Check,
  ExternalLink,
  Combine,
  Merge,
  RotateCcw,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

import { HAO_DATA } from './content';

const SHOW_BLOG_ENTRY = false;

// 主题配置 - 菜单只展示白天四种主题；夜色由对应主题自动派生。
const THEMES = {
  paper: {
    id: 'paper',
    name: 'Paper',
    bg: 'bg-[#FFFCF5]',
    bgAlt: 'bg-[#F5F3ED]',
    text: 'text-slate-800',
    textMuted: 'text-slate-500',
    font: 'font-sans',
    navBg: 'bg-[#FFFCF5]/95',
    border: 'border-slate-200',
    accent: 'text-blue-700',
    accentBg: 'bg-blue-700',
    cardBg: 'bg-white',
    highlight: 'bg-yellow-100',
    badgeConf: 'bg-blue-600 text-white',
    badgeJournal: 'bg-emerald-600 text-white',
    badgePre: 'bg-amber-500 text-white',
    badgeSoft: 'bg-purple-600 text-white',
  },
  lab: {
    id: 'lab',
    name: 'Lab',
    bg: 'bg-slate-50',
    bgAlt: 'bg-slate-100',
    text: 'text-slate-900',
    textMuted: 'text-slate-500',
    font: 'font-sans',
    navBg: 'bg-white/90',
    border: 'border-slate-200',
    accent: 'text-blue-600',
    accentBg: 'bg-blue-600',
    cardBg: 'bg-white',
    highlight: 'bg-blue-50',
    badgeConf: 'bg-blue-100 text-blue-800',
    badgeJournal: 'bg-emerald-100 text-emerald-800',
    badgePre: 'bg-amber-100 text-amber-800',
    badgeSoft: 'bg-purple-100 text-purple-800',
  },
  mint: {
    id: 'mint',
    name: 'Mint',
    bg: 'bg-[#FFF7EF]',
    bgAlt: 'bg-[#EDF3FF]',
    text: 'text-slate-900',
    textMuted: 'text-slate-600',
    font: 'font-sans',
    navBg: 'bg-[#FFF7EF]/95',
    border: 'border-slate-200',
    accent: 'text-emerald-600',
    accentBg: 'bg-emerald-500',
    cardBg: 'bg-white',
    highlight: 'bg-emerald-100',
    badgeConf: 'bg-slate-900 text-white',
    badgeJournal: 'bg-emerald-600 text-white',
    badgePre: 'bg-amber-500 text-white',
    badgeSoft: 'bg-indigo-600 text-white',
  },
  brutal: {
    id: 'brutal',
    name: 'Brutal',
    bg: 'bg-white',
    bgAlt: 'bg-[#F5F5F5]',
    text: 'text-slate-950',
    textMuted: 'text-slate-700',
    font: 'font-sans',
    navBg: 'bg-white/90',
    border: 'border-black',
    accent: 'text-yellow-500',
    accentBg: 'bg-black',
    cardBg: 'bg-white',
    highlight: 'bg-yellow-200',
    badgeConf: 'bg-yellow-300 text-black',
    badgeJournal: 'bg-emerald-500 text-black',
    badgePre: 'bg-red-500 text-white',
    badgeSoft: 'bg-blue-600 text-white',
  }
};

type ThemeKey = keyof typeof THEMES;
type PubType = 'Conference' | 'Journal' | 'Working Paper' | 'Software' | 'Patent';
type YearFilter = '2026' | '2025' | '2024' | 'before 2024';
type AuthorRoleFilter = 'first' | 'corresponding';

const PUB_TYPE_LABELS: Record<PubType, string> = {
  Conference: 'Conference',
  Journal: 'Journal',
  'Working Paper': 'Upcoming Papers',
  Software: 'Software',
  Patent: 'Patent',
};

const RESPONSIVE_FILTER_STYLES = `
  .publication-filter-panel {
    container-type: inline-size;
  }

  @container (max-width: 760px) {
    .publication-filter-label {
      padding-left: 0.5rem;
      padding-right: 0.5rem;
    }

    .publication-filter-selected-full,
    .publication-filter-clear-text {
      display: none;
    }

    .publication-filter-selected-short {
      display: inline;
    }
  }

  @container (min-width: 761px) {
    .publication-filter-selected-short {
      display: none;
    }

    .publication-filter-selected-full {
      display: inline;
    }
  }
`;

const NIGHT_THEMES: Record<ThemeKey, typeof THEMES[ThemeKey]> = {
  paper: {
    id: 'paper',
    name: 'Paper',
    bg: 'bg-[#171A21]',
    bgAlt: 'bg-[#22252D]',
    text: 'text-stone-100',
    textMuted: 'text-stone-400',
    font: 'font-sans',
    navBg: 'bg-[#171A21]/92',
    border: 'border-stone-700',
    accent: 'text-amber-300',
    accentBg: 'bg-amber-400',
    cardBg: 'bg-[#22252D]',
    highlight: 'bg-amber-400/20',
    badgeConf: 'bg-blue-900 text-blue-100',
    badgeJournal: 'bg-emerald-900 text-emerald-100',
    badgePre: 'bg-amber-900 text-amber-100',
    badgeSoft: 'bg-purple-900 text-purple-100',
  },
  lab: {
    id: 'lab',
    name: 'Lab',
    bg: 'bg-[#0B1120]',
    bgAlt: 'bg-[#111827]',
    text: 'text-slate-100',
    textMuted: 'text-slate-400',
    font: 'font-sans',
    navBg: 'bg-[#0B1120]/92',
    border: 'border-slate-700',
    accent: 'text-sky-300',
    accentBg: 'bg-sky-500',
    cardBg: 'bg-[#111827]',
    highlight: 'bg-sky-500/20',
    badgeConf: 'bg-sky-900 text-sky-100',
    badgeJournal: 'bg-emerald-900 text-emerald-100',
    badgePre: 'bg-amber-900 text-amber-100',
    badgeSoft: 'bg-violet-900 text-violet-100',
  },
  mint: {
    id: 'mint',
    name: 'Mint',
    bg: 'bg-[#0D1F1A]',
    bgAlt: 'bg-[#132923]',
    text: 'text-emerald-50',
    textMuted: 'text-emerald-200/70',
    font: 'font-sans',
    navBg: 'bg-[#0D1F1A]/92',
    border: 'border-emerald-800',
    accent: 'text-teal-300',
    accentBg: 'bg-teal-400',
    cardBg: 'bg-[#132923]',
    highlight: 'bg-teal-400/20',
    badgeConf: 'bg-slate-800 text-slate-100',
    badgeJournal: 'bg-emerald-900 text-emerald-100',
    badgePre: 'bg-amber-900 text-amber-100',
    badgeSoft: 'bg-indigo-900 text-indigo-100',
  },
  brutal: {
    id: 'brutal',
    name: 'Brutal',
    bg: 'bg-[#111111]',
    bgAlt: 'bg-[#1B1B1B]',
    text: 'text-zinc-50',
    textMuted: 'text-zinc-300',
    font: 'font-sans',
    navBg: 'bg-[#111111]/92',
    border: 'border-zinc-500',
    accent: 'text-yellow-300',
    accentBg: 'bg-yellow-300',
    cardBg: 'bg-[#1B1B1B]',
    highlight: 'bg-yellow-300/25',
    badgeConf: 'bg-yellow-300 text-black',
    badgeJournal: 'bg-emerald-400 text-black',
    badgePre: 'bg-red-500 text-white',
    badgeSoft: 'bg-blue-500 text-white',
  },
};

const TOP_TAG_STYLES: Record<
  ThemeKey,
  { ai: { pill: string; icon: string }; econometrics: { pill: string; icon: string } }
> = {
  paper: {
    ai: {
      pill: 'bg-gradient-to-r from-blue-100 via-indigo-100 to-cyan-100 border-blue-300/70 text-slate-900 ring-1 ring-blue-200/50 shadow-sm animate-pulse motion-reduce:animate-none hover:shadow-md hover:-translate-y-0.5',
      icon: 'text-blue-700',
    },
    econometrics: {
      pill: 'bg-gradient-to-r from-blue-100 via-sky-100 to-teal-100 border-blue-300/70 text-slate-900 ring-1 ring-blue-200/50 shadow-sm animate-pulse motion-reduce:animate-none hover:shadow-md hover:-translate-y-0.5',
      icon: 'text-blue-700',
    },
  },
  lab: {
    ai: {
      pill: 'bg-gradient-to-r from-blue-100 via-indigo-100 to-cyan-100 border-blue-300/70 text-slate-900 ring-1 ring-blue-200/50 shadow-sm animate-pulse motion-reduce:animate-none hover:shadow-md hover:-translate-y-0.5',
      icon: 'text-blue-700',
    },
    econometrics: {
      pill: 'bg-gradient-to-r from-blue-100 via-sky-100 to-teal-100 border-blue-300/70 text-slate-900 ring-1 ring-blue-200/50 shadow-sm animate-pulse motion-reduce:animate-none hover:shadow-md hover:-translate-y-0.5',
      icon: 'text-blue-700',
    },
  },
  mint: {
    ai: {
      pill: 'bg-gradient-to-r from-emerald-100 via-sky-100 to-indigo-100 border-emerald-300/70 text-slate-900 ring-1 ring-emerald-200/50 shadow-sm animate-pulse motion-reduce:animate-none hover:shadow-md hover:-translate-y-0.5',
      icon: 'text-emerald-700',
    },
    econometrics: {
      pill: 'bg-gradient-to-r from-emerald-100 via-lime-100 to-amber-100 border-emerald-300/70 text-slate-900 ring-1 ring-emerald-200/50 shadow-sm animate-pulse motion-reduce:animate-none hover:shadow-md hover:-translate-y-0.5',
      icon: 'text-emerald-700',
    },
  },
  brutal: {
    ai: {
      pill: 'bg-yellow-300 border-black text-black shadow-[2px_2px_0_#000] ring-0 animate-pulse motion-reduce:animate-none hover:shadow-[4px_4px_0_#000] hover:-translate-y-0.5',
      icon: 'text-black',
    },
    econometrics: {
      pill: 'bg-yellow-200 border-black text-black shadow-[2px_2px_0_#000] ring-0 animate-pulse motion-reduce:animate-none hover:shadow-[4px_4px_0_#000] hover:-translate-y-0.5',
      icon: 'text-black',
    },
  },
};

const NIGHT_TOP_TAG_STYLES: typeof TOP_TAG_STYLES = {
  paper: {
    ai: {
      pill: 'bg-gradient-to-r from-amber-500/20 via-blue-500/20 to-stone-500/20 border-amber-300/60 text-stone-100 ring-1 ring-amber-200/30 shadow-sm animate-pulse motion-reduce:animate-none hover:shadow-md hover:-translate-y-0.5',
      icon: 'text-amber-200',
    },
    econometrics: {
      pill: 'bg-gradient-to-r from-amber-500/20 via-teal-500/20 to-blue-500/20 border-amber-300/60 text-stone-100 ring-1 ring-amber-200/30 shadow-sm animate-pulse motion-reduce:animate-none hover:shadow-md hover:-translate-y-0.5',
      icon: 'text-amber-200',
    },
  },
  lab: {
    ai: {
      pill: 'bg-gradient-to-r from-sky-500/25 via-indigo-500/25 to-cyan-500/20 border-sky-400/60 text-slate-100 ring-1 ring-sky-300/40 shadow-sm animate-pulse motion-reduce:animate-none hover:shadow-md hover:-translate-y-0.5',
      icon: 'text-sky-300',
    },
    econometrics: {
      pill: 'bg-gradient-to-r from-sky-500/25 via-teal-500/25 to-indigo-500/20 border-sky-400/60 text-slate-100 ring-1 ring-sky-300/40 shadow-sm animate-pulse motion-reduce:animate-none hover:shadow-md hover:-translate-y-0.5',
      icon: 'text-sky-300',
    },
  },
  mint: {
    ai: {
      pill: 'bg-gradient-to-r from-teal-400/25 via-emerald-400/20 to-indigo-400/20 border-teal-300/60 text-emerald-50 ring-1 ring-teal-200/35 shadow-sm animate-pulse motion-reduce:animate-none hover:shadow-md hover:-translate-y-0.5',
      icon: 'text-teal-200',
    },
    econometrics: {
      pill: 'bg-gradient-to-r from-teal-400/25 via-lime-400/20 to-amber-400/20 border-teal-300/60 text-emerald-50 ring-1 ring-teal-200/35 shadow-sm animate-pulse motion-reduce:animate-none hover:shadow-md hover:-translate-y-0.5',
      icon: 'text-teal-200',
    },
  },
  brutal: {
    ai: {
      pill: 'bg-yellow-300 border-zinc-50 text-black shadow-[2px_2px_0_#fff] ring-0 animate-pulse motion-reduce:animate-none hover:shadow-[4px_4px_0_#fff] hover:-translate-y-0.5',
      icon: 'text-black',
    },
    econometrics: {
      pill: 'bg-yellow-200 border-zinc-50 text-black shadow-[2px_2px_0_#fff] ring-0 animate-pulse motion-reduce:animate-none hover:shadow-[4px_4px_0_#fff] hover:-translate-y-0.5',
      icon: 'text-black',
    },
  },
};

type TopVenueRule = {
  label: 'TOP AI' | 'TOP Econometrics';
  type?: PubType;
  patterns: RegExp[];
};

const TOP_VENUE_RULES: TopVenueRule[] = [
  {
    label: 'TOP AI',
    type: 'Conference',
    patterns: [
      /\bICML\b/i,
      /\bNeurIPS\b/i,
      /\bICLR\b/i,
      /\bCVPR\b/i,
    ],
  },
  {
    label: 'TOP Econometrics',
    type: 'Journal',
    patterns: [
      /Journal of Business\s*&\s*Economic Statistics/i,
      /\bJBES\b/i,
    ],
  },
];

export default function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isNightByTime = () => {
    const hour = new Date().getHours();
    return hour >= 19 || hour < 7;
  };

  const loadInitialTheme = (): ThemeKey => {
    try {
      const stored = window.localStorage.getItem('haozeng_theme');
      if (!stored) {
        return 'brutal';
      }
      const parsed = JSON.parse(stored) as Partial<{ selectedTheme: ThemeKey; preferredLightTheme: ThemeKey }>;
      const savedTheme = parsed.selectedTheme ?? parsed.preferredLightTheme;
      return savedTheme && savedTheme in THEMES ? savedTheme : 'brutal';
    } catch {
      return 'brutal';
    }
  };

  const themeIds = Object.keys(THEMES) as ThemeKey[];
  const [selectedTheme, setSelectedTheme] = useState<ThemeKey>(loadInitialTheme);
  const [isNightTheme, setIsNightTheme] = useState(isNightByTime);
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const [selectedOnly, setSelectedOnly] = useState(true);
  const [activeAuthorRoleFilters, setActiveAuthorRoleFilters] = useState<AuthorRoleFilter[]>([]);
  const [activeTypeFilter, setActiveTypeFilter] = useState<PubType | null>(null);
  const [activeYearFilter, setActiveYearFilter] = useState<YearFilter | null>(null);
  const [activeKeywords, setActiveKeywords] = useState<string[]>([]);
  const [keywordMatchMode, setKeywordMatchMode] = useState<'any' | 'all'>('any');
  const [topicsMenuOpen, setTopicsMenuOpen] = useState(false);
  const topicsMenuRef = useRef<HTMLDivElement | null>(null);
  const [expandedAbstractIds, setExpandedAbstractIds] = useState<string[]>([]);
  const [canHover, setCanHover] = useState<boolean>(false);
  const [openServiceNoteKey, setOpenServiceNoteKey] = useState<string | null>(null);
  const [highlightedPublicationId, setHighlightedPublicationId] = useState<string | null>(null);
  const [showAllPastTalks, setShowAllPastTalks] = useState(false);

  const currentTheme = selectedTheme;
  const theme = isNightTheme ? NIGHT_THEMES[selectedTheme] : THEMES[selectedTheme];
  const lastIsNightRef = useRef(isNightByTime());

  useEffect(() => {
    try {
      window.localStorage.setItem('haozeng_theme', JSON.stringify({ selectedTheme }));
    } catch {
      // ignore
    }
  }, [selectedTheme]);

  useEffect(() => {
    const maybeSwitchTheme = () => {
      const isNightNow = isNightByTime();
      if (isNightNow === lastIsNightRef.current) return;
      lastIsNightRef.current = isNightNow;
      setIsNightTheme(isNightNow);
    };

    const id = window.setInterval(maybeSwitchTheme, 60 * 1000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (!topicsMenuOpen) return;
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (!topicsMenuRef.current) return;
      if (topicsMenuRef.current.contains(target)) return;
      setTopicsMenuOpen(false);
    };
    window.addEventListener('pointerdown', onPointerDown);
    return () => window.removeEventListener('pointerdown', onPointerDown);
  }, [topicsMenuOpen]);

  const clearFilters = () => {
    setSelectedOnly(true);
    setActiveAuthorRoleFilters([]);
    setActiveTypeFilter(null);
    setActiveYearFilter(null);
    setActiveKeywords([]);
    setKeywordMatchMode('any');
    setTopicsMenuOpen(false);
  };

  useEffect(() => {
    const mql = window.matchMedia('(hover: hover) and (pointer: fine)');
    const lg = window.matchMedia('(min-width: 1024px)');
    const update = () => setCanHover(mql.matches && lg.matches);
    update();
    mql.addEventListener('change', update);
    lg.addEventListener('change', update);
    return () => {
      mql.removeEventListener('change', update);
      lg.removeEventListener('change', update);
    };
  }, []);

  useEffect(() => {
    if (canHover) {
      setOpenServiceNoteKey(null);
    }
  }, [canHover]);
  const applyTheme = (nextTheme: ThemeKey) => {
    setSelectedTheme(nextTheme);
  };

  const toggleDayNightTheme = () => {
    setIsNightTheme(prev => {
      const next = !prev;
      lastIsNightRef.current = next;
      return next;
    });
  };

  const cycleTheme = () => {
    const currentIndex = themeIds.indexOf(selectedTheme);
    const nextTheme = themeIds[(currentIndex + 1) % themeIds.length];
    applyTheme(nextTheme);
  };

  const publicationMatchesAuthorRole = (
    pub: typeof HAO_DATA.publications[number],
    role: AuthorRoleFilter
  ) => {
    if (role === 'first') {
      return pub.firstAuthors?.includes('Hao Zeng') ?? false;
    }
    return pub.correspondingAuthors?.includes('Hao Zeng') ?? false;
  };

  const filterPublicationsByAuthorRoles = (
    publications: typeof HAO_DATA.publications
  ) => {
    if (activeAuthorRoleFilters.length === 0) {
      return publications;
    }
    return publications.filter(pub =>
      activeAuthorRoleFilters.some(role => publicationMatchesAuthorRole(pub, role))
    );
  };

  const publicationsAfterAuthorRoles = useMemo(
    () => filterPublicationsByAuthorRoles(HAO_DATA.publications),
    [activeAuthorRoleFilters, HAO_DATA.publications]
  );

  const publicationsAfterRightFilters = useMemo(() => {
    let publications = publicationsAfterAuthorRoles;

    if (selectedOnly) {
      publications = publications.filter(p => p.selected);
    }

    if (activeTypeFilter) {
      publications = publications.filter(p => p.type === activeTypeFilter);
    }

    if (activeYearFilter) {
      if (activeYearFilter === 'before 2024') {
        publications = publications.filter(p => Number(p.year) < 2024);
      } else {
        publications = publications.filter(p => p.year === activeYearFilter);
      }
    }

    return publications;
  }, [publicationsAfterAuthorRoles, selectedOnly, activeTypeFilter, activeYearFilter]);

  const publicationsAfterYearAndTopics = useMemo(() => {
    let publications = publicationsAfterAuthorRoles;

    if (activeYearFilter) {
      if (activeYearFilter === 'before 2024') {
        publications = publications.filter(p => Number(p.year) < 2024);
      } else {
        publications = publications.filter(p => p.year === activeYearFilter);
      }
    }

    if (activeKeywords.length > 0) {
      publications = publications.filter(p => {
        if (!p.keywords || p.keywords.length === 0) return false;
        if (keywordMatchMode === 'all') {
          return activeKeywords.every(k => p.keywords!.includes(k));
        }
        return p.keywords.some(k => activeKeywords.includes(k));
      });
    }

    return publications;
  }, [publicationsAfterAuthorRoles, activeYearFilter, activeKeywords, keywordMatchMode]);

  const authorRoleCounts = useMemo(() => {
    let publications = HAO_DATA.publications;

    if (activeYearFilter) {
      if (activeYearFilter === 'before 2024') {
        publications = publications.filter(p => Number(p.year) < 2024);
      } else {
        publications = publications.filter(p => p.year === activeYearFilter);
      }
    }

    if (activeTypeFilter) {
      publications = publications.filter(p => p.type === activeTypeFilter);
    }

    if (selectedOnly) {
      publications = publications.filter(p => p.selected);
    }

    return {
      first: publications.filter(p => publicationMatchesAuthorRole(p, 'first')).length,
      corresponding: publications.filter(p => publicationMatchesAuthorRole(p, 'corresponding')).length,
    };
  }, [HAO_DATA.publications, activeYearFilter, activeTypeFilter, selectedOnly]);

  const selectedAllCounts = useMemo(() => {
    let publications = publicationsAfterYearAndTopics;

    if (activeTypeFilter) {
      publications = publications.filter(p => p.type === activeTypeFilter);
    }

    return {
      selected: publications.filter(p => p.selected).length,
      all: publications.length,
    };
  }, [publicationsAfterYearAndTopics, activeTypeFilter]);

  const typeCounts = useMemo(() => {
    let publications = publicationsAfterYearAndTopics;

    if (selectedOnly) {
      publications = publications.filter(p => p.selected);
    }

    const counts: Record<PubType, number> = {
      Journal: 0,
      Conference: 0,
      'Working Paper': 0,
      Software: 0,
      Patent: 0,
    };

    publications.forEach(p => {
      counts[p.type] += 1;
    });

    return counts;
  }, [publicationsAfterYearAndTopics, selectedOnly]);

  const availableKeywords = useMemo(() => {
    const set = new Set<string>();
    publicationsAfterRightFilters.forEach(p => (p.keywords ?? []).forEach(k => set.add(k)));
    return Array.from(set).sort();
  }, [publicationsAfterRightFilters]);

  useEffect(() => {
    setActiveKeywords(prev => {
      const next = prev.filter(k => availableKeywords.includes(k));
      return next.length === prev.length ? prev : next;
    });
  }, [availableKeywords]);

  // 筛选论文（包含 topic 筛选）
  const filteredPublications = useMemo(() => {
    let publications = publicationsAfterRightFilters;

    if (activeKeywords.length > 0) {
      publications = publications.filter(p => {
        if (!p.keywords || p.keywords.length === 0) return false;
        if (keywordMatchMode === 'all') {
          return activeKeywords.every(k => p.keywords!.includes(k));
        }
        return p.keywords.some(k => activeKeywords.includes(k));
      });
    }

    return publications;
  }, [publicationsAfterRightFilters, activeKeywords, keywordMatchMode]);

  // 显示的论文列表 - 显示所有符合筛选条件的论文
  const displayedPublications = useMemo(() => {
    return [...filteredPublications].sort((a, b) => {
      const yearDiff = Number(b.year) - Number(a.year);
      if (yearDiff !== 0) return yearDiff;
      const monthDiff = Number(b.month ?? 0) - Number(a.month ?? 0);
      if (monthDiff !== 0) return monthDiff;
      return b.id.localeCompare(a.id);
    });
  }, [filteredPublications]);

  const pubById = useMemo(() => {
    return new Map(HAO_DATA.publications.map(p => [p.id, p] as const));
  }, [HAO_DATA.publications]);

  const allPublicationsSorted = useMemo(() => {
    return [...HAO_DATA.publications].sort((a, b) => {
      const yearDiff = Number(b.year) - Number(a.year);
      if (yearDiff !== 0) return yearDiff;
      const monthDiff = Number(b.month ?? 0) - Number(a.month ?? 0);
      if (monthDiff !== 0) return monthDiff;
      // String comparison for ID as fallback
      return b.id.localeCompare(a.id);
    });
  }, [HAO_DATA.publications]);

  const pubNoById = useMemo(() => {
    const out = new Map<string, number>();
    const total = allPublicationsSorted.length;
    allPublicationsSorted.forEach((p, idx) => {
      out.set(p.id, total - idx);
    });
    return out;
  }, [allPublicationsSorted]);

  const pubIdByNo = useMemo(() => {
    const out = new Map<number, string>();
    const total = allPublicationsSorted.length;
    allPublicationsSorted.forEach((p, idx) => {
      out.set(total - idx, p.id);
    });
    return out;
  }, [allPublicationsSorted]);

  const jumpToPublication = (publicationId: string) => {
    setHighlightedPublicationId(null);
    setSelectedOnly(false);
    setActiveTypeFilter(null);
    setActiveYearFilter(null);
    setActiveAuthorRoleFilters([]);
    setActiveKeywords([]);
    setKeywordMatchMode('any');
    setTopicsMenuOpen(false);
    setMobileMenuOpen(false);

    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        const id = `pub-${publicationId}`;
        window.location.hash = id;
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        setHighlightedPublicationId(publicationId);
        window.setTimeout(() => {
          setHighlightedPublicationId(prev => (prev === publicationId ? null : prev));
        }, 2200);
      });
    });
  };

  const renderTextWithBold = (text: string, lowerCaseFirst = false) => {
    const parts: Array<string | JSX.Element> = [];
    const re = /\*\*(.*?)\*\*/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    // 如果需要首字母小写，先处理整个字符串（假设 ** 不在首位）
    // 但如果有 ** 在首位，需要小心。简单起见，如果 lowerCaseFirst 为 true，
    // 我们只把第一个字符小写化（如果它是字母）。
    // 更安全的做法：解析完 parts 后，把 parts[0] 的第一个字符小写。
    // 这里采用：先替换 text 的第一个字符，再做 bold 解析。
    let processedText = text;
    if (lowerCaseFirst && text.length > 0) {
      processedText = text.charAt(0).toLowerCase() + text.slice(1);
    }

    while ((match = re.exec(processedText))) {
      if (match.index > lastIndex) {
        parts.push(processedText.slice(lastIndex, match.index));
      }
      parts.push(
        <strong key={`b-${match.index}`} className="font-semibold">
          {match[1]}
        </strong>
      );
      lastIndex = re.lastIndex;
    }
    if (lastIndex < processedText.length) {
      parts.push(processedText.slice(lastIndex));
    }
    return parts;
  };

  const getPublicationTags = (pub: Publication) => {
    const tags = [...(pub.tag ?? [])];
    for (const rule of TOP_VENUE_RULES) {
      if (rule.type && pub.type !== rule.type) continue;
      if (rule.patterns.some(pattern => pattern.test(pub.venue))) {
        tags.push(rule.label);
      }
    }
    return Array.from(new Set(tags.map(tag => tag.trim()).filter(Boolean)));
  };

  const renderCitations = (publicationIds: string[], leading?: boolean) => {
    const pubs = publicationIds
      .map((pid) => {
        const pub = pubById.get(pid);
        const no = pubNoById.get(pid);
        if (!pub || !no) return null;
        return { pid, no, pub };
      })
      .filter(Boolean) as Array<{ pid: string; no: number; pub: NonNullable<ReturnType<typeof pubById.get>> }>;

    if (pubs.length === 0) return null;

    pubs.sort((a, b) => a.no - b.no);

    const segments: Array<{ startNo: number; endNo: number; pubs: typeof pubs }> = [];
    for (const item of pubs) {
      const last = segments[segments.length - 1];
      if (!last) {
        segments.push({ startNo: item.no, endNo: item.no, pubs: [item] });
        continue;
      }
      if (item.no === last.endNo + 1) {
        last.endNo = item.no;
        last.pubs.push(item);
        continue;
      }
      segments.push({ startNo: item.no, endNo: item.no, pubs: [item] });
    }

    return (
      <span className={`${leading ? '' : 'ml-2 '}inline-flex flex-wrap items-baseline`}>
        <span className={`text-sm font-semibold ${theme.textMuted} font-sans`}>[</span>
        {segments.map((seg, i) => {
          const label = seg.startNo === seg.endNo ? `${seg.startNo}` : `${seg.startNo}-${seg.endNo}`;
          const targetId = pubIdByNo.get(seg.startNo) ?? seg.pubs[0]?.pid;
          if (!targetId) return null;

          const fallbackTitle = seg.pubs.map((x) => `${x.no}. ${x.pub.title} (${x.pub.venue}, ${x.pub.year})`).join('\n');

          return (
            <span key={`${seg.startNo}-${seg.endNo}`} className="inline-flex items-baseline">
              {i > 0 && <span className={`text-sm font-semibold ${theme.textMuted} font-sans mr-1`}>,</span>}
              <span
                className={canHover ? 'group relative inline-flex' : undefined}
                title={!canHover ? fallbackTitle : undefined}
              >
                <button
                  type="button"
                  onClick={() => jumpToPublication(targetId)}
                  className={`text-sm font-semibold ${theme.textMuted} hover:${theme.accent} transition-colors font-sans`}
                >
                  {label}
                </button>
                {canHover && (
                  <span
                    className={`pointer-events-none absolute left-0 top-full mt-2 hidden group-hover:block z-20 ${theme.cardBg} border ${theme.border} shadow-sm rounded-xl px-4 py-3 text-sm leading-relaxed ${theme.text} min-w-[280px] max-w-md whitespace-normal`}
                  >
                    {seg.pubs.map((x) => (
                      <span key={x.pid} className="block space-y-0.5">
                        <span className="block font-semibold">
                          [{x.no}] {x.pub.title}
                        </span>
                        <span className={`block ${theme.textMuted}`}>
                          {x.pub.venue} ({x.pub.year})
                        </span>
                        <span className={`block ${theme.textMuted} text-xs`}>{x.pub.authors}</span>
                        <span className="block h-2" />
                      </span>
                    ))}
                  </span>
                )}
              </span>
            </span>
          );
        })}
        <span className={`text-sm font-semibold ${theme.textMuted} font-sans`}>]</span>
      </span>
    );
  };

  const renderNarrativeInline = (items: Array<{ text: string; citations?: string[] }>) => {
    return (
      <>
        {items.map((p, idx) => (
          <span key={idx}>
            {idx === 0 ? '' : ' '}
            {renderTextWithBold(p.text)}
            {p.citations?.length ? renderCitations(p.citations) : null}
          </span>
        ))}
      </>
    );
  };

  const renderNarrativeLeadingCitations = (items: Array<{ text: string; citations?: string[] }>) => {
    return (
      <>
        {items.map((p, idx) => (
          <span key={idx}>
            {idx === 0 ? '' : ' '}
            {p.citations?.length ? (
              <>
                In {renderCitations(p.citations, true)}, {renderTextWithBold(p.text, true)}
              </>
            ) : (
              renderTextWithBold(p.text)
            )}
          </span>
        ))}
      </>
    );
  };

  const featuredBlogPost = SHOW_BLOG_ENTRY ? HAO_DATA.blog[0] : undefined;

  // 导航项
  const navItems = [
    { label: 'About', href: '#about' },
    { label: 'News', href: '#news' },
    { label: 'Research', href: '#research' },
    { label: 'Publications', href: '#publications' },
    { label: 'Teaching', href: '#teaching' },
    { label: 'Seminar', href: '#seminar' },
    { label: 'Talks', href: '#talks' },
    { label: 'Service', href: '#service' },
  ];

  const todayKey = (() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  })();

  const visibleTalks = HAO_DATA.talks.filter(talk => talk.show !== false);
  const upcomingTalks = visibleTalks.filter(talk => talk.date >= todayKey || talk.tags?.includes('Forthcoming'));
  const pastTalks = visibleTalks.filter(talk => !upcomingTalks.includes(talk));
  const visiblePastTalks = showAllPastTalks ? pastTalks : pastTalks.slice(0, 5);
  const hiddenPastTalkCount = Math.max(0, pastTalks.length - visiblePastTalks.length);

  const renderTalkTimeline = (talks: typeof visibleTalks) => (
    <div className={`space-y-0 border-l ${theme.border} ml-3`}>
      {talks.map((talk) => (
        <div key={talk.id} className="relative pl-8 pb-8 last:pb-0">
          <div className={`absolute left-[-5px] top-1.5 h-2.5 w-2.5 rounded-full ${theme.accentBg} ring-4 ${isNightTheme ? 'ring-[#1E293B]' : currentTheme === 'lab' ? 'ring-slate-100' : currentTheme === 'mint' ? 'ring-[#EDF3FF]' : currentTheme === 'brutal' ? 'ring-white' : 'ring-[#F5F3ED]'}`}></div>
          <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4">
            <span className={`text-sm font-bold ${theme.textMuted} min-w-[100px] font-sans`}>{talk.date.substring(0, 7)}</span>
            <div>
              <h4 className={`text-lg font-bold ${theme.text}`}>{talk.title}</h4>
              <div className={`flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm ${theme.textMuted}`}>
                <span>{talk.type}</span>
                <span>@ {talk.venue}</span>
                <span className="flex items-center gap-1"><MapPin size={12} /> {talk.location}</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className={`min-h-screen ${theme.bg} ${theme.text} ${theme.font} transition-colors duration-500`}>
      <style>{RESPONSIVE_FILTER_STYLES}</style>
      {/* 导航栏 - 参考项目的简洁风格 */}
      <nav className={`sticky top-0 z-40 w-full border-b ${theme.border} ${theme.navBg} backdrop-blur-md transition-colors duration-300`}>
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <a href="#about" className="flex min-w-0 items-center gap-2 group">
            <span className={`whitespace-nowrap text-base sm:text-lg font-bold font-serif ${theme.text}`}>
              {HAO_DATA.profile.name} <span className={theme.textMuted}>{HAO_DATA.profile.cnName}</span>
            </span>
          </a>

          {/* 桌面导航 */}
          <div className="hidden lg:flex items-center gap-4">
            <div className="flex items-center gap-6">
              {navItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className={`text-sm font-medium ${theme.textMuted} hover:${theme.text} transition-colors`}
                >
                  {item.label}
                </a>
              ))}
            </div>

            {/* 主题切换 */}
            <div
              className="relative"
              onMouseEnter={() => setThemeMenuOpen(true)}
              onMouseLeave={() => setThemeMenuOpen(false)}
            >
              <button
                onClick={cycleTheme}
                className={`p-2 rounded-full hover:bg-slate-500/10 transition-colors ${theme.textMuted}`}
                title="切换样式"
              >
                <Palette size={18} />
              </button>
              {themeMenuOpen && (
                <div className={`absolute top-full right-0 mt-2 w-28 ${theme.cardBg} border ${theme.border} rounded-lg shadow-xl p-1 z-50`}>
                  {Object.values(THEMES).map((t) => (
                    <button
                      key={t.id}
                      onClick={() => { applyTheme(t.id as ThemeKey); setThemeMenuOpen(false); }}
                      className={`w-full text-left px-3 py-2 text-sm rounded-md flex items-center justify-between
                        ${currentTheme === t.id ? `${theme.highlight} ${theme.text}` : `${theme.textMuted} hover:bg-slate-500/5`}`}
                    >
                      {t.name}
                      {currentTheme === t.id && <Check size={14} />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={toggleDayNightTheme}
              className={`p-2 rounded-full hover:bg-slate-500/10 transition-colors ${theme.textMuted}`}
              title={isNightTheme ? '切换到白天' : '切换到夜色'}
              aria-label={isNightTheme ? '切换到白天' : '切换到夜色'}
              aria-pressed={isNightTheme}
            >
              {isNightTheme ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {featuredBlogPost && (
              <>
                <span className={`h-5 w-px border-l ${theme.border} opacity-70`} aria-hidden="true" />
                <a
                  href={`${import.meta.env.BASE_URL}blog/list.html`}
                  className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold ${theme.border} ${theme.cardBg} ${theme.text} hover:${theme.accent} transition-colors`}
                >
                  Blog
                  <ExternalLink size={14} />
                </a>
              </>
            )}
          </div>

          {/* 移动端菜单按钮 */}
          <div className="lg:hidden flex items-center gap-2">
            <button
              onClick={cycleTheme}
              className={`p-2 ${theme.textMuted}`}
              title="切换样式"
              aria-label="切换样式"
            >
              <Palette size={20} />
            </button>
            <button
              type="button"
              onClick={toggleDayNightTheme}
              className={`p-2 ${theme.textMuted}`}
              title={isNightTheme ? '切换到白天' : '切换到夜色'}
              aria-label={isNightTheme ? '切换到白天' : '切换到夜色'}
              aria-pressed={isNightTheme}
            >
              {isNightTheme ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button
              className={`p-2 ${theme.textMuted}`}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X /> : <Menu />}
            </button>
            {featuredBlogPost && (
              <a
                href={`${import.meta.env.BASE_URL}blog/list.html`}
                className={`ml-1 inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-semibold ${theme.border} ${theme.cardBg} ${theme.text}`}
              >
                Blog
                <ExternalLink size={12} />
              </a>
            )}
          </div>
        </div>

        {/* 移动端菜单 */}
        {mobileMenuOpen && (
          <div className={`lg:hidden ${theme.bg} border-b ${theme.border} px-4 py-4 space-y-2`}>
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block py-2 ${theme.textMuted} hover:${theme.text}`}
              >
                {item.label}
              </a>
            ))}
          </div>
        )}
      </nav>

      <main>
        {/* Hero 区域 - 参考项目的左右布局 */}
        <section id="about" className="pt-12 pb-16 lg:pt-24 lg:pb-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row gap-12 items-start">
              {/* 头像列 */}
              <div className="w-full lg:w-1/3 flex justify-center lg:justify-start">
                <div className="relative w-64 h-64 lg:w-80 lg:h-80">
                  {currentTheme === 'brutal' ? (
                    <>
                      <div className="absolute inset-0 bg-blue-600 border-4 border-black rounded-2xl -rotate-6 transform translate-x-2 translate-y-2"></div>
                      <div className="absolute inset-0 bg-red-500 border-4 border-black rounded-2xl rotate-3 transform -translate-x-2 translate-y-1"></div>
                      <div className="absolute inset-0 bg-yellow-300 border-4 border-black rounded-2xl -rotate-1 transform"></div>
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <span className="text-4xl font-black text-black">*</span>
                      </div>
                    </>
                  ) : (
                    <div className={`absolute inset-0 ${theme.bgAlt} rounded-2xl rotate-3 transform`}></div>
                  )}
                  <img
                    src={HAO_DATA.profile.avatarUrl}
                    alt={HAO_DATA.profile.name}
                    className={`relative w-full h-full object-cover rounded-2xl shadow-lg border ${theme.border}`}
                  />
                </div>
              </div>

              {/* 信息列 */}
              <div className="w-full lg:w-2/3 space-y-6">
                <div>
                  <h1 className={`text-4xl lg:text-5xl font-bold font-serif ${theme.text} tracking-tight mb-2 flex flex-col gap-1`}>
                    <span>{HAO_DATA.profile.name}</span>
                    <span className={`text-2xl lg:text-3xl font-normal ${theme.textMuted}`}>{HAO_DATA.profile.cnName}</span>
                  </h1>
                  {/* 座右铭 - 弱化颜色 */}
                  <p className={`text-base italic ${isNightTheme ? 'text-slate-500' : 'text-slate-400'} mb-3`}>
                    Heterogeneity nourishes statistics; independence begets probability; uncertainty is eternal.
                  </p>
                  <p className={`text-xl ${theme.textMuted} flex items-center gap-2`}>
                    <GraduationCap size={20} />
                    {HAO_DATA.profile.title}
                  </p>
                  <p className={`text-lg ${theme.textMuted} flex items-center gap-2 mt-1`}>
                    <MapPin size={18} />
                    {HAO_DATA.profile.university}
                  </p>
                </div>

                <p
                  className={`text-lg leading-relaxed max-w-3xl text-justify-hyphen ${isNightTheme ? 'text-slate-300' : 'text-slate-700'}`}
                  dangerouslySetInnerHTML={{
                    __html: HAO_DATA.profile.description.replace(
                      /\*\*(.*?)\*\*/g,
                      `<strong class="font-bold ${theme.text}">$1</strong>`
                    )
                  }}
                />

                {/* 社交链接按钮 */}
                <div className="flex flex-wrap gap-3 pt-2">
                  <a
                    href={HAO_DATA.profile.googleScholar}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center gap-2 px-4 py-2 ${theme.cardBg} border ${theme.border} rounded-lg text-sm font-medium ${theme.textMuted} hover:${theme.text} hover:border-slate-400 transition-all`}
                  >
                    <BookOpen size={16} /> Google Scholar
                  </a>
                  <a
                    href={HAO_DATA.profile.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center gap-2 px-4 py-2 ${theme.cardBg} border ${theme.border} rounded-lg text-sm font-medium ${theme.textMuted} hover:${theme.text} hover:border-slate-400 transition-all`}
                  >
                    <Github size={16} /> GitHub
                  </a>
                  <a
                    href={`mailto:${HAO_DATA.profile.email}`}
                    className={`inline-flex items-center gap-2 px-4 py-2 ${theme.cardBg} border ${theme.border} rounded-lg text-sm font-medium ${theme.textMuted} hover:${theme.text} hover:border-slate-400 transition-all`}
                  >
                    <Mail size={16} /> Email
                  </a>
                </div>

                {/* 研究兴趣标签 */}
                <div className={`pt-6 border-t ${theme.border}`}>
                  <h3 className={`text-sm font-semibold ${theme.textMuted} uppercase tracking-wider mb-4 font-sans`}>
                    Research Interests
                  </h3>
                  <div className="space-y-2 font-sans">
                    <div className={`text-sm ${theme.textMuted}`}>
                      <span className={`font-semibold ${theme.text}`}>Statistical Machine Learning:</span>{' '}
                      Model Free Predictive Inference, Conformal Prediction, Transfer Learning
                    </div>
                    <div className={`text-sm ${theme.textMuted}`}>
                      <span className={`font-semibold ${theme.text}`}>Interdisciplinary Research:</span>{' '}
                      Large Language Models, Spatial Statistics, Econometrics, and Biostatistics
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* News 区域 - 参考项目的时间线风格 */}
        <section id="news" className={`py-16 ${theme.bgAlt} transition-colors duration-300`}>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className={`text-3xl font-bold font-serif ${theme.text} mb-10`}>News</h2>
            <div className={`space-y-0 border-l ${theme.border} ml-3`}>
              {HAO_DATA.news.map((item, i) => (
                <div key={i} className="relative pl-8 pb-8 last:pb-0">
                  <div className={`absolute left-[-5px] top-1 h-2.5 w-2.5 rounded-full ${theme.accentBg} ring-4 ${isNightTheme ? 'ring-[#1E293B]' : currentTheme === 'lab' ? 'ring-slate-100' : currentTheme === 'mint' ? 'ring-[#EDF3FF]' : currentTheme === 'brutal' ? 'ring-white' : 'ring-[#F5F3ED]'}`}></div>
                  <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4">
                    <span className={`text-sm font-bold ${theme.textMuted} min-w-[80px] font-sans`}>{item.date}</span>
                    <p className={`text-base ${isNightTheme ? 'text-slate-300' : 'text-slate-700'}`}>
                      <span
                        dangerouslySetInnerHTML={{
                          __html: item.content.replace(
                            /\*\*(.*?)\*\*/g,
                            `<strong class="font-bold ${theme.text} ${theme.highlight} px-1 rounded-sm">$1</strong>`
                          )
                        }}
                      />
                      {item.publicationIds && item.publicationIds.length > 0 && (
                        <span className="ml-2">
                          {renderCitations(item.publicationIds)}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="research" className={`py-16 ${theme.bg} transition-colors duration-300`}>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
              <h2 className={`text-3xl font-bold font-serif ${theme.text}`}>Research</h2>
              <a
                href="#publications"
                className={`text-sm font-medium ${theme.textMuted} hover:${theme.accent} transition-colors font-sans`}
              >
                See full list in Publications →
              </a>
            </div>
            <p className={`text-base leading-relaxed max-w-5xl ${isNightTheme ? 'text-slate-300' : 'text-slate-700'}`}>
              {renderNarrativeInline(HAO_DATA.research.intro)}
            </p>

            <div className="grid md:grid-cols-2 gap-6 mt-10">
              {HAO_DATA.research.areas.map(area => (
                <div
                  key={area.id}
                  className={`${theme.cardBg} border ${theme.border} p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 flex flex-col`}
                >
                  {area.imageUrl && (
                    <div className="mb-4 overflow-hidden rounded-lg border border-slate-200/50">
                      <img
                        src={area.imageUrl}
                        alt={area.title}
                        className="w-full h-48 object-cover hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  )}
                  <h3 className={`text-xl font-bold ${theme.text} leading-tight`}>{area.title}</h3>
                  <p className={`mt-3 text-sm leading-relaxed ${isNightTheme ? 'text-slate-300' : 'text-slate-700'}`}>
                    {area.summary}
                  </p>

                  <p className={`mt-4 text-sm leading-relaxed ${isNightTheme ? 'text-slate-300' : 'text-slate-700'}`}>
                    {renderNarrativeLeadingCitations(area.narrative)}
                  </p>

                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Publications 区域 - 参考项目的列表+侧边栏布局 */}
        <section id="publications" className={`py-16 ${theme.bg} border-t ${theme.border} transition-colors duration-300`}>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div>
              {/* 论文列表 */}
              <div className="space-y-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1 md:flex-[0_0_360px]">
                    <h2 className={`text-3xl font-bold font-serif ${theme.text}`}>
                      Publications
                    </h2>
                    <p className={`text-xs ${theme.textMuted} font-sans`}>
                      <span className="inline-flex items-center gap-1" title="First author">
                        <span>†</span> first author/equal contribution
                      </span>
                      ;{' '}
                      <span className="inline-flex items-center gap-1" title="Corresponding author">
                        <Mail size={12} className="inline-block" aria-label="Corresponding author" /> corresponding author
                      </span>
                      ;{' '}
                      <span className="inline-flex items-center gap-1" title="Supervised student">
                        <GraduationCap size={12} className="inline-block" aria-label="Supervised student" /> supervised student
                      </span>
                    </p>
                    <div className="pt-2">
                      <div ref={topicsMenuRef} className="relative inline-block">
                        <button
                          type="button"
                          onClick={() => setTopicsMenuOpen(prev => !prev)}
                          className={`px-3 py-1.5 rounded-full text-xs transition-all border ${theme.border} ${theme.textMuted} ${theme.cardBg} hover:border-slate-400 inline-flex items-center gap-2`}
                        >
                          <span>
                            {activeKeywords.length === 0
                              ? 'select topics'
                              : activeKeywords.length === 1
                                ? activeKeywords[0]
                                : `${activeKeywords.length} topics`}
                          </span>
                          <span className="text-[10px]">▾</span>
                        </button>

                        {topicsMenuOpen && (
                          <div
                            className={`absolute left-0 mt-2 w-72 max-w-[80vw] rounded-xl border ${theme.border} ${theme.cardBg} shadow-lg p-2 z-50`}
                          >
                            <div className="flex items-center justify-between gap-2 px-1 pb-2">
                              <div className={`text-[11px] ${theme.textMuted}`}>Match mode</div>
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => setKeywordMatchMode('any')}
                                  className={`px-2 py-1 rounded-full text-[11px] border ${theme.border} ${keywordMatchMode === 'any' ? `${theme.accentBg} text-white` : `${theme.cardBg} ${theme.textMuted}`}`}
                                  title="Any (union)"
                                >
                                  <span className="inline-flex items-center gap-1">
                                    <Combine size={12} />
                                    Any
                                  </span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setKeywordMatchMode('all')}
                                  className={`px-2 py-1 rounded-full text-[11px] border ${theme.border} ${keywordMatchMode === 'all' ? `${theme.accentBg} text-white` : `${theme.cardBg} ${theme.textMuted}`}`}
                                  title="All (intersection)"
                                >
                                  <span className="inline-flex items-center gap-1">
                                    <Merge size={12} />
                                    All
                                  </span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveKeywords([]);
                                    setKeywordMatchMode('any');
                                  }}
                                  disabled={activeKeywords.length === 0 && keywordMatchMode === 'any'}
                                  className={`px-2 py-1 rounded-full text-[11px] border ${theme.border} ${theme.cardBg} ${theme.textMuted} inline-flex items-center gap-1 transition-opacity ${activeKeywords.length === 0 && keywordMatchMode === 'any' ? 'opacity-40 cursor-not-allowed' : 'hover:border-slate-400'}`}
                                  title="Clean topics"
                                >
                                  <RotateCcw size={12} />
                                  Clean
                                </button>
                              </div>
                            </div>

                            <div className="max-h-64 overflow-auto">
                              {availableKeywords.map((k: string) => {
                                const checked = activeKeywords.includes(k);
                                return (
                                  <label
                                    key={k}
                                    className={`flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer hover:bg-slate-500/10 ${theme.textMuted}`}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={checked}
                                      onChange={() =>
                                        setActiveKeywords(prev =>
                                          checked ? prev.filter(x => x !== k) : [...prev, k]
                                        )
                                      }
                                      className="h-3.5 w-3.5"
                                    />
                                    <span className="text-xs">{k}</span>
                                  </label>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 筛选器 */}
                  <div className="publication-filter-panel flex min-w-0 flex-col gap-2 md:flex-[1_1_auto] md:items-end">
                    <div className="flex flex-wrap gap-2 font-sans items-center justify-start sm:justify-end">
                      {([
                        { id: 'first', label: 'First / Co-first', count: authorRoleCounts.first },
                        { id: 'corresponding', label: 'Corresponding', count: authorRoleCounts.corresponding },
                      ] as const).map(filter => {
                        const active = activeAuthorRoleFilters.includes(filter.id);
                        return (
                          <button
                            key={filter.id}
                            type="button"
                            onClick={() =>
                              setActiveAuthorRoleFilters(prev =>
                                active ? prev.filter(x => x !== filter.id) : [...prev, filter.id]
                              )
                            }
                            className={`inline-flex items-center px-2.5 py-1.5 rounded-full text-xs font-bold uppercase transition-colors border whitespace-nowrap
                              ${active
                                ? `${theme.accentBg} text-white ${theme.border}`
                                : `${theme.cardBg} ${theme.border} ${theme.textMuted} hover:border-slate-400`}`}
                            aria-pressed={active}
                          >
                            {filter.label} ({filter.count})
                          </button>
                        );
                      })}

                      <button
                        type="button"
                        onClick={() => setSelectedOnly(v => !v)}
                        className={`relative inline-flex items-center rounded-full border ${theme.border} ${theme.cardBg} overflow-hidden transition-all`}
                        aria-pressed={selectedOnly}
                        title={selectedOnly ? 'Showing selected publications' : 'Showing all publications'}
                      >
                        <span
                          className={`publication-filter-label px-3 sm:px-4 py-1.5 text-xs font-bold uppercase transition-colors ${selectedOnly ? `${theme.accentBg} text-white` : theme.textMuted}`}
                        >
                          <span className="publication-filter-selected-full">Selected</span>
                          <span className="publication-filter-selected-short">Sel</span> ({selectedAllCounts.selected})
                        </span>
                        <span
                          className={`publication-filter-label px-3 sm:px-4 py-1.5 text-xs font-bold uppercase transition-colors ${selectedOnly ? theme.textMuted : `${theme.accentBg} text-white`}`}
                        >
                          All ({selectedAllCounts.all})
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={clearFilters}
                        className={`px-2 sm:px-3 py-1.5 rounded-full text-xs font-bold uppercase transition-all border ${theme.border} ${theme.cardBg} ${theme.textMuted} hover:border-slate-400 inline-flex items-center gap-1.5 sm:gap-2`}
                        title="Clear filters"
                        aria-label="Clear publication filters"
                      >
                        <RotateCcw size={14} />
                        <span className="publication-filter-clear-text">Clear</span>
                      </button>
                    </div>

                    <div className="flex flex-nowrap gap-2 font-sans items-center justify-start sm:justify-end">
                      {(['Journal', 'Conference', 'Working Paper', 'Software', 'Patent'] as const).map(label => (
                        <button
                          key={label}
                          type="button"
                          onClick={() => {
                            const nextType = activeTypeFilter === label ? null : label;
                            setActiveTypeFilter(nextType);
                            if (nextType) {
                              setActiveYearFilter(null);
                            }
                          }}
                          className={`min-w-9 whitespace-nowrap px-2.5 py-1.5 rounded-full text-xs font-bold uppercase leading-none transition-all
                            ${activeTypeFilter === label
                              ? `${theme.accentBg} text-white shadow-md`
                              : `${theme.cardBg} border ${theme.border} ${theme.textMuted} hover:border-slate-400`}`}
                          title={`${PUB_TYPE_LABELS[label]} (${typeCounts[label]})`}
                          aria-label={`${PUB_TYPE_LABELS[label]} publications, ${typeCounts[label]} items`}
                        >
                          {PUB_TYPE_LABELS[label]} ({typeCounts[label]})
                        </button>
                      ))}
                    </div>

                    <div className="flex flex-wrap gap-2 font-sans items-center justify-end">
                      {(['2026', '2025', '2024', 'before 2024'] as const).map(year => (
                        <button
                          key={year}
                          type="button"
                          onClick={() => setActiveYearFilter(prev => (prev === year ? null : year))}
                          className={`px-3 py-1.5 rounded-full text-xs font-bold tracking-wide uppercase transition-all
                            ${activeYearFilter === year
                              ? `${theme.accentBg} text-white shadow-md`
                              : `${theme.cardBg} border ${theme.border} ${theme.textMuted} hover:border-slate-400`}`}
                        >
                          {year}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  {displayedPublications.map((pub, idx) => (
                    <div
                      key={pub.id}
                      id={`pub-${pub.id}`}
                      className={`group relative pl-4 border-l-2 scroll-mt-24 transition-all duration-500 ${highlightedPublicationId === pub.id
                        ? `${theme.accent} border-l-[6px] bg-current/5 ring-2 ring-current/30 rounded-r-lg py-3 pr-3`
                        : `${theme.border} hover:border-current`
                        }`}
                    >
                      <h3 className={`text-xl font-semibold ${theme.text} group-hover:${theme.accent} transition-colors`}>
                        <span
                          className={`font-sans font-bold mr-2 ${!selectedOnly && pub.selected ? 'text-[#8B0000]' : theme.textMuted
                            }`}
                        >
                          {displayedPublications.length - idx}.
                        </span>
                        {pub.url && pub.url !== '#' ? (
                          <a
                            href={pub.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`inline-flex items-center gap-1 hover:${theme.accent} transition-colors`}
                          >
                            <span>{pub.title}</span>
                            {canHover && <ExternalLink size={16} />}
                          </a>
                        ) : (
                          pub.title
                        )}
                      </h3>
                      <div className={`mt-1 ${isNightTheme ? 'text-slate-300' : 'text-slate-600'}`}>
                        {pub.authors.split(',').map((rawAuthor, i, arr) => {
                          const author = rawAuthor.trim();
                          const isMe = author === 'Hao Zeng';
                          const isFirstAuthor = pub.firstAuthors?.includes(author);
                          const isGuidedStudent = pub.guidedStudents?.includes(author);
                          const isCorrespondingAuthor = pub.correspondingAuthors?.includes(author);

                          return (
                            <span key={`${author}-${i}`}>
                              {isMe ? <span className={`font-bold ${theme.text}`}>{author}</span> : author}
                              {isFirstAuthor && (
                                <sup className={`ml-0.5 align-super ${theme.textMuted}`} title="First author">†</sup>
                              )}
                              {isGuidedStudent && (
                                <sup className={`ml-0.5 align-super ${theme.textMuted}`} title="Supervised student">
                                  <GraduationCap size={12} className="inline-block" aria-label="Supervised student" />
                                </sup>
                              )}
                              {isCorrespondingAuthor && (
                                <sup className={`ml-0.5 align-super ${theme.textMuted}`} title="Corresponding author">
                                  <Mail size={12} className="inline-block" aria-label="Corresponding author" />
                                </sup>
                              )}
                              {i < arr.length - 1 ? ', ' : ''}
                            </span>
                          );
                        })}
                      </div>
                      <div className="flex flex-wrap items-center gap-3 mt-2 text-sm font-sans">
                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${pub.type === 'Conference' ? theme.badgeConf :
                          pub.type === 'Journal' ? theme.badgeJournal :
                            pub.type === 'Software' || pub.type === 'Patent' ? theme.badgeSoft : theme.badgePre
                          }`}>
                          {PUB_TYPE_LABELS[pub.type]}
                        </span>
                        <span className={`font-medium italic ${theme.textMuted}`}>{pub.venue}</span>
                        <span className={theme.textMuted}>{pub.year}</span>
                        {getPublicationTags(pub).length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {getPublicationTags(pub)
                              .map(tag => {
                                const upper = tag.toUpperCase();
                                const isTop = upper.startsWith('TOP');
                                const isAi =
                                  isTop && (upper.includes('TOP AI') || upper.endsWith(' AI') || upper.endsWith('AI'));
                                const topStyle = isTop
                                  ? (isAi
                                    ? (isNightTheme ? NIGHT_TOP_TAG_STYLES[currentTheme].ai : TOP_TAG_STYLES[currentTheme].ai)
                                    : (isNightTheme ? NIGHT_TOP_TAG_STYLES[currentTheme].econometrics : TOP_TAG_STYLES[currentTheme].econometrics))
                                  : null;

                                return (
                                  <span
                                    key={tag}
                                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border transition-all duration-200 ${topStyle
                                      ? topStyle.pill
                                      : `${theme.cardBg} ${theme.textMuted} ${theme.border} hover:${theme.accent} hover:border-current hover:shadow-sm hover:-translate-y-0.5`
                                      }`}
                                  >
                                    <Tag size={12} className={topStyle ? topStyle.icon : undefined} />
                                    <span>{tag}</span>
                                  </span>
                                );
                              })}
                          </div>
                        )}
                        {pub.keywords && pub.keywords.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {pub.keywords.map(k => (
                              <span key={k} className={`px-2 py-0.5 rounded text-xs ${theme.cardBg} border ${theme.border} ${theme.textMuted}`}>
                                {k}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* 链接按钮 */}
                        <div className="flex gap-2 ml-auto">
                          {pub.url && pub.url !== '#' && (
                            <a
                              href={pub.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`${canHover ? 'hidden' : ''} inline-flex items-center gap-1 px-3 py-1.5 rounded border ${theme.border} ${theme.cardBg} ${theme.textMuted} hover:${theme.accent} transition-colors`}
                            >
                              <ExternalLink size={16} />
                              Link
                            </a>
                          )}
                          {pub.pdf && pub.pdf !== '#' && (
                            <a
                              href={pub.pdf}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`flex items-center gap-1 ${theme.textMuted} hover:${theme.accent} transition-colors`}
                            >
                              <FileText size={14} /> PDF
                            </a>
                          )}
                          {pub.code && pub.code !== '#' && (
                            <a
                              href={pub.code}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`flex items-center gap-1 ${theme.textMuted} hover:${theme.accent} transition-colors`}
                            >
                              <Code size={14} /> Code
                            </a>
                          )}
                          {pub.abs && (
                            <button
                              type="button"
                              onClick={() =>
                                setExpandedAbstractIds(prev =>
                                  prev.includes(pub.id) ? prev.filter(x => x !== pub.id) : [...prev, pub.id]
                                )
                              }
                              className={`${canHover ? 'hidden' : ''} inline-flex items-center gap-1 px-2 py-1 rounded border ${theme.border} ${theme.cardBg} ${theme.textMuted} hover:${theme.accent} transition-colors`}
                            >
                              <BookOpen size={16} />
                              <span>Abstract</span>
                              {expandedAbstractIds.includes(pub.id) ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </button>
                          )}
                        </div>
                      </div>
                      {pub.abs && (
                        <>
                          <div className={`hidden ${canHover ? 'group-hover:block' : ''} mt-3 p-3 rounded-lg border ${theme.border} ${theme.cardBg} shadow-sm`}>
                            <p className={`text-sm ${isNightTheme ? 'text-slate-300' : 'text-slate-700'}`}>
                              {pub.abs}
                            </p>
                          </div>
                          {expandedAbstractIds.includes(pub.id) && (
                            <div className={`${canHover ? 'hidden' : ''} mt-3 p-3 rounded-lg border ${theme.border} ${theme.cardBg} shadow-sm`}>
                              <p className={`text-sm ${isNightTheme ? 'text-slate-300' : 'text-slate-700'}`}>
                                {pub.abs}
                              </p>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>


            </div>
          </div>
        </section>

        {/* Teaching 区域 */}
        <section id="teaching" className={`py-16 ${theme.bgAlt} border-t ${theme.border} transition-colors duration-300`}>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className={`text-3xl font-bold font-serif ${theme.text} mb-10`}>Teaching</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {HAO_DATA.teaching.map((teach) => (
                <div key={teach.id} className={`${theme.cardBg} border ${theme.border} p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 flex flex-col`}>
                  <div className="flex flex-col gap-2 mb-4">
                    <div className="flex justify-between items-start gap-4">
                      <h3 className={`text-xl font-bold ${theme.text} leading-tight`}>
                        <a
                          href={`${import.meta.env.BASE_URL}teaching-and-seminar/${teach.id}.html`}
                          className={`hover:${theme.accent} transition-colors`}
                        >
                          {teach.title}
                        </a>
                      </h3>
                      <span className={`text-xs font-bold ${theme.accent} whitespace-nowrap font-sans bg-opacity-10 px-2 py-1 rounded-full ${theme.highlight} shrink-0`}>
                        {teach.date.split('-')[0]}
                      </span>
                    </div>
                    <div className={`flex flex-wrap gap-x-3 gap-y-1 text-sm ${theme.textMuted} font-sans`}>
                      <span className="flex items-center gap-1"><BookOpen size={14} /> {teach.type}</span>
                      {teach.role && (
                        <span className="flex items-center gap-1"><Award size={14} /> {teach.role}</span>
                      )}
                    </div>
                    <div className={`text-sm ${theme.textMuted} font-sans flex items-center gap-1`}>
                      <MapPin size={14} /> {teach.venue}
                    </div>
                  </div>
                  {(teach.excerpt || teach.body) && (
                    <p className={`mt-auto pt-4 border-t ${theme.border} ${isNightTheme ? 'text-slate-300' : 'text-slate-600'} text-sm leading-relaxed`}>
                      {teach.excerpt ?? teach.body?.split('\n\n')[0]}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Seminar 区域 */}
        <section id="seminar" className={`py-16 ${theme.bg} border-t ${theme.border} transition-colors duration-300`}>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className={`text-3xl font-bold font-serif ${theme.text} mb-10`}>Seminar</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {HAO_DATA.seminars.map((sem) => (
                <div key={sem.id} className={`${theme.cardBg} border ${theme.border} p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 flex flex-col`}>
                  <div className="flex flex-col gap-2 mb-4">
                    <div className="flex justify-between items-start gap-4">
                      <h3 className={`text-xl font-bold ${theme.text} leading-tight`}>
                        <a
                          href={`${import.meta.env.BASE_URL}teaching-and-seminar/${sem.id}.html`}
                          className={`hover:${theme.accent} transition-colors`}
                        >
                          {sem.title}
                        </a>
                      </h3>
                      <span className={`text-xs font-bold ${theme.accent} whitespace-nowrap font-sans bg-opacity-10 px-2 py-1 rounded-full ${theme.highlight} shrink-0`}>
                        {sem.date.split('-')[0]}
                      </span>
                    </div>
                    <div className={`flex flex-wrap gap-x-3 gap-y-1 text-sm ${theme.textMuted} font-sans`}>
                      <span className="flex items-center gap-1"><BookOpen size={14} /> {sem.type}</span>
                    </div>
                    <div className={`text-sm ${theme.textMuted} font-sans flex items-center gap-1`}>
                      <MapPin size={14} /> {sem.venue}{sem.location ? ` • ${sem.location}` : ''}
                    </div>
                  </div>
                  {(sem.excerpt || sem.body) && (
                    <p className={`mt-auto pt-4 border-t ${theme.border} ${isNightTheme ? 'text-slate-300' : 'text-slate-600'} text-sm leading-relaxed`}>
                      {sem.excerpt ?? sem.body?.split('\n\n')[0]}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Talks 区域 */}
        <section id="talks" className={`py-16 ${theme.bg} border-t ${theme.border} transition-colors duration-300`}>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className={`text-3xl font-bold font-serif ${theme.text} mb-10`}>Talks and Presentations</h2>
            <div className="space-y-12">
              {upcomingTalks.length > 0 && (
                <div>
                  <div className="mb-5 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <h3 className={`text-xl font-bold font-serif ${theme.text}`}>Forthcoming</h3>
                  </div>
                  {renderTalkTimeline(upcomingTalks)}
                </div>
              )}

              {pastTalks.length > 0 && (
                <div>
                  <div className="mb-5 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <h3 className={`text-xl font-bold font-serif ${theme.text}`}>Past</h3>
                  </div>
                  {renderTalkTimeline(visiblePastTalks)}
                  {pastTalks.length > 5 && (
                    <button
                      type="button"
                      onClick={() => setShowAllPastTalks(prev => !prev)}
                      className={`ml-3 mt-1 inline-flex items-center rounded-full border px-4 py-2 text-xs font-bold uppercase transition-all ${theme.border} ${theme.cardBg} ${theme.textMuted} hover:border-slate-400 hover:${theme.text}`}
                      aria-expanded={showAllPastTalks}
                    >
                      {showAllPastTalks ? 'Show fewer' : `Show ${hiddenPastTalkCount} more`}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Service 区域 */}
        <section id="service" className={`py-16 ${theme.bgAlt} transition-colors duration-300`}>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className={`text-3xl font-bold font-serif ${theme.text} mb-10`}>Academic Service</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {HAO_DATA.services.map((s, i) => (
                <div key={i} className={`${theme.cardBg} border ${theme.border} p-6 rounded-xl shadow-sm transition-colors duration-300`}>
                  <h3 className={`font-sans font-bold ${theme.text} mb-4 flex items-center gap-2`}>
                    <Award size={18} className={theme.accent} /> {s.type}
                  </h3>
                  <ul className="space-y-2">
                    {s.items.map((item, idx) => (
                      <li key={idx} className={`text-sm ${isNightTheme ? 'text-slate-300' : 'text-slate-600'}`}>
                        <div className="flex items-start gap-2">
                          <span className={`${theme.textMuted} mt-1`}>•</span>
                          {canHover || !item.note?.trim() ? (
                            <span className={item.note?.trim() ? 'group relative inline-flex' : undefined}>
                              <span
                                className={
                                  item.note?.trim()
                                    ? `underline decoration-dashed underline-offset-4 ${theme.textMuted} hover:${theme.accent} transition-colors`
                                    : undefined
                                }
                              >
                                {item.name}
                                {item.year?.length ? ` ${item.year.join(', ')}` : ''}
                              </span>
                              {item.note?.trim() && (
                                <span
                                  className={`pointer-events-none absolute left-0 top-full mt-2 hidden group-hover:block z-20 ${theme.cardBg} border ${theme.border} shadow-sm rounded-xl px-4 py-3 text-sm leading-relaxed ${theme.text} min-w-[240px] max-w-md whitespace-normal`}
                                >
                                  {item.note}
                                </span>
                              )}
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                const key = `${i}-${idx}`;
                                setOpenServiceNoteKey(prev => (prev === key ? null : key));
                              }}
                              aria-expanded={openServiceNoteKey === `${i}-${idx}`}
                              className={`text-left underline decoration-dashed underline-offset-4 ${theme.textMuted} hover:${theme.accent} transition-colors`}
                            >
                              <span className={`${theme.text} font-medium`}>
                                {item.name}
                                {item.year?.length ? ` ${item.year.join(', ')}` : ''}
                              </span>
                            </button>
                          )}
                        </div>
                        {!canHover && item.note?.trim() && openServiceNoteKey === `${i}-${idx}` && (
                          <div className={`ml-5 mt-1 text-xs leading-relaxed ${theme.textMuted}`}>
                            {item.note}
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className={`${theme.cardBg} border-t ${theme.border} py-12 transition-colors duration-300`}>
        <div className={`container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center text-sm ${theme.textMuted} font-sans`}>
          <div className="text-center md:text-left space-y-1">
            <p>&copy; 2026 Hao Zeng. All rights reserved.</p>
            <p>Updated at 2026-05-19.</p>
          </div>
          <div className="flex gap-4 mt-4 md:mt-0">
            <a href={HAO_DATA.profile.googleScholar} target="_blank" rel="noopener noreferrer" className={`hover:${theme.text} transition-colors`}>Google Scholar</a>
            <a href={HAO_DATA.profile.github} target="_blank" rel="noopener noreferrer" className={`hover:${theme.text} transition-colors`}>GitHub</a>
          </div>
        </div>
      </footer>

      {/* 全局样式 */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap');
        :root { --font-sans: 'Inter', -apple-system, sans-serif; --font-serif: var(--font-sans); }
        body { font-family: var(--font-sans); }
        .font-sans { font-family: var(--font-sans); }
        .font-serif { font-family: var(--font-serif); }
        .text-justify-hyphen { text-align: justify; text-justify: inter-word; hyphens: auto; overflow-wrap: anywhere; }
        html { scroll-behavior: smooth; }
      `}</style>
    </div>
  );
}
