import { IsString, IsOptional, IsMongoId } from 'class-validator';

export class CreateJourneyDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsOptional()
  @IsMongoId()
  user?: string;

  @IsOptional()
  @IsMongoId()
  pointId?: string;
}
