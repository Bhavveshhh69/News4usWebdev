import React from 'react';
import { useContent } from '../../store/contentStore';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Download, BookOpen } from 'lucide-react';

export function EPaperPage() {
  const { epapers } = useContent();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl md:text-6xl">
          <span className="text-red-600">E-Paper</span> Archive
        </h1>
        <p className="mt-3 max-w-md mx-auto text-base text-gray-500 dark:text-gray-400 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
          Browse through our digital editions. Click to read or download the PDF.
        </p>
      </div>

      {epapers && epapers.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {epapers.map((epaper) => (
            <Card key={epaper.id} className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="bg-gray-50 dark:bg-gray-800 p-4">
                <div className="flex items-center space-x-3">
                    <BookOpen className="w-8 h-8 text-red-600"/>
                    <div>
                        <CardTitle className="text-lg">{epaper.title}</CardTitle>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{epaper.uploadDate}</p>
                    </div>
                </div>
              </CardHeader>
              <CardContent className="p-4 flex flex-col items-center justify-center space-y-4">
                <p className="text-center text-sm text-gray-600 dark:text-gray-300">
                  Full edition available as a PDF document.
                </p>
                <div className="flex space-x-2">
                    <Button 
                        variant="default"
                        className="bg-red-600 hover:bg-red-700"
                        onClick={() => window.open(epaper.fileUrl, '_blank')}
                    >
                        Read Now
                    </Button>
                    <a href={epaper.fileUrl} download={`${epaper.title}.pdf`}>
                        <Button variant="outline">
                            <Download className="w-4 h-4 mr-2" />
                            Download
                        </Button>
                    </a>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">No E-Papers Available</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Please check back later for new editions.</p>
        </div>
      )}
    </div>
  );
}