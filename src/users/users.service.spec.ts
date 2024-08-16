import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { UsersService } from './users.service';
import { User } from './schemas/user.schema';
import { Model } from 'mongoose';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

jest.mock('axios');
jest.mock('fs');

const mockedAxios = axios as jest.Mocked<typeof axios>;

const mockUser = {
  _id: '123',
  name: 'Test User',
  email: 'test@example.com',
  avatar: 'https://reqres.in/img/faces/1-image.jpg',
  avatarHash: 'mockhash',
};

const mockUserModel = {
  findOne: jest.fn(),
  findByIdAndDelete: jest.fn(),
  updateOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  exec: jest.fn(),
};

describe('UsersService', () => {
  let service: UsersService;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let model: Model<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    model = module.get<Model<User>>(getModelToken(User.name));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should get avatar from external API and save locally', async () => {
    jest.spyOn(crypto, 'createHash').mockReturnValueOnce({
      update: () => ({ digest: () => 'mockhash' }),
    } as any);

    mockUserModel.findOne.mockResolvedValueOnce(null);
    mockedAxios.get.mockResolvedValueOnce({
      data: {
        data: {
          ...mockUser,
          avatar: 'https://reqres.in/img/faces/1-image.jpg',
        },
      },
    });
    mockedAxios.get.mockResolvedValueOnce({
      data: Buffer.from('avatar image data', 'binary'),
    });

    const base64Avatar = await service.getAvatar('123');

    expect(fs.writeFileSync).toHaveBeenCalledWith(
      path.join(__dirname, '..', 'avatars', 'mockhash.png'),
      Buffer.from('avatar image data', 'binary'),
    );
    expect(base64Avatar).toEqual(
      Buffer.from('avatar image data', 'binary').toString('base64'),
    );
  });

  it('should return existing avatar if already saved locally', async () => {
    const existingUser = { ...mockUser, avatarHash: 'mockhash' };
    mockUserModel.findOne.mockResolvedValueOnce(existingUser);

    mockedAxios.get.mockResolvedValueOnce({ data: { data: mockUser } });

    jest.spyOn(fs, 'existsSync').mockReturnValue(true);
    jest
      .spyOn(fs, 'readFileSync')
      .mockReturnValue(Buffer.from('avatar image data', 'binary'));

    const base64Avatar = await service.getAvatar('123');

    expect(base64Avatar).toEqual(
      Buffer.from('avatar image data', 'binary').toString('base64'),
    );
  });

  it('should delete avatar from local storage and database', async () => {
    const existingUser = { ...mockUser, avatarHash: 'mockhash' };
    mockUserModel.findOne.mockResolvedValueOnce(existingUser);

    jest.spyOn(fs, 'unlinkSync').mockImplementation(() => {});

    const result = await service.deleteAvatar('123');

    expect(fs.unlinkSync).toHaveBeenCalledWith(
      path.join(__dirname, '..', 'avatars', 'mockhash.png'),
    );
    expect(result).toEqual({ message: 'Avatar deleted successfully' });
  });
});
