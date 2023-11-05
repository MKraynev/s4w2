import { IsEnum } from "class-validator";

export enum AvailableLikeStatus {
    "Like",
    "Dislike",
    "None"
}

export class CreateLikeDto {

    @IsEnum(AvailableLikeStatus)
    public likeStatus: AvailableLikeStatus

    constructor(status: AvailableLikeStatus) { this.likeStatus = status }
}

export class CreateLikeWithIdDto extends CreateLikeDto {
    public targetId: string;
    
    constructor(id: string, data: CreateLikeDto) {
        super(data.likeStatus);
        this.targetId = id;
    }
}