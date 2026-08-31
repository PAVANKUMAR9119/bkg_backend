import {
  Prop,
  Schema,
  SchemaFactory,
} from '@nestjs/mongoose';

import { HydratedDocument, Types } from 'mongoose';
import { ArticleStatus } from '../../common/enums/article-status.enum';

export type ArticleDocument =
  HydratedDocument<Article>;

@Schema({
  timestamps: true,
})
export class Article {
  @Prop({
    type: String,
    required: true,
    trim: true,
  })
  title: string | undefined;

  @Prop({
    type: String,
    required: false,
  })
  body: string | undefined;

  @Prop({ type: String })
  image?: string;

  @Prop({
    type: Types.ObjectId,
    ref: 'User',
    required: true,
  })
  author: Types.ObjectId | undefined;

  @Prop({
    type: String,
    enum: ArticleStatus,
    default: ArticleStatus.PENDING,
  })
  status: ArticleStatus | undefined;

  @Prop({ type: String })
  rejectionReason?: string;

  @Prop({
    type: Number,
    default: 0,
  })
  likesCount: number | undefined;

  @Prop({
    type: Number,
    default: 0,
  })
  commentsCount: number | undefined;
}

export const ArticleSchema =
  SchemaFactory.createForClass(Article);

ArticleSchema.index({
  status: 1,
  createdAt: -1,
});
