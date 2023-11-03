import { Injectable } from "@nestjs/common";
import { CrudService, TakeResult } from "../../Common/Services/crudService";
import { CreateCommentDto } from "./Repo/Dto/CreateCommentDto";
import { CommentDocument, CommentDto } from "./Repo/Schema/comment.schema";
import { CommentRepoService } from "./Repo/commentRepo.service";
import { MongooseFindUnit, MongooseRepoFindPattern_OR } from "../../Repos/Mongoose/Searcher/MongooseRepoFindPattern";
import { CommentTarget } from "./Repo/Dto/CommentTarget";
import { ServiceExecutionResultStatus } from "../../Common/Services/Types/ServiceExecutionStatus";
import { ServiceExecutionResult } from "../../Common/Services/Types/ServiseExecutionResult";
import { ServiceDto } from "../../Common/Services/Types/ServiceDto";

@Injectable()
export class CommentService extends CrudService<CreateCommentDto, CommentDto, CommentDocument, CommentRepoService>{
    constructor(private commentRepo: CommentRepoService) {
        super(commentRepo);
    }

    public async TakeByTarget(
        sortBy: keyof (CommentDto),
        sortDirection: "asc" | "desc",
        loginValue?: string,
        emailValue?: string,
        skip: number = 0,
        limit: number = 10,
        target?: CommentTarget,
        targetId?: string,
    ): Promise<ServiceExecutionResult<ServiceExecutionResultStatus, TakeResult<ServiceDto<CommentDto>>>> {
        let targetFindUnit: MongooseFindUnit<CommentDto> = target ?
            {
                field: "target",
                value: target
            }
            : undefined;

        let idFindUnit: MongooseFindUnit<CommentDto> = targetId ?
            {
                field: "targetId",
                value: targetId
            }
            : undefined;

        let findPattern = new MongooseRepoFindPattern_OR(targetFindUnit, idFindUnit)

        let countComments = await this.commentRepo.CountByPattern(findPattern)
        let foundComments = (await this.commentRepo.FindByPatterns(findPattern, sortBy, sortDirection, skip, limit)).map(comment => comment.toObject()) as ServiceDto<CommentDto>[];

        return new ServiceExecutionResult(ServiceExecutionResultStatus.Success, { count: countComments, items: foundComments });
    }
}