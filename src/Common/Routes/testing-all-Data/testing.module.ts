import { Module } from '@nestjs/common';
import { TestController } from './testing.controller';
import { TestService } from './testing.service';
import { BlogsRepoModule } from '../../../Entities/Blogs/Repo/blogsRepo.module';
import { PostsRepoModule } from '../../../Entities/Posts/Repo/postsRepo.module';
import { UsersRepoModule } from '../../../Entities/Users/Repo/usersRepo.module';
import { CommentRepoModule } from '../../../Entities/Comments/Repo/commentRepo.module';
import { LikesRepoModule } from '../../../Entities/Likes/Repo/likesRepo.module';
import { DevicesRepoModule } from '../../../Entities/Devices/Repo/usersRepo.module';

@Module({
  imports: [BlogsRepoModule, PostsRepoModule, UsersRepoModule, CommentRepoModule, LikesRepoModule, DevicesRepoModule],
  controllers: [TestController],
  providers: [TestService],
})
export class TestModule { }