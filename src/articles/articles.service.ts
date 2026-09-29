import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import {
  Article,
  ArticleDocument,
} from './schemas/article.schema';

import { CreateArticleDto } from './dto/create-article.dto';
import { ArticleStatus } from '../common/enums/article-status.enum';

@Injectable()
export class ArticlesService {
  constructor(
    @InjectModel(Article.name)
    private readonly articleModel:
      Model<ArticleDocument>,
  ) {}

  async create(
    dto: CreateArticleDto,
    userId: string,
  ) {
    return this.articleModel.create({
      ...dto,
      author: new Types.ObjectId(userId),
      status: ArticleStatus.PENDING,
    });
  }

  async findApproved(page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [articles, total] =
      await Promise.all([
        this.articleModel
          .find({
            status: ArticleStatus.APPROVED,
          })
          .populate(
            'author',
            'name type profileImage',
          )
          .sort({
            createdAt: -1,
          })
          .skip(skip)
          .limit(limit)
          .lean(),

        this.articleModel.countDocuments({
          status: ArticleStatus.APPROVED,
        }),
      ]);

    return {
      articles,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findByStatus(
    status: ArticleStatus,
    page = 1,
    limit = 10,
  ) {
    const skip = (page - 1) * limit;

    const [articles, total] = await Promise.all([
      this.articleModel
        .find({ status })
        .populate(
          'author',
          'name type profileImage',
        )
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      this.articleModel.countDocuments({ status }),
    ]);

    return {
      articles,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findFiltered(
    filters: {
      status?: ArticleStatus;
      userId?: string;
      featured?: boolean;
    },
    page = 1,
    limit = 10,
  ) {
    const skip = (page - 1) * limit;
    const query: Record<string, unknown> = {};

    if (filters.status) {
      query.status = filters.status;
    }
    if (filters.userId) {
      query.author = new Types.ObjectId(filters.userId);
    }
    if (filters.featured !== undefined) {
      query.featured = filters.featured
        ? true
        : { $in: [false, null] };
    }

    const [articles, total] = await Promise.all([
      this.articleModel
        .find(query)
        .populate(
          'author',
          'name type profileImage',
        )
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      this.articleModel.countDocuments(query),
    ]);

    return {
      articles,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const article = await this.articleModel
      .findOne({
        _id: id,
        status: ArticleStatus.APPROVED,
      })
      .populate(
        'author',
        'name type profileImage',
      )
      .lean();

    if (!article) {
      throw new NotFoundException(
        'Article not found',
      );
    }

    return article;
  }

  async findMyArticles(userId: string) {
    return this.articleModel
      .find({
        author: new Types.ObjectId(userId),
      })
      .sort({
        createdAt: -1,
      })
      .lean();
  }

  async approve(id: string) {
    const article =
      await this.articleModel.findByIdAndUpdate(
        id,
        {
          status: ArticleStatus.APPROVED,
          rejectionReason: null,
        },
        {
          new: true,
        },
      );

    if (!article) {
      throw new NotFoundException(
        'Article not found',
      );
    }

    return article;
  }

  async reject(
    id: string,
    reason?: string,
  ) {
    const article =
      await this.articleModel.findByIdAndUpdate(
        id,
        {
          status: ArticleStatus.REJECTED,
          rejectionReason: reason,
        },
        {
          new: true,
        },
      );

    if (!article) {
      throw new NotFoundException(
        'Article not found',
      );
    }

    return article;
  }

  async findPending() {
    return this.articleModel
      .find({
        status: ArticleStatus.PENDING,
      })
      .populate(
        'author',
        'name email phone type profileImage',
      )
      .sort({
        createdAt: 1,
      })
      .lean();
  }

  async incrementLikes(articleId: string) {
    return this.articleModel.findByIdAndUpdate(
      articleId,
      {
        $inc: {
          likesCount: 1,
        },
      },
      {
        new: true,
      },
    );
  }

  async decrementLikes(articleId: string) {
    return this.articleModel.findOneAndUpdate(
      {
        _id: articleId,
        likesCount: {
          $gt: 0,
        },
      },
      {
        $inc: {
          likesCount: -1,
        },
      },
      {
        new: true,
      },
    );
  }

  async incrementComments(articleId: string) {
    return this.articleModel.findByIdAndUpdate(
      articleId,
      {
        $inc: {
          commentsCount: 1,
        },
      },
      {
        new: true,
      },
    );
  }

  async decrementComments(articleId: string) {
    return this.articleModel.findOneAndUpdate(
      {
        _id: articleId,
        commentsCount: {
          $gt: 0,
        },
      },
      {
        $inc: {
          commentsCount: -1,
        },
      },
      {
        new: true,
      },
    );
  }
}