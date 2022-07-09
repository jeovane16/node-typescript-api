import { SuperTest, Test } from 'supertest';

declare global {
  //eslint-disable-next-line no-var
  var testRequest: SuperTest<Test>;
}
