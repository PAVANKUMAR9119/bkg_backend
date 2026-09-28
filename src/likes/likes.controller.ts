import {
  Controller,
  Delete,
  Param,
  Post,
  Query,
} from '@nestjs/common';

import { LikesService } from './likes.service';

@Controller('articles/:articleId/like')
export class LikesController {
  constructor(
    private readonly likesService:
      LikesService,
  ) {}

  @Post()
  like(
    @Param('articleId') articleId: string,
    @Query('userId') userId: string,
  ) {
    return this.likesService.like(
      articleId,
      userId,
    );
  }

  @Delete()
  unlike(
    @Param('articleId') articleId: string,
    @Query('userId') userId: string,
  ) {
    return this.likesService.unlike(
      articleId,
      userId,
    );
  }
}