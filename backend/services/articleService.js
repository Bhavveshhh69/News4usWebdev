// Article service with ACID compliance
import { 
  createArticle, 
  getArticleById, 
  getAllArticles, 
  updateArticle, 
  deleteArticle, 
  publishArticle, 
  incrementArticleViews,
  searchArticles
} from '../repositories/articleRepository.js';

import { 
  createCategory, 
  getCategoryById, 
  getCategoryByName, 
  getAllCategories, 
  updateCategory, 
  deleteCategory 
} from '../repositories/categoryRepository.js';

import { 
  createTag, 
  getTagById, 
  getTagByName, 
  getAllTags, 
  updateTag, 
  deleteTag, 
  getArticlesByTag 
} from '../repositories/tagRepository.js';

// Create a new article
const createNewArticle = async (articleData, authorId) => {
  try {
    // Validate required fields
    if (!articleData.title || !articleData.content) {
      throw new Error('Title and content are required');
    }
    
    // Validate category if provided
    if (articleData.categoryId) {
      const category = await getCategoryById(articleData.categoryId);
      if (!category) {
        throw new Error('Invalid category ID');
      }
    }
    
    // Create the article
    const article = await createArticle(articleData, authorId);
    
    return {
      success: true,
      article,
      message: 'Article created successfully'
    };
  } catch (err) {
    throw err;
  }
};

// Get article by ID
const getArticle = async (id) => {
  try {
    const article = await getArticleById(id);
    
    if (!article) {
      throw new Error('Article not found');
    }
    
    // Increment view count
    await incrementArticleViews(id);
    
    return {
      success: true,
      article,
      message: 'Article retrieved successfully'
    };
  } catch (err) {
    throw err;
  }
};

// Get all articles with pagination
const getArticles = async (limit = 10, offset = 0, filters = {}) => {
  try {
    // Validate limit and offset
    if (limit < 1 || limit > 100) {
      limit = 10;
    }
    
    if (offset < 0) {
      offset = 0;
    }
    
    // Validate filters
    const validFilters = {};
    if (filters.categoryId) {
      const category = await getCategoryById(filters.categoryId);
      if (category) {
        validFilters.categoryId = filters.categoryId;
      }
    }
    
    if (filters.authorId) {
      validFilters.authorId = filters.authorId;
    }
    
    if (filters.status && ['draft', 'published', 'archived'].includes(filters.status)) {
      validFilters.status = filters.status;
    }
    
    if (filters.isFeatured !== undefined) {
      validFilters.isFeatured = Boolean(filters.isFeatured);
    }
    
    const result = await getAllArticles(limit, offset, validFilters);
    
    return {
      success: true,
      ...result,
      message: 'Articles retrieved successfully'
    };
  } catch (err) {
    throw err;
  }
};

// Update an article
const updateExistingArticle = async (articleId, updateData, authorId) => {
  try {
    // Validate category if provided
    if (updateData.categoryId) {
      const category = await getCategoryById(updateData.categoryId);
      if (!category) {
        throw new Error('Invalid category ID');
      }
    }
    
    // Update the article
    const article = await updateArticle(articleId, updateData, authorId);
    
    return {
      success: true,
      article,
      message: 'Article updated successfully'
    };
  } catch (err) {
    throw err;
  }
};

// Delete an article
const deleteExistingArticle = async (articleId, authorId) => {
  try {
    const result = await deleteArticle(articleId, authorId);
    
    return {
      success: true,
      result,
      message: 'Article deleted successfully'
    };
  } catch (err) {
    throw err;
  }
};

// Publish an article
const publishExistingArticle = async (articleId, authorId) => {
  try {
    // First, verify the article exists and belongs to the author
    const article = await getArticleById(articleId);
    
    if (!article) {
      throw new Error('Article not found');
    }
    
    if (article.author_id !== authorId) {
      throw new Error('Unauthorized: You can only publish your own articles');
    }
    
    // Publish the article
    const publishedArticle = await publishArticle(articleId, authorId);
    
    return {
      success: true,
      article: publishedArticle,
      message: 'Article published successfully'
    };
  } catch (err) {
    throw err;
  }
};

// Search articles
const searchExistingArticles = async (query, limit = 10, offset = 0) => {
  try {
    // Validate limit and offset
    if (limit < 1 || limit > 100) {
      limit = 10;
    }
    
    if (offset < 0) {
      offset = 0;
    }
    
    if (!query || query.trim().length === 0) {
      throw new Error('Search query is required');
    }
    
    const result = await searchArticles(query, limit, offset);
    
    return {
      success: true,
      ...result,
      message: 'Search completed successfully'
    };
  } catch (err) {
    throw err;
  }
};

// Get articles by tag
const getArticlesByTagName = async (tagName, limit = 10, offset = 0) => {
  try {
    // Validate limit and offset
    if (limit < 1 || limit > 100) {
      limit = 10;
    }
    
    if (offset < 0) {
      offset = 0;
    }
    
    // First, get the tag by name
    const tag = await getTagByName(tagName);
    
    if (!tag) {
      return {
        success: true,
        articles: [],
        totalCount: 0,
        message: 'No articles found for this tag'
      };
    }
    
    // Get articles by tag
    const result = await getArticlesByTag(tag.id, limit, offset);
    
    return {
      success: true,
      ...result,
      message: 'Articles retrieved successfully'
    };
  } catch (err) {
    throw err;
  }
};

// Export all functions
export {
  createNewArticle,
  getArticle,
  getArticles,
  updateExistingArticle,
  deleteExistingArticle,
  publishExistingArticle,
  searchExistingArticles,
  getArticlesByTagName
};