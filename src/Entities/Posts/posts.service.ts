import { Injectable } from "@nestjs/common";
import { PostsRepoService } from "./Repo/postsRepo.service";
import { CrudService, TakeResult } from "../../Common/Services/crudService";
import { Post_CreatePostDto } from "./Repo/Dtos/posts.createPostDto";
import { PostDto, PostDocument } from "./Repo/Schema/post.schema";
import { ServiceExecutionResultStatus } from "../../Common/Services/Types/ServiceExecutionStatus";
import { ServiceExecutionResult } from "../../Common/Services/Types/ServiseExecutionResult";
import { ServiceDto } from "../../Common/Services/Types/ServiceDto";
import { BlogsRepoService } from "../Blogs/Repo/blogsRepo.service";
import { LikeService } from "../Likes/likes.service";
import { CommentService } from "../Comments/comments.service";
import { Blogs_CreatePostDto } from "../Blogs/Entities/blogs.createPostDto";

@Injectable()
export class PostService extends CrudService<Post_CreatePostDto, PostDto, PostDocument, PostsRepoService>{
    constructor(
        private postRepo: PostsRepoService,
        private blogsRepo: BlogsRepoService,
    ) { super(postRepo) }

    async CreateByBlogId(blogId: string, postData: Blogs_CreatePostDto | Post_CreatePostDto): Promise<ServiceExecutionResult<ServiceExecutionResultStatus, ServiceDto<PostDto>>> {
        let blog = await this.blogsRepo.FindById(blogId);

        if (!blog)
            return new ServiceExecutionResult(ServiceExecutionResultStatus.NotFound);

        let post = new PostDto(postData.title, postData.shortDescription, postData.content, blogId, blog.name);
        let savePost = await this.postRepo.SaveDto(post);

        return new ServiceExecutionResult(ServiceExecutionResultStatus.Success, savePost.toObject());
    }

    async TakeByBlogId(blogId: string, sortBy: keyof (PostDto), sortDirection: "asc" | "desc", skip: number = 0, limit: number = 10)
        : Promise<ServiceExecutionResult<ServiceExecutionResultStatus, TakeResult<ServiceDto<PostDto>>>> {
        let blog = await this.blogsRepo.FindById(blogId);

        if (!blog)
            return new ServiceExecutionResult(ServiceExecutionResultStatus.NotFound);

        return this.Take(sortBy, sortDirection, "blogId", blogId, skip, limit);
    }

    async PostExist(postId: string){
        return await this.postRepo.IdExist(postId);
    }
}