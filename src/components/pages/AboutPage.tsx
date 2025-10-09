import React from 'react';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '../ui/breadcrumb';
import { Link } from '../Router';
import { Users, Award, Globe, Clock, Shield, Target } from 'lucide-react';

export function AboutPage() {
  const teamMembers = [
    {
      name: "Sarah Martinez",
      role: "Editor-in-Chief",
      experience: "15 years in journalism",
      specialty: "Investigative Reporting"
    },
    {
      name: "Michael Chen",
      role: "Senior Political Correspondent",
      experience: "12 years covering politics",
      specialty: "Government Affairs"
    },
    {
      name: "Dr. Emily Rodriguez",
      role: "Health & Science Editor",
      experience: "10 years medical journalism",
      specialty: "Healthcare Policy"
    },
    {
      name: "James Thompson",
      role: "Sports Director",
      experience: "8 years sports coverage",
      specialty: "International Sports"
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

  const achievements = [
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
              <Link to="/">Home</Link>
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
            Your trusted source for comprehensive news coverage, delivering accurate, timely, and unbiased journalism to millions of readers worldwide.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-3xl font-bold text-red-600 mb-2">2019</div>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">Get In Touch</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Editorial</h3>
            <p className="text-gray-600 dark:text-gray-300">editorial@news4us.com</p>
            <p className="text-gray-600 dark:text-gray-300">+1 (555) 123-4567</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Advertising</h3>
            <p className="text-gray-600 dark:text-gray-300">ads@news4us.com</p>
            <p className="text-gray-600 dark:text-gray-300">+1 (555) 123-4568</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Support</h3>
            <p className="text-gray-600 dark:text-gray-300">support@news4us.com</p>
            <p className="text-gray-600 dark:text-gray-300">+1 (555) 123-4569</p>
          </div>
        </div>
      </div>
    </div>
  );
}