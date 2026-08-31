import {
  Controller,
  Delete,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/gaurds/jwt-auth.guard';
import { LikesService } from './likes.service';

@Controller('articles/:articleId/like')
@UseGuards(JwtAuthGuard)
export class LikesController {
  constructor(
    private readonly likesService:
      LikesService,
  ) {}

  @Post()
  like(
    @Param('articleId') articleId: string,
    @Req() req: any,
  ) {
    return this.likesService.like(
      articleId,
      req.user._id.toString(),
    );
  }

  @Delete()
  unlike(
    @Param('articleId') articleId: string,
    @Req() req: any,
  ) {
    return this.likesService.unlike(
      articleId,
      req.user._id.toString(),
    );
  }
}