// Environment variable validation
const validateEnvironment = () => {
  const requiredVars = [
    'DB_HOST',
    'DB_PORT',
    'DB_NAME',
    'DB_USER',
    'DB_PASSWORD'
  ];
  
  const missingVars = [];
  const envVars = {};
  
  // Check for required environment variables
  for (const variable of requiredVars) {
    const value = process.env[variable];
    if (!value) {
      missingVars.push(variable);
    } else {
      envVars[variable] = value;
    }
  }
  
  // Validate DB_PORT is a number
  if (process.env.DB_PORT && isNaN(process.env.DB_PORT)) {
    throw new Error('DB_PORT must be a valid number');
  }
  
  // Validate DB_SSL is boolean if provided
  if (process.env.DB_SSL && !['true', 'false'].includes(process.env.DB_SSL)) {
    throw new Error('DB_SSL must be either "true" or "false"');
  }
  
  // Validate DB_MAX_CONNECTIONS is a number if provided
  if (process.env.DB_MAX_CONNECTIONS && isNaN(process.env.DB_MAX_CONNECTIONS)) {
    throw new Error('DB_MAX_CONNECTIONS must be a valid number');
  }
  
  return {
    isValid: missingVars.length === 0,
    missingVars,
    envVars
  };
};

export default validateEnvironment;