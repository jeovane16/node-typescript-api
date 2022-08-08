import './utils/module-alias';
import apiSchema from './api.schema.json';
import swaggerUi from 'swagger-ui-express';
import { OpenApiValidator } from 'express-openapi-validator/dist/openapi.validator';
import { OpenAPIV3 } from 'express-openapi-validator/dist/framework/types';
import { Server } from '@overnightjs/core';
import bodyParser from 'body-parser';
import { ForecastController } from '@src/controller/forecast';
import { Application } from 'express';
import * as database from '@src/database';
import { BeachesController } from '@src/controller/beaches';
import { UsersController } from '@src/controller/users';
import logger from '@src/logger';
import expressPino from 'express-pino-logger';
import cors from 'cors';
import { apiErrorValidator } from '@src/middlewares/api-error-validator';
import { BeachMongoDBRepository } from '@src/repositories/beachMongoDBRepository';

export class SetupServer extends Server {
  constructor(private port = 3000) {
    super();
  }

  public async init(): Promise<void> {
    this.setupExpress();
    await this.docSetup();
    this.setupControllers();
    await SetupServer.databaseSetup();
    this.setupErrorHandlers();
  }

  private setupExpress(): void {
    this.app.use(bodyParser.json());
    this.app.use(
      expressPino({
        logger,
      })
    );
    this.app.use(
      cors({
        origin: '*',
      })
    );
  }

  private setupErrorHandlers(): void {
    this.app.use(apiErrorValidator);
  }

  private setupControllers(): void {
    const forecastController = new ForecastController(
      new BeachMongoDBRepository()
    );
    const beachesController = new BeachesController(
      new BeachMongoDBRepository()
    );
    const usersController = new UsersController();
    this.addControllers([
      forecastController,
      beachesController,
      usersController,
    ]);
  }

  private static async databaseSetup(): Promise<void> {
    await database.connect();
  }

  public start(): void {
    this.app.listen(this.port, () => {
      logger.info(`Server listening of port: ${this.port}`);
    });
  }

  public async close(): Promise<void> {
    await database.close();
  }

  private async docSetup(): Promise<void> {
    this.app.use('/docs', swaggerUi.serve, swaggerUi.setup(apiSchema));
    await new OpenApiValidator({
      apiSpec: apiSchema as OpenAPIV3.Document,
      validateRequests: false,
      validateResponses: false,
    });
  }

  public getApp(): Application {
    return this.app;
  }
}
