import { AvailableLikeStatus } from "../LikesRepo/Dtos/createLikeDto";
import { LiteLikeInfo } from "./LiteLikeInfo";

export class ExtendedLikeInfo {
    constructor(
        public likesCount: number = 0,
        public dislikesCount: number = 0,
        public myStatus: AvailableLikeStatus = "None",
        public newestLikes: Array<LiteLikeInfo> = []
    ) {}
}



// "extendedLikesInfo": {
//     "likesCount": 0,
//     "dislikesCount": 0,
//     "myStatus": "None",
//     "newestLikes": [
//       {
//         "addedAt": "2023-10-25T13:15:54.762Z",
//         "userId": "string",
//         "login": "string"
//       }
//     ]
//   }