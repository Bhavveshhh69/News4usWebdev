import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { ContentProvider, useContent } from './contentStore';

// Mock component to test the content store
const TestComponent = () => {
  const { articles, isLoading, error } = useContent();
  
  return (
    <div>
      <div data-testid="loading">{isLoading ? 'Loading...' : 'Not loading'}</div>
      <div data-testid="error">{error || 'No error'}</div>
      <div data-testid="article-count">{articles.length} articles</div>
      {articles.map((article) => (
        <div key={article.id} data-testid={`article-${article.id}`}>
          {article.title}
        </div>
      ))}
    </div>
  );
};

// Mock fetch globally
global.fetch = jest.fn();

describe('ContentStore', () => {
  beforeEach(() => {
    // Clear localStorage
    localStorage.clear();
    
    // Reset fetch mock
    (fetch as jest.Mock).mockClear();
  });

  it('should fetch articles from backend when token is available', async () => {
    // Set up mock token
    localStorage.setItem('token', 'test-token');
    
    // Mock fetch response
    (fetch as jest.Mock).mockImplementationOnce(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          articles: [
            {
              id: 1,
              title: 'Test Article',
              summary: 'Test summary',
              content: '<p>Test content</p>',
              category_name: 'News',
              tags: [{ id: 1, name: 'test' }],
              author_name: 'Test Author',
              published_at: '2023-01-01T00:00:00Z',
              views: 100,
              status: 'published',
              is_featured: false
            }
          ]
        })
      })
    );
    
    render(
      <ContentProvider>
        <TestComponent />
      </ContentProvider>
    );
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('Not loading');
    });
    
    // Check that articles are loaded
    expect(screen.getByTestId('article-count')).toHaveTextContent('1 articles');
    expect(screen.getByTestId('article-1')).toHaveTextContent('Test Article');
  });

  it('should fall back to localStorage when no token is available', async () => {
    // No token in localStorage
    
    // Mock fetch to simulate network error
    (fetch as jest.Mock).mockImplementationOnce(() => 
      Promise.reject(new Error('Network error'))
    );
    
    render(
      <ContentProvider>
        <TestComponent />
      </ContentProvider>
    );
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('Not loading');
    });
    
    // Should fall back to localStorage (which is empty)
    expect(screen.getByTestId('article-count')).toHaveTextContent('0 articles');
  });
});