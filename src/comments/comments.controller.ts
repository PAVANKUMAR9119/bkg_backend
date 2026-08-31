import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/gaurds/jwt-auth.guard';

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
  @UseGuards(JwtAuthGuard)
  create(
    @Param('articleId') articleId: string,
    @Body() dto: CreateCommentDto,
    @Req() req: any,
  ) {
    return this.commentsService.create(
      articleId,
      req.user._id.toString(),
      dto,
    );
  }

  @Delete('comments/:id')
  @UseGuards(JwtAuthGuard)
  delete(
    @Param('id') id: string,
    @Req() req: any,
  ) {
    return this.commentsService.delete(
      id,
      req.user._id.toString(),
    );
  }
}