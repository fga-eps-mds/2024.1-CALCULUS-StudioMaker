import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Content } from './content.schema';
import { Trail } from '../trail/trail.schema';
import { TrailService } from '../trail/trail.service';
import { ContentInterface } from './dtos/update-content-order.dto';

@Injectable()
export class ContentService {
  private readonly logger = new Logger(ContentService.name);

  constructor(
    @InjectModel('Content') private readonly contentModel: Model<Content>,
    @InjectModel('Trail') private readonly trailModel: Model<Trail>,
    private readonly trailService: TrailService,
  ) {}

  async createContent(
    title: string,
    content: string,
    trailId: string,
  ): Promise<Content> {
    const trailExists = await this.trailModel.findById(trailId).exec();
    if (!trailExists) {
      throw new NotFoundException(`Trail with ID ${trailId} not found`);
    }

    const contentCount = trailExists.contents.length + 1;

    const newContent = new this.contentModel({
      title,
      content,
      trail: trailId,
      order: contentCount,
    });

    await this.trailService.addContentToTrail(
      trailId,
      newContent._id.toString(),
    );

    return newContent.save();
  }

  async findContentsByTrailId(trailId: string): Promise<Content[]> {
    this.logger.log(`Finding contents by trail ID: ${trailId}`);
    const trail = await this.trailModel.findById(trailId).exec();
    if (!trail) {
      throw new NotFoundException(`Trail with ID ${trailId} not found`);
    }
    return this.contentModel.find({ trail: trailId }).exec();
  }

  async findContentById(id: string): Promise<Content> {
    const content = await this.contentModel.findById(id).exec();
    if (!content) {
      throw new NotFoundException(`Content with ID ${id} not found`);
    }
    return content;
  }

  async findAllContents(): Promise<Content[]> {
    return this.contentModel.find().exec();
  }

  async updateContent(
    id: string,
    updateData: Partial<Content>,
  ): Promise<Content> {
    const content = await this.contentModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();
    if (!content) {
      throw new NotFoundException(`Content with ID ${id} not found`);
    }
    return content;
  }

  async deleteContent(id: string): Promise<void> {
    const result = await this.contentModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Content with ID ${id} not found`);
    }
  }

  async updateContentOrder(contents: ContentInterface[]) {
    const bulkOperations = contents.map((content) => ({
      updateOne: {
        filter: { _id: new Types.ObjectId(content._id) },
        update: { $set: { order: content.order } },
      },
    }));

    const result = await this.contentModel.bulkWrite(bulkOperations);
    console.log(`Bulk update result: ${JSON.stringify(result)}`);
    return result;
  }
}
