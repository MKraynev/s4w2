import { IsEnum } from "class-validator";

export enum AvailableLikeStatus {
    "Like",
    "Dislike",
    "None"
}

export class CreateLikeDto {

    @IsEnum(AvailableLikeStatus)
    public status: AvailableLikeStatus

    constructor(status: AvailableLikeStatus) { this.status = status }
}

export class CreateLikeWithIdDto extends CreateLikeDto {
    public targetId: string;
    
    constructor(id: string, data: CreateLikeDto) {
        super(data.status);
        this.targetId = id;
    }
}