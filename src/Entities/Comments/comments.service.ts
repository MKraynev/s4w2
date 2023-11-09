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

@Injectable()
export class CommentService {
    constructor(
        private commentRepo: CommentRepoService,
        private userRepo: UsersRepoService,
        private postRepo: PostsRepoService
    ) { }

    public async Save(userId: string, userLogin, commentData: CreateCommentWithTargetAndIdDto): Promise<ServiceExecutionResult<ServiceExecutionResultStatus, ServiceDto<CommentDto>>> {
        let userExist = await this.userRepo.IdExist(userId);

        if (!userExist)
            return new ServiceExecutionResult(ServiceExecutionResultStatus.NotFound);

        let targetIDExist = await this.postRepo.IdExist(commentData.targetId)
        if (!targetIDExist)
            return new ServiceExecutionResult(ServiceExecutionResultStatus.NotFound);

        let commentDto = new CommentDto(userId, userLogin, commentData);
        let saveComment = await this.commentRepo.SaveDto(commentDto);

        return new ServiceExecutionResult(ServiceExecutionResultStatus.Success, saveComment.toObject());
    }
}