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
  Palette,
  Check,
  ExternalLink,
  Combine,
  Merge,
  RotateCcw,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

import { HAO_DATA } from './content';

// 主题配置 - 保留原有的三种主题
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
  },
  night: {
    id: 'night',
    name: 'Night',
    bg: 'bg-[#0F172A]',
    bgAlt: 'bg-[#1E293B]',
    text: 'text-slate-200',
    textMuted: 'text-slate-400',
    font: 'font-sans',
    navBg: 'bg-[#0F172A]/90',
    border: 'border-slate-700',
    accent: 'text-sky-400',
    accentBg: 'bg-sky-500',
    cardBg: 'bg-[#1E293B]',
    highlight: 'bg-indigo-500/20',
    badgeConf: 'bg-sky-900 text-sky-200',
    badgeJournal: 'bg-emerald-900 text-emerald-200',
    badgePre: 'bg-amber-900 text-amber-200',
    badgeSoft: 'bg-purple-900 text-purple-200',
  }
};

type ThemeKey = keyof typeof THEMES;
type PubType = 'Conference' | 'Journal' | 'Preprint' | 'Software';
type YearFilter = '2026' | '2025' | '2024' | 'before 2024';

export default function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isNightByTime = () => {
    const hour = new Date().getHours();
    return hour >= 19 || hour < 7;
  };

  const loadInitialTheme = (): { currentTheme: ThemeKey; preferredLightTheme: ThemeKey } => {
    try {
      const stored = window.localStorage.getItem('haozeng_theme');
      if (!stored) {
        const preferredLightTheme: ThemeKey = 'brutal';
        return { currentTheme: isNightByTime() ? 'night' : preferredLightTheme, preferredLightTheme };
      }
      const parsed = JSON.parse(stored) as Partial<{ preferredLightTheme: ThemeKey }>;
      const preferredLightTheme: ThemeKey = parsed.preferredLightTheme && parsed.preferredLightTheme in THEMES ? parsed.preferredLightTheme : 'brutal';
      return { currentTheme: isNightByTime() ? 'night' : preferredLightTheme, preferredLightTheme };
    } catch {
      const preferredLightTheme: ThemeKey = 'brutal';
      return { currentTheme: isNightByTime() ? 'night' : preferredLightTheme, preferredLightTheme };
    }
  };

  const themeIds = Object.keys(THEMES) as ThemeKey[];
  const initial = loadInitialTheme();
  const [preferredLightTheme, setPreferredLightTheme] = useState<ThemeKey>(initial.preferredLightTheme);
  const [currentTheme, setCurrentTheme] = useState<ThemeKey>(initial.currentTheme);
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const [selectedOnly, setSelectedOnly] = useState(true);
  const [activeTypeFilter, setActiveTypeFilter] = useState<PubType | null>(null);
  const [activeYearFilter, setActiveYearFilter] = useState<YearFilter | null>(null);
  const [activeKeywords, setActiveKeywords] = useState<string[]>([]);
  const [keywordMatchMode, setKeywordMatchMode] = useState<'any' | 'all'>('any');
  const [topicsMenuOpen, setTopicsMenuOpen] = useState(false);
  const topicsMenuRef = useRef<HTMLDivElement | null>(null);
  const [expandedAbstractIds, setExpandedAbstractIds] = useState<number[]>([]);
  const [canHover, setCanHover] = useState<boolean>(false);

  const theme = THEMES[currentTheme];
  const preferredLightThemeRef = useRef(preferredLightTheme);
  const lastIsNightRef = useRef(isNightByTime());

  useEffect(() => {
    preferredLightThemeRef.current = preferredLightTheme;
  }, [preferredLightTheme]);

  useEffect(() => {
    if (currentTheme === 'night') return;
    try {
      window.localStorage.setItem('haozeng_theme', JSON.stringify({ preferredLightTheme: currentTheme }));
    } catch {
      // ignore
    }
  }, [currentTheme]);

  useEffect(() => {
    const maybeSwitchTheme = () => {
      const isNightNow = isNightByTime();
      if (isNightNow === lastIsNightRef.current) return;
      lastIsNightRef.current = isNightNow;
      setCurrentTheme(isNightNow ? 'night' : preferredLightThemeRef.current);
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
  const applyTheme = (nextTheme: ThemeKey) => {
    setCurrentTheme(nextTheme);
    if (nextTheme !== 'night') {
      setPreferredLightTheme(nextTheme);
    }
  };

  const cycleTheme = () => {
    const currentIndex = themeIds.indexOf(currentTheme);
    const nextTheme = themeIds[(currentIndex + 1) % themeIds.length];
    applyTheme(nextTheme);
  };

  const publicationsAfterRightFilters = useMemo(() => {
    let publications = HAO_DATA.publications;

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
  }, [selectedOnly, activeTypeFilter, activeYearFilter]);

  const publicationsAfterYearAndTopics = useMemo(() => {
    let publications = HAO_DATA.publications;

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
  }, [activeYearFilter, activeKeywords, keywordMatchMode]);

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

    const counts: Record<'Journal' | 'Conference' | 'Preprint' | 'Software', number> = {
      Journal: 0,
      Conference: 0,
      Preprint: 0,
      Software: 0,
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
      return b.id - a.id;
    });
  }, [filteredPublications]);

  // 导航项
  const navItems = [
    { label: 'About', href: '#about' },
    { label: 'News', href: '#news' },
    { label: 'Publications', href: '#publications' },
    { label: 'Teaching', href: '#teaching' },
    { label: 'Seminar', href: '#seminar' },
    { label: 'Talks', href: '#talks' },
    { label: 'Service', href: '#service' },
  ];

  return (
    <div className={`min-h-screen ${theme.bg} ${theme.text} ${theme.font} transition-colors duration-500`}>
      {/* 导航栏 - 参考项目的简洁风格 */}
      <nav className={`sticky top-0 z-40 w-full border-b ${theme.border} ${theme.navBg} backdrop-blur-md transition-colors duration-300`}>
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <a href="#about" className="flex items-center gap-2 group">
            <span className={`text-lg font-bold font-serif ${theme.text}`}>
              {HAO_DATA.profile.name} <span className={theme.textMuted}>{HAO_DATA.profile.cnName}</span>
            </span>
          </a>

          {/* 桌面导航 */}
          <div className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <a 
                key={item.label} 
                href={item.href}
                className={`text-sm font-medium ${theme.textMuted} hover:${theme.text} transition-colors`}
              >
                {item.label}
              </a>
            ))}
            
            {/* 主题切换 */}
            <div
              className="relative ml-4"
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
          </div>

          {/* 移动端菜单按钮 */}
          <div className="md:hidden flex items-center gap-2">
            <button 
              onClick={cycleTheme}
              className={`p-2 ${theme.textMuted}`}
            >
              <Palette size={20} />
            </button>
            <button 
              className={`p-2 ${theme.textMuted}`}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        {/* 移动端菜单 */}
        {mobileMenuOpen && (
          <div className={`md:hidden ${theme.bg} border-b ${theme.border} px-4 py-4 space-y-2`}>
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
                  <p className={`text-base italic ${currentTheme === 'night' ? 'text-slate-500' : 'text-slate-400'} mb-3`}>
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
                  className={`text-lg leading-relaxed max-w-3xl text-justify-hyphen ${currentTheme === 'night' ? 'text-slate-300' : 'text-slate-700'}`}
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
                  <div className={`absolute left-[-5px] top-1 h-2.5 w-2.5 rounded-full ${theme.accentBg} ring-4 ${currentTheme === 'night' ? 'ring-[#1E293B]' : currentTheme === 'lab' ? 'ring-slate-100' : currentTheme === 'mint' ? 'ring-[#EDF3FF]' : currentTheme === 'brutal' ? 'ring-white' : 'ring-[#F5F3ED]'}`}></div>
                  <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4">
                    <span className={`text-sm font-bold ${theme.textMuted} min-w-[80px] font-sans`}>{item.date}</span>
                    <p 
                      className={`text-base ${currentTheme === 'night' ? 'text-slate-300' : 'text-slate-700'}`}
                      dangerouslySetInnerHTML={{
                        __html: item.content.replace(
                          /\*\*(.*?)\*\*/g, 
                          `<strong class="font-bold ${theme.text} ${theme.highlight} px-1 rounded-sm">$1</strong>`
                        )
                      }} 
                    />
                  </div>
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
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
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
                  <div className="flex flex-col gap-2">
                    <div className="flex flex-wrap gap-2 font-sans items-center">
                      <button
                        type="button"
                        onClick={() => setSelectedOnly(v => !v)}
                        className={`relative inline-flex items-center rounded-full border ${theme.border} ${theme.cardBg} overflow-hidden transition-all`}
                        aria-pressed={selectedOnly}
                      >
                        <span
                          className={`px-4 py-1.5 text-xs font-bold tracking-wide uppercase transition-colors ${selectedOnly ? `${theme.accentBg} text-white` : theme.textMuted}`}
                        >
                          Selected ({selectedAllCounts.selected})
                        </span>
                        <span
                          className={`px-4 py-1.5 text-xs font-bold tracking-wide uppercase transition-colors ${selectedOnly ? theme.textMuted : `${theme.accentBg} text-white`}`}
                        >
                          All ({selectedAllCounts.all})
                        </span>
                      </button>

                      {(['Journal', 'Conference', 'Preprint', 'Software'] as const).map(filter => (
                        <button
                          key={filter}
                          type="button"
                          onClick={() => setActiveTypeFilter(prev => (prev === filter ? null : filter))}
                          className={`px-3 py-1.5 rounded-full text-xs font-bold tracking-wide uppercase transition-all
                            ${activeTypeFilter === filter
                              ? `${theme.accentBg} text-white shadow-md`
                              : `${theme.cardBg} border ${theme.border} ${theme.textMuted} hover:border-slate-400`}`}
                        >
                          {filter} ({typeCounts[filter]})
                        </button>
                      ))}

                      <button
                        type="button"
                        onClick={clearFilters}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold tracking-wide uppercase transition-all border ${theme.border} ${theme.cardBg} ${theme.textMuted} hover:border-slate-400 inline-flex items-center gap-2`}
                        title="Clear filters"
                      >
                        <RotateCcw size={14} />
                        Clear
                      </button>
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
                      className={`group relative pl-4 border-l-2 ${theme.border} hover:border-current transition-colors duration-300`}
                    >
                      <h3 className={`text-xl font-semibold ${theme.text} group-hover:${theme.accent} transition-colors`}>
                        <span
                          className={`font-sans font-bold mr-2 ${
                            !selectedOnly && pub.selected ? 'text-[#8B0000]' : theme.textMuted
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
                      <div className={`mt-1 ${currentTheme === 'night' ? 'text-slate-300' : 'text-slate-600'}`}>
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
                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                          pub.type === 'Conference' ? theme.badgeConf : 
                          pub.type === 'Journal' ? theme.badgeJournal : 
                          pub.type === 'Software' ? theme.badgeSoft : theme.badgePre
                        }`}>
                          {pub.type}
                        </span>
                        <span className={`font-medium italic ${theme.textMuted}`}>{pub.venue}</span>
                        <span className={theme.textMuted}>({pub.year})</span>
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
                            <p className={`text-sm ${currentTheme === 'night' ? 'text-slate-300' : 'text-slate-700'}`}>
                              {pub.abs}
                            </p>
                          </div>
                          {expandedAbstractIds.includes(pub.id) && (
                            <div className={`${canHover ? 'hidden' : ''} mt-3 p-3 rounded-lg border ${theme.border} ${theme.cardBg} shadow-sm`}>
                              <p className={`text-sm ${currentTheme === 'night' ? 'text-slate-300' : 'text-slate-700'}`}>
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
                    <p className={`mt-auto pt-4 border-t ${theme.border} ${currentTheme === 'night' ? 'text-slate-300' : 'text-slate-600'} text-sm leading-relaxed`}>
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
                    <p className={`mt-auto pt-4 border-t ${theme.border} ${currentTheme === 'night' ? 'text-slate-300' : 'text-slate-600'} text-sm leading-relaxed`}>
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
            <div className={`space-y-0 border-l ${theme.border} ml-3`}>
              {HAO_DATA.talks.filter(talk => talk.show !== false).map((talk) => (
                <div key={talk.id} className="relative pl-8 pb-8 last:pb-0">
                  <div className={`absolute left-[-5px] top-1.5 h-2.5 w-2.5 rounded-full ${theme.accentBg} ring-4 ${currentTheme === 'night' ? 'ring-[#1E293B]' : currentTheme === 'lab' ? 'ring-slate-100' : currentTheme === 'mint' ? 'ring-[#EDF3FF]' : currentTheme === 'brutal' ? 'ring-white' : 'ring-[#F5F3ED]'}`}></div>
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
                    <Award size={18} className={theme.accent}/> {s.type}
                  </h3>
                  <ul className="space-y-2">
                    {s.items.map((item, idx) => (
                      <li key={idx} className={`text-sm ${currentTheme === 'night' ? 'text-slate-300' : 'text-slate-600'} flex items-start gap-2`}>
                        <span className={`${theme.textMuted} mt-1`}>•</span> 
                        <span>{item}</span>
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
          <p>&copy; 2025 Hao Zeng. All rights reserved.</p>
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
