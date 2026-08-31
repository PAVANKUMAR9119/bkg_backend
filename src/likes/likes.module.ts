import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import {
  Like,
  LikeSchema,
} from './schemas/like.schema';

import { LikesController } from './likes.controller';
import { LikesService } from './likes.service';

import { ArticlesModule } from '../articles/articles.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Like.name,
        schema: LikeSchema,
      },
    ]),

    ArticlesModule,
  ],

  controllers: [
    LikesController,
  ],

  providers: [
    LikesService,
  ],
})
export class LikesModule {}