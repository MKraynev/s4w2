import {Test, TestingModule} from "@nestjs/testing"
import { BlogController } from "./blogs.controller"
import { BlogService } from "./blogs.service";
import { PostService } from "../Posts/posts.service";
import { LikeService } from "../Likes/likes.service";
import { ServiceDto } from "../../Common/Services/Types/ServiceDto";
import { ServiceExecutionResultStatus } from "../../Common/Services/Types/ServiceExecutionStatus";
import { ServiceExecutionResult } from "../../Common/Services/Types/ServiseExecutionResult";
import { TakeResult } from "../../Common/Services/crudService";
import { CreateBlogDto } from "./BlogsRepo/Dtos/CreateBlogDto";
import { BlogDto } from "./BlogsRepo/Schema/blog.schema";
import { InputPaginator } from "../../Common/Paginator/Paginator";

describe("Blogs controllers", ()=> {
    let controller: BlogController;
    
    const mockBlogService = {
        Save: jest.fn( dto => {
            let buff = {...dto, id: "asdasdaa"}
            let res = new ServiceExecutionResult(ServiceExecutionResultStatus.Success, buff);
            return res;
        })
    }
    
    beforeEach( async ()=>{
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

    it('Post()', ()=> {
        expect(controller.saveBlog(new CreateBlogDto("asdasd", "asdasd", "asdasd"))).toEqual([]);
        expect(mockBlogService.Save).toHaveBeenCalled();
    })
})