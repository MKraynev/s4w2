import { LikeStatistic } from "../../../Likes/Entities/like.statistic"

export type DecoratedComment = {
    id: string,
    content: string,
    commentatorInfo: {
        userId: string,
        userLogin: string
    }
    createdAt: Date
}

export type DecoratedCommentWithLikes = DecoratedComment & LikeStatistic;

