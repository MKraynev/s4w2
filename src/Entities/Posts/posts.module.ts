import { Module } from '@nestjs/common';
import { PostService } from './posts.service';
import { PostController } from './posts.controller';
import { PostsRepoModule } from './Repo/postsRepo.module';
import { BlogsRepoModule } from '../Blogs/Repo/blogsRepo.module';
import { LikesModule } from '../Likes/likes.module';
import { CommentsModule } from '../Comments/comments.module';


@Module({
    imports: [PostsRepoModule, BlogsRepoModule, CommentsModule, LikesModule, CommentsModule],
    controllers: [PostController],
    providers: [PostService],
    exports: [PostService]
})
export class PostsModule { }