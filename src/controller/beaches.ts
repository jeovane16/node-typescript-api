import { ClassMiddleware, Controller, Post } from '@overnightjs/core';
import { Request, Response } from 'express';
import { authMiddleware } from '@src/middlewares/auth';
import { BaseController } from '@src/controller/index';
import { BeachRepository } from '@src/repositories';

@Controller('beaches')
@ClassMiddleware(authMiddleware)
export class BeachesController extends BaseController {
  constructor(private beachRepository: BeachRepository) {
    super();
  }

  @Post('')
  public async create(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.beachRepository.create({
        ...req.body,
        ...{ user: req.decoded?.id },
      });
      res.status(201).send(result);
    } catch (error) {
      this.sendCreatedUpdateErrorResponse(res, error);
    }
  }
}
