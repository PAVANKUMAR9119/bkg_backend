import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import {
  Comment,
  CommentSchema,
} from './schemas/comment.schema';

import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';

import { ArticlesModule } from '../articles/articles.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Comment.name,
        schema: CommentSchema,
      },
    ]),

    ArticlesModule,
  ],

  controllers: [
    CommentsController,
  ],

  providers: [
    CommentsService,
  ],
})
export class CommentsModule {}