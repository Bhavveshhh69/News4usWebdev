import React from 'react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { NewsCard } from './NewsCard';

interface HeroSectionProps {
  isQuickRead: boolean;
}

export function HeroSection({ isQuickRead }: HeroSectionProps) {
  const featuredStory = {
    title: "Global Economic Summit Reaches Historic Climate Agreement",
    summary: "World leaders from 195 countries have reached a groundbreaking consensus on climate action and economic recovery, marking a pivotal moment in international cooperation. The agreement includes unprecedented commitments to renewable energy investments and sustainable development goals.",
    imageUrl: "https://images.unsplash.com/photo-1650984661525-7e6b1b874e47?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxicmVha2luZyUyMG5ld3MlMjBuZXdzcm9vbXxlbnwxfHx8fDE3NTgwMTA4Nzd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    category: "WORLD NEWS",
    timeAgo: "2 hours ago"
  };

  const trendingStories = [
    {
      title: "Tech Giants Report Record Q4 Earnings",
      summary: "Major technology companies exceeded expectations with strong quarterly results.",
      imageUrl: "https://images.unsplash.com/photo-1645226880663-81561dcab0ae?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMHN0b2NrJTIwbWFya2V0JTIwY2hhcnRzfGVufDF8fHx8MTc1ODAxMDg3N3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      category: "BUSINESS",
      timeAgo: "4 hours ago"
    },
    {
      title: "Healthcare Innovation Breakthrough",
      summary: "Revolutionary treatment shows promising results in clinical trials.",
      imageUrl: "https://images.unsplash.com/photo-1618498082410-b4aa22193b38?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoZWFsdGhjYXJlJTIwbWVkaWNhbCUyMG5ld3N8ZW58MXx8fHwxNzU4MDEwODc2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      category: "HEALTH",
      timeAgo: "6 hours ago"
    },
    {
      title: "Championship Final Sets Records",
      summary: "Historic match draws largest viewership in sports history.",
      imageUrl: "https://images.unsplash.com/photo-1631746410377-b0e23f61d083?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzcG9ydHMlMjBzdGFkaXVtJTIwY3Jvd2R8ZW58MXx8fHwxNzU3OTQ0ODE4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      category: "SPORTS",
      timeAgo: "8 hours ago"
    }
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Featured Story */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            <div className="relative h-80">
              <ImageWithFallback
                src={featuredStory.imageUrl}
                alt={featuredStory.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4">
                <span className="bg-red-600 text-white px-3 py-1 rounded font-medium">
                  {featuredStory.category}
                </span>
              </div>
            </div>
            <div className="p-6">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                {featuredStory.title}
              </h1>
              {isQuickRead ? (
                <div className="space-y-2 mb-4">
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-red-600 rounded-full mt-1.5 flex-shrink-0"></div>
                    <p className="text-gray-600 dark:text-gray-300">195 countries reach climate consensus at global summit</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-red-600 rounded-full mt-1.5 flex-shrink-0"></div>
                    <p className="text-gray-600 dark:text-gray-300">Unprecedented renewable energy investment commitments announced</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-red-600 rounded-full mt-1.5 flex-shrink-0"></div>
                    <p className="text-gray-600 dark:text-gray-300">Implementation timeline set for sustainable development goals</p>
                  </div>
                </div>
              ) : (
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  {featuredStory.summary}
                </p>
              )}
              <p className="text-sm text-gray-500 dark:text-gray-400">{featuredStory.timeAgo}</p>
            </div>
          </div>
        </div>

        {/* Trending Stories */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Trending Now</h2>
          {trendingStories.map((story, index) => (
            <NewsCard
              key={index}
              title={story.title}
              summary={story.summary}
              imageUrl={story.imageUrl}
              category={story.category}
              timeAgo={story.timeAgo}
              size="small"
              isQuickRead={isQuickRead}
            />
          ))}
        </div>
      </div>
    </section>
  );
}