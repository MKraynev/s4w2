export type AvailableLikeStatus = "Like" | "Dislike" | "None";

export class CreateLikeDto{
    constructor(
        public targetId: string,
        public status: AvailableLikeStatus
    ) {}
}