import { Module } from "@nestjs/common";
import { LikesRepoService } from "./likesRepo.service";

@Module({
    imports: [],
    providers: [LikesRepoService],
    exports: [LikesRepoService]
})
export class LikesRepoModule { }