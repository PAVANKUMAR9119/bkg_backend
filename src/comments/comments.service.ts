import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';
import {
  Model,
  Types,
} from 'mongoose';

import {
  Comment,
  CommentDocument,
} from './schemas/comment.schema';

import { CreateCommentDto } from './dto/create-comment.dto';

import { ArticlesService } from '../articles/articles.service';

@Injectable()
export class CommentsService {
  constructor(
    @InjectModel(Comment.name)
    private readonly commentModel:
      Model<CommentDocument>,

    private readonly articlesService:
      ArticlesService,
  ) {}

  async create(
    articleId: string,
    userId: string,
    dto: CreateCommentDto,
  ) {
    const comment =
      await this.commentModel.create({
        article: new Types.ObjectId(articleId),
        user: new Types.ObjectId(userId),
        content: dto.content,
      });

    await this.articlesService.incrementComments(
      articleId,
    );

    return this.commentModel
      .findById(comment._id)
      .populate(
        'user',
        'name type profileImage',
      )
      .lean();
  }

  async findByArticle(articleId: string) {
    return this.commentModel
      .find({
        article: new Types.ObjectId(articleId),
        isDeleted: false,
      })
      .populate(
        'user',
        'name type profileImage',
      )
      .sort({
        createdAt: -1,
      })
      .lean();
  }

  async delete(
    commentId: string,
    userId: string,
  ) {
    const comment =
      await this.commentModel.findOne({
        _id: commentId,
        user: userId,
        isDeleted: false,
      });

    if (!comment) {
      throw new NotFoundException(
        'Comment not found',
      );
    }

    comment.isDeleted = true;

    await comment.save();

    if (comment.article) {
      await this.articlesService.decrementComments(
        comment.article.toString(),
      );
    }

    return {
      message: 'Comment deleted',
    };
  }
}