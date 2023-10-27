import { Injectable } from "@nestjs/common";
import { PostsRepoService } from "./PostsRepo/postsRepo.service";
import { CrudService, TakeResult } from "../../Common/Services/crudService";
import { CreatePostDto } from "./PostsRepo/Dtos/CreatePostDto";
import { PostDto, PostDocument } from "./PostsRepo/Schema/post.schema";
import { ServiceExecutionResultStatus } from "../../Common/Services/Types/ServiceExecutionStatus";
import { ServiceExecutionResult } from "../../Common/Services/Types/ServiseExecutionResult";
import { ServiceDto } from "../../Common/Services/Types/ServiceDto";
import { BlogsRepoService } from "../Blogs/BlogsRepo/blogsRepo.service";
import { LikeService } from "../Likes/likes.service";

@Injectable()
export class PostService extends CrudService<CreatePostDto, PostDto, PostDocument, PostsRepoService>{
    constructor(private postRepo: PostsRepoService, private blogsRepo: BlogsRepoService, private likeService: LikeService) {
        super(postRepo)
    }

    async CreateByBlogId(blogId: string, postData: CreatePostDto): Promise<ServiceExecutionResult<ServiceExecutionResultStatus, ServiceDto<PostDto>>>{
        let blog = await this.blogsRepo.FindById(blogId);

        if(!blog)
            return new ServiceExecutionResult(ServiceExecutionResultStatus.NotFound);

        let post = new PostDto(postData.title, postData.shortDescription, postData.content, blogId, blog.name);
        let savePost = await this.postRepo.Save(post);
        
        return new ServiceExecutionResult(ServiceExecutionResultStatus.Success, savePost.toObject());
    }

    async TakeByBlogId(blogId: string, sortBy: keyof (PostDto), sortDirection: "asc" | "desc", skip: number = 0, limit: number = 10)
    : Promise <ServiceExecutionResult<ServiceExecutionResultStatus, TakeResult<ServiceDto<PostDto>>>>{
        let blog = await this.blogsRepo.FindById(blogId);

        if(!blog)
            return new ServiceExecutionResult(ServiceExecutionResultStatus.NotFound);

        return this.Take(sortBy, sortDirection, "blogId", blogId, skip, limit);
    }
}