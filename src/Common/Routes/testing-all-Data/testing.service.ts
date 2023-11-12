import { Injectable } from "@nestjs/common";
import { BlogsRepoService } from "../../../Entities/Blogs/Repo/blogsRepo.service";
import { PostsRepoService } from "../../../Entities/Posts/Repo/postsRepo.service";
import { UsersRepoService } from "../../../Entities/Users/Repo/usersRepo.service";
import { CommentRepoService } from "../../../Entities/Comments/Repo/commentRepo.service";
import { LikesRepoService } from "../../../Entities/Likes/Repo/likesRepo.service";
import { DeviceRepoService } from "../../../Entities/Devices/Repo/usersRepo.service";

@Injectable()
export class TestService {
    constructor(
        private blogsRepo: BlogsRepoService,
        private postsRepo: PostsRepoService,
        private usersRepo: UsersRepoService,
        private commentsRepo: CommentRepoService,
        private likesRepo: LikesRepoService,
        private deviceRepo: DeviceRepoService
    ) {

    }
    public async DeleteAll() {
        this.blogsRepo.DeleteAll();
        this.postsRepo.DeleteAll();
        this.usersRepo.DeleteAll();
        this.commentsRepo.DeleteAll();
        this.likesRepo.DeleteAll();
        this.deviceRepo.DeleteAll();
        return true;
    }
}