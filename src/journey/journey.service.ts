import { HttpService } from '@nestjs/axios';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Journey } from './journey.schema';
import { CreateJourneyDto } from './dtos/create-journey.dto';
import { Point } from '../start_point/point.schema';
import { PointService } from 'src/start_point/point.service';
import { JourneyInterface } from './dtos/updateJourneyOrder';

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
    pointId: string,
  ): Promise<Journey> {
    const pointExist = await this.pointModel.findById(pointId).exec();
    if (!pointExist) {
      throw new NotFoundException(`Point with ID ${pointId} not found`);
    }

    const newJourney = new this.journeyModel({
      ...createJourneyDto,
      point: pointId,
      order: pointExist.journeys.length + 1,

    });

    const savedJourney = await newJourney.save();

    await this.pointService.addJourneyToPoint(
      pointId,
      savedJourney._id.toString(),
    );

    return savedJourney;
  }

  async findAll(): Promise<Journey[]> {
    return this.journeyModel.find().exec();
  }

  async findByPointId(pointId: string): Promise<Journey[]> {
    return this.journeyModel.find({ point: pointId }).exec();
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

  async updateOrder(journeys: JourneyInterface[]) {
    const bulkOperations = journeys.map((trail) => ({
      updateOne: {
        filter: { _id: new Types.ObjectId(trail._id) },
        update: { $set: { order: trail.order } },
      },
    }));

    const result = await this.journeyModel.bulkWrite(bulkOperations);
    console.log(`Bulk update result: ${JSON.stringify(result)}`);
    return result;
  }
}
