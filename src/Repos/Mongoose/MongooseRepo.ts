import { HydratedDocument, Model } from "mongoose";
import { MongooseRepoFindPattern_AND, MongooseRepoFindPattern_EXCEPT, MongooseRepoFindPattern_OR } from "./Searcher/MongooseRepoFindPattern";

export type MongooseRepoFindPatterns<T> = MongooseRepoFindPattern_OR<T> | MongooseRepoFindPattern_AND<T> | MongooseRepoFindPattern_EXCEPT<T>;

export class MongooseRepo<ModelType, CreateDTO, EntityDocument extends HydratedDocument<ModelType>>{
  constructor(private model: Model<ModelType>) { }

  async SaveDto(createDTO: CreateDTO): Promise<EntityDocument> {
    const createEntity = await this.model.create(createDTO);
    return (await createEntity.save() as EntityDocument);
  }

  async SaveDocument(document: EntityDocument) {
    return await document.save() as EntityDocument
  }

  async FindById(id: string): Promise<EntityDocument | null> {
    try {
      return await this.model.findById(id);
    }
    catch (e) {
      return null;
    }
  }

  async Find(sortBy: keyof (ModelType), sortDirection: "asc" | "desc", property?: keyof (ModelType), propertyValue?: string, skip: number = 0, limit: number = 10): Promise<EntityDocument[]> {
    let searchPattern = this.GetSearchPattern(property, propertyValue);
    let sortPattern = this.GetSortPattern(sortBy, sortDirection);

    return await this.model.find(searchPattern).sort(sortPattern).skip(skip).limit(limit).exec() as EntityDocument[];
  }

  async Count(key?: keyof (ModelType), value?: string) {
    let searchPattern = this.GetSearchPattern(key, value);

    return await this.model.count(searchPattern);
  }
  async IdExist(id: string) {
    try {
      return await this.model.exists({ _id: id })
    }
    catch {
      return false;
    }
  }

  async FindByPatterns(findPattern: MongooseRepoFindPatterns<ModelType>, sortBy: keyof (ModelType), sortDirection: "asc" | "desc", skip: number = 0, limit: number = 10): Promise<EntityDocument[]> {
    try {
      let sorter = this.GetSortPattern(sortBy, sortDirection);

      return await this.model.find(findPattern.value).sort(sorter).skip(skip).limit(limit).exec() as EntityDocument[];
    }
    catch {
      return []
    }
  }

  async CountByPattern(findPattern: MongooseRepoFindPatterns<ModelType>) {
    try {
      return await this.model.count(findPattern.value);
    }
    catch {
      return 0;
    }
  }

  async DeleteByPattern(findPattern: MongooseRepoFindPatterns<ModelType>): Promise<{acknowledged: boolean, deletedCount: number}>{
    try{
      let deleteMany = await this.model.deleteMany(findPattern.value);
      return {
        acknowledged: deleteMany.acknowledged,
        deletedCount: deleteMany.deletedCount
      }

    }
    catch{
      return {
        acknowledged: false,
        deletedCount: 0
      }
    }
  }

  async Update(document: EntityDocument): Promise<EntityDocument> {
    return (await document.save() as EntityDocument);
  }

  async DeleteById(id: string): Promise<EntityDocument> | null {
    try {
      let deletedDocument = await this.model.findByIdAndDelete(id) as EntityDocument;
      return deletedDocument || null;
    }
    catch {
      return null;
    }
  }

  async DeleteAll() {
    let del = await this.model.deleteMany();
    return del.acknowledged;
  }

  private GetSortPattern(key?: keyof (ModelType), value?: string) {
    let searchPattern: any = {};
    if (key && value)
      searchPattern[key] = value;

    return searchPattern;
  }
  private GetSearchPattern(key?: keyof (ModelType), value?: string) {
    let searchPattern: any = {};
    if (key && value)
      searchPattern[key] = { $regex: value, $options: 'i' };
    return searchPattern;
  }
}