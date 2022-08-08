import { Response } from 'express';
import logger from '@src/logger';
import ApiError, { APIError } from '@src/utils/errors/api-error';
import {
  DatabaseError,
  DatabaseUnknownClientError,
  DatabaseValidationError,
} from '@src/repositories/repository';

export abstract class BaseController {
  protected sendCreatedUpdateErrorResponse(
    res: Response,
    error: unknown
  ): void {
    if (
      error instanceof DatabaseValidationError ||
      error instanceof DatabaseUnknownClientError
    ) {
      const clientErrors = this.handleClientErrors(error);
      res.status(clientErrors.code).send(
        ApiError.format({
          code: clientErrors.code,
          message: clientErrors.error,
        })
      );
    } else {
      logger.error(error);
      res
        .status(500)
        .send(ApiError.format({ code: 500, message: 'Something went wrong!' }));
    }
  }

  private handleClientErrors(error: DatabaseError): {
    code: number;
    error: string;
  } {
    if (error instanceof DatabaseValidationError) {
      return {
        code: 409,
        error: error.message,
      };
    }
    return { code: 400, error: error.message };
  }

  protected sendErrorResponse(res: Response, apiError: APIError): Response {
    return res.status(apiError.code).send(ApiError.format(apiError));
  }
}
