import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MONGO_URL } from './settings';
import { BlogsModule } from './Entities/Blogs/blogs.module';
import { TestModule } from './Common/Routes/testing-all-Data/testing.module';
import { PostsModule } from './Entities/Posts/posts.module';
import { UsersModule } from './Entities/Users/users.module';


@Module({
  imports: [
    MongooseModule.forRoot(MONGO_URL),
    BlogsModule,
    PostsModule,
    UsersModule,
    TestModule],
  controllers: [],
  providers: [],
})
export class AppModule { }
