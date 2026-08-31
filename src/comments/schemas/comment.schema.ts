import {
  Prop,
  Schema,
  SchemaFactory,
} from '@nestjs/mongoose';

import {
  HydratedDocument,
  Types,
} from 'mongoose';

export type CommentDocument =
  HydratedDocument<Comment>;

@Schema({
  timestamps: true,
})
export class Comment {
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

  @Prop({
    type: String,
    required: true,
    trim: true,
  })
  content: string | undefined;

  @Prop({
    type: Boolean,
    default: false,
  })
  isDeleted: boolean | undefined;
}

export const CommentSchema =
  SchemaFactory.createForClass(Comment);

CommentSchema.index({
  article: 1,
  createdAt: -1,
});
