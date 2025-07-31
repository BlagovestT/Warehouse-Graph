import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { EnvService } from '../env/env.service';

export const getDatabaseConfig = (
  envService: EnvService,
): TypeOrmModuleOptions => {
  const dbConfig = envService.database;

  return {
    type: 'postgres',
    host: dbConfig.host,
    port: dbConfig.port,
    username: dbConfig.username,
    password: dbConfig.password,
    database: dbConfig.database,
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    migrations: [__dirname + '/../migrations/*{.ts,.js}'],
    synchronize: false,
    logging: envService.isDevelopment,
    migrationsRun: !envService.isDevelopment,
  };
};
