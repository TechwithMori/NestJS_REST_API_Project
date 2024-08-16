import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './schemas/user.schema';
import * as amqplib from 'amqplib';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import axios from 'axios';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const createdUser = new this.userModel(createUserDto);
    return createdUser.save();
  }

  async sendUserCreationNotification(user: User) {
    // Dummy email sending
    console.log(`Sending email to ${user.email}...`);

    // RabbitMQ event
    const connection = await amqplib.connect('amqp://localhost');
    const channel = await connection.createChannel();
    await channel.assertQueue('user_creation');
    channel.sendToQueue('user_creation', Buffer.from(JSON.stringify(user)));
    console.log('RabbitMQ event sent for user creation.');
  }

  async getUserFromExternalAPI(userId: string): Promise<any> {
    try {
      const response = await axios.get(`https://reqres.in/api/users/${userId}`);
      return response.data.data;
    } catch (error) {
      throw new Error('Error fetching user from external API');
    }
  }

  async getAvatar(userId: string): Promise<string> {
    const user = await this.getUserFromExternalAPI(userId);
    const avatarUrl = user.avatar;
    const hash = crypto.createHash('md5').update(avatarUrl).digest('hex');

    const avatarPath = path.join(__dirname, '..', 'avatars', `${hash}.png`);

    const existingUser = await this.userModel.findOne({ _id: userId });

    if (existingUser && existingUser.avatarHash) {
      return fs.readFileSync(avatarPath).toString('base64');
    }

    const response = await axios.get(avatarUrl, {
      responseType: 'arraybuffer',
    });
    const avatar = Buffer.from(response.data, 'binary');
    fs.writeFileSync(avatarPath, avatar);

    await this.userModel.updateOne({ _id: userId }, { avatarHash: hash });

    return avatar.toString('base64');
  }

  async deleteAvatar(userId: string) {
    const user = await this.userModel.findOne({ _id: userId });

    if (user && user.avatarHash) {
      const avatarPath = path.join(
        __dirname,
        '..',
        'avatars',
        `${user.avatarHash}.png`,
      );
      fs.unlinkSync(avatarPath);
      await this.userModel.updateOne({ _id: userId }, { avatarHash: null });
      return { message: 'Avatar deleted successfully' };
    }

    return { message: 'Avatar not found' };
  }

  async findAll(): Promise<User[]> {
    return this.userModel.find().exec();
  }

  async findOne(id: string): Promise<User> {
    return this.userModel.findById(id).exec();
  }

  async delete(id: string): Promise<User> {
    return this.userModel.findByIdAndDelete(id).exec();
  }
}
