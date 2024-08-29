import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PointSchema } from './point.schema';
import { PointService } from './point.service';
import { PointController } from './point.controller';
import { ContentModule } from '../content/content.module';
import { HttpModule } from '@nestjs/axios';

@Module({
    imports: [
        HttpModule,
        MongooseModule.forFeature([{ name: 'Point', schema: PointSchema }]),
        forwardRef(() => ContentModule),
    ],
    providers: [PointService],
    controllers: [PointController],
    exports: [MongooseModule, PointService],
})
export class PointModule {}
