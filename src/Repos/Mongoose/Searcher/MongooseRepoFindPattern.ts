export class MongooseRepoFindPattern_OR<T>{
    readonly value: any = {};

    constructor(...findUnits: MongooseFindUnit<T>[] | undefined[]) {
        let validValues = findUnits.filter(value => value)
        if(validValues.length === 0)
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

export type MongooseFindUnit<T> = {
    field: keyof (T),
    value: string
}