import { Body, Controller, Post } from "@nestjs/common";
import { CreateCommentDto } from "../Comments/CommentsRepo/Dto/CreateCommentDto";

@Controller('posts')
export class PostController {

    //put -> /hometask_14/api/posts/{postId}/like-status

    //get -< /hometask_14/api/posts/{postId}/like-status

    //post => /hometask_14/api/posts/{postId}/comments
    @Post(':id/comments')
    async SaveComment(@Body() commentData: CreateCommentDto) {

    }
    //get -< /hometask_14/api/posts
    //post -> /hometask_14/api/posts
    //get -> /hometask_14/api/posts/{id}
    //put -> /hometask_14/api/posts/{id}
    //delete -> /hometask_14/api/posts/{id}

}