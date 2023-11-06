import { Module } from "@nestjs/common";
import { LikesRepoModule } from "./Repo/likesRepo.module";
import { LikeService } from "./likes.service";
import { PostsModule } from "../Posts/posts.module";
import { PostsRepoModule } from "../Posts/Repo/postsRepo.module";

@Module({
    imports: [LikesRepoModule, PostsRepoModule],
    providers: [LikeService],
    exports: [LikeService]
})
export class LikesModule{}