import * as http from 'http';
import { Express } from 'express';
import { DecodedUser } from '@src/services/auth';

declare module 'express-serve-static-core' {
  export interface Request extends http.IncomingMessage, Express.Request {
    decoded?: DecodedUser;
  }
}
