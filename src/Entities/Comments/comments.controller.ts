import { Body, Controller, Delete, ForbiddenException, Get, HttpCode, HttpStatus, NotFoundException, Param, Put, UseGuards } from "@nestjs/common";
import { CommentService } from "./comments.service";
import { LikeService } from "../Likes/likes.service";
import { JwtAuthGuard } from "../../Auth/Guards/jwt-auth.guard";
import { ValidationPipe } from "../../Pipes/validation.pipe";
import { CreateLikeDto, CreateLikeWithIdDto } from "../Likes/Repo/Dtos/createLikeDto";
import { RequestTokenLoad } from "../../Auth/Decorators/request.tokenLoad";
import { TokenLoad_Access } from "../../Auth/Tokens/tokenLoad.access";
import { ServiceExecutionResultStatus } from "../../Common/Services/Types/ServiceExecutionStatus";
import { CreateCommentDto } from "./Repo/Dto/CreateCommentDto";

@Controller('comments')
export class CommentsController {
    constructor(private commentService: CommentService, private likeService: LikeService) { }

    //put -> /hometask_14/api/comments/{commentId}/like-status
    @Put(':id/like-status')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.NO_CONTENT)
    async SetLike(
        @Body(new ValidationPipe()) likeData: CreateLikeDto,
        @Param('id') id: string,
        @RequestTokenLoad() tokenLoad: TokenLoad_Access
    ) {
        let likeInfo: CreateLikeWithIdDto = new CreateLikeWithIdDto(tokenLoad.id, tokenLoad.name, "comments", id, likeData);
        let setLike = await this.likeService.SetLikeData( likeInfo);

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

    //put -> /hometask_14/api/comments/{commentId}
    @Put(':id')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.NO_CONTENT)
    async UpdateComment(
        @Param('id') id: string,
        @Body(new ValidationPipe()) commentData: CreateCommentDto,
        @RequestTokenLoad() tokenLoad: TokenLoad_Access
    ) {
        let updateComment = await this.commentService.Update(id, tokenLoad.id, commentData);

        switch (updateComment.executionStatus) {
            case ServiceExecutionResultStatus.Success:
                return;
                break;

            case ServiceExecutionResultStatus.WrongUser:
                throw new ForbiddenException();
                break;

            default:
            case ServiceExecutionResultStatus.NotFound:
                throw new NotFoundException();
                break;
        }
    }

    //delete -> /hometask_14/api/comments/{commentId}
    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.NO_CONTENT)
    async DeleteComment(
        @Param('id') id: string,
        @RequestTokenLoad() tokenLoad: TokenLoad_Access
    ) {
        let deleteComment = await this.commentService.Delete(id, tokenLoad.id);

        switch (deleteComment.executionStatus) {
            case ServiceExecutionResultStatus.Success:
                return;
                break;

            case ServiceExecutionResultStatus.WrongUser:
                throw new ForbiddenException();
                break;

            default:
            case ServiceExecutionResultStatus.NotFound:
                throw new NotFoundException();
                break;
        }
    }

    //get -> /hometask_14/api/comments/{id}
    @Get(':id')
    async GetComments(
        @Param('id') id: string,
        @RequestTokenLoad() tokenLoad: TokenLoad_Access | undefined
    ) {
        let findComment = await this.commentService.TakeById(id);

        switch (findComment.executionStatus) {
            case ServiceExecutionResultStatus.Success:
                let comment = findComment.executionResultObject;
                let likeStatistic = await this.likeService.GetLikeStatistic("comments", comment.id);
                let userStatus = await this.likeService.GetUserStatus(tokenLoad?.id, "comments", comment.id);
                let likeInfo = {
                    likesInfo: { ...likeStatistic, ...userStatus }
                }
                let res = { ...comment, ...likeInfo }

                return res;
        }
    }
}