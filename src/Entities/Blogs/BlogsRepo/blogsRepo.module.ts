import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BlogDto, BlogSchema } from './Schema/blog.schema';
import { BlogsRepoService } from './blogsRepo.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: BlogDto.name, schema: BlogSchema }])],
  providers: [BlogsRepoService],
  exports: [BlogsRepoService]
})
export class BlogsRepoModule {}