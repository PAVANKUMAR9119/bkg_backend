import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { UserRole } from '../../common/enums/role.enum';

export type UserDocument = HydratedDocument<User>;

export enum UserType {
  STUDENT = 'STUDENT',
  TEACHER = 'TEACHER',
  AUTHOR = 'AUTHOR',
}

@Schema({
  timestamps: true,
})
export class User {
  @Prop({ type: String, required: true, trim: true })
  name: string | undefined;

  @Prop({
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  })
  email: string | undefined;

  @Prop({ type: String, required: true })
  phone: string | undefined;

  @Prop({ type: String, required: true })
  password!: string;

  @Prop({
    type: String,
    required: true,
    enum: UserType,
  })
  type: UserType | undefined;

  @Prop({ type: String })
  profileImage?: string;

  @Prop({
    type: String,
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole | undefined;

  @Prop({ type: Boolean, default: true })
  isActive: boolean | undefined;
}

export const UserSchema = SchemaFactory.createForClass(User);
