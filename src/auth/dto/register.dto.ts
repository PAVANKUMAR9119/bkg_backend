import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  MinLength,
} from 'class-validator';
import { UserType } from '../../users/schemas/user.schema';

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  name: string | undefined;

  @IsEmail()
  email: string | undefined;

  @IsString()
  @IsNotEmpty()
  phone: string | undefined;

  @IsString()
  @MinLength(6)
  password: string | undefined;

  @IsEnum(UserType)
  type: UserType | undefined;

  @IsString()
  profileImage?: string;
}