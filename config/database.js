import { Sequelize } from 'sequelize';
import 'dotenv/config.js';

// Create a Sequelize instance for MySQL connection
const sequelize = new Sequelize(
  process.env.MYSQL_DB || 'roboverr',
  process.env.MYSQL_USER || 'root',
  process.env.MYSQL_PASSWORD || '',
  {
    host: process.env.MYSQL_HOST || 'localhost',
    port: process.env.MYSQL_PORT || 3306,
    dialect: 'mysql',
    // logging: process.env.NODE_ENV === 'development' ? console.log : false,
    logging: false,
    dialectOptions: process.env.NODE_ENV === 'production' ? {
      ssl: {
        require: true,
      }
    } : {}
  }
);

export default sequelize;