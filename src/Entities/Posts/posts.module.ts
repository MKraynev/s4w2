import { Module } from '@nestjs/common';
import { PostService } from './posts.service';
import { PostController } from './posts.controller';
import { PostsRepoModule } from './Repo/postsRepo.module';
import { BlogsRepoModule } from '../Blogs/Repo/blogsRepo.module';
import { LikesModule } from '../Likes/likes.module';
import { CommentModule } from '../Comments/comments.module';


@Module({
    imports: [PostsRepoModule, BlogsRepoModule, CommentModule, LikesModule, CommentModule],
    controllers: [PostController],
    providers: [PostService],
    exports: [PostService]
})
export class PostsModule { }