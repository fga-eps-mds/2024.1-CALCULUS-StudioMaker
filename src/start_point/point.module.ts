import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PointSchema } from './point.schema';
import { PointService } from './point.service';
import { PointController } from './point.controller';
import { ContentModule } from '../content/content.module';
import { HttpModule } from '@nestjs/axios';
import { JourneyModule } from 'src/journey/journey.module';

@Module({
  imports: [
    HttpModule, // Certifique-se de que HttpModule está importado aqui
    forwardRef(() => JourneyModule),
    MongooseModule.forFeature([{ name: 'Point', schema: PointSchema }]),
  ],
  providers: [PointService],
  controllers: [PointController],
  exports: [MongooseModule, PointService],
})
export class PointModule {}
