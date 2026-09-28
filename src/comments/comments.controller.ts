import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';

import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';

@Controller()
export class CommentsController {
  constructor(
    private readonly commentsService:
      CommentsService,
  ) {}

  @Get('articles/:articleId/comments')
  findComments(
    @Param('articleId') articleId: string,
  ) {
    return this.commentsService.findByArticle(
      articleId,
    );
  }

  @Post('articles/:articleId/comments')
  create(
    @Param('articleId') articleId: string,
    @Body() dto: CreateCommentDto,
  ) {
    return this.commentsService.create(
      articleId,
      dto.userId!,
      dto,
    );
  }

  @Delete('comments/:id')
  delete(
    @Param('id') id: string,
    @Query('userId') userId: string,
  ) {
    return this.commentsService.delete(
      id,
      userId,
    );
  }
}