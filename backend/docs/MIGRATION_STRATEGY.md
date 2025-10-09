# Migration Strategy

## Current Migration System Analysis

Based on our Phase 1 assessment, the current migration system has these characteristics:
- Uses sequential migration files (001-create-users-table.js, etc.)
- Each migration file contains table creation logic
- Migrations are run through migrations/run-migration.js
- Basic error handling and logging
- No rollback procedures
- No pre/post migration validation

## Proposed Migration Strategy Enhancements

### 1. Versioned, Idempotent Migration Scripts

#### Current Issues:
- Migration scripts are not idempotent
- No version tracking beyond filename sequence
- Limited error handling

#### Proposed Solution:
Create idempotent migration scripts with proper version tracking.

#### Implementation Plan:
1. Implement idempotent DDL operations
2. Add migration version tracking table
3. Enhance error handling and logging
4. Create migration validation procedures

#### Enhanced Migration Implementation:

```javascript
// Enhanced migration template
// migrations/xxx-enhanced-migration-template.js

// Migration to create example table with idempotent operations
import { executeQuery } from '../config/db-utils.js';

const migrationVersion = 'xxx'; // Replace with actual migration number
const migrationName = 'Enhanced example table creation';

const up = async () => {
  console.log(`Running migration ${migrationVersion}: ${migrationName}`);
  
  try {
    // Use CREATE TABLE IF NOT EXISTS for idempotency
    const query = `
      CREATE TABLE IF NOT EXISTS example_table (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      
      -- Create indexes if they don't exist
      CREATE INDEX IF NOT EXISTS idx_example_table_name ON example_table(name);
      
      -- Add columns if they don't exist (PostgreSQL 9.6+)
      ALTER TABLE example_table 
      ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'active';
      
      -- Create updated_at trigger if it doesn't exist
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
      END;
      $$ language 'plpgsql';
      
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_trigger WHERE tgname = 'update_example_table_updated_at'
        ) THEN
          CREATE TRIGGER update_example_table_updated_at 
          BEFORE UPDATE ON example_table 
          FOR EACH ROW 
          EXECUTE FUNCTION update_updated_at_column();
        END IF;
      END
      $$;
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
      DROP TABLE IF EXISTS example_table CASCADE;
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

### 2. Migration Version Tracking

#### Current Issues:
- No database table tracking migration versions
- Migration status only in logs
- No way to track which migrations have been applied

#### Proposed Solution:
Create a migrations table to track applied migrations.

#### Implementation Plan:
1. Create migrations table
2. Update migration runner to use tracking table
3. Implement migration status checks
4. Add migration metadata storage

#### Migration Tracking Implementation:

```sql
-- Create migrations tracking table
CREATE TABLE IF NOT EXISTS schema_migrations (
  id SERIAL PRIMARY KEY,
  version VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  direction VARCHAR(10) NOT NULL, -- 'up' or 'down'
  status VARCHAR(20) NOT NULL, -- 'pending', 'running', 'completed', 'failed'
  started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP WITH TIME ZONE,
  error TEXT,
  duration_ms INTEGER
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_schema_migrations_version ON schema_migrations(version);
CREATE INDEX IF NOT EXISTS idx_schema_migrations_status ON schema_migrations(status);
CREATE INDEX IF NOT EXISTS idx_schema_migrations_started_at ON schema_migrations(started_at);
```

### 3. Enhanced Migration Runner

#### Current Issues:
- Simple sequential execution
- Limited error handling
- No rollback capabilities
- No parallel execution options

#### Proposed Solution:
Create an enhanced migration runner with better error handling and rollback capabilities.

#### Implementation Plan:
1. Implement enhanced migration runner
2. Add pre/post migration hooks
3. Implement rollback procedures
4. Add migration validation

#### Enhanced Migration Runner Implementation:

```javascript
// enhanced-run-migration.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { executeQuery } from '../config/db-utils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create migrations tracking table
const createMigrationsTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id SERIAL PRIMARY KEY,
      version VARCHAR(255) NOT NULL UNIQUE,
      name VARCHAR(255) NOT NULL,
      direction VARCHAR(10) NOT NULL,
      status VARCHAR(20) NOT NULL,
      started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      completed_at TIMESTAMP WITH TIME ZONE,
      error TEXT,
      duration_ms INTEGER
    );
    
    CREATE INDEX IF NOT EXISTS idx_schema_migrations_version ON schema_migrations(version);
    CREATE INDEX IF NOT EXISTS idx_schema_migrations_status ON schema_migrations(status);
    CREATE INDEX IF NOT EXISTS idx_schema_migrations_started_at ON schema_migrations(started_at);
  `;
  
  await executeQuery(query);
};

// Get applied migrations
const getAppliedMigrations = async () => {
  try {
    const result = await executeQuery(
      'SELECT version FROM schema_migrations WHERE direction = $1 AND status = $2 ORDER BY version',
      ['up', 'completed']
    );
    return result.rows.map(row => row.version);
  } catch (err) {
    console.error('Error getting applied migrations:', err);
    return [];
  }
};

// Record migration start
const recordMigrationStart = async (version, name, direction) => {
  await executeQuery(
    'INSERT INTO schema_migrations (version, name, direction, status) VALUES ($1, $2, $3, $4)',
    [version, name, direction, 'running']
  );
};

// Record migration completion
const recordMigrationCompletion = async (version, durationMs) => {
  await executeQuery(
    'UPDATE schema_migrations SET status = $1, completed_at = NOW(), duration_ms = $2 WHERE version = $3 AND status = $4',
    ['completed', durationMs, version, 'running']
  );
};

// Record migration failure
const recordMigrationFailure = async (version, error) => {
  await executeQuery(
    'UPDATE schema_migrations SET status = $1, error = $2, completed_at = NOW() WHERE version = $3 AND status = $4',
    ['failed', error, version, 'running']
  );
};

// Run a single migration
const runMigration = async (migration) => {
  console.log(`Running migration: ${migration.migrationVersion} - ${migration.migrationName}`);
  
  // Record start
  await recordMigrationStart(migration.migrationVersion, migration.migrationName, 'up');
  
  const startTime = Date.now();
  
  try {
    // Run the migration
    await migration.up();
    
    // Record completion
    const duration = Date.now() - startTime;
    await recordMigrationCompletion(migration.migrationVersion, duration);
    
    console.log(`Migration ${migration.migrationVersion} completed successfully in ${duration}ms`);
  } catch (err) {
    // Record failure
    const duration = Date.now() - startTime;
    await recordMigrationFailure(migration.migrationVersion, err.message);
    
    console.error(`Migration ${migration.migrationVersion} failed after ${duration}ms:`, err.message);
    throw err;
  }
};

// Rollback a migration
const rollbackMigration = async (migration) => {
  console.log(`Rolling back migration: ${migration.migrationVersion} - ${migration.migrationName}`);
  
  // Record start
  await recordMigrationStart(migration.migrationVersion, migration.migrationName, 'down');
  
  const startTime = Date.now();
  
  try {
    // Run the rollback
    await migration.down();
    
    // Record completion
    const duration = Date.now() - startTime;
    await recordMigrationCompletion(migration.migrationVersion, duration);
    
    console.log(`Migration ${migration.migrationVersion} rolled back successfully in ${duration}ms`);
  } catch (err) {
    // Record failure
    const duration = Date.now() - startTime;
    await recordMigrationFailure(migration.migrationVersion, err.message);
    
    console.error(`Migration ${migration.migrationVersion} rollback failed after ${duration}ms:`, err.message);
    throw err;
  }
};

// Get all migration files
const getMigrationFiles = () => {
  const migrationsDir = path.join(__dirname);
  const files = fs.readdirSync(migrationsDir)
    .filter(file => file.match(/^\d{3}-.+\.js$/))
    .sort();
  
  return files;
};

// Load migration module
const loadMigration = async (file) => {
  const modulePath = path.join(__dirname, file);
  const migration = await import(modulePath);
  return migration;
};

// Run all pending migrations
const runMigrations = async () => {
  console.log('Running migrations...');
  
  try {
    // Create migrations table if it doesn't exist
    await createMigrationsTable();
    
    // Get applied migrations
    const appliedMigrations = await getAppliedMigrations();
    
    // Get all migration files
    const migrationFiles = getMigrationFiles();
    
    // Filter out already applied migrations
    const pendingMigrations = migrationFiles.filter(file => {
      const version = file.substring(0, 3);
      return !appliedMigrations.includes(version);
    });
    
    if (pendingMigrations.length === 0) {
      console.log('No pending migrations to run');
      return;
    }
    
    console.log(`Found ${pendingMigrations.length} pending migrations`);
    
    // Run each pending migration
    for (const file of pendingMigrations) {
      const migration = await loadMigration(file);
      await runMigration(migration);
    }
    
    console.log('All migrations completed successfully');
  } catch (err) {
    console.error('Error running migrations:', err);
    process.exit(1);
  }
};

// Rollback last migration
const rollbackLastMigration = async () => {
  console.log('Rolling back last migration...');
  
  try {
    // Get the last applied migration
    const result = await executeQuery(
      'SELECT version, name FROM schema_migrations WHERE direction = $1 AND status = $2 ORDER BY version DESC LIMIT 1',
      ['up', 'completed']
    );
    
    if (result.rows.length === 0) {
      console.log('No migrations to rollback');
      return;
    }
    
    const lastMigration = result.rows[0];
    console.log(`Rolling back migration ${lastMigration.version}: ${lastMigration.name}`);
    
    // Find the migration file
    const migrationFiles = getMigrationFiles();
    const migrationFile = migrationFiles.find(file => file.startsWith(lastMigration.version));
    
    if (!migrationFile) {
      console.error(`Migration file for version ${lastMigration.version} not found`);
      process.exit(1);
    }
    
    // Load and run rollback
    const migration = await loadMigration(migrationFile);
    await rollbackMigration(migration);
    
    console.log('Migration rollback completed successfully');
  } catch (err) {
    console.error('Error rolling back migration:', err);
    process.exit(1);
  }
};

// Main execution
const main = async () => {
  const args = process.argv.slice(2);
  const command = args[0] || 'up';
  
  switch (command) {
    case 'up':
      await runMigrations();
      break;
    case 'down':
      await rollbackLastMigration();
      break;
    default:
      console.log('Usage: node enhanced-run-migration.js [up|down]');
      process.exit(1);
  }
};

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { runMigrations, rollbackLastMigration };
```

### 4. Pre/Post Migration Validation

#### Current Issues:
- No validation before or after migrations
- No data integrity checks
- No performance impact assessment

#### Proposed Solution:
Implement pre and post migration validation procedures.

#### Implementation Plan:
1. Create validation framework
2. Implement data integrity checks
3. Add performance impact assessment
4. Create validation reporting

#### Validation Implementation:

```javascript
// migration-validation.js
import { executeQuery } from '../config/db-utils.js';

class MigrationValidator {
  constructor() {
    this.validationResults = [];
  }
  
  // Pre-migration validation
  async preMigrationValidation() {
    console.log('Running pre-migration validation...');
    
    try {
      // Check database connectivity
      await this.checkDatabaseConnectivity();
      
      // Check available disk space
      await this.checkDiskSpace();
      
      // Check current schema state
      await this.checkSchemaState();
      
      // Check for active connections
      await this.checkActiveConnections();
      
      console.log('Pre-migration validation completed successfully');
      return true;
    } catch (err) {
      console.error('Pre-migration validation failed:', err.message);
      return false;
    }
  }
  
  // Post-migration validation
  async postMigrationValidation() {
    console.log('Running post-migration validation...');
    
    try {
      // Check that all expected tables exist
      await this.checkTableExistence();
      
      // Check that indexes are created
      await this.checkIndexExistence();
      
      // Check data integrity
      await this.checkDataIntegrity();
      
      // Check performance metrics
      await this.checkPerformanceMetrics();
      
      console.log('Post-migration validation completed successfully');
      return true;
    } catch (err) {
      console.error('Post-migration validation failed:', err.message);
      return false;
    }
  }
  
  async checkDatabaseConnectivity() {
    try {
      await executeQuery('SELECT 1');
      this.validationResults.push({ check: 'Database connectivity', status: 'PASS' });
    } catch (err) {
      this.validationResults.push({ check: 'Database connectivity', status: 'FAIL', error: err.message });
      throw err;
    }
  }
  
  async checkDiskSpace() {
    // This is a simplified check - in practice, you'd check actual disk space
    try {
      const result = await executeQuery("SELECT pg_database_size(current_database()) as size");
      const size = parseInt(result.rows[0].size);
      const sizeMB = size / (1024 * 1024);
      
      if (sizeMB > 10000) {  // Warn if database is over 10GB
        console.warn(`Database size is large: ${sizeMB.toFixed(2)} MB`);
      }
      
      this.validationResults.push({ check: 'Disk space check', status: 'PASS', details: `Database size: ${sizeMB.toFixed(2)} MB` });
    } catch (err) {
      this.validationResults.push({ check: 'Disk space check', status: 'FAIL', error: err.message });
      throw err;
    }
  }
  
  async checkSchemaState() {
    try {
      // Check for any locks that might block migrations
      const lockResult = await executeQuery(`
        SELECT locktype, relation::regclass, mode, granted
        FROM pg_locks
        WHERE NOT granted
      `);
      
      if (lockResult.rows.length > 0) {
        console.warn('Blocking locks detected:', lockResult.rows);
      }
      
      this.validationResults.push({ check: 'Schema state check', status: 'PASS' });
    } catch (err) {
      this.validationResults.push({ check: 'Schema state check', status: 'FAIL', error: err.message });
      throw err;
    }
  }
  
  async checkActiveConnections() {
    try {
      const result = await executeQuery(`
        SELECT count(*) as connection_count
        FROM pg_stat_activity
        WHERE state = 'active'
      `);
      
      const connectionCount = parseInt(result.rows[0].connection_count);
      
      if (connectionCount > 50) {  // Warn if many active connections
        console.warn(`High number of active connections: ${connectionCount}`);
      }
      
      this.validationResults.push({ check: 'Active connections check', status: 'PASS', details: `Active connections: ${connectionCount}` });
    } catch (err) {
      this.validationResults.push({ check: 'Active connections check', status: 'FAIL', error: err.message });
      throw err;
    }
  }
  
  async checkTableExistence() {
    try {
      // This would check for specific tables expected to exist after migration
      this.validationResults.push({ check: 'Table existence check', status: 'PASS' });
    } catch (err) {
      this.validationResults.push({ check: 'Table existence check', status: 'FAIL', error: err.message });
      throw err;
    }
  }
  
  async checkIndexExistence() {
    try {
      // This would check for specific indexes expected to exist after migration
      this.validationResults.push({ check: 'Index existence check', status: 'PASS' });
    } catch (err) {
      this.validationResults.push({ check: 'Index existence check', status: 'FAIL', error: err.message });
      throw err;
    }
  }
  
  async checkDataIntegrity() {
    try {
      // Check for referential integrity
      // Check for null values in non-null columns
      // Check for data consistency
      
      this.validationResults.push({ check: 'Data integrity check', status: 'PASS' });
    } catch (err) {
      this.validationResults.push({ check: 'Data integrity check', status: 'FAIL', error: err.message });
      throw err;
    }
  }
  
  async checkPerformanceMetrics() {
    try {
      // Check query performance
      // Check index usage
      // Check table statistics
      
      this.validationResults.push({ check: 'Performance metrics check', status: 'PASS' });
    } catch (err) {
      this.validationResults.push({ check: 'Performance metrics check', status: 'FAIL', error: err.message });
      throw err;
    }
  }
  
  getValidationReport() {
    return this.validationResults;
  }
}

export default new MigrationValidator();
```

## Implementation Timeline

### Week 1: Idempotent Migrations and Version Tracking
- Implement idempotent migration templates
- Create migration version tracking table
- Update existing migrations for idempotency
- Test migration version tracking

### Week 2: Enhanced Migration Runner
- Implement enhanced migration runner
- Add pre/post migration hooks
- Test migration execution and rollback
- Validate error handling

### Week 3: Migration Validation
- Implement validation framework
- Create pre-migration validation procedures
- Create post-migration validation procedures
- Test validation procedures

### Week 4: Final Testing and Documentation
- Comprehensive migration testing
- Document all migration procedures
- Create rollback procedures for all migrations
- Final validation and performance testing

## Testing Plan

### Migration Testing:
- [ ] All migrations are idempotent
- [ ] Migration version tracking works correctly
- [ ] Rollback procedures function properly
- [ ] Error handling is comprehensive

### Validation Testing:
- [ ] Pre-migration validation detects issues
- [ ] Post-migration validation confirms success
- [ ] Data integrity is maintained
- [ ] Performance is not negatively impacted

### Rollback Testing:
- [ ] Individual migrations can be rolled back
- [ ] Rollback procedures maintain data integrity
- [ ] Schema is correctly restored
- [ ] Application continues to function after rollback

## Monitoring and Alerting

### Migration Metrics to Monitor:
- Migration success rate (> 99%)
- Average migration duration (< 30 seconds)
- Rollback frequency (< 1%)
- Validation success rate (> 99%)

### Alerting Thresholds:
- Migration failure rate > 5%
- Migration duration > 2 minutes
- Rollback frequency > 5%
- Validation failure rate > 5%

## Rollback Plan

If migration enhancements cause issues:
1. Revert to original migration system
2. Restore database from backup if needed
3. Disable enhanced migration features
4. Validate system functionality
5. Implement fixes and re-deploy

## Success Criteria

Migration strategy enhancements will be considered successful when:
- All migrations are idempotent
- Migration version tracking is accurate
- Rollback procedures work correctly
- Pre/post validation prevents issues
- Migration process is reliable and robust
- All tests pass successfully
- System can be migrated forward and backward safely