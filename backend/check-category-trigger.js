import { executeQuery } from './config/db-utils.js';

const checkCategoryTrigger = async () => {
  try {
    console.log('Checking triggers on categories table...');
    
    const triggerResult = await executeQuery(`
      SELECT tgname, tgrelid::regclass 
      FROM pg_trigger 
      WHERE tgrelid = 'categories'::regclass
      ORDER BY tgname
    `);
    
    if (triggerResult.rows.length > 0) {
      console.log('Triggers found on categories table:');
      triggerResult.rows.forEach(trigger => {
        console.log(`- ${trigger.tgname}`);
      });
    } else {
      console.log('No triggers found on categories table');
    }
    
    // Add audit trigger to categories table
    console.log('\nAdding audit trigger to categories table...');
    await executeQuery(`
      DROP TRIGGER IF EXISTS categories_audit_trigger ON categories;
      CREATE TRIGGER categories_audit_trigger
      AFTER INSERT OR UPDATE OR DELETE ON categories
      FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();
    `);
    
    console.log('Audit trigger added to categories table');
    
    process.exit(0);
  } catch (err) {
    console.error('Error checking/adding category trigger:', err.stack);
    process.exit(1);
  }
};

checkCategoryTrigger();