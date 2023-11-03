import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { CreateBlogDto } from '../Dtos/CreateBlogDto';

export type BlogDocument = HydratedDocument<BlogDto>;

@Schema({
  timestamps: true,
  toObject: {
    transform(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
    }
  }
})
export class BlogDto extends CreateBlogDto {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  websiteUrl: string;

  @Prop({ default: false })
  isMembership: boolean;

  createdAt: Date;

  updatedAt: Date;
}

export const BlogSchema = SchemaFactory.createForClass(BlogDto);