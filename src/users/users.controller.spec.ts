import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../app.module';
import { UsersService } from './users.service';

describe('UsersController (e2e)', () => {
  let app: INestApplication;
  const usersService = {
    getUserFromExternalAPI: jest
      .fn()
      .mockResolvedValue({ id: '123', name: 'Test User' }),
    getAvatar: jest.fn().mockResolvedValue('base64string'),
    deleteAvatar: jest
      .fn()
      .mockResolvedValue({ message: 'Avatar deleted successfully' }),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(UsersService)
      .useValue(usersService)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/api/users/:userId (GET) should get user from external API', () => {
    return request(app.getHttpServer())
      .get('/api/users/123')
      .expect(200)
      .expect({ id: '123', name: 'Test User' });
  });

  it('/api/users/:userId/avatar (GET) should get avatar', () => {
    return request(app.getHttpServer())
      .get('/api/users/123/avatar')
      .expect(200)
      .expect('base64string');
  });

  it('/api/users/:userId/avatar (DELETE) should delete avatar', () => {
    return request(app.getHttpServer())
      .delete('/api/users/123/avatar')
      .expect(200)
      .expect({ message: 'Avatar deleted successfully' });
  });
});
