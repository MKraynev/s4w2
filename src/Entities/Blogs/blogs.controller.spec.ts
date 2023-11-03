import { Test, TestingModule } from "@nestjs/testing"
import { BlogController } from "./blogs.controller"
import { BlogService } from "./blogs.service";
import { PostService } from "../Posts/posts.service";
import { LikeService } from "../Likes/likes.service";
import { CreateBlogDto } from "./Repo/Dtos/CreateBlogDto";
import { mockBlogService } from "./Tests/mocks/blogs.mockService";
import { InputPaginator } from "../../Paginator/Paginator";

describe("Blogs controllers", () => {
    let controller: BlogController;



    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [BlogController],
            providers: [BlogService, PostService, LikeService]
        })
            .overrideProvider(BlogService).useValue(mockBlogService)
            .overrideProvider(PostService).useValue({})
            .overrideProvider(LikeService).useValue({})
            .compile();

        controller = module.get<BlogController>(BlogController);
    })

    it('Post()', async () => {
        expect(await controller.getBlog("dfdsf", "createdAt", "desc", new InputPaginator("12", "23", "desc"))).toEqual([]);
        expect(mockBlogService.Take).toHaveBeenCalled();
    })
})