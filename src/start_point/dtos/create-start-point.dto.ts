import { IsString, IsOptional, IsMongoId } from 'class-validator';

export class CreateStartPointDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsOptional()
  @IsMongoId()
  user?: string;
}
