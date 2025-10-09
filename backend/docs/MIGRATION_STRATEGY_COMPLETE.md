# Migration Strategy Documentation

## Overview
This document provides comprehensive documentation for the database migration strategy implemented in the NEWS4US application.

## Migration System Architecture

### Components

#### 1. Migration Files
Sequentially numbered migration files containing database schema changes.

**Naming Convention:**
- Format: `XXX-description.js`
- XXX: Three-digit sequence number (001, 002, 003, etc.)
- Description: Brief description of migration purpose

**Example:**
```
001-create-users-table.js
002-create-articles-table.js
003-create-media-table.js
```

#### 2. Migration Runner
Script that executes migrations in the correct order.

**Features:**
- Sequential execution
- Version tracking
- Error handling
- Rollback capabilities

#### 3. Migration Tracking
Database table that tracks applied migrations.

**Table: schema_migrations**
| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL | Primary key |
| version | VARCHAR(255) | Migration version number |
| name | VARCHAR(255) | Migration name |
| direction | VARCHAR(10) | Direction (up/down) |
| status | VARCHAR(20) | Status (pending/running/completed/failed) |
| started_at | TIMESTAMP WITH TIME ZONE | Migration start time |
| completed_at | TIMESTAMP WITH TIME ZONE | Migration completion time |
| error | TEXT | Error message (if failed) |
| duration_ms | INTEGER | Migration duration in milliseconds |

## Idempotent Migrations

### Implementation
All migrations are designed to be idempotent, meaning they can be run multiple times without causing errors or duplicate data.

**Techniques:**
1. **CREATE IF NOT EXISTS**: For tables, indexes, and other database objects
2. **ALTER TABLE IF NOT EXISTS**: For adding columns
3. **INSERT ... ON CONFLICT**: For data insertion
4. **Conditional logic**: Check if objects exist before creating them

### Example Idempotent Migration
```javascript
// Migration to create users table
const up = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      name VARCHAR(255) NOT NULL,
      role VARCHAR(50) NOT NULL DEFAULT 'user',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      last_login TIMESTAMP WITH TIME ZONE,
      is_active BOOLEAN DEFAULT true
    );
    
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
  `;

  try {
    await executeQuery(query);
    console.log('Users table created successfully');
  } catch (err) {
    console.error('Error creating users table:', err.stack);
    throw err;
  }
};
```

## Enhanced Migration Runner

### Features

#### 1. Version Tracking
Tracks which migrations have been applied to prevent re-execution.

**Implementation:**
- Checks `schema_migrations` table before running migrations
- Only runs migrations that haven't been applied
- Records migration status in real-time

#### 2. Error Handling
Comprehensive error handling and logging.

**Features:**
- Detailed error messages
- Stack trace logging
- Migration status updates
- Graceful failure handling

#### 3. Rollback Capabilities
Support for rolling back migrations.

**Implementation:**
- Each migration includes `up` and `down` functions
- `down` function reverses the changes made by `up`
- Rollback command: `node migrations/run-migration.js down`

### Migration Runner Commands

#### 1. Run Pending Migrations
```bash
node migrations/run-migration.js up
```

#### 2. Rollback Last Migration
```bash
node migrations/run-migration.js down
```

#### 3. Run Specific Migration
```bash
node migrations/run-migration.js up 003
```

## Pre/Post Migration Validation

### Pre-Migration Validation
Checks performed before running migrations.

**Validations:**
1. Database connectivity
2. Available disk space
3. Schema state (locks, etc.)
4. Active connections

**Implementation:**
```javascript
// Pre-migration validation
const preMigrationValidation = async () => {
  // Check database connectivity
  await executeQuery('SELECT 1');
  
  // Check available disk space
  const result = await executeQuery("SELECT pg_database_size(current_database()) as size");
  
  // Check for active connections
  const connResult = await executeQuery(`
    SELECT count(*) as connection_count
    FROM pg_stat_activity
    WHERE state = 'active'
  `);
  
  // Additional validations...
};
```

### Post-Migration Validation
Checks performed after running migrations.

**Validations:**
1. Table existence
2. Index existence
3. Data integrity
4. Performance metrics

**Implementation:**
```javascript
// Post-migration validation
const postMigrationValidation = async () => {
  // Check that expected tables exist
  const tableResult = await executeQuery(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_name IN ('users', 'articles', 'categories')
  `);
  
  // Check that indexes are created
  const indexResult = await executeQuery(`
    SELECT indexname 
    FROM pg_indexes 
    WHERE tablename IN ('users', 'articles', 'categories')
  `);
  
  // Additional validations...
};
```

## Migration Best Practices

### 1. Backward Compatibility
Ensure migrations maintain backward compatibility.

**Guidelines:**
- Add columns with default values
- Make columns nullable initially
- Avoid dropping columns in use
- Test with existing data

### 2. Performance Considerations
Optimize migrations for large datasets.

**Techniques:**
- Batch processing for large data operations
- Index creation after data loading
- Concurrent index creation when possible
- Monitoring during long-running migrations

### 3. Data Safety
Protect data during migrations.

**Practices:**
- Always backup before major migrations
- Test migrations on staging environment
- Use transactions for related changes
- Implement rollback procedures

### 4. Testing
Thoroughly test all migrations.

**Testing Process:**
1. Unit tests for migration logic
2. Integration tests with database
3. Performance tests with large datasets
4. Rollback testing

## Migration Templates

### Standard Migration Template
```javascript
// migrations/XXX-migration-description.js
import { executeQuery } from '../config/db-utils.js';

const migrationVersion = 'XXX';
const migrationName = 'Migration description';

const up = async () => {
  console.log(`Running migration ${migrationVersion}: ${migrationName}`);
  
  try {
    const query = `
      -- Migration SQL here
      CREATE TABLE IF NOT EXISTS example_table (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL
      );
    `;
    
    await executeQuery(query);
    console.log(`Migration ${migrationVersion} completed successfully`);
  } catch (err) {
    console.error(`Error running migration ${migrationVersion}:`, err.stack);
    throw err;
  }
};

const down = async () => {
  console.log(`Rolling back migration ${migrationVersion}: ${migrationName}`);
  
  try {
    const query = `
      -- Rollback SQL here
      DROP TABLE IF EXISTS example_table;
    `;
    
    await executeQuery(query);
    console.log(`Migration ${migrationVersion} rolled back successfully`);
  } catch (err) {
    console.error(`Error rolling back migration ${migrationVersion}:`, err.stack);
    throw err;
  }
};

export { up, down, migrationVersion, migrationName };
```

### Data Migration Template
```javascript
// migrations/XXX-data-migration.js
import { executeQuery, executeTransaction } from '../config/db-utils.js';

const migrationVersion = 'XXX';
const migrationName = 'Data migration description';

const up = async () => {
  console.log(`Running data migration ${migrationVersion}: ${migrationName}`);
  
  try {
    // Process data in batches to avoid memory issues
    const batchSize = 1000;
    let offset = 0;
    let processed = 0;
    
    do {
      // Get batch of records
      const result = await executeQuery(`
        SELECT id, old_column
        FROM example_table
        WHERE new_column IS NULL
        LIMIT $1 OFFSET $2
      `, [batchSize, offset]);
      
      if (result.rows.length === 0) break;
      
      // Process batch in transaction
      const queries = [];
      for (const row of result.rows) {
        const newValue = transformData(row.old_column);
        queries.push({
          query: 'UPDATE example_table SET new_column = $1 WHERE id = $2',
          values: [newValue, row.id]
        });
      }
      
      await executeTransaction(queries);
      processed += result.rows.length;
      offset += batchSize;
      
      console.log(`Processed ${processed} records`);
    } while (true);
    
    console.log(`Data migration ${migrationVersion} completed successfully`);
  } catch (err) {
    console.error(`Error running data migration ${migrationVersion}:`, err.stack);
    throw err;
  }
};

const down = async () => {
  console.log(`Rolling back data migration ${migrationVersion}: ${migrationName}`);
  
  try {
    // Rollback data changes
    await executeQuery('UPDATE example_table SET new_column = NULL');
    
    console.log(`Data migration ${migrationVersion} rolled back successfully`);
  } catch (err) {
    console.error(`Error rolling back data migration ${migrationVersion}:`, err.stack);
    throw err;
  }
};

// Helper function for data transformation
const transformData = (oldValue) => {
  // Data transformation logic here
  return oldValue.toUpperCase();
};

export { up, down, migrationVersion, migrationName };
```

## Migration Monitoring

### Real-Time Monitoring
Track migration progress and status.

**Metrics:**
- Migration start time
- Migration completion time
- Duration
- Status (running, completed, failed)
- Error messages

### Alerting
Notify team of migration issues.

**Alerts:**
- Migration failures
- Long-running migrations
- High error rates

## Rollback Procedures

### When to Rollback
Situations that require migration rollback:

1. **Migration Failure**: Migration fails during execution
2. **Data Corruption**: Migration causes data integrity issues
3. **Performance Issues**: Migration negatively impacts performance
4. **Application Incompatibility**: Migration breaks application functionality

### Rollback Process

#### 1. Identify Issue
- Review error logs
- Check database state
- Assess impact

#### 2. Stop Application
- Prevent further database changes
- Ensure data consistency

#### 3. Execute Rollback
```bash
node migrations/run-migration.js down
```

#### 4. Verify Rollback
- Check database state
- Confirm data integrity
- Test application functionality

#### 5. Restore from Backup (if needed)
- Restore database from backup
- Re-run previous migrations
- Validate restored state

## Disaster Recovery

### Backup Strategy
Regular database backups to prevent data loss.

**Backup Types:**
1. **Full Backups**: Complete database snapshots
2. **Incremental Backups**: Changes since last backup
3. **Point-in-Time Recovery**: Recovery to specific timestamp

### Recovery Procedures
Steps to recover from database failures.

**Recovery Process:**
1. Identify recovery point
2. Restore from backup
3. Apply transaction logs
4. Validate recovered data
5. Resume operations

## Conclusion

This migration strategy documentation provides a comprehensive overview of the database migration system implemented in the NEWS4US application. The combination of idempotent migrations, version tracking, validation procedures, and rollback capabilities ensures reliable and safe database evolution.