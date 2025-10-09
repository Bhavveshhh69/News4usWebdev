// Test file for Phase 3 implementation
import dotenv from 'dotenv';
dotenv.config();

import { 
  createNewArticle, 
  getArticle, 
  getArticles, 
  updateExistingArticle, 
  deleteExistingArticle,
  publishExistingArticle,
  searchExistingArticles,
  getArticlesByTagName
} from './services/articleService.js';

import { 
  createCategory, 
  getCategoryById, 
  getCategoryByName, 
  getAllCategories, 
  updateCategory, 
  deleteCategory 
} from './repositories/categoryRepository.js';

import { 
  createTag, 
  getTagById, 
  getTagByName, 
  getAllTags, 
  updateTag, 
  deleteTag 
} from './repositories/tagRepository.js';

console.log('Testing Phase 3 implementation...');

// Test category operations
console.log('\n--- Testing Category Operations ---');

try {
  // Create a category
  const categoryData = {
    name: 'Technology_' + Date.now(), // Use unique name
    description: 'Articles about technology'
  };
  
  const newCategory = await createCategory(categoryData);
  console.log('Created category:', newCategory);
  
  // Get category by ID
  const categoryById = await getCategoryById(newCategory.id);
  console.log('Retrieved category by ID:', categoryById);
  
  // Get category by name
  const categoryByName = await getCategoryByName(categoryData.name);
  console.log('Retrieved category by name:', categoryByName);
  
  // Get all categories
  const allCategories = await getAllCategories();
  console.log('All categories:', allCategories);
  
  // Update category
  const updatedCategory = await updateCategory(newCategory.id, {
    name: 'Tech_' + Date.now(), // Use unique name
    description: 'Updated technology articles'
  });
  console.log('Updated category:', updatedCategory);
  
  // Delete category
  await deleteCategory(newCategory.id);
  console.log('Deleted category');
} catch (err) {
  console.error('Error in category operations:', err.message);
}

// Test tag operations
console.log('\n--- Testing Tag Operations ---');

try {
  // Create a tag
  const tagData = {
    name: 'JavaScript_' + Date.now() // Use unique name
    // Note: tags table doesn't have a description column
  };
  
  const newTag = await createTag(tagData);
  console.log('Created tag:', newTag);
  
  // Get tag by ID
  const tagById = await getTagById(newTag.id);
  console.log('Retrieved tag by ID:', tagById);
  
  // Get tag by name
  const tagByName = await getTagByName(tagData.name);
  console.log('Retrieved tag by name:', tagByName);
  
  // Get all tags
  const allTags = await getAllTags();
  console.log('All tags:', allTags);
  
  // Update tag (without description since it doesn't exist in the table)
  const updatedTag = await updateTag(newTag.id, {
    name: 'JS_' + Date.now() // Use unique name
    // Note: tags table doesn't have a description column
  });
  console.log('Updated tag:', updatedTag);
  
  // Delete tag
  await deleteTag(newTag.id);
  console.log('Deleted tag');
} catch (err) {
  console.error('Error in tag operations:', err.message);
}

console.log('\n--- Phase 3 Test Completed ---');