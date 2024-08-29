import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import {
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Point } from './point.schema';
import { CreateStartPointDto } from './dtos/create-start-point.dto';

@Injectable()
export class PointService {
  private readonly logger = new Logger(PointService.name);

  constructor(
    @InjectModel('Point') private readonly pointModel: Model<Point>,
    private readonly httpService: HttpService,
  ) {}

  async create(
    createStartPointDto: CreateStartPointDto,
    token: string,
  ): Promise<Point> {
    const userId = await this.validateTokenAndGetUserId(token);

    if (!userId) {
      throw new UnauthorizedException('Invalid token');
    }

    const newPoint = new this.pointModel({
      ...createStartPointDto,
      user: userId,
    });

    const savedPoint = await newPoint.save();

    await this.addPointToUser(userId, savedPoint._id.toString());

    return savedPoint;
  }

  async addPointToUser(userId: string, pointId: string): Promise<void> {
    try {
      await firstValueFrom(
        this.httpService.patch(
          `${process.env.USER_SERVICE_URL}/${userId}/add-point`,
          { pointId },
        ),
      );
      this.logger.log(`Added point ${pointId} to user ${userId}`);
    } catch (err) {
      this.logger.error(`Failed to add point to user: ${err.message}`);
      throw new NotFoundException('Failed to update user with new point');
    }
  }

  async validateTokenAndGetUserId(token: string): Promise<string | null> {
    try {
      this.logger.log(`Validating token: ${token}`);
      const response = await firstValueFrom(
        this.httpService.get(`${process.env.AUTH_SERVICE_URL}/validate-token`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      );
      this.logger.log(
        `Token validation response: ${JSON.stringify(response.data)}`,
      );
      return response.data.userPayload?.id || null;
    } catch (err) {
      this.logger.error(`Token validation failed: ${err.message}`);
      return null;
    }
  }

  async findAll(): Promise<Point[]> {
    return this.pointModel.find().exec();
  }

  async findByUserId(userId: string): Promise<Point[]> {
    return this.pointModel.find({ user: userId }).exec();
  }

  async findById(id: string): Promise<Point> {
    const point = await this.pointModel.findById(id).exec();
    if (!point) {
      throw new NotFoundException(`Point with ID ${id} not found`);
    }
    return point;
  }

  async update(
    id: string,
    updateStartPointDto: CreateStartPointDto,
  ): Promise<Point> {
    const point = await this.pointModel
      .findByIdAndUpdate(id, updateStartPointDto, { new: true })
      .exec();
    if (!point) {
      throw new NotFoundException(`Point with ID ${id} not found`);
    }
    return point;
  }

  async delete(id: string): Promise<Point> {
    const point = await this.pointModel.findByIdAndDelete(id).exec();
    if (!point) {
      throw new NotFoundException(`Journey with ID ${id} not found`);
    }
    this.logger.log(`Deleted point with ID ${id}`);
    return point;
  }

  async addJourneyToPoint(pointId: string, journeyId: string): Promise<Point> {
    const point = await this.pointModel.findById(pointId).exec();
    if (!point) {
      throw new NotFoundException(`Point with ID ${pointId} not found`);
    }

    const objectId = new Types.ObjectId(journeyId);

    if (!point.journeys) {
      point.journeys = [];
    }

    point.journeys.push(objectId);

    return point.save();
  }

  async getJourneysByPointId(pointId: string): Promise<Types.ObjectId[]> {
    const point = await this.pointModel.findById(pointId).exec();
    if (!point) {
      throw new NotFoundException(`Point with ID ${pointId} not found`);
    }
    return point.journeys || [];
  }
}
