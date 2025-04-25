import { Sequelize } from 'sequelize';
import 'dotenv/config.js';

// Create a Sequelize instance for PostgreSQL connection
const sequelize = new Sequelize(
  process.env.POSTGRES_DB || 'roboverr',
  process.env.POSTGRES_USER || 'postgres',
  process.env.POSTGRES_PASSWORD || 'postgres',
  {
    host: process.env.POSTGRES_HOST || 'localhost',
    port: process.env.POSTGRES_PORT || 5432,
    dialect: 'postgres',
    // logging: process.env.NODE_ENV === 'development' ? console.log : false,
    logging: false,
    dialectOptions: process.env.NODE_ENV === 'production' ? {
      ssl: {
        require: true,
        // rejectUnauthorized: false
      }
    } : {}
  }
);

export default sequelize;