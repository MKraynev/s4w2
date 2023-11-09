import { Module } from "@nestjs/common";
import { LikesRepoModule } from "./Repo/likesRepo.module";
import { LikeService } from "./likes.service";
import { PostsModule } from "../Posts/posts.module";
import { PostsRepoModule } from "../Posts/Repo/postsRepo.module";
import { CommentRepoModule } from "../Comments/Repo/commentRepo.module";

@Module({
    imports: [LikesRepoModule, PostsRepoModule, CommentRepoModule],
    providers: [LikeService],
    exports: [LikeService]
})
export class LikesModule{}