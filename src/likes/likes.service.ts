import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import {
  Like,
  LikeDocument,
} from './schemas/like.schema';

import { ArticlesService } from '../articles/articles.service';

@Injectable()
export class LikesService {
  constructor(
    @InjectModel(Like.name)
    private readonly likeModel:
      Model<LikeDocument>,

    private readonly articlesService:
      ArticlesService,
  ) {}

  async like(
    articleId: string,
    userId: string,
  ) {
    const existing = await this.likeModel.findOne({
      article: new Types.ObjectId(articleId),
      user: new Types.ObjectId(userId),
    });

    if (existing) {
      throw new ConflictException(
        'Article already liked',
      );
    }

    await this.likeModel.create({
      article: new Types.ObjectId(articleId),
      user: new Types.ObjectId(userId),
    });

    const article =
      await this.articlesService.incrementLikes(
        articleId,
      );

    return {
      message: 'Article liked',
      likesCount: article?.likesCount ?? 0,
    };
  }

  async unlike(
    articleId: string,
    userId: string,
  ) {
    const like =
      await this.likeModel.findOneAndDelete({
        article: new Types.ObjectId(articleId),
        user: new Types.ObjectId(userId),
      });

    if (!like) {
      throw new NotFoundException(
        'Like not found',
      );
    }

    const article =
      await this.articlesService.decrementLikes(
        articleId,
      );

    return {
      message: 'Article unliked',
      likesCount: article?.likesCount ?? 0,
    };
  }
}