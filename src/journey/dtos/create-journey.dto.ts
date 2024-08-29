import { IsString, IsOptional, IsMongoId } from 'class-validator';

export class CreateJourneyDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsMongoId()
  pointId?: string;
}
