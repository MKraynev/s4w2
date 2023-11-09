import { Injectable } from "@nestjs/common";
import { CrudService, TakeResult } from "../../Common/Services/crudService";
import { CreateCommentWithTargetAndIdDto } from "./Repo/Dto/CreateCommentDto";
import { CommentRepoService } from "./Repo/commentRepo.service";
import { UserService } from "../Users/users.service";
import { PostService } from "../Posts/posts.service";
import { NotFoundError } from "rxjs";
import { ServiceExecutionResult } from "../../Common/Services/Types/ServiseExecutionResult";
import { ServiceExecutionResultStatus } from "../../Common/Services/Types/ServiceExecutionStatus";
import { ServiceDto } from "../../Common/Services/Types/ServiceDto";
import { CommentDto } from "./Repo/Schema/comment.schema";
import { UsersRepoService } from "../Users/Repo/usersRepo.service";
import { PostsRepoService } from "../Posts/Repo/postsRepo.service";
import { MongooseFindUnit, MongooseRepoFindPattern_AND } from "../../Repos/Mongoose/Searcher/MongooseRepoFindPattern";
import { DecoratedComment } from "./Repo/Dto/comment.decorated";

@Injectable()
export class CommentService {
    constructor(
        private commentRepo: CommentRepoService,
        private userRepo: UsersRepoService,
        private postRepo: PostsRepoService
    ) {
    }

    public async Save(userId: string, userLogin, commentData: CreateCommentWithTargetAndIdDto): Promise<ServiceExecutionResult<ServiceExecutionResultStatus, DecoratedComment>> {
        let userExist = await this.userRepo.IdExist(userId);

        if (!userExist)
            return new ServiceExecutionResult(ServiceExecutionResultStatus.NotFound);

        let targetIDExist = await this.postRepo.IdExist(commentData.targetId)
        if (!targetIDExist)
            return new ServiceExecutionResult(ServiceExecutionResultStatus.NotFound);

        let commentDto = new CommentDto(userId, userLogin, commentData);
        let savedComment = (await this.commentRepo.SaveDto(commentDto)).toObject() as ServiceDto<CommentDto>;

        let decoratedComment: DecoratedComment = {
            id: savedComment.id,
            content: savedComment.content,
            commentatorInfo: {
                userId: savedComment.userId,
                userLogin: savedComment.userLogin
            },
            createdAt: savedComment.createdAt
        };

        return new ServiceExecutionResult(ServiceExecutionResultStatus.Success, decoratedComment);
    }

    public async TakeByPostId(
        postId: string, 
        sortBy: keyof (CommentDto), 
        sortDirection: "asc" | "desc", 
        skip: number = 0, 
        limit: number = 10) : Promise<ServiceExecutionResult<ServiceExecutionResultStatus, Array<DecoratedComment>>>{
        let searchByPostId: MongooseFindUnit<CommentDto> = { field: "targetId", value: postId }
        let findPattern: MongooseRepoFindPattern_AND<CommentDto> = new MongooseRepoFindPattern_AND(searchByPostId);

        let comments = await this.commentRepo.FindByPatterns(findPattern, sortBy, sortDirection, skip, limit);

        let formatedComments: Array<DecoratedComment> = comments.length > 0 ?
            comments.map(comment => {
                let decoratedComment: DecoratedComment = {
                    id: comment.id,
                    content: comment.content,
                    commentatorInfo: {
                        userId: comment.userId,
                        userLogin: comment.userLogin
                    },
                    createdAt: comment.createdAt
                }

                return decoratedComment;
            })
            :[]

        return new ServiceExecutionResult(ServiceExecutionResultStatus.Success, formatedComments);
    }
}