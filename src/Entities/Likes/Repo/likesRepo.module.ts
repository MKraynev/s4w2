import { Module } from "@nestjs/common";
import { LikesRepoService } from "./likesRepo.service";
import { MongooseModule } from "@nestjs/mongoose";
import { LikeDto, LikeSchema } from "./Schema/like.schema";

@Module({
    imports: [MongooseModule.forFeature([{ name: LikeDto.name, schema: LikeSchema }])],
    providers: [LikesRepoService],
    exports: [LikesRepoService]
})
export class LikesRepoModule { }