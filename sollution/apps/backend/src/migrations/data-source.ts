import { DataSourceOptions, DataSource } from 'typeorm';
import { config } from 'dotenv';
import { isRunningLocally } from '@utils/environment.util';

config({ path: '.env' });
export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  entities: ['dist/database/entities/**/*.js'],
  migrations: ['dist/migrations/history/*.js'],
  url: process.env.DATABASE_URL,
  synchronize: false,
  ...(isRunningLocally()
    ? {}
    : {
        extra: {
          ssl: {
            rejectUnauthorized: false,
          },
        },
        ssl: {
          rejectUnauthorized: false,
        },
      }),
};
const dataSource = new DataSource(dataSourceOptions);
export default dataSource;
