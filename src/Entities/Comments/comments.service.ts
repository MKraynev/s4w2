import { Injectable } from "@nestjs/common";
import { CrudService } from "../../Common/Services/crudService";
import { CreateCommentDto } from "./CommentsRepo/Dto/CreateCommentDto";
import { CommentDocument, CommentDto } from "./CommentsRepo/Schema/comment.schema";
import { CommentRepoService } from "./CommentsRepo/commentRepo.service";

@Injectable()
export class CommentService extends CrudService<CreateCommentDto, CommentDto, CommentDocument, CommentRepoService>{
    constructor(private commentRepo: CommentRepoService) {
        super(commentRepo);
    }
}