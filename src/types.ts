export interface NavigationItem {
  name: string;
  path: string;
}

export interface StockData {
  symbol: string;
  value: string;
  change: string;
  isPositive: boolean;
}

export interface YouTubeVideo {
  title: string;
  thumbnail: string;
  duration: string;
}

export type TrendingArticle = string;
