import {registerDecorator, ValidationOptions, ValidationArguments} from "class-validator";
import { ObjectId } from "bson"

export function IsMongoIdObject(validationOptions?: ValidationOptions) {
   return function (object: Object, propertyName: string) {
        registerDecorator({
            name: "IsMongoIdObject",
            target: object.constructor,
            propertyName: propertyName,
            constraints: [],
            options: validationOptions,
            validator: {
                validate(value: any, args: ValidationArguments) {
                    return ObjectId.isValid(value)
                }
            }
        });
   };
}