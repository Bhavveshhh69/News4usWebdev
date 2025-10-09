// Article input validation middleware

// Validate article input
const validateArticleInput = (req, res, next) => {
  try {
    const { title, content } = req.body;
    
    // Validate title
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return res.status(400).json({ 
        success: false,
        message: 'Title is required and must be a non-empty string' 
      });
    }
    
    // Validate content
    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return res.status(400).json({ 
        success: false,
        message: 'Content is required and must be a non-empty string' 
      });
    }
    
    // Validate title length
    if (title.length > 255) {
      return res.status(400).json({ 
        success: false,
        message: 'Title must be less than 255 characters' 
      });
    }
    
    // Validate summary length if provided
    if (req.body.summary && (typeof req.body.summary !== 'string' || req.body.summary.length > 500)) {
      return res.status(400).json({ 
        success: false,
        message: 'Summary must be a string and less than 500 characters' 
      });
    }
    
    // Validate categoryId if provided
    if (req.body.categoryId && (!Number.isInteger(req.body.categoryId) || req.body.categoryId <= 0)) {
      return res.status(400).json({ 
        success: false,
        message: 'Category ID must be a positive integer' 
      });
    }
    
    // Validate tags if provided
    if (req.body.tags && !Array.isArray(req.body.tags)) {
      return res.status(400).json({ 
        success: false,
        message: 'Tags must be an array' 
      });
    }
    
    // Validate status if provided
    if (req.body.status && !['draft', 'published', 'archived'].includes(req.body.status)) {
      return res.status(400).json({ 
        success: false,
        message: 'Status must be one of: draft, published, archived' 
      });
    }
    
    // Validate isFeatured if provided
    if (req.body.isFeatured !== undefined && typeof req.body.isFeatured !== 'boolean') {
      return res.status(400).json({ 
        success: false,
        message: 'isFeatured must be a boolean value' 
      });
    }
    
    next();
  } catch (err) {
    return res.status(500).json({ 
      success: false,
      message: 'Article validation failed', 
      error: err.message 
    });
  }
};

export {
  validateArticleInput
};