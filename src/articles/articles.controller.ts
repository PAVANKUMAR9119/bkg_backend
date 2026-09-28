import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';

import { ArticlesService } from './articles.service';

import { CreateArticleDto } from './dto/create-article.dto';

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

  @Get('my-articles')
  findMyArticles(@Query('userId') userId: string) {
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