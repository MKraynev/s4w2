import { Injectable } from "@nestjs/common";
import { LikesRepoService } from "./Repo/likesRepo.service";
import { AvailableLikeStatus, CreateLikeWithIdDto } from "./Repo/Dtos/createLikeDto";
import { ServiceExecutionResult } from "../../Common/Services/Types/ServiseExecutionResult";
import { ServiceExecutionResultStatus } from "../../Common/Services/Types/ServiceExecutionStatus";
import { ServiceDto } from "../../Common/Services/Types/ServiceDto";
import { LikeDocument, LikeDto } from "./Repo/Schema/like.schema";
import { MongooseFindUnit, MongooseRepoFindPattern_AND } from "../../Repos/Mongoose/Searcher/MongooseRepoFindPattern";
import { PostsRepoService } from "../Posts/Repo/postsRepo.service";
import { LatestLikes, LikeStatistic, UserStatus } from "./Entities/like.statistic";
import { LiteLikeInfo } from "./Entities/LiteLikeInfo";
import { ExtendedLikeInfo } from "./Entities/ExtendedLikeInfo";
import { LikeTarget } from "./Repo/Dtos/likes.target";

@Injectable()
export class LikeService {
    private searchByLikeStatus: MongooseFindUnit<LikeDto> = { field: "likeStatus", value: "Like" }
    private searchByDislikeStatus: MongooseFindUnit<LikeDto> = { field: "likeStatus", value: "Dislike" }

    constructor(
        private likesRepo: LikesRepoService,
        private postRepo: PostsRepoService) { }


    public async GetLikeStatistic(target: LikeTarget, searchById: string): Promise<LikeStatistic> {
        let countLikes = await this.CountLikes(target, searchById);
        let countDislikes = await this.CountDislikes(target, searchById);

        let statisctic: LikeStatistic = {
            likesCount: countLikes,
            dislikesCount: countDislikes
        }

        return statisctic;
    }

    public async GetUserStatus(userId: string | undefined, target: LikeTarget, searchById: string): Promise<UserStatus> {
        let userLikeStatus = await this.GetUserLikeStatus(userId, target, searchById)
        let userStatus: UserStatus = { myStatus: userLikeStatus }

        return userStatus;
    }

    public async GetLatesLikes(target: LikeTarget, likeTargetId: string, limit: number = 3): Promise<LatestLikes> {
        let searchByPostId: MongooseFindUnit<LikeDto> = { field: "targetId", value: likeTargetId }
        let mongooseSearchLikePattern = new MongooseRepoFindPattern_AND(searchByPostId, this.searchByLikeStatus)
        let newestLikes = await this.likesRepo.FindByPatterns(mongooseSearchLikePattern, "createdAt", "desc", 0, limit);

        let liteLikes: Array<LiteLikeInfo> = newestLikes.length > 0 ?
            newestLikes.map(like => new LiteLikeInfo(like.createdAt, like.userId, like.userLogin))
            : []

        let latestLikes: LatestLikes = {
            newestLikes: liteLikes
        }

        return latestLikes;
    }

    public async DecorateWithExtendedInfo<T>(userId: string | undefined, target: LikeTarget, likeTargetId: string, object: T): Promise<T & { extendedLikesInfo: ExtendedLikeInfo }> {
        //TODO убрать private функцию - сделать сборку через new ExtendedLikeInfo(N, M, ...)
        let userStatus = await this.GetUserStatus(userId, target, likeTargetId);
        let countLikes = await this.CountLikes(target, likeTargetId);
        let countDislikes = await this.CountDislikes(target, likeTargetId);
        let newestLikes = await this.GetLatesLikes(target, likeTargetId, 3);

        let extendedLikesInfo: ExtendedLikeInfo = {
            likesCount: countLikes,
            dislikesCount: countDislikes,
            myStatus: userStatus.myStatus,
            newestLikes: newestLikes.newestLikes
        }

        let result = { ...object, extendedLikesInfo };
        return result;
    }

    private async CountLikes(target: LikeTarget, likeTargetId: string): Promise<number> {
        let searchByTarget: MongooseFindUnit<LikeDto> = { field: "target", value: target }
        let searchByPostId: MongooseFindUnit<LikeDto> = { field: "targetId", value: likeTargetId }
        
         
        let mongooseSearchLikePattern = new MongooseRepoFindPattern_AND(searchByTarget, searchByPostId, this.searchByLikeStatus)
        let countLikes = await this.likesRepo.CountByPattern(mongooseSearchLikePattern);

        return countLikes;
    }

    private async CountDislikes(target: LikeTarget, likeTargetId: string): Promise<number> {
        let searchByTarget: MongooseFindUnit<LikeDto> = { field: "target", value: target }
        let searchByPostId: MongooseFindUnit<LikeDto> = { field: "targetId", value: likeTargetId }

        let mongooseSearchLikePattern = new MongooseRepoFindPattern_AND(searchByTarget, searchByPostId, this.searchByDislikeStatus)
        let countDislikes = await this.likesRepo.CountByPattern(mongooseSearchLikePattern);

        return countDislikes;
    }

    private async GetUserLikeStatus(userId: string | undefined, target: LikeTarget, likeTargetId: string): Promise<AvailableLikeStatus> {
        let userStatus: AvailableLikeStatus = userId ?
            await this.FindUserLikeStatus(userId, target, likeTargetId)
            : "None";

        return userStatus;
    }


    public async SetLikeData(likeData: CreateLikeWithIdDto): Promise<ServiceExecutionResult<ServiceExecutionResultStatus, ServiceDto<LikeDto>>> {
        let currentLikeData = await this.FindUserLikeDocument(likeData.userId, likeData.target, likeData.targetId);

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



    private async FindUserLikeDocument(userId: string, target: LikeTarget, targetId: string): Promise<LikeDocument | undefined> {
        let userIdFindUnit: MongooseFindUnit<LikeDto> = { field: "userId", value: userId }
        let searchByTarget: MongooseFindUnit<LikeDto> = { field: "target", value: target }
        let targetIdFindUnit: MongooseFindUnit<LikeDto> = { field: "targetId", value: targetId }

        let findPattern = new MongooseRepoFindPattern_AND(userIdFindUnit, searchByTarget, targetIdFindUnit);

        let foundLikes = await this.likesRepo.FindByPatterns(findPattern, "createdAt", "desc", 0, 1) as LikeDocument[];
        return foundLikes[0] || undefined;
    }

    private async FindUserLikeStatus(userId: string, target: LikeTarget, targetId: string): Promise<AvailableLikeStatus> {
        let userLikeDocument = await this.FindUserLikeDocument(userId, target, targetId);

        return userLikeDocument?.toObject().likeStatus || "None";
    }
}