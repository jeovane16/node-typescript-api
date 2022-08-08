import {
  DatabaseInternalError,
  DatabaseUnknownClientError,
  DatabaseValidationError,
  Repository,
} from '@src/repositories/repository';
import { Model, Error } from 'mongoose';
import { BaseModel } from '@src/models';
import { FilterOptions, WithId } from '@src/repositories/index';
import { CUSTOM_VALIDATION } from '@src/models/user';
import logger from '@src/logger';

export abstract class DefaultMongoDBRepository<
  T extends BaseModel
> extends Repository<T> {
  constructor(private model: Model<T>) {
    super();
  }

  public async create(data: T): Promise<WithId<T>> {
    try {
      const model = new this.model(data);
      const createdData = await model.save();
      return createdData.toObject<WithId<T>>();
    } catch (error) {
      this.handleError(error);
    }
  }

  public async find(filter: FilterOptions) {
    try {
      const data = await this.model.find(filter);
      return data.map((d) => d.toObject<WithId<T>>());
    } catch (error) {
      this.handleError(error);
    }
  }

  protected handleError(error: unknown): never {
    if (error instanceof Error.ValidationError) {
      const duplicatedKindErrors = Object.values(error.errors).filter(
        (err) =>
          err.name === 'ValidatorError' &&
          err.kind === CUSTOM_VALIDATION.DUPLICATED
      );
      if (duplicatedKindErrors.length) {
        throw new DatabaseValidationError(error.message);
      }
      throw new DatabaseUnknownClientError(error.message);
    }
    logger.warn('Database error ', error);
    throw new DatabaseInternalError(
      'Something unexpected happened to the database'
    );
  }
}
