import * as path from 'path';

export const database = {
  type: 'mysql',
  port: Number(process.env.DB_PORT),
  host: process.env.DB_HOST,
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  entities: [
    path.resolve(
      __dirname,
      '..',
      '..',
      '..',
      'modules',
      '**',
      'infra',
      'typeorm',
      'entities',
      '*',
    ),
    path.resolve(
      __dirname,
      '..',
      '..',
      '..',
      'modules',
      '**',
      'infra',
      'typeorm',
      'views',
      '*',
    ),
  ],
  migrations: ['./src/shared/infra/typeorm/migrations/*.js'],
  synchronize: false,
  logging: ['error', 'warn'],
};
