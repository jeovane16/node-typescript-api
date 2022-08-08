import { DefaultMongoDBRepository } from '@src/repositories/defaultMongoDBRepository';
import { Beach } from '@src/models/beach';
import { BeachRepository, WithId } from '@src/repositories/index';

export class BeachMongoDBRepository
  extends DefaultMongoDBRepository<Beach>
  implements BeachRepository
{
  constructor(private beachModel = Beach) {
    super(beachModel);
  }

  async findAllBeachesForUser(userId: string): Promise<WithId<Beach>[]> {
    return await this.find({ userId });
  }
}
