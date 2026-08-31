import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ArticlesModule } from './articles/articles.module';
import { CommentsModule } from './comments/comments.module';
import { LikesModule } from './likes/likes.module';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [
    MongooseModule.forRoot(
      "mongodb://Pavan:Pavan%401996@187.127.218.27:27017/bkg_dev?authSource=admin"
    ),
    AuthModule,
    UsersModule,
    ArticlesModule,
    CommentsModule,
    LikesModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}