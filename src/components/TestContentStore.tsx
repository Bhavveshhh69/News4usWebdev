import React, { useEffect, useState } from 'react';
import { useContent } from '../store/contentStore';

export function TestContentStore() {
  const { articles, isLoading, error, addArticle } = useContent();
  const [testArticle, setTestArticle] = useState({
    title: 'Test Article',
    summary: 'This is a test article summary',
    content: '<p>This is the full content of the test article</p>',
    category: 'News',
    tags: ['test', 'article'],
    status: 'published' as const,
    author: 'Test Author',
    publishDate: new Date().toISOString().split('T')[0],
    views: 0,
    slug: 'test-article',
    imageUrl: '',
    placements: {
      homeHero: false,
      homeSection: 'none',
      categorySpot: 'none' as const
    }
  });

  useEffect(() => {
    console.log('Articles loaded:', articles);
    console.log('Loading state:', isLoading);
    console.log('Error state:', error);
  }, [articles, isLoading, error]);

  const handleCreateArticle = async () => {
    try {
      await addArticle(testArticle);
      console.log('Article created successfully');
    } catch (err) {
      console.error('Failed to create article:', err);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Test Content Store</h2>
      <div className="mb-4">
        <button 
          onClick={handleCreateArticle}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Create Test Article
        </button>
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-2">Articles ({articles.length})</h3>
        {isLoading ? (
          <p>Loading articles...</p>
        ) : error ? (
          <p className="text-red-500">Error: {error}</p>
        ) : articles.length === 0 ? (
          <p>No articles found</p>
        ) : (
          <ul>
            {articles.map((article) => (
              <li key={article.id} className="border-b py-2">
                <h4 className="font-medium">{article.title}</h4>
                <p className="text-sm text-gray-600">{article.summary}</p>
                <p className="text-xs text-gray-500">Status: {article.status} | Category: {article.category}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}