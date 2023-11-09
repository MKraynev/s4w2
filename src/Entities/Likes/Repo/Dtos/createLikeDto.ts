import { IsEnum } from "class-validator";
import { LikeTarget } from "./likes.target";

export type AvailableLikeStatus = "Like" | "Dislike" | "None"
export const AvailableLikeStatusArray: AvailableLikeStatus[] = ["Like", "Dislike", "None"]

export class CreateLikeDto {

    @IsEnum(AvailableLikeStatusArray)
    public likeStatus: AvailableLikeStatus

    constructor(status: AvailableLikeStatus) { this.likeStatus = status }
}

export class CreateLikeWithIdDto extends CreateLikeDto {

    public userId: string;
    public userLogin: string;
    public target: LikeTarget;
    public targetId: string;



    constructor(userId: string, userLogin: string, target: LikeTarget, targetId: string, data: CreateLikeDto) {
        super(data.likeStatus);
        this.userId = userId;
        this.userLogin = userLogin;
        this.target = target;
        this.targetId = targetId;
    }
}