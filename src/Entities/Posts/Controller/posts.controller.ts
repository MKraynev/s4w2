import { BadRequestException, Body, Controller, Delete, Get, HttpCode, HttpStatus, NotFoundException, Param, Post, Put, Query } from "@nestjs/common";
import { PostService } from "../posts.service";
import { ServiceExecutionResultStatus } from "../../../Common/Services/Types/ServiceExecutionStatus";
import { CreatePostDto } from "../PostsRepo/Dtos/CreatePostDto";
import { QueryPaginator } from "../../../Common/Routes/QueryParams/PaginatorQueryParams";
import { PostDto } from "../PostsRepo/Schema/post.schema";
import { InputPaginator, OutputPaginator } from "../../../Common/Paginator/Paginator";
import { LikeService } from "../../Likes/likes.service";

@Controller("posts")
export class PostController {
    constructor(private postService: PostService, private likeService: LikeService) { }

    @Get()
    async GetPosts(
        @Query('sortBy') sortBy: keyof (PostDto) = "createdAt",
        @Query('sortDirection') sortDirecrion: "desc" | "asc" = "desc",
        @QueryPaginator() paginator: InputPaginator

    ) {
        let findPost = await this.postService.Take(sortBy, sortDirecrion, undefined, undefined, paginator.skipElements, paginator.pageSize);

        switch (findPost.executionStatus) {
            case ServiceExecutionResultStatus.Success:
                let count = findPost.executionResultObject.count;
                let decoratedPosts = await Promise.all(findPost.executionResultObject.items.map(async (post) => {

                    let { updatedAt, ...rest } = post;
                    let decoratedPost = await this.likeService.DecorateWithExtendedInfo(rest.id, rest)
                    return decoratedPost;
                }));
                let pagedPosts = new OutputPaginator(count, decoratedPosts, paginator)
                return pagedPosts;
                break;

            default:
                return;
        }
    }

    //get -> /hometask_13/api/posts/{id}
    @Get(":id")
    async GetPostById(@Param('id') id: string) {
        let findPost = await this.postService.TakeById(id);

        switch (findPost.executionStatus) {
            case ServiceExecutionResultStatus.Success:
                let { updatedAt, ...returnPost } = findPost.executionResultObject;;
                let decoratedPost = await this.likeService.DecorateWithExtendedInfo(returnPost.id, returnPost);
                return decoratedPost;
                break;

            default:
            case ServiceExecutionResultStatus.NotFound:
                throw new NotFoundException();
                break;
        }
    }

    //get -> hometask_13/api/posts/{postId}/comments
    @Get(":id/comments")
    async GetPostComments() {
        return ["some comment 1", "some comment 2"];
    }

    //post -> /hometask_13/api/posts
    @Post()
    async SavePost(@Body() post: CreatePostDto) {
        let savePost = await this.postService.CreateByBlogId(post.blogId, post);

        switch (savePost.executionStatus) {
            case ServiceExecutionResultStatus.Success:
                //TODO Возвращаемая сущность содержит две инфы от постов и лайков
                //Задавать логику лайков в посты нет желания
                //Делать отдельный Join repo?
                let { updatedAt, ...returnPost } = savePost.executionResultObject;
                let decoratedPost = await this.likeService.DecorateWithExtendedInfo(returnPost.id, returnPost);
                return decoratedPost;
                break;

            default:
                throw new BadRequestException();
                break;
        }
    }

    //put -> /hometask_13/api/posts/{id}
    @Put(":id")
    @HttpCode(HttpStatus.NO_CONTENT)
    async UpdatePost(
        @Param("id") id: string,
        @Body() postData: CreatePostDto
    ) {
        let updatePost = await this.postService.Update(id, postData);

        switch (updatePost.executionStatus) {
            case ServiceExecutionResultStatus.Success:
                let { updatedAt, ...returnPost } = updatePost.executionResultObject;
                let decoratedPost = await this.likeService.DecorateWithExtendedInfo(returnPost.id, returnPost);

                return decoratedPost;
                break;

            default:
            case ServiceExecutionResultStatus.NotFound:
                throw new NotFoundException();
                break;
        }
    }

    //delete -> /hometask_13/api/posts/{id}
    @Delete(":id")
    @HttpCode(HttpStatus.NO_CONTENT)
    async DeletePost(@Param('id') id: string) {
        let deletePost = await this.postService.Delete(id);

        switch (deletePost.executionStatus) {
            case ServiceExecutionResultStatus.Success:
                return;
                break;

            default:
            case ServiceExecutionResultStatus.NotFound:
                throw new NotFoundException();
                break;
        }
    }
}