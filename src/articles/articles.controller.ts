import {
  Body,
  BadRequestException,
  Controller,
  Get,
  Param,
  ParseEnumPipe,
  Post,
  Query,
} from '@nestjs/common';

import { ArticlesService } from './articles.service';

import { CreateArticleDto } from './dto/create-article.dto';
import { ArticleStatus } from '../common/enums/article-status.enum';
import { Types } from 'mongoose';

@Controller('articles')
export class ArticlesController {
  constructor(
    private readonly articlesService:
      ArticlesService,
  ) {}

  @Get()
  findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    return this.articlesService.findApproved(
      Number(page),
      Number(limit),
    );
  }

  @Get('status/:status')
  findByStatus(
    @Param('status', new ParseEnumPipe(ArticleStatus))
    status: ArticleStatus,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    return this.articlesService.findByStatus(
      status,
      Number(page),
      Number(limit),
    );
  }

  @Get('filter')
  findFiltered(
    @Query('status') status?: string,
    @Query('userId') userId?: string,
    @Query('featured') featured?: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    if (
      status &&
      !Object.values(ArticleStatus).includes(
        status as ArticleStatus,
      )
    ) {
      throw new BadRequestException(
        'status must be PENDING, APPROVED, or REJECTED',
      );
    }

    if (userId && !Types.ObjectId.isValid(userId)) {
      throw new BadRequestException(
        'userId must be a valid MongoDB ObjectId',
      );
    }

    let featuredFilter: boolean | undefined;
    if (featured !== undefined) {
      if (featured !== 'true' && featured !== 'false') {
        throw new BadRequestException(
          'featured must be true or false',
        );
      }
      featuredFilter = featured === 'true';
    }

    return this.articlesService.findFiltered(
      {
        status: status as ArticleStatus | undefined,
        userId,
        featured: featuredFilter,
      },
      Number(page),
      Number(limit),
    );
  }

  @Get('my-articles')
  findMyArticles(@Query('userId') userId: string) {
    return this.articlesService.findMyArticles(
      userId,
    );
  }

  @Get('user/:userId')
  findByUserId(@Param('userId') userId: string) {
    return this.articlesService.findMyArticles(
      userId,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.articlesService.findOne(id);
  }

  @Post()
  create(
    @Body() dto: CreateArticleDto,
  ) {
    return this.articlesService.create(
      dto,
      dto.userId!,
    );
  }
}