import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { ValidationError, validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { type } from 'os';

@Injectable()
export class ValidationPipe implements PipeTransform<any> {
  async transform(value: any, { metatype }: ArgumentMetadata) {
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }

    let object = plainToInstance(metatype, value);
    object = this.trim(object);

    const errors = await validate(object);
    if (errors.length > 0) {
      let result = {
        errorMessages: []
      }
      errors.forEach(e => {
        e as ValidationError;

        let message = {
          message: `Wrong value ${e.value}`,
          field: e.property
        }

        result.errorMessages.push(message);
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
}