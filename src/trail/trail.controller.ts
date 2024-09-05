import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Param,
  Body,
  NotFoundException,
  Logger,
  Patch,
} from '@nestjs/common';
import { TrailService } from './trail.service';
import { UpdateTrailsDtos } from 'src/trail/dtos/updateTrailsDtos';

@Controller('trails')
export class TrailController {
  constructor(private readonly trailService: TrailService) {}
  private readonly logger = new Logger(TrailController.name);
  @Post()
  async createTrail(@Body() body: { name: string; journeyId: string }) {
    const { name, journeyId } = body;

    if (!journeyId) {
      throw new NotFoundException('Journey ID not provided in body');
    }

    return this.trailService.createTrail(name, journeyId);
  }

  @Get(':id')
  async getTrailById(@Param('id') id: string) {
    return this.trailService.findTrailById(id);
  }

  @Get()
  async getAllTrails() {
    return this.trailService.findAllTrails();
  }

  @Get('journey/:id')
  async getTrailsByJourneyId(@Param('id') id: string) {
    return this.trailService.findTrailsByJourneyId(id);
  }

  @Put(':id')
  async updateTrail(
    @Param('id') id: string,
    @Body() updateData: Partial<{ name: string; description?: string }>,
  ) {
    return this.trailService.updateTrail(id, updateData);
  }

  @Put(':id/addContent')
  async addContentToTrail(
    @Param('id') trailId: string,
    @Body() body: { contentId: string },
  ) {
    const { contentId } = body;
    if (!contentId) {
      throw new NotFoundException('Content ID not provided in body');
    }
    return this.trailService.addContentToTrail(trailId, contentId);
  }

  @Put(':id/removeContent')
  async removeContentFromTrail(
    @Param('id') trailId: string,
    @Body() body: { contentId: string },
  ) {
    const { contentId } = body;
    return this.trailService.removeContentFromTrail(trailId, contentId);
  }

  @Delete(':id')
  async deleteTrail(@Param('id') id: string) {
    await this.trailService.deleteTrail(id);
    return { message: 'Trail deleted successfully' };
  }

  @Patch('update-trail-order')
  async updateTrailOrder(@Body() trailsDto: UpdateTrailsDtos) {
    this.logger.log(
      `Updating trail order for the list: ${JSON.stringify(trailsDto.trails)}`,
    );
    const result = await this.trailService.updateTrailOrder(trailsDto.trails);
    return result;
  }
}
