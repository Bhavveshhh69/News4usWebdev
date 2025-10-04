import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type ArticleStatus = 'draft' | 'scheduled' | 'published' | 'archived';

export interface ArticlePlacements {
  homeHero?: boolean;
  homeSection?: string; // Category name or ''
  categorySpot?: 'featured' | 'grid' | 'none';
}

export interface EPaperItem {
  id: string;
  title: string;
  uploadDate: string; // YYYY-MM-DD
  fileUrl: string; // data URL or a server path
}

export interface HomePageContent {
  heroSectionTitle: string;
  heroSectionSubtitle: string;
  quickReadButtonText: string;
  politicsSectionTitle: string;
  healthSectionTitle: string;
  sportsSectionTitle: string;
  entertainmentSectionTitle: string;
}

export interface YouTubeVideo {
  id: string;
  title: string;
  videoUrl: string;
  isMiniPlayer?: boolean;
}

export interface ArticleItem {
  id: string;
  title: string;
  summary: string;
  content?: string; // HTML string
  imageUrl: string;
  category: string; // e.g., Politics, Health
  tags: string[];
  author?: string;
  publishDate: string; // YYYY-MM-DD
  readTime?: string;
  views?: number;
  status?: ArticleStatus;
  slug?: string;
  placements?: ArticlePlacements;
}

interface ContentContextValue {
  articles: ArticleItem[];
  categories: string[];
  tags: string[];
  epapers: EPaperItem[];
  youtubeVideos: YouTubeVideo[];
  miniPlayerEnabled: boolean;
  breakingItems: string[];
  breakingSpeedMs: number;
  breakingPauseOnHover: boolean;
  homePageContent: HomePageContent;
  addArticle: (a: ArticleItem) => void;
  updateArticle: (a: ArticleItem) => void;
  deleteArticle: (id: string) => void;
  addTag: (t: string) => void;
  addEPaper: (epaper: EPaperItem) => void;
  deleteEPaper: (id: string) => void;
  addYouTubeVideo: (video: YouTubeVideo) => void;
  updateYouTubeVideo: (video: YouTubeVideo) => void;
  deleteYouTubeVideo: (id: string) => void;
  setMiniPlayerVideo: (id: string) => void;
  clearMiniPlayerVideo: () => void;
  setMiniPlayerEnabled: (enabled: boolean) => void;
  setBreakingItems: (items: string[]) => void;
  addBreakingItem: (text: string) => void;
  removeBreakingItem: (index: number) => void;
  updateBreakingItem: (index: number, text: string) => void;
  setBreakingSpeed: (ms: number) => void;
  setBreakingPause: (v: boolean) => void;
  setHomePageContent: (content: HomePageContent) => void;
}

const defaultCategories = ['News', 'Politics', 'Health', 'Sports', 'Entertainment', 'Technology', 'Business'];
const defaultTags = ['Breaking', 'Analysis', 'Opinion', 'Interview', 'Exclusive', 'Research'];
const defaultBreaking = [
  'Breaking: Election results live updates',
  'Tech: New AI model announced',
  'Markets: Indices rally on earnings beat',
];

const defaultHomePageContent: HomePageContent = {
  heroSectionTitle: 'Featured Stories',
  heroSectionSubtitle: 'Latest updates from around the world',
  quickReadButtonText: 'Quick Read Mode',
  politicsSectionTitle: 'Politics',
  healthSectionTitle: 'Health',
  sportsSectionTitle: 'Sports',
  entertainmentSectionTitle: 'Entertainment',
};

const seedEPapers: EPaperItem[] = [
  {
    id: 'epaper-2024-01-22',
    title: 'Monday Edition - January 22, 2024',
    uploadDate: '2024-01-22',
    fileUrl: '/sample-epaper.pdf'
  },
  {
    id: 'epaper-2024-01-21',
    title: 'Sunday Edition - January 21, 2024',
    uploadDate: '2024-01-21',
    fileUrl: '/sample-epaper.pdf'
  }
];

const seedArticles: ArticleItem[] = [
  {
    id: 'p-1',
    title: 'Senate Passes Landmark Infrastructure Bill',
    summary: 'Historic bipartisan legislation includes major investments in transportation, broadband, and clean energy infrastructure.',
    content: '<p>Full article content here...</p>',
    imageUrl: 'https://images.unsplash.com/photo-1740645580404-3a58c3b98182?auto=format&fit=crop&w=1280&q=80',
    category: 'Politics',
    tags: ['Breaking', 'Analysis'],
    author: 'Sarah Martinez',
    publishDate: '2024-01-20',
    readTime: '6 min read',
    views: 15420,
    status: 'published',
    slug: 'senate-passes-infrastructure-bill',
    placements: { homeHero: true, homeSection: 'Politics', categorySpot: 'featured' }
  },
  {
    id: 'h-1',
    title: 'Revolutionary Cancer Treatment Shows Promise',
    summary: 'Clinical trials demonstrate significant improvement in patient outcomes using innovative immunotherapy approach.',
    content: '<p>Revolutionary treatment shows promise...</p>',
    imageUrl: 'https://images.unsplash.com/photo-1618498082410-b4aa22193b38?auto=format&fit=crop&w=1280&q=80',
    category: 'Health',
    tags: ['Research'],
    author: 'Dr. Emily Rodriguez',
    publishDate: '2024-01-21',
    readTime: '8 min read',
    views: 0,
    status: 'scheduled',
    slug: 'cancer-treatment-breakthrough',
    placements: { homeSection: 'Health', categorySpot: 'grid' }
  },
  {
    id: 's-1',
    title: 'Championship Finals Break Attendance Records',
    summary: 'Historic match draws largest crowd in stadium history as fans witness thrilling playoff conclusion.',
    content: '<p>Draft content...</p>',
    imageUrl: 'https://images.unsplash.com/photo-1631746410377-b0e23f61d083?auto=format&fit=crop&w=1280&q=80',
    category: 'Sports',
    tags: ['Breaking'],
    author: 'James Thompson',
    publishDate: '2024-01-22',
    readTime: '5 min read',
    views: 0,
    status: 'draft',
    slug: 'championship-finals-preview',
    placements: { homeSection: 'Sports', categorySpot: 'grid' }
  },
  {
    id: 'e-1',
    title: 'Award Season Highlights Industry Excellence',
    summary: 'Annual ceremony celebrates outstanding achievements in film, television, and digital entertainment platforms.',
    content: '<p>Entertainment awards content...</p>',
    imageUrl: 'https://images.unsplash.com/photo-1675295275119-b3ffe5448c9c?auto=format&fit=crop&w=1280&q=80',
    category: 'Entertainment',
    tags: ['Interview'],
    author: 'Alex Rivera',
    publishDate: '2024-01-21',
    readTime: '4 min read',
    views: 0,
    status: 'published',
    slug: 'award-season-highlights',
    placements: { homeSection: 'Entertainment', categorySpot: 'featured' }
  },
];

const seedYouTubeVideos: YouTubeVideo[] = [
  { id: 'yt-1', title: 'Breaking: Global Climate Summit Reaches Historic Agreement', videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
  { id: 'yt-2', title: 'LIVE: Tech Market Analysis - AI Stocks Surge', videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
  { id: 'yt-3', title: 'Healthcare Breakthrough: New Cancer Treatment', videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' }
];

const STORAGE_KEY = 'contentStore_v1';

const ContentContext = createContext(null as any);

export function ContentProvider({ children }: { children?: any }) {
  const [articles, setArticles] = useState([] as ArticleItem[]);
  const [tags, setTags] = useState(defaultTags as string[]);
  const [epapers, setEPapers] = useState(seedEPapers as EPaperItem[]);
  const [youtubeVideos, setYouTubeVideos] = useState(seedYouTubeVideos as YouTubeVideo[]);
  const [miniPlayerEnabled, setMiniPlayerEnabledState] = useState(true);
  const [breakingItems, setBreakingItemsState] = useState(defaultBreaking as string[]);
  const [breakingSpeedMs, setBreakingSpeedMs] = useState(22000);
  const [breakingPauseOnHover, setBreakingPauseOnHover] = useState(true);
  const [homePageContent, setHomePageContentState] = useState(defaultHomePageContent as HomePageContent);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setArticles(parsed.articles || seedArticles);
        setTags(parsed.tags || defaultTags);
        setEPapers(parsed.epapers || seedEPapers);
        setYouTubeVideos(parsed.youtubeVideos || seedYouTubeVideos);
        setMiniPlayerEnabledState(parsed.miniPlayerEnabled ?? true);
        setBreakingItemsState(parsed.breakingItems || defaultBreaking);
        setBreakingSpeedMs(parsed.breakingSpeedMs || 22000);
        setBreakingPauseOnHover(parsed.breakingPauseOnHover ?? true);
        setHomePageContentState(parsed.homePageContent || defaultHomePageContent);
      } else {
        setArticles(seedArticles);
        setTags(defaultTags);
        setEPapers(seedEPapers);
        setYouTubeVideos(seedYouTubeVideos);
        setMiniPlayerEnabledState(true);
        setHomePageContentState(defaultHomePageContent);
      }
    } catch {
      setArticles(seedArticles);
      setTags(defaultTags);
      setEPapers(seedEPapers);
      setYouTubeVideos(seedYouTubeVideos);
      setMiniPlayerEnabledState(true);
      setHomePageContentState(defaultHomePageContent);
    }
  }, []);

  useEffect(() => {
    try {
      const payload = { 
        articles, 
        tags, 
        // NOTE: We intentionally do NOT persist `epapers` here to avoid localStorage quota errors
        youtubeVideos,
        miniPlayerEnabled,
        breakingItems, 
        breakingSpeedMs, 
        breakingPauseOnHover,
        homePageContent
      };
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(payload)
      );
    } catch (err) {
      // Avoid crashing the app if localStorage quota is exceeded
      console.warn('Failed to persist content store to localStorage:', err);
    }
  }, [articles, tags, youtubeVideos, miniPlayerEnabled, breakingItems, breakingSpeedMs, breakingPauseOnHover, homePageContent]);

  const setBreakingItems = (items: string[]) => {
    setBreakingItemsState(items);
  };

  const addBreakingItem = (text: string) => {
    setBreakingItemsState([...breakingItems, text]);
  };

  const removeBreakingItem = (index: number) => {
    const newItems = [...breakingItems];
    newItems.splice(index, 1);
    setBreakingItemsState(newItems);
  };

  const updateBreakingItem = (index: number, text: string) => {
    const newItems = [...breakingItems];
    newItems[index] = text;
    setBreakingItemsState(newItems);
  };

  const setBreakingSpeed = (ms: number) => {
    setBreakingSpeedMs(ms);
  };

  const setBreakingPause = (v: boolean) => {
    setBreakingPauseOnHover(v);
  };

  const setHomePageContent = (content: HomePageContent) => {
    setHomePageContentState(content);
  };

  const addArticle = (a: ArticleItem) => {
    setArticles([...articles, a]);
  };

  const updateArticle = (a: ArticleItem) => {
    setArticles(articles.map(item => item.id === a.id ? a : item));
  };

  const deleteArticle = (id: string) => {
    setArticles(articles.filter(a => a.id !== id));
  };

  const addTag = (t: string) => {
    if (!tags.includes(t)) {
      setTags([...tags, t]);
    }
  };

  const addEPaper = (epaper: EPaperItem) => {
    setEPapers([...epapers, epaper]);
  };

  const deleteEPaper = (id: string) => {
    setEPapers(epapers.filter(e => e.id !== id));
  };

  const addYouTubeVideo = (video: YouTubeVideo) => {
    setYouTubeVideos([...youtubeVideos, video]);
  };

  const updateYouTubeVideo = (video: YouTubeVideo) => {
    setYouTubeVideos(youtubeVideos.map(v => v.id === video.id ? video : v));
  };

  const deleteYouTubeVideo = (id: string) => {
    setYouTubeVideos(youtubeVideos.filter(v => v.id !== id));
  };

  const setMiniPlayerVideo = (id: string) => {
    setYouTubeVideos(youtubeVideos.map(v => ({ ...v, isMiniPlayer: v.id === id })));
  };

  const clearMiniPlayerVideo = () => {
    setYouTubeVideos(youtubeVideos.map(v => ({ ...v, isMiniPlayer: false })));
  };

  const setMiniPlayerEnabled = (enabled: boolean) => {
    setMiniPlayerEnabledState(enabled);
  };

  return (
    <ContentContext.Provider value={{
      articles,
      categories: defaultCategories,
      tags,
      epapers,
      youtubeVideos,
      miniPlayerEnabled,
      breakingItems,
      breakingSpeedMs,
      breakingPauseOnHover,
      homePageContent,
      addArticle,
      updateArticle,
      deleteArticle,
      addTag,
      addEPaper,
      deleteEPaper,
      addYouTubeVideo,
      updateYouTubeVideo,
      deleteYouTubeVideo,
      setMiniPlayerVideo,
      clearMiniPlayerVideo,
      setMiniPlayerEnabled,
      setBreakingItems,
      addBreakingItem,
      removeBreakingItem,
      updateBreakingItem,
      setBreakingSpeed,
      setBreakingPause,
      setHomePageContent
    }}>
      {children}
    </ContentContext.Provider>
  );
}

export function useContent() {
  return useContext(ContentContext) as ContentContextValue;
}

export function timeAgoFrom(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  return `${Math.floor(diffInSeconds / 86400)} days ago`;
}


