import { Injectable } from "@nestjs/common";
import { MongooseRepo } from "../../../Repos/Mongoose/MongooseRepo";
import { BlogsRepoService } from "../../../Entities/Blogs/Repo/blogsRepo.service";
import { PostsRepoService } from "../../../Entities/Posts/Repo/postsRepo.service";
import { UsersRepoService } from "../../../Entities/Users/Repo/usersRepo.service";

@Injectable()
export class TestService {
    constructor(
        private blogsRepo: BlogsRepoService,
        private postsRepo: PostsRepoService,
        private usersRepo: UsersRepoService
    ) {

    }
    public async DeleteAll() {
        this.blogsRepo.DeleteAll();
        this.postsRepo.DeleteAll();
        this.usersRepo.DeleteAll();
        return true;
    }
}