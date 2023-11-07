import { ServiceDto } from "../../../Common/Services/Types/ServiceDto";
import { AvailableLikeStatus } from "../Repo/Dtos/createLikeDto";
import { LikeDocument, LikeDto } from "../Repo/Schema/like.schema";
import { LiteLikeInfo } from "./LiteLikeInfo";

export class ExtendedLikeInfo {
    public myStatus: string;
    public newestLikes: Array<LiteLikeInfo>;

    constructor(
        public likesCount: number = 0,
        public dislikesCount: number = 0,
        newestLikes: Array<LikeDocument | ServiceDto<LikeDto>> = [],
        userStatus: AvailableLikeStatus = "None"
    ) {

        this.myStatus = userStatus;

        this.newestLikes = newestLikes.length > 0 ?
            newestLikes.map(like => new LiteLikeInfo(like.createdAt, like.userId, like.userLogin))
            : []
    }
}