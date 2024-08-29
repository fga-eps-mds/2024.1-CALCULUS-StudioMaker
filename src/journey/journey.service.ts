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
import { Journey } from './journey.schema';
import { CreateJourneyDto } from './dtos/create-journey.dto';
import { Point } from '../start_point/point.schema';
import { PointService } from 'src/start_point/point.service';

@Injectable()
export class JourneyService {
  private readonly logger = new Logger(JourneyService.name);

  constructor(
    @InjectModel('Journey') private readonly journeyModel: Model<Journey>,
    @InjectModel('Point') private readonly pointModel: Model<Point>,
    private readonly pointService: PointService,

    private readonly httpService: HttpService,
  ) {}

  async create(
    createJourneyDto: CreateJourneyDto,
    token: string,
    pointId: string,
  ): Promise<Journey> {
    const userId = await this.pointService.validateTokenAndGetUserId(token);

    const pointExist = await this.pointModel.findById(pointId).exec();
    if (!pointExist) {
      throw new NotFoundException(`Point with ID ${pointId} not found`);
    }
    this.logger.log(`User ID from token: ${userId}`);

    if (!userId) {
      throw new UnauthorizedException('Invalid token');
    }

    const newJourney = new this.journeyModel({
      ...createJourneyDto,
      point: pointId,
      user: userId,
    });
    const savedJourney = await newJourney.save();

    await this.addJourneyToUser(userId, savedJourney._id.toString());

    await this.pointService.addJourneyToPoint(
      pointId,
      savedJourney._id.toString(),
    );

    return savedJourney;
  }

  async addJourneyToUser(userId: string, journeyId: string): Promise<void> {
    try {
      await firstValueFrom(
        this.httpService.patch(
          `${process.env.USER_SERVICE_URL}/${userId}/add-journey`,
          { journeyId },
        ),
      );
      this.logger.log(`Added journey ${journeyId} to user ${userId}`);
    } catch (err) {
      this.logger.error(`Failed to add journey to user: ${err.message}`);
      throw new NotFoundException('Failed to update user with new journey');
    }
  }

  async findAll(): Promise<Journey[]> {
    return this.journeyModel.find().exec();
  }

  async findByUserId(userId: string): Promise<Journey[]> {
    return this.journeyModel.find({ user: userId }).exec();
  }

  async findById(id: string): Promise<Journey> {
    const journey = await this.journeyModel.findById(id).exec();
    if (!journey) {
      throw new NotFoundException(`Journey with ID ${id} not found`);
    }
    return journey;
  }

  async update(
    id: string,
    updateJourneyDto: CreateJourneyDto,
  ): Promise<Journey> {
    const journey = await this.journeyModel
      .findByIdAndUpdate(id, updateJourneyDto, { new: true })
      .exec();
    if (!journey) {
      throw new NotFoundException(`Journey with ID ${id} not found`);
    }
    return journey;
  }

  async delete(id: string): Promise<Journey> {
    const journey = await this.journeyModel.findByIdAndDelete(id).exec();
    if (!journey) {
      throw new NotFoundException(`Journey with ID ${id} not found`);
    }
    this.logger.log(`Deleted journey with ID ${id}`);
    return journey;
  }

  async addTrailToJourney(
    journeyId: string,
    trailId: string,
  ): Promise<Journey> {
    const journey = await this.journeyModel.findById(journeyId).exec();
    if (!journey) {
      throw new NotFoundException(`Journey with ID ${journeyId} not found`);
    }

    const objectId = new Types.ObjectId(trailId);

    if (!journey.trails) {
      journey.trails = [];
    }

    journey.trails.push(objectId);

    return journey.save();
  }
}
