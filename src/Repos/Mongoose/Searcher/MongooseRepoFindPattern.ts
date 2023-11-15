import mongoose from "mongoose";

export class MongooseRepoFindPattern_OR<T>{
    readonly value: any = {};

    constructor(...findUnits: MongooseFindUnit<T>[] | undefined[]) {
        let validValues = findUnits.filter(value => value)
        if (validValues.length === 0)
            return;

        let formatedCore = validValues.map(unit => {
            let buff: any = {};
            buff[unit.field] = { $regex: unit.value, $options: 'i' }
            return buff;
        })
        this.value = {
            "$or": formatedCore
        }
    }
}

export class MongooseRepoFindPattern_AND<T>{
    readonly value: any = {};

    constructor(...findUnits: MongooseFindUnit<T>[] | undefined[]) {
        let validValues = findUnits.filter(value => value)
        if (validValues.length === 0)
            return;

        let formatedValue: any = {};
        validValues.forEach(unit => {
            if (unit)
                formatedValue[unit.field] = unit.value;
        })
        this.value = formatedValue;
    }
}

export class MongooseRepoFindPattern_EXCEPT<T> {
    readonly value: any = {};

    constructor(exceptUnit: MongooseFindUnit<T>, ...findUnits: MongooseFindUnit<T>[]) {
        if (!exceptUnit || findUnits.length === 0)
            throw new Error(`${MongooseRepoFindPattern_EXCEPT.name} - except parametr or findUnits cant be undefined`)

        let validValues = findUnits.filter(value => value);

        let formatedValue: any = {};
        validValues.forEach(unit => {
            if (unit)
                formatedValue[unit.field] = unit.value;
        })
        this.value = formatedValue;
        this.value[exceptUnit.field] = { $ne: exceptUnit.value };
        if (exceptUnit.field = '_id')
            this.value[exceptUnit.field] = { $ne: new mongoose.Types.ObjectId(exceptUnit.value as string) };
    }
}

export type MongooseFindUnit<T> = {
    field: keyof (T) | '_id',
    value: string | number | boolean;
}