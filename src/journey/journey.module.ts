import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JourneySchema } from './journey.schema';
import { JourneyService } from './journey.service';
import { HttpModule } from '@nestjs/axios';
import { JourneyController } from './journey.controller';
import { PointModule } from 'src/start_point/point.module';

@Module({
  imports: [
    HttpModule,
    MongooseModule.forFeature([{ name: 'Journey', schema: JourneySchema }]),
    forwardRef(() => PointModule),
  ],
  providers: [JourneyService],
  controllers: [JourneyController],
  exports: [MongooseModule, JourneyService],
})
export class JourneyModule {}
