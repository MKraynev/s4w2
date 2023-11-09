import { LatestLikes, LikeStatistic, UserStatus } from "./like.statistic";

export interface ExtendedLikeInfo extends LikeStatistic, UserStatus, LatestLikes{}