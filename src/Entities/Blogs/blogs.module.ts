import { Module } from '@nestjs/common';
import { BlogController } from './blogs.controller';
import { BlogService } from './blogs.service';
import { BlogsRepoModule } from './BlogsRepo/blogsRepo.module';
import { PostsModule } from '../Posts/posts.module';
import { LikesModule } from '../Likes/likes.module';

@Module({
  imports: [BlogsRepoModule, PostsModule, LikesModule],
  controllers: [BlogController],
  providers: [BlogService],
})
export class BlogsModule {}