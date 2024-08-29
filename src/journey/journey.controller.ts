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
} from '@nestjs/common';
import { JourneyService } from './journey.service';
import { Request } from 'express';
import { CreateJourneyDto } from './dtos/create-journey.dto';

@Controller('journeys')
export class JourneyController {
  constructor(private readonly journeyService: JourneyService) {}

  @Post()
  async create(@Body() body: CreateJourneyDto, @Req() req: Request) {
    const authHeader = req.headers.authorization as string;
    const token = authHeader?.split(' ')[1];

    if (!token) {
      throw new UnauthorizedException('Token not found');
    }

    const pointId = body.pointId;

    return this.journeyService.create(body, token, pointId);
  }
  @Get()
  async findAll() {
    return this.journeyService.findAll();
  }

  @Get('user/:id')
  async findByUser(@Param('id') userId: string) {
    return this.journeyService.findByUserId(userId);
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.journeyService.findById(id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateJourneyDto: CreateJourneyDto,
  ) {
    return this.journeyService.update(id, updateJourneyDto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.journeyService.delete(id);
  }

  @Patch(':id/add-trail')
  async addTrailToJourney(
    @Param('id') id: string,
    @Body() body: { trailId: string },
  ) {
    return this.journeyService.addTrailToJourney(id, body.trailId);
  }
}
