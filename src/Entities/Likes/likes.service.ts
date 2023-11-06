import { Injectable } from "@nestjs/common";
import { LikesRepoService } from "./Repo/likesRepo.service";
import { ExtendedLikeInfo } from "./Entities/ExtendedLikeInfo";
import { AvailableLikeStatus, CreateLikeWithIdDto } from "./Repo/Dtos/createLikeDto";
import { ServiceExecutionResult } from "../../Common/Services/Types/ServiseExecutionResult";
import { ServiceExecutionResultStatus } from "../../Common/Services/Types/ServiceExecutionStatus";
import { ServiceDto } from "../../Common/Services/Types/ServiceDto";
import { LikeDocument, LikeDto } from "./Repo/Schema/like.schema";
import { MongooseFindUnit, MongooseRepoFindPattern_AND, MongooseRepoFindPattern_OR } from "../../Repos/Mongoose/Searcher/MongooseRepoFindPattern";
import { PostsRepoService } from "../Posts/Repo/postsRepo.service";

@Injectable()
export class LikeService {
    constructor(private likesRepo: LikesRepoService, private postRepo: PostsRepoService) { }

    public static GetEmptyExtendedData() {
        return new ExtendedLikeInfo();
    }

    public async DecorateWithExtendedInfo(userId: string | undefined, searchById: string, object: any) {
        //TODO убрать private функцию - сделать сборку через new ExtendedLikeInfo(N, M, ...)
        let userStatus: AvailableLikeStatus = userId ?
            await this.FindUserLikeStatus(userId, searchById)
            : AvailableLikeStatus.None;


        let searchByPostId: MongooseFindUnit<LikeDto> = {
            field: "targetId",
            value: searchById
        }
        let searchByLikeStatus: MongooseFindUnit<LikeDto> = {
            field: "likeStatus",
            value: AvailableLikeStatus.Like
        }
        let searchByDislikeStatus: MongooseFindUnit<LikeDto> = {
            field: "likeStatus",
            value: AvailableLikeStatus.Dislike
        }

        let mongooseSearchLikePattern = new MongooseRepoFindPattern_AND(searchByPostId, searchByLikeStatus)
        let countLikes = await this.likesRepo.CountByPattern(mongooseSearchLikePattern);

        let mongooseSearchDislikePattern = new MongooseRepoFindPattern_AND(searchByPostId, searchByDislikeStatus)
        let countDislikes = await this.likesRepo.CountByPattern(mongooseSearchDislikePattern);

        let newestLikes = await this.likesRepo.FindByPatterns(mongooseSearchLikePattern, "createdAt", "desc", 0, 3);        

        let extendedLikesInfo = new ExtendedLikeInfo(countLikes, countDislikes, newestLikes, userStatus);
        
        let result = { ...object, extendedLikesInfo }
        return result;
    }

    public async SetLikeData(likeData: CreateLikeWithIdDto): Promise<ServiceExecutionResult<ServiceExecutionResultStatus, ServiceDto<LikeDto>>> {
        let currentLikeData = await this.FindUserLikeDocument(likeData.userId, likeData.targetId);

        let resultLikeData: LikeDocument;

        if (currentLikeData) {
            //Лайк/дислайк существует
            currentLikeData.likeStatus = likeData.likeStatus;
            resultLikeData = await this.likesRepo.SaveDocument(currentLikeData);
        }
        else {
            //лайка/дислайка еще не было
            let foundPost = await this.postRepo.FindById(likeData.targetId);

            if (!foundPost)
                return new ServiceExecutionResult(ServiceExecutionResultStatus.NotFound);

            let likeDto = new LikeDto(likeData);
            resultLikeData = await this.likesRepo.SaveDto(likeDto);
        }

        return new ServiceExecutionResult(ServiceExecutionResultStatus.Success, resultLikeData.toObject());
    }



    private async FindUserLikeDocument(userId: string, targetId: string): Promise<LikeDocument | undefined> {
        let userIdFindUnit: MongooseFindUnit<LikeDto> = { field: "userId", value: userId }
        let targetIdFindUnit: MongooseFindUnit<LikeDto> = { field: "targetId", value: targetId }

        let findPattern = new MongooseRepoFindPattern_AND(userIdFindUnit, targetIdFindUnit);

        let foundLikes = await this.likesRepo.FindByPatterns(findPattern, "createdAt", "desc", 0, 1) as LikeDocument[];
        return foundLikes[0] || undefined;
    }

    private async FindUserLikeStatus(userId: string, targetId: string): Promise<AvailableLikeStatus> {
        let userLikeDocument = await this.FindUserLikeDocument(userId, targetId);

        return userLikeDocument.toObject().likeStatus || AvailableLikeStatus.None;
    }
}



//     private async GetUserLikeStatus(userId: string, targetId: string): Promise<ExecutionResultContainer<ServicesWithUsersExecutionResult, LikeResponse | null>> {
//         let getUserStatus = await this.likeRepo.GetCurrentLikeStatus(userId, targetId);

//         if (getUserStatus.executionStatus !== ExecutionResult.Pass) {
//             return new ExecutionResultContainer(ServicesWithUsersExecutionResult.NotFound);
//         }

//         return new ExecutionResultContainer(ServicesWithUsersExecutionResult.Success, getUserStatus.executionResultObject?.toObject());
//     }

//     private async GetLastLikes(targetId: string, count: number = 3): Promise<ExecutionResultContainer<ServicesWithUsersExecutionResult, LikeResponse[]>> {
//         let likes = await this.likeRepo.GetLast(targetId, "Like", count);

//         return new ExecutionResultContainer(ServicesWithUsersExecutionResult.Success, likes.map(likeMongooseDto => likeMongooseDto.toObject()));
//     }
//     public async GetLikeStatistic(targetId: string, userId?: string): Promise<LikeStatistic> {
//         let countLikes = await this.likeRepo.Count(targetId, "Like");
//         let countDislikes = await this.likeRepo.Count(targetId, "Dislike");
//         let userStatus =  userId? (await this.GetUserLikeStatus(userId, targetId)).executionResultObject?.status || "None" : "None";

//         let result: LikeStatistic = {
//             likesCount: countLikes,
//             dislikesCount: countDislikes,
//             myStatus: userStatus
//         }

//         return result;
//     }

//     public async GetExtendedLikeStatistic(targetId: string, userId?: string): Promise<ExtendedLikeStatistic> {
//         let getStatistic = await this.GetLikeStatistic(targetId, userId);
//         let getLastLikes = await this.GetLastLikes(targetId, 3);
//         let newestLikes: NewestLike[] = getLastLikes.executionResultObject?.map(likeResponse => {
//             let nl: NewestLike = {
//                 addedAt: likeResponse.createdAt,
//                 userId: likeResponse.userId,
//                 login: likeResponse.userLogin
//             }
//             return nl;
//         }) || []


//         let result: ExtendedLikeStatistic = {
//             likesCount: getStatistic.likesCount,
//             dislikesCount: getStatistic.dislikesCount,
//             myStatus: getStatistic.myStatus,
//             newestLikes: newestLikes
//         }

//         return result;
//     }

//     private async FindTarget(target: AvailableLikeTarget, targetId: string) {
//         switch (target) {
//             case "comments":
//                 return await commentService.GetCommentById(targetId);
//                 break;

//             case "posts":
//                 return await postService.GetPostById(targetId);
//                 break;
//         }
//     }
//     private async AddStatistics(target: AvailableLikeTarget, targetId: string, newLikeData: LikeRequest, previousLikeData: LikeDataBase | null) {
//         let findTarget = await this.FindTarget(target, targetId);
//         let targetData = findTarget.executionResultObject;

//         if (findTarget.executionStatus !== ServicesWithUsersExecutionResult.Success || !targetData) {
//             return;
//         }

//         let previousStatus: AvailableLikeStatus = previousLikeData?.status || "None";
//         let newStatus: AvailableLikeStatus = newLikeData.status;
//         let dbTable: AvailableDbTables;


//         switch (target) {
//             case "comments":
//                 dbTable = AvailableDbTables.comments;
//                 break;

//             case "posts":
//                 dbTable = AvailableDbTables.posts;
//                 break;
//         }

//         //step 1
//         switch (`${previousStatus}->${newStatus}`) {
//             case "Like->None":
//             case "Like->Dislike":
//                 this.SubLike(targetId, mongoDb, dbTable);
//                 break;

//             case "Dislike->None":
//             case "Dislike->Like":
//                 this.SubDislike(targetId, mongoDb, dbTable);
//                 break;

//             case "Dislike->Dislike":
//             case "Like->Like":
//             case "None->None":
//                 return;
//                 break;
//         }

//         //step 2
//         switch (newStatus) {
//             case "Like":
//                 this.AddLike(targetId, mongoDb, dbTable);
//                 break;

//             case "Dislike":
//                 this.AddDislike(targetId, mongoDb, dbTable);
//                 break;
//         }
//     }

//     private async AddLike(targetId: string, mongoDb: MongoDb, table: AvailableDbTables) {
//         let add = await mongoDb.IncrementProperty(table, targetId, "likesInfo.likesCount", 1);
//         return add.executionResultObject;
//     }
//     private async SubLike(targetId: string, mongoDb: MongoDb, table: AvailableDbTables) {
//         let sub = await mongoDb.IncrementProperty(table, targetId, "likesInfo.likesCount", -1);
//         return sub.executionResultObject;
//     }
//     private async AddDislike(targetId: string, mongoDb: MongoDb, table: AvailableDbTables) {
//         let add = await mongoDb.IncrementProperty(table, targetId, "likesInfo.dislikesCount", 1);
//         return add.executionResultObject;
//     }
//     private async SubDislike(targetId: string, mongoDb: MongoDb, table: AvailableDbTables) {
//         let sub = await mongoDb.IncrementProperty(table, targetId, "likesInfo.dislikesCount", -1);
//         return sub.executionResultObject;
//     }
// }

// export const likeService = new LikeService(likeRepo, tokenHandler);