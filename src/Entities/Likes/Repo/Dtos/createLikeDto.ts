import { IsEnum } from "class-validator";

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
    public targetId: string;



    constructor(userId: string, userLogin: string, targetId: string, data: CreateLikeDto) {
        super(data.likeStatus);
        this.userId = userId;
        this.userLogin = userLogin;
        this.targetId = targetId;
    }
}