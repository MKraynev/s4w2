import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MONGO_URL } from './settings';
import { BlogsModule } from './Entities/Blogs/blogs.module';
import { TestModule } from './Common/Routes/testing-all-Data/testing.module';
import { PostsModule } from './Entities/Posts/posts.module';
import { UsersModule } from './Entities/Users/users.module';
import { AuthModule } from './Entities/Auth/auth.module';
import { CommentsModule } from './Entities/Comments/comments.module';
import { DevicesModule } from './Entities/Devices/devices.module';


@Module({
  imports: [
    MongooseModule.forRoot(MONGO_URL),
    BlogsModule,
    PostsModule,
    UsersModule,
    TestModule,
    AuthModule,
    CommentsModule,
    DevicesModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
