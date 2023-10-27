import { Injectable } from '@nestjs/common';
import { BlogsRepoService } from './BlogsRepo/blogsRepo.service';
import { CreateBlogDto } from './BlogsRepo/Dtos/CreateBlogDto';
import { BlogDto, BlogDocument } from './BlogsRepo/Schema/blog.schema';
import { CrudService } from '../../Common/Services/crudService';

@Injectable()
export class BlogService extends CrudService<CreateBlogDto, BlogDto, BlogDocument, BlogsRepoService>{
  constructor(private blogsRepo: BlogsRepoService) {
    super(blogsRepo)
  }
}
