import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Switch } from '../ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { useContent, HomePageContent } from '../../store/contentStore';

const defaultHomePageContent: HomePageContent = {
  heroSectionTitle: 'Featured Stories',
  heroSectionSubtitle: 'Latest updates from around the world',
  quickReadButtonText: 'Quick Read Mode',
  politicsSectionTitle: 'Politics',
  healthSectionTitle: 'Health',
  sportsSectionTitle: 'Sports',
  entertainmentSectionTitle: 'Entertainment',
};

export function HomePageEditor() {
  const { 
    breakingItems, 
    setBreakingItems, 
    breakingSpeedMs, 
    setBreakingSpeed, 
    breakingPauseOnHover, 
    setBreakingPause,
    homePageContent,
    setHomePageContent
  } = useContent();
  const [content, setContent] = useState<HomePageContent>(defaultHomePageContent);
  const [breakingNewsItems, setBreakingNewsItems] = useState<string[]>([]);
  const [tickerSpeed, setTickerSpeed] = useState(22000);
  const [tickerPauseOnHover, setTickerPauseOnHover] = useState(true);
  const [newTickerItem, setNewTickerItem] = useState('');

  // Initialize content from store
  useEffect(() => {
    setContent({
      heroSectionTitle: homePageContent.heroSectionTitle || defaultHomePageContent.heroSectionTitle,
      heroSectionSubtitle: homePageContent.heroSectionSubtitle || defaultHomePageContent.heroSectionSubtitle,
      quickReadButtonText: homePageContent.quickReadButtonText || defaultHomePageContent.quickReadButtonText,
      politicsSectionTitle: homePageContent.politicsSectionTitle || defaultHomePageContent.politicsSectionTitle,
      healthSectionTitle: homePageContent.healthSectionTitle || defaultHomePageContent.healthSectionTitle,
      sportsSectionTitle: homePageContent.sportsSectionTitle || defaultHomePageContent.sportsSectionTitle,
      entertainmentSectionTitle: homePageContent.entertainmentSectionTitle || defaultHomePageContent.entertainmentSectionTitle,
    });
    setBreakingNewsItems([...breakingItems]);
    setTickerSpeed(breakingSpeedMs);
    setTickerPauseOnHover(breakingPauseOnHover);
  }, [homePageContent, breakingItems, breakingSpeedMs, breakingPauseOnHover]);

  const handleSave = () => {
    setHomePageContent(content);
    setBreakingItems(breakingNewsItems);
    setBreakingSpeed(tickerSpeed);
    setBreakingPause(tickerPauseOnHover);
  };

  const addTickerItem = () => {
    if (newTickerItem.trim()) {
      setBreakingNewsItems([...breakingNewsItems, newTickerItem.trim()]);
      setNewTickerItem('');
    }
  };

  const removeTickerItem = (index: number) => {
    const newItems = [...breakingNewsItems];
    newItems.splice(index, 1);
    setBreakingNewsItems(newItems);
  };

  const updateTickerItem = (index: number, value: string) => {
    const newItems = [...breakingNewsItems];
    newItems[index] = value;
    setBreakingNewsItems(newItems);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Home Page Editor</h2>
        <Button onClick={handleSave}>Save Changes</Button>
      </div>

      <Tabs defaultValue="ticker" className="space-y-6">
        <TabsList>
          <TabsTrigger value="ticker">Breaking News Ticker</TabsTrigger>
          <TabsTrigger value="sections">Section Titles</TabsTrigger>
          <TabsTrigger value="hero">Hero Section</TabsTrigger>
        </TabsList>

        <TabsContent value="ticker" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Breaking News Ticker</CardTitle>
              <CardDescription>Manage the scrolling news ticker at the top of the homepage</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={newTickerItem}
                  onChange={(e) => setNewTickerItem(e.target.value)}
                  placeholder="Enter breaking news item"
                />
                <Button onClick={addTickerItem}>Add Item</Button>
              </div>

              <div className="space-y-2">
                {breakingNewsItems.map((item, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={item}
                      onChange={(e) => updateTickerItem(index, e.target.value)}
                    />
                    <Button variant="destructive" onClick={() => removeTickerItem(index)}>Remove</Button>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                <div className="flex items-center space-x-2">
                  <Label htmlFor="ticker-speed">Ticker Speed (ms)</Label>
                  <Input
                    id="ticker-speed"
                    type="number"
                    value={tickerSpeed}
                    onChange={(e) => setTickerSpeed(Number(e.target.value))}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Label htmlFor="ticker-pause">Pause on Hover</Label>
                  <Switch
                    id="ticker-pause"
                    checked={tickerPauseOnHover}
                    onCheckedChange={(checked) => setTickerPauseOnHover(checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sections" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Section Titles</CardTitle>
              <CardDescription>Edit the titles for each content section</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="politics-title">Politics Section Title</Label>
                  <Input
                    id="politics-title"
                    value={content.politicsSectionTitle}
                    onChange={(e) => setContent({...content, politicsSectionTitle: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="health-title">Health Section Title</Label>
                  <Input
                    id="health-title"
                    value={content.healthSectionTitle}
                    onChange={(e) => setContent({...content, healthSectionTitle: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sports-title">Sports Section Title</Label>
                  <Input
                    id="sports-title"
                    value={content.sportsSectionTitle}
                    onChange={(e) => setContent({...content, sportsSectionTitle: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="entertainment-title">Entertainment Section Title</Label>
                  <Input
                    id="entertainment-title"
                    value={content.entertainmentSectionTitle}
                    onChange={(e) => setContent({...content, entertainmentSectionTitle: e.target.value})}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hero" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Hero Section</CardTitle>
              <CardDescription>Edit the hero section content</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="hero-title">Hero Title</Label>
                <Input
                  id="hero-title"
                  value={content.heroSectionTitle}
                  onChange={(e) => setContent({...content, heroSectionTitle: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hero-subtitle">Hero Subtitle</Label>
                <Textarea
                  id="hero-subtitle"
                  value={content.heroSectionSubtitle}
                  onChange={(e) => setContent({...content, heroSectionSubtitle: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quickread-text">Quick Read Button Text</Label>
                <Input
                  id="quickread-text"
                  value={content.quickReadButtonText}
                  onChange={(e) => setContent({...content, quickReadButtonText: e.target.value})}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}