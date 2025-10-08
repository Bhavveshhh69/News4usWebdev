import React from 'react';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '../ui/breadcrumb';
import { Link } from '../Router';
import { Users, Award, Globe, Clock, Shield, Target, Youtube, Twitter, Facebook } from 'lucide-react';
import { useContent } from '../../store/contentStore';
const RLink: any = Link;

export function AboutPage() {
  const { articles } = useContent();
  
  // Get team members from articles with "team" category or tag
  const teamArticles = articles.filter(article => 
    article.category.toLowerCase().includes('team') || 
    article.tags.some(tag => tag.toLowerCase().includes('team'))
  );
  
  // Generate team members from articles or use fallback
  const teamMembers = teamArticles.length > 0 ? teamArticles.slice(0, 4).map(article => ({
    name: article.author || 'Staff Writer',
    role: article.title,
    experience: article.summary || 'Experienced journalist',
    specialty: article.tags.join(', ') || 'General Reporting'
  })) : [
    {
      name: "DR BM Sivaprasad",
      role: "CEO of NEWS4US and Newsforus newspaper",
      experience: "Ph.D, MJMC TT Mgm, MBA",
      specialty: ""
    },
    {
      name: "B T Vijay Kumar",
      role: "AP and Telangana Chief Incharge",
      experience: "LLB, MA",
      specialty: ""
    },
    {
      name: "S Bhavesh",
      role: "Lead Developer",
      experience: "B.Tech-Artificial Intelligence and Data Science",
      specialty: ""
    }
  ];

  const values = [
    {
      icon: Shield,
      title: "Integrity",
      description: "We maintain the highest standards of journalistic integrity and ethical reporting."
    },
    {
      icon: Clock,
      title: "Timeliness",
      description: "Breaking news delivered as it happens, with accuracy as our priority."
    },
    {
      icon: Globe,
      title: "Global Perspective",
      description: "Comprehensive coverage of local, national, and international news."
    },
    {
      icon: Target,
      title: "Accuracy",
      description: "Fact-checked reporting with multiple source verification."
    }
  ];

  // Get achievements from articles with "award" or "achievement" tags
  const achievementArticles = articles.filter(article => 
    article.tags.some(tag => 
      tag.toLowerCase().includes('award') || 
      tag.toLowerCase().includes('achievement') ||
      tag.toLowerCase().includes('recognition')
    )
  );
  
  // Generate achievements from articles or use fallback
  const achievements = achievementArticles.length > 0 ? achievementArticles.slice(0, 4).map(article => article.title) : [
    "Winner of 3 National Journalism Awards (2022-2024)",
    "Recognized for Excellence in Digital Media Innovation",
    "Best News Website Design Award 2023",
    "Press Freedom Excellence Award 2024"
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Breadcrumbs */}
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <RLink to="/">Home</RLink>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="font-semibold">About Us</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Hero Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">
            <span className="text-red-600">About NEWS</span>
            <span className="text-gray-900 dark:text-white">4US</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            News4us Channel gives you Latest and Updated Exclusive updates on 
            Andhra Pradesh & Telangana News Our site gives you Updated info on Telugu States Politics. And delivering all Latest News including Breaking News, Regional News, National and International News, Sports Updates, Entertainment, Business, Political, Crime, Movie Related news, Fashion Trends & Devotional Programs.
            Trades, stock market live updates and cricket live score updates exclusive 
            For More Latest Updates Connect With Us!!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-3xl font-bold text-red-600 mb-2">2012</div>
            <div className="text-gray-600 dark:text-gray-300">Founded</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-red-600 mb-2">50M+</div>
            <div className="text-gray-600 dark:text-gray-300">Monthly Readers</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-red-600 mb-2">24/7</div>
            <div className="text-gray-600 dark:text-gray-300">Coverage</div>
          </div>
        </div>
      </div>

      {/* Mission Statement */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-8">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Our Mission</h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-4xl mx-auto leading-relaxed">
            At NEWS4US, we are committed to delivering truth through journalism. Our mission is to inform, educate, and empower our readers with accurate, comprehensive, and timely news coverage that helps them make informed decisions about their lives and communities.
          </p>
        </div>
      </div>

      {/* Core Values */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">Our Core Values</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((value, index) => (
            <div key={index} className="text-center">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <value.icon className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{value.title}</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">{value.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Team Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">Leadership Team</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {teamMembers.map((member, index) => (
            <div key={index} className="text-center">
              <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Users className="w-12 h-12 text-gray-500 dark:text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{member.name}</h3>
              <p className="text-red-600 dark:text-red-400 font-medium mb-2">{member.role}</p>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">{member.experience}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{member.specialty}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Achievements */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">Awards & Recognition</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {achievements.map((achievement, index) => (
            <div key={index} className="flex items-center space-x-3">
              <Award className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0" />
              <span className="text-gray-700 dark:text-gray-300">{achievement}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Contact Information */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">Get In Touch</h2>
        <div className="text-center">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Email</h3>
            <p className="text-gray-600 dark:text-gray-300">newsforus.in@gmail.com</p>
          </div>
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Phone</h3>
            <p className="text-gray-600 dark:text-gray-300">9054712345, 9059788886</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Tech Support</h3>
            <p className="text-gray-600 dark:text-gray-300">9394754329</p>
          </div>
        </div>
      </div>

      {/* Social Media Links */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">Follow Us</h2>
        <div className="flex justify-center space-x-8">
          <a href="http://www.youtube.com/@News4Us" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center">
            <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center mb-2">
              <Youtube className="text-white" size={24} />
            </div>
            <span className="text-gray-700 dark:text-gray-300 font-medium">YouTube</span>
          </a>
          <a href="https://twitter.com/news_4us" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center">
            <div className="w-12 h-12 bg-blue-400 rounded-full flex items-center justify-center mb-2">
              <Twitter className="text-white" size={24} />
            </div>
            <span className="text-gray-700 dark:text-gray-300 font-medium">Twitter</span>
          </a>
          <a href="https://www.fb.com/news4us" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mb-2">
              <Facebook className="text-white" size={24} />
            </div>
            <span className="text-gray-700 dark:text-gray-300 font-medium">Facebook</span>
          </a>
        </div>
      </div>
    </div>
  );
}