import React from 'react';
import { BreakingNewsTicker } from "../BreakingNewsTicker";
import { BreakingTicker } from "../BreakingTicker";
import { HeroCarousel, Slide } from "../HeroCarousel";
import { ScrollReveal } from "../ScrollReveal";
import { HeroSection } from "../HeroSection";
import { LiveMarketUpdates } from "../LiveMarketUpdates";
import { VideoNews } from "../VideoNews";
import { CategorySection } from "../CategorySection";
import { Sidebar } from "../Sidebar";
import { Button } from "../ui/button";
import { FileText } from 'lucide-react';
import { useContent, timeAgoFrom } from "../../store/contentStore";

interface HomePageProps {
  isDarkMode: boolean;
  isQuickRead: boolean;
  setIsQuickRead: (value: boolean) => void;
}

export function HomePage({ isDarkMode, isQuickRead, setIsQuickRead }: HomePageProps) {
  const { articles, breakingItems, breakingSpeedMs, breakingPauseOnHover, homePageContent } = useContent();

  const published = articles.filter(a => (a.status === 'published') || (a.status === 'scheduled' && new Date(a.publishDate).getTime() <= Date.now()));
  const sorted = [...published].sort((a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime());

  const heroCandidates = sorted.filter(a => a.placements?.homeHero);
  const heroList = (heroCandidates.length > 0 ? heroCandidates : sorted.slice(0, 3)).slice(0, 3);
  const heroSlides: Slide[] = heroList.map(a => ({
    image: a.imageUrl || '',
    title: a.title,
    subtitle: a.summary || a.category
  }));

  const mapForSection = (cat: string) =>
    sorted.filter(a => {
      const section = (a.placements?.homeSection && a.placements?.homeSection !== 'none') ? a.placements?.homeSection : a.category;
      const key = String(section ?? '').toLowerCase();
      return key === cat.toLowerCase();
    }).slice(0, 6).map(a => ({
      title: a.title,
      summary: a.summary,
      imageUrl: a.imageUrl || '',
      category: String(a.category || '').toUpperCase(),
      timeAgo: timeAgoFrom(a.publishDate)
    }));

  const politicsArticles = mapForSection('Politics');
  const healthArticles = mapForSection('Health');
  const sportsArticles = mapForSection('Sports');
  const entertainmentArticles = mapForSection('Entertainment');

  return (
    <>
      {/* Old ticker kept for compatibility; new animated ticker below */}
      <BreakingNewsTicker />
      <BreakingTicker
        items={breakingItems}
        className="border-y border-red-700/30"
        speedMs={breakingSpeedMs}
        pauseOnHover={breakingPauseOnHover}
      />
      
      {/* Quick Read Mode Toggle */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <Button
          onClick={() => setIsQuickRead(!isQuickRead)}
          variant={isQuickRead ? "default" : "outline"}
          className={`${isQuickRead ? 'bg-red-600 hover:bg-red-700 text-white' : 'hover:bg-red-50 dark:hover:bg-red-900/20'}`}
        >
          <FileText className="w-4 h-4 mr-2" />
          {isQuickRead ? 'Exit Quick Read Mode' : homePageContent.quickReadButtonText}
        </Button>
      </div>

      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            <ScrollReveal>
              <HeroCarousel slides={heroSlides} />
            </ScrollReveal>
            <ScrollReveal>
              <HeroSection isQuickRead={isQuickRead} />
            </ScrollReveal>
            <LiveMarketUpdates />
            <VideoNews />
            
            <ScrollReveal>
              <CategorySection
              title={homePageContent.politicsSectionTitle}
              highlightColor="red"
              articles={politicsArticles}
              isQuickRead={isQuickRead}
              />
            </ScrollReveal>
            
            <ScrollReveal delayMs={100}>
              <CategorySection
              title={homePageContent.healthSectionTitle}
              highlightColor="teal"
              articles={healthArticles}
              isQuickRead={isQuickRead}
              />
            </ScrollReveal>
            
            <ScrollReveal delayMs={150}>
              <CategorySection
              title={homePageContent.sportsSectionTitle}
              highlightColor="green"
              articles={sportsArticles}
              isQuickRead={isQuickRead}
              />
            </ScrollReveal>
            
            <ScrollReveal delayMs={200}>
              <CategorySection
              title={homePageContent.entertainmentSectionTitle}
              highlightColor="purple"
              articles={entertainmentArticles}
              isQuickRead={isQuickRead}
              />
            </ScrollReveal>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <Sidebar />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}