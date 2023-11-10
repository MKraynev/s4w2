import { Injectable } from "@nestjs/common";
import { CreateCommentDto, CreateCommentWithTargetAndIdDto } from "./Repo/Dto/CreateCommentDto";
import { CommentRepoService } from "./Repo/commentRepo.service";
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


    public async Save(userId: string, userLogin: string, commentData: CreateCommentWithTargetAndIdDto): Promise<ServiceExecutionResult<ServiceExecutionResultStatus, DecoratedComment>> {
        let userExist = await this.userRepo.IdExist(userId);

        if (!userExist)
            return new ServiceExecutionResult(ServiceExecutionResultStatus.NotFound);

        let targetIDExist = await this.postRepo.IdExist(commentData.targetId)
        if (!targetIDExist)
            return new ServiceExecutionResult(ServiceExecutionResultStatus.NotFound);

        let commentDto = new CommentDto(userId, userLogin, commentData);
        let savedComment = (await this.commentRepo.SaveDto(commentDto)).toObject() as ServiceDto<CommentDto>;

        let decoratedComment = this.Convert(savedComment);

        return new ServiceExecutionResult(ServiceExecutionResultStatus.Success, decoratedComment);
    }

    public async Update(commentId: string, userId: string, commentData: CreateCommentDto): Promise<ServiceExecutionResult<ServiceExecutionResultStatus, DecoratedComment>> {
        let foundComment = await this.commentRepo.FindById(commentId);
        if (!foundComment)
            return new ServiceExecutionResult(ServiceExecutionResultStatus.NotFound)

        if (foundComment.userId !== userId)
            return new ServiceExecutionResult(ServiceExecutionResultStatus.WrongUser)

        foundComment.content = commentData.content;

        let updatedComment = (await this.commentRepo.SaveDocument(foundComment)).toObject() as ServiceDto<CommentDto>;
        let decoratedComment = this.Convert(updatedComment);

        return new ServiceExecutionResult(ServiceExecutionResultStatus.Success, decoratedComment);
    }

    public async Delete(commentId: string, userId: string) {
        let foundComment = await this.commentRepo.FindById(commentId);
        if (!foundComment)
            return new ServiceExecutionResult(ServiceExecutionResultStatus.NotFound)

        if (foundComment.userId !== userId)
            return new ServiceExecutionResult(ServiceExecutionResultStatus.WrongUser)

        let deletedComment = await this.commentRepo.DeleteById(commentId);

        if (!deletedComment)
            return new ServiceExecutionResult(ServiceExecutionResultStatus.DataBaseFailed);

        return new ServiceExecutionResult(ServiceExecutionResultStatus.Success, deletedComment);
    }

    public async TakeById(commentId: string): Promise<ServiceExecutionResult<ServiceExecutionResultStatus, DecoratedComment>> {
        let foundComment = await this.commentRepo.FindById(commentId);

        if (!foundComment)
            return new ServiceExecutionResult(ServiceExecutionResultStatus.NotFound);

        let decoratedComment = this.Convert(foundComment.toObject());
        return new ServiceExecutionResult(ServiceExecutionResultStatus.Success, decoratedComment);
    }
    public async TakeByPostId(
        postId: string,
        sortBy: keyof (CommentDto),
        sortDirection: "asc" | "desc",
        skip: number = 0,
        limit: number = 10): Promise<ServiceExecutionResult<ServiceExecutionResultStatus, Array<DecoratedComment>>> {

        let targetIDExist = await this.postRepo.IdExist(postId)
        if (!targetIDExist)
            return new ServiceExecutionResult(ServiceExecutionResultStatus.NotFound);

        let searchByTarget: MongooseFindUnit<CommentDto> = { field: "target", value: "posts" }
        let searchByPostId: MongooseFindUnit<CommentDto> = { field: "targetId", value: postId }
        let findPattern: MongooseRepoFindPattern_AND<CommentDto> = new MongooseRepoFindPattern_AND(searchByTarget, searchByPostId);

        let comments = await this.commentRepo.FindByPatterns(findPattern, sortBy, sortDirection, skip, limit);

        let formatedComments: Array<DecoratedComment> = comments.length > 0 ?
            comments.map(comment => {
                let objComments = comment.toObject() as ServiceDto<CommentDto>;
                return this.Convert(objComments);
            })
            : []

        return new ServiceExecutionResult(ServiceExecutionResultStatus.Success, formatedComments);
    }



    private Convert(comment: ServiceDto<CommentDto>): DecoratedComment {
        let decoratedComment: DecoratedComment = {
            id: comment.id,
            content: comment.content,
            commentatorInfo: {
                userId: comment.userId,
                userLogin: comment.userLogin
            },
            createdAt: comment.createdAt
        };
        return decoratedComment;
    }
}