import {
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateArticleDto {
  @IsString()
  @IsNotEmpty()
  title: string | undefined;

  @IsString()
  @IsNotEmpty()
  body: string | undefined;

  @IsString()
  @IsNotEmpty()
  userId: string | undefined;

  @IsOptional()
  @IsString()
  image?: string;
}