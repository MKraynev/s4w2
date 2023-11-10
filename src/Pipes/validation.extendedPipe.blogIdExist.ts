import { ArgumentMetadata, BadRequestException, Injectable, PipeTransform } from "@nestjs/common";
import { BlogsRepoService } from "../Entities/Blogs/Repo/blogsRepo.service";
import { plainToInstance } from "class-transformer";
import { ValidationError, validate } from "class-validator";

@Injectable()
export class ValidationPipeWithBlogIdCheck implements PipeTransform {
  constructor(private blogRepo?: BlogsRepoService) { }
  async transform(value: any, { metatype }: ArgumentMetadata) {
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }

    let object = plainToInstance(metatype, value);
    object = this.trim(object);

    const errors = await validate(object);
    let blogIdError = await this.CheckBlogId(object);

    if (blogIdError) errors.push(blogIdError);

    if (errors.length > 0) {
      let result = {
        errorsMessages: []
      }
      errors.forEach(e => {
        e as ValidationError;

        let message = {
          message: `Wrong value ${e.value}`,
          field: e.property
        }

        result.errorsMessages.push(message);
      })
      throw new BadRequestException(result);
    }
    return object;
  }

  private toValidate(metatype: Function): boolean {
    const types: Function[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }

  private trim(values) {
    Object.keys(values).forEach(key => {
      if (key !== 'password') {
        if (this.isObj(values[key])) {
          values[key] = this.trim(values[key])
        } else {
          if (typeof values[key] === 'string') {
            values[key] = values[key].trim()
          }
        }
      }
    })
    return values
  }

  private isObj(obj: any): boolean {
    return typeof obj === 'object' && obj !== null
  }

  private async CheckBlogId(obj: any): Promise<ValidationError | undefined> {
    if ('blogId' in obj) {
        let idExit = await this.blogRepo.IdExist(obj.blogId);
        if (idExit)
          return undefined;

        let err = new ValidationError();
        err.value = "blogId";
        err.property = "blogId";

        return err;
    }
  }
}