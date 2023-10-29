import { HydratedDocument, Model } from "mongoose";
import { MongooseRepoFindPattern } from "./Searcher/MongooseRepoFindPattern";

export class MongooseRepo<ModelType, CreateDTO, EntityDocument extends HydratedDocument<ModelType>>{
  constructor(private model: Model<ModelType>) { }

  async Save(createDTO: CreateDTO | ModelType): Promise<EntityDocument> {
    const createEntity = await this.model.create(createDTO);
    return (await createEntity.save() as EntityDocument);
  }

  async FindById(id: string): Promise<EntityDocument | null> {
    return await this.model.findById(id);
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

  async FindByPatterns(findPattern: MongooseRepoFindPattern<ModelType>, sortBy: keyof (ModelType), sortDirection: "asc" | "desc", skip: number = 0, limit: number = 10): Promise<EntityDocument[]> {
    try{
      let sorter = this.GetSortPattern(sortBy, sortDirection);

      return await this.model.find(findPattern.value).sort(sorter).skip(skip).limit(limit).exec() as EntityDocument[];
    }
    catch{
      return []
    }
  }

  async CountByPattern(findPattern: MongooseRepoFindPattern<ModelType>){
    try{
      return await this.model.count(findPattern.value);
    }
    catch{
      return 0;
    }
  }

  async Update(document: EntityDocument) {
    return (await document.save());
  }

  async DeleteById(id: string): Promise<EntityDocument> | null {
    let deletedDocument = await this.model.findByIdAndDelete(id) as EntityDocument;

    return deletedDocument || null;
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