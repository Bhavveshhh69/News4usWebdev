import React, { createContext, useContext, useEffect, useState } from 'react';

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
  isMiniPlayer?: boolean; // Add this field to mark video for mini player
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
  addArticle: (a: ArticleItem) => Promise<void>;
  updateArticle: (a: ArticleItem) => Promise<void>;
  deleteArticle: (id: string) => Promise<void>;
  addTag: (t: string) => void;
  addEPaper: (epaper: EPaperItem) => void;
  deleteEPaper: (id: string) => void;
  addYouTubeVideo: (video: YouTubeVideo) => Promise<void>;
  updateYouTubeVideo: (video: YouTubeVideo) => Promise<void>;
  deleteYouTubeVideo: (id: string) => Promise<void>;
  setMiniPlayerVideo: (id: string) => Promise<void>;
  clearMiniPlayerVideo: () => Promise<void>;
  setMiniPlayerEnabled: (enabled: boolean) => void;
  setBreakingItems: (items: string[]) => void;
  addBreakingItem: (text: string) => void;
  removeBreakingItem: (index: number) => void;
  updateBreakingItem: (index: number, text: string) => void;
  setBreakingSpeed: (ms: number) => void;
  setBreakingPause: (v: boolean) => void;
  setHomePageContent: (content: HomePageContent) => void;
  isLoading: boolean;
  error: string | null;
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

const seedYouTubeVideos: YouTubeVideo[] = [
  {
    id: 'yt-1',
    title: "Breaking: Global Climate Summit Reaches Historic Agreement",
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  },
  {
    id: 'yt-2',
    title: "LIVE: Tech Market Analysis - AI Stocks Surge",
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  },
  {
    id: 'yt-3',
    title: "Healthcare Breakthrough: New Cancer Treatment",
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  },
  {
    id: 'yt-4',
    title: "Championship Final Highlights",
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  },
  {
    id: 'yt-5',
    title: "Celebrity Award Show Behind The Scenes",
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  },
  {
    id: 'yt-6',
    title: "Political Debate Analysis",
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  },
  {
    id: '1',
    title: 'My Latest YouTube Upload',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
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

const STORAGE_KEY = 'contentStore_v1';
// ✅ ROBUST: Use Vite environment variables for production-ready configuration
const API_BASE = (import.meta as any).env?.VITE_API_BASE_URL || '/api';

const ContentContext = createContext(null as any);

export function ContentProvider({ children }: { children?: any }) {
  const [articles, setArticles] = useState([]);
  const [tags, setTags] = useState(defaultTags);
  const [epapers, setEPapers] = useState(seedEPapers);
  const [youtubeVideos, setYouTubeVideos] = useState([]);
  const [miniPlayerEnabled, setMiniPlayerEnabledState] = useState(true);
  const [breakingItems, setBreakingItemsState] = useState(defaultBreaking);
  const [breakingSpeedMs, setBreakingSpeedMs] = useState(22000);
  const [breakingPauseOnHover, setBreakingPauseOnHover] = useState(true);
  const [homePageContent, setHomePageContentState] = useState(defaultHomePageContent);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch data from backend on component mount
  useEffect(() => {
    fetchDataFromBackend();
  }, []);

  const fetchDataFromBackend = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Cookies are sent automatically - no need for token retrieval

      // Fetch articles with automatic cookie authentication
      try {
        const articlesResponse = await fetch(`${API_BASE}/articles`);
        if (articlesResponse.ok) {
          const articlesData = await articlesResponse.json();
          // Transform backend data to match frontend structure
          const transformedArticles = articlesData.articles.map((article: any) => ({
            id: article.id.toString(),
            title: article.title,
            summary: article.summary,
            content: article.content,
            imageUrl: '', // Will need to be set properly
            category: article.category_name || 'News',
            tags: article.tags ? article.tags.map((tag: any) => tag.name) : [],
            author: article.author_name || '',
            publishDate: article.published_at ? article.published_at.split('T')[0] : new Date().toISOString().split('T')[0],
            readTime: '5 min read', // Default value
            views: article.views || 0,
            status: article.status || 'draft',
            slug: article.title ? article.title.toLowerCase().replace(/\s+/g, '-') : '',
            placements: { 
              homeHero: article.is_featured || false, 
              homeSection: article.category_name || 'News', 
              categorySpot: 'none' 
            }
          }));
          setArticles(transformedArticles);
        } else {
          console.error('Failed to fetch articles:', articlesResponse.status, articlesResponse.statusText);
        }
      } catch (err) {
        console.error('Failed to fetch articles:', err);
      }

      // Fetch categories
      try {
        const categoriesResponse = await fetch(`${API_BASE}/categories`);
        // Handle categories if needed
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      }

      // Fetch tags
      try {
        const tagsResponse = await fetch(`${API_BASE}/tags`);
        // Handle tags if needed
      } catch (err) {
        console.error('Failed to fetch tags:', err);
      }

      // For now, keep YouTube videos and other content in localStorage
      // In a full implementation, these would also be fetched from backend
      loadSupplementaryDataFromLocalStorage();
    } catch (error) {
      console.error('Failed to fetch data from backend:', error);
      setError('Failed to load content from server');
      // Fallback to localStorage
      loadFromLocalStorage();
    } finally {
      setIsLoading(false);
    }
  };

  const loadSupplementaryDataFromLocalStorage = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setEPapers(parsed.epapers || seedEPapers);
        setYouTubeVideos(parsed.youtubeVideos || seedYouTubeVideos);
        setMiniPlayerEnabledState(parsed.miniPlayerEnabled ?? true);
        setBreakingItemsState(parsed.breakingItems || defaultBreaking);
        setBreakingSpeedMs(parsed.breakingSpeedMs || 22000);
        setBreakingPauseOnHover(parsed.breakingPauseOnHover ?? true);
        setHomePageContentState(parsed.homePageContent || defaultHomePageContent);
      } else {
        setEPapers(seedEPapers);
        setYouTubeVideos(seedYouTubeVideos);
        setMiniPlayerEnabledState(true);
        setHomePageContentState(defaultHomePageContent);
      }
    } catch (err) {
      console.error('Failed to load supplementary data from localStorage:', err);
      setEPapers(seedEPapers);
      setYouTubeVideos(seedYouTubeVideos);
      setMiniPlayerEnabledState(true);
      setHomePageContentState(defaultHomePageContent);
    }
  };

  const loadFromLocalStorage = () => {
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
      setMiniPlayerEnabledState(true);
      setHomePageContentState(defaultHomePageContent);
    }
  };

  // Persist supplementary data to localStorage
  useEffect(() => {
    try {
      const payload = { 
        // NOTE: We intentionally do NOT persist articles here as they come from backend
        tags,
        epapers,
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
  }, [tags, epapers, youtubeVideos, breakingItems, breakingSpeedMs, breakingPauseOnHover, homePageContent]);

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

  const addArticle = async (a: ArticleItem) => {
    try {
      // Transform frontend data to backend format
      const backendArticle = {
        title: a.title,
        summary: a.summary,
        content: a.content,
        categoryId: 1, // Default category ID, should be properly mapped
        tags: a.tags,
        status: a.status,
        isFeatured: a.placements?.homeHero
      };

      const response = await fetch(`${API_BASE}/articles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
          // Authorization handled by HTTP-only cookies
        },
        body: JSON.stringify(backendArticle)
      });

      if (response.ok) {
        const result = await response.json();
        // Transform backend response to frontend format
        const newArticle = {
          id: result.article.id.toString(),
          title: result.article.title,
          summary: result.article.summary,
          content: result.article.content,
          imageUrl: '',
          category: result.article.category_name || 'News',
          tags: result.article.tags ? result.article.tags.map((tag) => tag.name) : [],
          author: result.article.author_name || '',
          publishDate: result.article.published_at ? result.article.published_at.split('T')[0] : new Date().toISOString().split('T')[0],
          readTime: '5 min read', // Default value
          views: result.article.views || 0,
          status: result.article.status || 'draft',
          slug: result.article.title ? result.article.title.toLowerCase().replace(/\s+/g, '-') : '',
          placements: { 
            homeHero: result.article.is_featured || false, 
            homeSection: result.article.category_name || 'News', 
            categorySpot: 'none' 
          }
        };
        setArticles([...articles, newArticle]);
        return newArticle;
      } else {
        const errorText = await response.text();
        console.error('Failed to create article:', response.status, response.statusText, errorText);
        throw new Error(`Failed to create article: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error('Failed to add article:', error);
      setError('Failed to add article');
      // Fallback to local state update
      setArticles([...articles, a]);
      throw error;
    }
  };

  const updateArticle = async (a: ArticleItem) => {
    try {
      // Transform frontend data to backend format
      const backendArticle = {
        title: a.title,
        summary: a.summary,
        content: a.content,
        categoryId: 1, // Default category ID, should be properly mapped
        tags: a.tags,
        status: a.status,
        isFeatured: a.placements?.homeHero
      };

      const response = await fetch(`${API_BASE}/articles/${a.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
          // Authorization handled by HTTP-only cookies
        },
        body: JSON.stringify(backendArticle)
      });

      if (response.ok) {
        const result = await response.json();
        // Transform backend response to frontend format
        const updatedArticle = {
          id: result.article.id.toString(),
          title: result.article.title,
          summary: result.article.summary,
          content: result.article.content,
          imageUrl: '',
          category: result.article.category_name || 'News',
          tags: result.article.tags ? result.article.tags.map((tag) => tag.name) : [],
          author: result.article.author_name || '',
          publishDate: result.article.published_at ? result.article.published_at.split('T')[0] : new Date().toISOString().split('T')[0],
          views: result.article.views || 0,
          status: result.article.status || 'draft',
          slug: result.article.title ? result.article.title.toLowerCase().replace(/\s+/g, '-') : '',
          placements: { 
            homeHero: result.article.is_featured || false, 
            homeSection: result.article.category_name || 'News', 
            categorySpot: 'none' 
          }
        };
        setArticles(articles.map(item => item.id === a.id ? updatedArticle : item));
      } else {
        throw new Error('Failed to update article');
      }
    } catch (error) {
      console.error('Failed to update article:', error);
      setError('Failed to update article');
      // Fallback to local state update
      setArticles(articles.map(item => item.id === a.id ? a : item));
    }
  };

  const deleteArticle = async (id: string) => {
    try {
      const response = await fetch(`${API_BASE}/articles/${id}`, {
        method: 'DELETE'
        // Authorization handled by HTTP-only cookies
      });

      if (response.ok) {
        setArticles(articles.filter(a => a.id !== id));
      } else {
        throw new Error('Failed to delete article');
      }
    } catch (error) {
      console.error('Failed to delete article:', error);
      setError('Failed to delete article');
      // Fallback to local state update
      setArticles(articles.filter(a => a.id !== id));
    }
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

  const addYouTubeVideo = async (video: YouTubeVideo) => {
    // For now, keep YouTube videos in localStorage
    // In a full implementation, this would be sent to backend
    setYouTubeVideos([...youtubeVideos, video]);
  };

  const updateYouTubeVideo = async (video: YouTubeVideo) => {
    // For now, keep YouTube videos in localStorage
    // In a full implementation, this would be sent to backend
    setYouTubeVideos(youtubeVideos.map(item => item.id === video.id ? video : item));
  };

  const deleteYouTubeVideo = async (id: string) => {
    // For now, keep YouTube videos in localStorage
    // In a full implementation, this would be sent to backend
    setYouTubeVideos(youtubeVideos.filter(v => v.id !== id));
  };

  const setMiniPlayerVideo = async (id: string) => {
    // For now, keep YouTube videos in localStorage
    // In a full implementation, this would be sent to backend
    setYouTubeVideos(youtubeVideos.map(video => ({
      ...video,
      isMiniPlayer: video.id === id
    })));
  };

  const clearMiniPlayerVideo = async () => {
    // For now, keep YouTube videos in localStorage
    // In a full implementation, this would be sent to backend
    setYouTubeVideos(youtubeVideos.map(video => ({
      ...video,
      isMiniPlayer: false
    })));
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
      setHomePageContent,
      isLoading,
      error
    }}>
      {children}
    </ContentContext.Provider>
  );
}

export function useContent() {
  return useContext(ContentContext);
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