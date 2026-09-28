import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
} from '@nestjs/common';

import { ArticlesService } from '../articles/articles.service';

@Controller('admin')
export class AdminController {
  constructor(
    private readonly articlesService:
      ArticlesService,
  ) {}

  @Get('articles/pending')
  pendingArticles() {
    return this.articlesService.findPending();
  }

  @Patch('articles/:id/approve')
  approve(
    @Param('id') id: string,
  ) {
    return this.articlesService.approve(id);
  }

  @Patch('articles/:id/reject')
  reject(
    @Param('id') id: string,
    @Body('reason') reason: string,
  ) {
    return this.articlesService.reject(
      id,
      reason,
    );
  }
}
