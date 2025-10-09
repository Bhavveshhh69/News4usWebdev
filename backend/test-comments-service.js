// Test file for Comments Service functionality
import dotenv from 'dotenv';
dotenv.config();

import { 
  createNewComment,
  getComment,
  getArticleComments,
  updateExistingComment,
  deleteExistingComment,
  getCommentReplies
} from './services/commentService.js';

import { 
  createNewArticle
} from './services/articleService.js';

import { 
  createCategory
} from './repositories/categoryRepository.js';

console.log('Testing Comments Service functionality...');

// Test comment operations
console.log('\n--- Testing Comment Operations ---');

try {
  // First, create a category for our article
  const categoryData = {
    name: 'Test_Category_' + Date.now(),
    description: 'Test category for articles'
  };
  
  const newCategory = await createCategory(categoryData);
  console.log('Created category:', newCategory.name);
  
  // Use the existing user ID from our previous tests
  const authorId = 6;
  
  // Create an article
  const articleData = {
    title: 'Test Article for Comments ' + Date.now(),
    summary: 'This is a test article for comments testing',
    content: 'This is the full content of the test article for comments testing.',
    categoryId: newCategory.id,
    status: 'published',
    isFeatured: false
  };
  
  const newArticle = await createNewArticle(articleData, authorId);
  console.log('Created article:', newArticle.article.title);
  
  // Create a comment
  const commentData = {
    content: 'This is a test comment',
    articleId: newArticle.article.id
  };
  
  const newComment = await createNewComment(commentData, authorId);
  console.log('Created comment:', newComment.comment.content);
  
  // Get the comment
  const retrievedComment = await getComment(newComment.comment.id);
  console.log('Retrieved comment:', retrievedComment.comment.content);
  
  // Get all comments for the article
  const articleComments = await getArticleComments(newArticle.article.id, 10, 0);
  console.log('Article comments count:', articleComments.comments.length);
  
  // Update the comment
  const updatedComment = await updateExistingComment(newComment.comment.id, {
    content: 'This is an updated test comment'
  }, authorId);
  console.log('Updated comment:', updatedComment.comment.content);
  
  // Create a reply to the comment
  const replyData = {
    content: 'This is a reply to the comment',
    articleId: newArticle.article.id,
    parentId: newComment.comment.id
  };
  
  const newReply = await createNewComment(replyData, authorId);
  console.log('Created reply:', newReply.comment.content);
  
  // Get replies to the comment
  const commentReplies = await getCommentReplies(newComment.comment.id, 10, 0);
  console.log('Comment replies count:', commentReplies.comments.length);
  
  // Delete the comment
  const deletedComment = await deleteExistingComment(newComment.comment.id, authorId);
  console.log('Deleted comment:', deletedComment.result.content);
  
  console.log('\n--- Comments Service Test Completed Successfully ---');
} catch (err) {
  console.error('Error in comment operations:', err.message);
  console.error('Stack trace:', err.stack);
}