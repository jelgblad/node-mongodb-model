import {
  Filter,
  FindOptions,
  ObjectId,
  Document,
  OptionalId,
  IndexSpecification,
  CreateIndexesOptions,
  UpdateOptions,
  UpdateFilter,
  InsertOneResult,
  UpdateResult,
  DeleteResult,
  CreateCollectionOptions,
  TimeSeriesCollectionOptions,
  Db
} from 'mongodb'
import { IMongoJSONSchema } from './IMongoJSONSchema'

export interface IQueryOptions {
  populate?: string[]
}

export interface IModelOptions {
  schema?: IMongoJSONSchema,
  validationAction?: 'error' | 'warn',
  validationLevel?: 'off' | 'moderate' | 'strict',
  indices?: IndexDefinition[],
  timeseries?: {
    timeseries: TimeSeriesCollectionOptions,
    expireAfterSeconds?: number
  }
}

type MiddlewareBeforeFind<T> = (doc: T) => Promise<T> | T | void
type MiddlewareBeforeCreate = (data: any) => Promise<any> | any | void
type MiddlewareAfterCreate<T> = (result: InsertOneResult<T>, data: Partial<T>) => (Promise<InsertOneResult<T>> | InsertOneResult<T>) | void
type MiddlewareBeforeUpdate<T> = (query: Filter<T>, data: any) => Promise<any> | any | void
type MiddlewareAfterUpdate<T> = (result: Document | UpdateResult, query: Filter<T>) => Promise<UpdateResult> | UpdateResult | void
type MiddlewareBeforeDelete<T> = (query: Filter<T>, documents: T[]) => Promise<void> | void
type MiddlewareAfterDelete<T> = (result: DeleteResult, query: Filter<T>, documents: T[]) => Promise<DeleteResult> | DeleteResult | void


export type IndexDefinition = { indexSpec: IndexSpecification, options?: CreateIndexesOptions }

export class MongoModel<T extends OptionalId<Document>> {

  readonly db: () => Promise<Db>
  readonly collectionName: string
  // readonly schema?: IMongoJSONSchema
  // readonly indexDefinitions?: IndexDefinition[]

  private isCollectionReady = false;
  private collectionReadyCallbacks: (() => void)[] = []

  private _middleware = {
    beforeFind: [] as MiddlewareBeforeFind<T>[],
    beforeCreate: [] as MiddlewareBeforeCreate[],
    afterCreate: [] as MiddlewareAfterCreate<T>[],
    beforeUpdate: [] as MiddlewareBeforeUpdate<T>[],
    afterUpdate: [] as MiddlewareAfterUpdate<T>[],
    beforeDelete: [] as MiddlewareBeforeDelete<T>[],
    afterDelete: [] as MiddlewareAfterDelete<T>[],
  }

  private populateCallbacks: {
    [property: string]: ((doc: any) => Promise<any> | any)
  } = {}

  constructor(db: () => Promise<Db>, collectionName: string, options?: IModelOptions) {
    this.db = db
    this.collectionName = collectionName
    // this.schema = options?.schema
    // this.indexDefinitions = options?.indices

    this.prepareCollection(options)
  }

  protected collection() {
    return this.db()
      .then(db => db.collection(this.collectionName))
  }

  private async prepareCollection(options?: IModelOptions) {

    const db = await this.db()

    const validator = {
      ...(options?.schema && { $jsonSchema: options.schema })
    }
    const validationAction = options?.validationAction || undefined;
    const validationLevel = options?.validationLevel || undefined;

    const collectionExists = await db.listCollections({ name: this.collectionName }).toArray().then(cols => cols.length > 0)

    if (!collectionExists) {

      if (process.env.NODE_ENV === 'development') {
        console.log(`Creating collection "${this.collectionName}"...`)
      }

      try {
        await db.createCollection(this.collectionName, {
          ...(validationLevel && { validationAction }),
          ...(validationLevel && { validationLevel }),
          ...(options?.schema && { validator }),
          ...(options?.timeseries && { timeseries: options?.timeseries.timeseries }),
          ...(options?.timeseries?.expireAfterSeconds && { expireAfterSeconds: options?.timeseries.expireAfterSeconds }),
        })
      }
      catch (err) {
        console.error(err.message)
      }
    }
    else {

      if (options?.schema) {

        if (process.env.NODE_ENV === 'development') {
          console.log(`Updating validator for collection "${this.collectionName}"...`)
        }

        // Update validation
        await db.command({ collMod: this.collectionName, validator })
        await db.command({ collMod: this.collectionName, validationAction: validationAction })
        await db.command({ collMod: this.collectionName, validationLevel: validationLevel })
      }
    }

    if (options?.indices) {

      if (process.env.NODE_ENV === 'development') {
        console.log(`Updating indices for collection "${this.collectionName}"...`)
      }

      const col = db.collection(this.collectionName)

      options.indices.forEach(async def => {
        await col.createIndex(def.indexSpec, def.options)
      })
    }

    // Set isCollectionReady-flag
    this.isCollectionReady = true;

    console.log(`Collection "${this.collectionName}" ready.`)

    // Execute callbacks
    this.collectionReadyCallbacks.forEach(cb => cb())

    // Remove callbacks
    this.collectionReadyCallbacks.forEach(cb => {
      // Remove callback function
      this.collectionReadyCallbacks.splice(this.collectionReadyCallbacks.indexOf(cb, 1))
    })
  }

  collectionReady() {
    return new Promise(resolve => {

      // Return immediately if ready
      if (this.isCollectionReady) {
        return resolve(null)
      }

      // Define callback function
      const cb = () => {
        // Resolve promise
        resolve(null)
      }
      // Add callback function
      this.collectionReadyCallbacks.push(cb)
    })
  }




  // Functions to register middleware

  beforeFind(middleware: MiddlewareBeforeFind<T>) {
    this._middleware.beforeFind.push(middleware)
  }

  beforeCreate(middleware: MiddlewareBeforeCreate) {
    this._middleware.beforeCreate.push(middleware)
  }

  afterCreate(middleware: MiddlewareAfterCreate<T>) {
    this._middleware.afterCreate.push(middleware)
  }

  beforeUpdate(middleware: MiddlewareBeforeUpdate<T>) {
    this._middleware.beforeUpdate.push(middleware)
  }

  afterUpdate(middleware: MiddlewareAfterUpdate<T>) {
    this._middleware.afterUpdate.push(middleware)
  }

  beforeDelete(middleware: MiddlewareBeforeDelete<T>) {
    this._middleware.beforeDelete.push(middleware)
  }

  afterDelete(middleware: MiddlewareAfterDelete<T>) {
    this._middleware.afterDelete.push(middleware)
  }


  populate(property: string, callback: (doc: any) => Promise<any> | any) {

    if (process.env.NODE_ENV === 'development') {
      if (this.populateCallbacks[property]) {
        console.warn(`Populate-callback for property "${property}" on model "${this.collectionName}" was specified more than once. This might be a bug in your code...`)
      }
    }

    this.populateCallbacks[property] = callback;
  }


  _beforeFindCall = async (data) => {
    // Call middleware
    for (let i = 0; i < this._middleware.beforeFind.length; i++) {
      const mw = this._middleware.beforeFind[i];
      data = await mw(Object.assign({}, data)) || data; //TODO: Deep copy!
    }
    return data;
  }


  exists(query?: Filter<Document>): Promise<boolean> {

    return this.collection()
      .then(col => col.find(query).limit(1).count())
      .then(count => count === 1)
  }

  find(query?: Filter<Document>, options?: FindOptions<T>, queryOptions?: IQueryOptions): Promise<T[]> {

    return this.db()
      .then(db => db.collection<T>(this.collectionName))
      .then(collection => collection.find(query, options).toArray())
      .then(x => Promise.all(x.map(this._beforeFindCall)))
      .then(x => Promise.all(x.map(d => this._populateAll(d, queryOptions?.populate || []))))
  }

  findOne(query?: Filter<Document>, options?: FindOptions<T>, queryOptions?: IQueryOptions): Promise<T> {

    return this.collection()
      .then(col => col.findOne(query, options))
      .then(this._beforeFindCall)
      .then(d => this._populateAll(d, queryOptions?.populate || []));

    // return this.find(query, options, queryOptions)
    //   .then(x => x.length > 0 ? x[0] : null) // TODO: throw error, like findFyId??
  }

  findById(id: string, options?: FindOptions<T>, queryOptions?: IQueryOptions): Promise<T> {

    return this.db()
      .then(db => db.collection<T>(this.collectionName))
      .then(collection => collection.findOne({ _id: new ObjectId(id) }, options))
      .then(this._beforeFindCall)
      .then(d => this._populateAll(d, queryOptions?.populate || []))
  }

  async create(data: Partial<T>) {

    const col = await this.collection()

    // Call middleware
    for (let i = 0; i < this._middleware.beforeCreate.length; i++) {
      const mw = this._middleware.beforeCreate[i];
      data = await mw(Object.assign({}, data)) || data; //TODO: Deep copy!
    }

    let result = await col.insertOne(data)

    // Call middleware
    for (let i = 0; i < this._middleware.afterCreate.length; i++) {
      const mw = this._middleware.afterCreate[i];
      result = await mw(Object.assign({}, result), data) || result; //TODO: Deep copy!
    }

    return result;
  }

  async updateOne(query: Filter<Document>, data: UpdateFilter<T>, options?: UpdateOptions) {

    const col = await this.collection()

    // Call middleware
    for (let i = 0; i < this._middleware.beforeUpdate.length; i++) {
      const mw = this._middleware.beforeUpdate[i];
      data = await mw(query, Object.assign({}, data)) || data; //TODO: Deep copy!
    }

    // let data = await this.onBeforeUpdate(query, data)
    let result = await col.updateOne(query, data, options)

    // Call middleware
    for (let i = 0; i < this._middleware.afterUpdate.length; i++) {
      const mw = this._middleware.afterUpdate[i];
      result = await mw(Object.assign({}, result), data) || result; //TODO: Deep copy!
    }

    return result;
  }

  async delete(query?: Filter<T>, options?: FindOptions<T>) {

    const col = await this.collection()

    // const documents = await this.find(query)
    const documents = await col.find(query, options).toArray() as T[]

    console.log(documents)

    // Call middleware
    for (let i = 0; i < this._middleware.beforeDelete.length; i++) {
      const mw = this._middleware.beforeDelete[i];
      await mw(query, documents)
    }

    let result = await col.deleteMany(query)

    // if (result.deletedCount < 1) {
    //   // throw new Error('not_found')
    // }

    // Call middleware
    for (let i = 0; i < this._middleware.afterDelete.length; i++) {
      const mw = this._middleware.afterDelete[i];
      result = await mw(result, query, documents) || result; //TODO: Deep copy!
    }

    return result;
  }

  private async _populateAll(doc: any, properties: string[]) {

    if (!doc) return;

    const populatedProps = await Promise.all(properties.map(prop => this._populate(doc, prop)))

    const newDoc = Object.assign({}, doc)

    properties.forEach((value, i) => {
      newDoc[value] = populatedProps[i]
    })

    return newDoc
  }

  private async _populate(doc: any, property: string) {

    if (!this.populateCallbacks[property]) {

      if (process.env.NODE_ENV === 'development') {
        console.log(`Property "${property}" does not exist on document`)
      }

      return doc[property]
    }

    return this.populateCallbacks[property](doc)
  }
}