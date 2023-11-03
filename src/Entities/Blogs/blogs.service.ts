import { Injectable } from '@nestjs/common';
import { BlogsRepoService } from './Repo/blogsRepo.service';
import { CreateBlogDto } from './Repo/Dtos/CreateBlogDto';
import { BlogDto, BlogDocument } from './Repo/Schema/blog.schema';
import { CrudService } from '../../Common/Services/crudService';

@Injectable()
export class BlogService extends CrudService<CreateBlogDto, BlogDto, BlogDocument, BlogsRepoService>{
  constructor(private blogsRepo: BlogsRepoService) {
    super(blogsRepo)
  }
}
