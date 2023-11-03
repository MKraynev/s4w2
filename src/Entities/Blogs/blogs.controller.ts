import { BadRequestException, Body, Controller, Delete, Get, HttpCode, HttpStatus, NotFoundException, Param, Post, Put, Query } from '@nestjs/common';
import { CreateBlogDto } from './BlogsRepo/Dtos/CreateBlogDto';
import { BlogService } from './blogs.service';
import { UpdateBlogDto } from './BlogsRepo/Dtos/UpdateBlogDto';
import { ServiceExecutionResultStatus } from '../../Common/Services/Types/ServiceExecutionStatus';
import { ControllerBlogDto } from './Entities/blogs.controllerDto';
import { PostService } from '../Posts/posts.service';
import { CreatePostDto } from '../Posts/PostsRepo/Dtos/CreatePostDto';
import { BlogDto } from './BlogsRepo/Schema/blog.schema';
import { InputPaginator, OutputPaginator } from '../../Paginator/Paginator';
import { QueryPaginator } from '../../Common/Routes/QueryParams/PaginatorQueryParams';
import { PostDto } from "../Posts/PostsRepo/Schema/post.schema"
import { LikeService } from '../Likes/likes.service';


@Controller("blogs")
export class BlogController {
  constructor(private blogService: BlogService, private postService: PostService, private likeService: LikeService) { }

  //get -> hometask_13/api/blogs
  //TODO можно ли вынести QUERY в одит объект - можно как и в body
  @Get()
  async getBlog(
    @Query('searchNameTerm') nameTerm: string | undefined,
    @Query('sortBy') sortBy: keyof (BlogDto) = "createdAt",
    @Query('sortDirection') sortDirecrion: "desc" | "asc" = "desc",
    @QueryPaginator() paginator: InputPaginator
  ) {
    let searchPropName: keyof (BlogDto) | undefined = nameTerm ? "name" : undefined;

    let findAndCountBlogs = await this.blogService.Take(
      sortBy,
      sortDirecrion,
      searchPropName,
      nameTerm,
      paginator.skipElements,
      paginator.pageSize);

    switch (findAndCountBlogs.executionStatus) {
      case ServiceExecutionResultStatus.Success:
        //TODO можно ли объявить единый фильтр для Controller?
        let blogs = findAndCountBlogs.executionResultObject.items.map(serviceBlog => new ControllerBlogDto(serviceBlog));
        let count = findAndCountBlogs.executionResultObject.count;
        let pagedBlogs = new OutputPaginator(count, blogs, paginator);
        return pagedBlogs;
        break;

      default:
        throw new NotFoundException();
        break;
    }
  }

  //post -> hometask_13/api/blogs
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async saveBlog(@Body() blog: CreateBlogDto) {
    let savedBlog = await this.blogService.Save(blog);

    switch (savedBlog.executionStatus) {
      case ServiceExecutionResultStatus.Success:
        let blog = new ControllerBlogDto(savedBlog.executionResultObject);
        return blog;
        break;

      default:
        throw new BadRequestException();
        break;
    }
  }

  //get -> hometask_13/api/blogs/{blogId}/posts
  @Get(':id/posts')
  async GetBlogsPosts(
    @Param('id') id: string,
    @Query('searchNameTerm') nameTerm: string | undefined,
    @Query('sortBy') sortBy: keyof (PostDto) = "createdAt",
    @Query('sortDirection') sortDirecrion: "desc" | "asc" = "desc",
    @QueryPaginator() paginator: InputPaginator
  ) {
    let findPosts = await this.postService.TakeByBlogId(id, sortBy, sortDirecrion, paginator.skipElements, paginator.pageSize);

    switch (findPosts.executionStatus) {
      case ServiceExecutionResultStatus.Success:
        let decoratedPosts = await Promise.all(findPosts.executionResultObject.items.map(async (post) => {
          let { updatedAt, ...rest } = post;
          let decoratedPost = await this.likeService.DecorateWithExtendedInfo(rest.id, rest);
          return decoratedPost;
        }));

        let count = findPosts.executionResultObject.count;
        let pagedPosts = new OutputPaginator(count, decoratedPosts, paginator);

        return pagedPosts;
        break;

      default:
      case ServiceExecutionResultStatus.NotFound:
        throw new NotFoundException();
        break;
    }
  }

  //post -> hometask_13/api/blogs/{blogId}/posts
  @Post(':id/posts')
  @HttpCode(HttpStatus.CREATED)
  async SaveBlogsPosts(@Param('id') id: string, @Body() postData: CreatePostDto) {
    let createPost = await this.postService.CreateByBlogId(id, postData);

    switch (createPost.executionStatus) {
      case ServiceExecutionResultStatus.Success:
        let { updatedAt, ...returnPost } = createPost.executionResultObject;
        let decoratedPost = await this.likeService.DecorateWithExtendedInfo(returnPost.id, returnPost);

        return decoratedPost;
        break;

      default:
      case ServiceExecutionResultStatus.NotFound:
        throw new NotFoundException();
        break;
    }
  }

  //get -> hometask_13/api/blogs/{id}
  @Get(":id")
  async GetBlogById(@Param('id') id: string) {
    let findBlog = await this.blogService.TakeByIdDto(id);
    switch (findBlog.executionStatus) {
      case ServiceExecutionResultStatus.Success:
        let blog = new ControllerBlogDto(findBlog.executionResultObject);
        return blog;
        break;

      default:
      case ServiceExecutionResultStatus.NotFound:
        throw new NotFoundException();
        break;
    }
  }

  //put -> /hometask_13/api/blogs/{id}
  @Put(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  async UpdateBlog(
    @Param('id') id: string,
    @Body() blogData: UpdateBlogDto) {
    let updateBlog = await this.blogService.UpdateDto(id, blogData);

    switch (updateBlog.executionStatus) {
      case ServiceExecutionResultStatus.Success:
        return;
        break;

      default:
      case ServiceExecutionResultStatus.NotFound:
        throw new NotFoundException();
        break;
    }
  }

  //delete -> /hometask_13/api/blogs/{id}
  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  async DeleteBlog(@Param('id') id: string) {
    let deleteBlog = await this.blogService.Delete(id);

    switch (deleteBlog.executionStatus) {
      case ServiceExecutionResultStatus.Success:
        return;
        break;

      default:
      case ServiceExecutionResultStatus.NotFound:
        throw new NotFoundException();
    }
  }
}