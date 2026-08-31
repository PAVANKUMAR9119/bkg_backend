import {
  Prop,
  Schema,
  SchemaFactory,
} from '@nestjs/mongoose';

import {
  HydratedDocument,
  Types,
} from 'mongoose';

export type LikeDocument =
  HydratedDocument<Like>;

@Schema({
  timestamps: true,
})
export class Like {
  @Prop({
    type: Types.ObjectId,
    ref: 'Article',
    required: true,
  })
  article: Types.ObjectId | undefined;

  @Prop({
    type: Types.ObjectId,
    ref: 'User',
    required: true,
  })
  user: Types.ObjectId | undefined;
}

export const LikeSchema =
  SchemaFactory.createForClass(Like);

LikeSchema.index(
  {
    article: 1,
    user: 1,
  },
  {
    unique: true,
  },
);