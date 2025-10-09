import { StockData, YouTubeVideo, TrendingArticle } from '../types';

export const stockData: StockData[] = [
  { symbol: 'S&P 500', value: '4,567.89', change: '+0.51%', isPositive: true },
  { symbol: 'NASDAQ', value: '14,823.21', change: '+0.87%', isPositive: true },
  { symbol: 'DOW JONES', value: '34,123.45', change: '-0.32%', isPositive: false },
  { symbol: 'BITCOIN', value: '$45,678', change: '+2.15%', isPositive: true }
];

export const youtubeVideos: YouTubeVideo[] = [
  {
    title: "Breaking: Global Climate Summit Updates",
    thumbnail: "https://images.unsplash.com/photo-1650984661525-7e6b1b874e47?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxicmVha2luZyUyMG5ld3MlMjBuZXdzcm9vbXxlbnwxfHx8fDE3NTgwMTA4Nzd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    duration: "12:34"
  },
  {
    title: "Tech Market Analysis Today",
    thumbnail: "https://images.unsplash.com/photo-1645226880663-81561dcab0ae?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMHN0b2NrJTIwbWFya2V0JTIwY2hhcnRzfGVufDF8fHx8MTc1ODAxMDg3N3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    duration: "8:45"
  },
  {
    title: "Healthcare Breakthrough Report",
    thumbnail: "https://images.unsplash.com/photo-1618498082410-b4aa22193b38?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoZWFsdGhjYXJlJTIwbWVkaWNhbCUyMG5ld3N8ZW58MXx8fHwxNzU4MDEwODc2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    duration: "15:20"
  }
];

export const trendingArticles: TrendingArticle[] = [
  "Economic reforms reshape global markets",
  "Climate summit reaches historic agreement",
  "Technology breakthrough in AI research",
  "Sports championship breaks viewership records",
  "Entertainment industry shows strong recovery"
];

