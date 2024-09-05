import { IsString, IsOptional, IsMongoId } from 'class-validator';

export class CreateJourneyDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description: string;

  @IsOptional()
  @IsMongoId()
  pointId?: string;
}
