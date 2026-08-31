import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ArticlesModule } from './articles/articles.module';
import { CommentsModule } from './comments/comments.module';
import { LikesModule } from './likes/likes.module';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [
    MongooseModule.forRoot(
      process.env.MONGODB_URI ||
        'mongodb://Pavan:Pavan%401996@187.127.218.27:27017/bkg_dev?authSource=admin'
    ),

    AuthModule,
    UsersModule,
    ArticlesModule,
    CommentsModule,
    LikesModule,
    AdminModule,
  ],
})
export class AppModule {}