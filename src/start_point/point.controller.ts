import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Req,
  UnauthorizedException,
  Delete,
  Patch,
  NotFoundException,
} from '@nestjs/common';
import { PointService } from './point.service';
import { Request } from 'express';
import { CreateStartPointDto } from './dtos/create-start-point.dto';

@Controller('points')
export class PointController {
  constructor(private readonly pointService: PointService) {}

  @Post()
  async create(
    @Body() createStartPointDto: CreateStartPointDto,
    @Req() req: Request,
  ) {
    const authHeader = req.headers.authorization as string;
    const token = authHeader?.split(' ')[1];

    if (!token) {
      throw new UnauthorizedException('Token not found');
    }

    return this.pointService.create(createStartPointDto, token);
  }

  @Get()
  async findAll() {
    return this.pointService.findAll();
  }

  @Get('user/:id')
  async findByUser(@Param('id') userId: string) {
    return this.pointService.findByUserId(userId);
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.pointService.findById(id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateStartPointDto: CreateStartPointDto,
  ) {
    return this.pointService.update(id, updateStartPointDto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.pointService.delete(id);
  }

  @Patch(':id/add-journey')
  async addJourneyToPoint(
    @Param('id') id: string,
    @Body() body: { journeyId: string },
  ) {
    return this.pointService.addJourneyToPoint(id, body.journeyId);
  }

  @Get(':pointId/journeys')
  async getJourneysByPointId(@Param('pointId') pointId: string) {
    try {
      return await this.pointService.getJourneysByPointId(pointId);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      }
      throw error;
    }
  }
}
