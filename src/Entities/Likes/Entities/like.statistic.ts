import { AvailableLikeStatus } from "../Repo/Dtos/createLikeDto";
import { LiteLikeInfo } from "./LiteLikeInfo";

export type LikeStatistic = {
    likesCount: number,
    dislikesCount: number,
}

export type UserStatus = {
    myStatus: AvailableLikeStatus
}

export type LatestLikes = {
    newestLikes: Array<LiteLikeInfo>
}