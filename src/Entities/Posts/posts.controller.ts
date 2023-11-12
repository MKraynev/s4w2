import { BadRequestException, Body, Controller, Delete, Get, HttpCode, HttpStatus, NotFoundException, Param, Post, Put, Query, UseGuards } from "@nestjs/common";
import { PostService } from "./posts.service";
import { ServiceExecutionResultStatus } from "../../Common/Services/Types/ServiceExecutionStatus";
import { Post_CreatePostDto } from "./Repo/Dtos/posts.createPostDto";
import { QueryPaginator } from "../../Common/Routes/QueryParams/PaginatorQueryParams";
import { PostDto } from "./Repo/Schema/post.schema";
import { InputPaginator, OutputPaginator } from "../../Paginator/Paginator";
import { LikeService } from "../Likes/likes.service";
import { CreateCommentDto, CreateCommentWithTargetAndIdDto } from "../Comments/Repo/Dto/CreateCommentDto";
import { ValidationPipe } from "../../Pipes/validation.pipe";
import { AdminGuard } from "../../Auth/Guards/admin.guard";
import { CreateLikeDto, CreateLikeWithIdDto } from "../Likes/Repo/Dtos/createLikeDto";
import { JwtAuthGuard } from "../../Auth/Guards/jwt-auth.guard";
import { ReadAccessToken, TokenExpectation } from "../../Auth/Decorators/request.accessToken";
import { AccessTokenData } from "../../Auth/Tokens/token.access.data";
import { CommentService } from "../Comments/comments.service";
import { ServiceDto } from "../../Common/Services/Types/ServiceDto";
import { CommentDto } from "../Comments/Repo/Schema/comment.schema";
import { ValidationPipeWithBlogIdCheck } from "../../Pipes/validation.extendedPipe.blogIdExist";

@Controller("posts")
export class PostController {
    constructor(private postService: PostService, private likeService: LikeService, private commentService: CommentService) { }

    // put -> /hometask_14/api/posts/{postId}/like-status
    @Put(':id/like-status')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.NO_CONTENT)
    async PutLike(
        @Body(new ValidationPipe()) likeData: CreateLikeDto,
        @Param('id') id: string,
        @ReadAccessToken() tokenLoad: AccessTokenData
    ) {
        let likeInfo: CreateLikeWithIdDto = new CreateLikeWithIdDto(tokenLoad.id, tokenLoad.name, "posts", id, likeData);
        let setLike = await this.likeService.SetLikeData(likeInfo);

        switch (setLike.executionStatus) {
            case ServiceExecutionResultStatus.Success:
                return;
                break;

            default:
            case ServiceExecutionResultStatus.NotFound:
                throw new NotFoundException();
                break;
        }
    }

    @Get()
    async GetPosts(
        @Query('sortBy') sortBy: keyof (PostDto) = "createdAt",
        @Query('sortDirection') sortDirecrion: "desc" | "asc" = "desc",
        @QueryPaginator() paginator: InputPaginator,
        @ReadAccessToken(TokenExpectation.Possibly) tokenLoad: AccessTokenData | undefined
    ) {
        let findPost = await this.postService.Take(sortBy, sortDirecrion, undefined, undefined, paginator.skipElements, paginator.pageSize);

        switch (findPost.executionStatus) {
            case ServiceExecutionResultStatus.Success:
                let count = findPost.executionResultObject.count;

                let decoratedPosts = await Promise.all(findPost.executionResultObject.items.map(async (post) => {
                    let { updatedAt, ...rest } = post;
                    let decoratedPost = await this.likeService.DecorateWithExtendedInfo(tokenLoad?.id, "posts", rest.id, rest)
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
    async GetPostById(
        @Param('id') id: string,
        @ReadAccessToken(TokenExpectation.Possibly) tokenLoad: AccessTokenData | undefined
    ) {
        let findPost = await this.postService.TakeByIdDto(id);

        switch (findPost.executionStatus) {
            case ServiceExecutionResultStatus.Success:
                let { updatedAt, ...returnPost } = findPost.executionResultObject as ServiceDto<PostDto>;
                let decoratedPosts = await this.likeService.DecorateWithExtendedInfo(tokenLoad?.id, "posts", returnPost.id, returnPost)

                return decoratedPosts;
                break;

            default:
            case ServiceExecutionResultStatus.NotFound:
                throw new NotFoundException();
                break;
        }
    }

    //get -> hometask_13/api/posts/{postId}/comments
    @Get(":id/comments")
    async GetPostComments(
        @Query('searchNameTerm') nameTerm: string | undefined,
        @Query('sortBy') sortBy: keyof (CommentDto) = "createdAt",
        @Query('sortDirection') sortDirecrion: "desc" | "asc" = "desc",
        @QueryPaginator() paginator: InputPaginator,
        @Param('id') id: string,
        @ReadAccessToken(TokenExpectation.Possibly) tokenLoad: AccessTokenData | undefined
    ) {
        let getComments = await this.commentService.TakeByPostId(id, sortBy, sortDirecrion, paginator.skipElements, paginator.pageSize);
        switch (getComments.executionStatus) {
            case ServiceExecutionResultStatus.Success:
                let foundComments = getComments.executionResultObject;

                let extdendCommentsWithLikeData = await Promise.all(getComments.executionResultObject.map(async (comment) => {
                    let likeStatistic = await this.likeService.GetLikeStatistic("comments", comment.id);
                    let userStatus = await this.likeService.GetUserStatus(tokenLoad?.id, "comments", comment.id);
                    let likeInfo = {
                        likesInfo: { ...likeStatistic, ...userStatus }
                    }
                    let res = { ...comment, ...likeInfo }

                    return res;
                }))

                let pagedComments = new OutputPaginator(foundComments.length, extdendCommentsWithLikeData, paginator);
                return pagedComments;

            default:
            case ServiceExecutionResultStatus.NotFound:
                throw new NotFoundException();
                break;
        }
    }

    @Post(':id/comments')
    @HttpCode(HttpStatus.CREATED)
    @UseGuards(JwtAuthGuard)
    async SaveComment(
        @Param('id') id: string,
        @Body(new ValidationPipe()) commentData: CreateCommentDto,
        @ReadAccessToken() tokenLoad: AccessTokenData
    ) {

        let comment = new CreateCommentWithTargetAndIdDto(id, "posts", commentData)
        let saveComment = await this.commentService.Save(tokenLoad.id, tokenLoad.name, comment);

        switch (saveComment.executionStatus) {
            case ServiceExecutionResultStatus.Success:
                let comment = saveComment.executionResultObject;

                let likeStatistic = await this.likeService.GetLikeStatistic("comments", comment.id);
                let userStatus = await this.likeService.GetUserStatus(tokenLoad.id, "comments", comment.id);
                let likeInfo = {
                    likesInfo: { ...likeStatistic, ...userStatus }
                }
                let res = { ...comment, ...likeInfo }

                return res;
                break;

            default:
            case ServiceExecutionResultStatus.NotFound:
                throw new NotFoundException();
                break;

        }
    }

    //post -> /hometask_13/api/posts
    @Post()
    @UseGuards(AdminGuard)
    async SavePost(@Body(ValidationPipeWithBlogIdCheck) post: Post_CreatePostDto
    ) {
        let savePost = await this.postService.CreateByBlogId(post.blogId, post);

        switch (savePost.executionStatus) {
            case ServiceExecutionResultStatus.Success:
                let { updatedAt, ...returnPost } = savePost.executionResultObject;
                let decoratedPost = await this.likeService.DecorateWithExtendedInfo(undefined, "posts", returnPost.id, returnPost);
                return decoratedPost;
                break;

            default:
                throw new BadRequestException();
                break;
        }
    }

    //put -> /hometask_13/api/posts/{id}
    @Put(":id")
    @UseGuards(AdminGuard)
    @HttpCode(HttpStatus.NO_CONTENT)
    async UpdatePost(
        @Param("id") id: string,
        @Body(ValidationPipeWithBlogIdCheck) postData: Post_CreatePostDto,
    ) {
        let updatePost = await this.postService.UpdateDto(id, postData);

        switch (updatePost.executionStatus) {
            case ServiceExecutionResultStatus.Success:
                return;
                break;

            default:
            case ServiceExecutionResultStatus.NotFound:
                throw new NotFoundException();
                break;
        }
    }

    //delete -> /hometask_13/api/posts/{id}
    @Delete(":id")
    @UseGuards(AdminGuard)
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