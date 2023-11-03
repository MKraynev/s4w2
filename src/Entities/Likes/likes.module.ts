import { Module } from "@nestjs/common";
import { LikesRepoModule } from "./Repo/likesRepo.module";
import { LikeService } from "./likes.service";

@Module({
    imports: [LikesRepoModule],
    providers: [LikeService],
    exports: [LikeService]
})
export class LikesModule{}