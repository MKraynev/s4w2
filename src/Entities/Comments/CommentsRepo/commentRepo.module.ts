import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { CommentDto, CommentSchema } from "./Schema/comment.schema";
import { CommentRepoService } from "./commentRepo.service";

@Module({
    imports: [MongooseModule.forFeature([{ name: CommentDto.name, schema: CommentSchema }])],
    providers: [CommentRepoService],
    exports: [CommentRepoService]
})
export class CommentRepoModule { }