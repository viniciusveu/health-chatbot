import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import knex from 'knex';
import dotenv from 'dotenv';

dotenv.config();

@Injectable()
export class KnexService implements OnModuleInit, OnModuleDestroy {
  public db: any;

  constructor() {
    this.db = knex({
      client: process.env.CLIENT, // 'oracledb', 'mysql', 'pg', etc.
      connection: {
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT),
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME,
      },
    });
  }

  async onModuleInit() {}

  async onModuleDestroy() {
    await this.db.destroy();
  }
}
