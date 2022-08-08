import {
  ClassMiddleware,
  Controller,
  Get,
  Middleware,
} from '@overnightjs/core';
import { Request, Response } from 'express';
import { Forecast } from '@src/services/forecast';
import { authMiddleware } from '@src/middlewares/auth';
import logger from '@src/logger';
import { BaseController } from '@src/controller/index';
import rateLimit from 'express-rate-limit';
import ApiError from '@src/utils/errors/api-error';
import { BeachRepository } from '@src/repositories';

const forecast = new Forecast();

const rateLimiter = rateLimit({
  windowMs: 60 * 100,
  max: 10,
  keyGenerator(req: Request): string {
    return req.ip;
  },
  handler(_, res: Response): void {
    res.status(429).send(
      ApiError.format({
        code: 429,
        message: 'Too many requests to the /forecast endpoint',
      })
    );
  },
});

@Controller('forecast')
@ClassMiddleware(authMiddleware)
export class ForecastController extends BaseController {
  constructor(private beachRepository: BeachRepository) {
    super();
  }

  @Get('')
  @Middleware(rateLimiter)
  public async getForecastForLoggedUser(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      if (!req.decoded?.id) {
        this.sendErrorResponse(res, {
          code: 500,
          message: 'Something went wrong',
        });
        logger.error('Missing userId');
        return;
      }

      const beaches = await this.beachRepository.findAllBeachesForUser(
        req.decoded?.id
      );
      const forecastData = await forecast.processForecastForBeaches(beaches);
      res.status(200).send(forecastData);
    } catch (error) {
      logger.error(error);
      this.sendErrorResponse(res, {
        code: 500,
        message: 'Something went wrong',
      });
    }
  }
}
