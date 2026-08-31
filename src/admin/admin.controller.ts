import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/gaurds/jwt-auth.guard';
import { RolesGuard } from '../auth/gaurds/roles.guard';

import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/role.enum';

import { ArticlesService } from '../articles/articles.service';

@Controller('admin')
@UseGuards(
  JwtAuthGuard,
  RolesGuard,
)
@Roles(UserRole.ADMIN)
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
