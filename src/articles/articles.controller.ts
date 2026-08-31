import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';

import { ArticlesService } from './articles.service';

import { CreateArticleDto } from './dto/create-article.dto';

import { JwtAuthGuard } from '../auth/gaurds/jwt-auth.guard';

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
  @UseGuards(JwtAuthGuard)
  findMyArticles(@Req() req: any) {
    return this.articlesService.findMyArticles(
      req.user._id.toString(),
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.articlesService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(
    @Body() dto: CreateArticleDto,
    @Req() req: any,
  ) {
    return this.articlesService.create(
      dto,
      req.user._id.toString(),
    );
  }
}