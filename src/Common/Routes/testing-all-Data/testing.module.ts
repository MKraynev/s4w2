import { Module } from '@nestjs/common';
import { TestController } from './testing.controller';
import { TestService } from './testing.service';
import { BlogsRepoModule } from '../../../Entities/Blogs/BlogsRepo/blogsRepo.module';
import { PostsRepoModule } from '../../../Entities/Posts/PostsRepo/postsRepo.module';
import { UsersRepoModule } from '../../../Entities/Users/UsersRepo/usersRepo.module';

@Module({
  imports: [BlogsRepoModule, PostsRepoModule, UsersRepoModule],
  controllers: [TestController],
  providers: [TestService],
})
export class TestModule { }