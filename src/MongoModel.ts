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
// import { this.db } from '../database'

export interface IQueryOptions {
  populate?: string[]
}

export interface IModelOptions {
  schema?: IMongoJSONSchema,
  indices?: IndexDefinition[],
  timeseries?: {
    timeseries: TimeSeriesCollectionOptions,
    expireAfterSeconds?: number
  }
}

export type IndexDefinition = { indexSpec: IndexSpecification, options?: CreateIndexesOptions }

export class MongoModel<T extends OptionalId<Document>> {

  readonly db: () => Promise<Db>
  readonly collectionName: string
  // readonly schema?: IMongoJSONSchema
  // readonly indexDefinitions?: IndexDefinition[]

  private collectionReadyCallbacks: (() => void)[] = []

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

    const collectionExists = await db.listCollections({ name: this.collectionName }).toArray().then(cols => cols.length > 0)

    if (!collectionExists) {

      if (process.env.NODE_ENV === 'development') {
        console.log(`Creating collection "${this.collectionName}"...`)
      }

      try {
        await db.createCollection(this.collectionName, {
          ...(options?.schema && { validator }),
          ...(options?.timeseries && { timeseries: options?.timeseries.timeseries }),
          ...(options?.timeseries.expireAfterSeconds && { expireAfterSeconds: options?.timeseries.expireAfterSeconds }),
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

    console.log(`Collection "${this.collectionName}" ready.`)

    // Execute callbacks
    this.collectionReadyCallbacks.forEach(cb => cb())

    // Remove callbacks
    this.collectionReadyCallbacks.forEach(cb => {
      // Remove callback function
      this.collectionReadyCallbacks.splice(this.collectionReadyCallbacks.indexOf(cb, 1))
    })
  }

  onCollectionReady() {
    return new Promise(resolve => {
      // Define callback function
      const cb = () => {
        // Resolve promise
        resolve(null)
      }
      // Add callback function
      this.collectionReadyCallbacks.push(cb)
    })
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
      .then(x => Promise.all(x.map(this.onBeforeFind)))
      .then(x => Promise.all(x.map(d => this._populateAll(d, queryOptions?.populate || []))))
  }

  findOne(query?: Filter<Document>, options?: FindOptions<T>, queryOptions?: IQueryOptions): Promise<T> {

    return this.collection()
      .then(col => col.findOne(query, options))
      .then(this.onBeforeFind)
      .then(d => this._populateAll(d, queryOptions?.populate || []));

    // return this.find(query, options, queryOptions)
    //   .then(x => x.length > 0 ? x[0] : null) // TODO: throw error, like findFyId??
  }

  findById(id: string, options?: FindOptions<T>, queryOptions?: IQueryOptions): Promise<T> {

    return this.db()
      .then(db => db.collection<T>(this.collectionName))
      .then(collection => collection.findOne({ _id: new ObjectId(id) }, options))
      // .then(d => {
      //   if (!d) {
      //     throw new Error('not_found')
      //   }

      //   return d
      // })
      .then(this.onBeforeFind)
      .then(d => this._populateAll(d, queryOptions?.populate || []))
  }

  async create(data: Partial<T>) {

    const col = await this.collection()
    const data_1 = await this.onBeforeCreate(data)
    const result_1 = await col.insertOne(data_1)
    return this.onAfterCreate(result_1, data_1)
  }

  updateOne(query: Filter<Document>, data: UpdateFilter<T>, options?: UpdateOptions) {

    return this.collection()
      .then(async col => col.updateOne(query, await this.onBeforeUpdate(query, data), options))
      .then(result => this.onAfterUpdate(result, query))
  }

  async delete(query?: Filter<T>, options?: FindOptions<T>) {

    const col = await this.collection()

    const documents = await this.find(query)

    const result = await col.deleteMany(query)

    // if (result.deletedCount < 1) {
    //   // throw new Error('not_found')
    // }

    return await this.onAfterDelete(result, query, documents)
  }

  private async _populateAll(doc: any, properties: string[]) {

    if (!doc) return;

    const populatedProps = await Promise.all(properties.map(prop => this.populate(doc, prop)))

    const newDoc = Object.assign({}, doc)

    properties.forEach((value, i) => {
      newDoc[value] = populatedProps[i]
    })

    return newDoc
  }

  // Override this method to populate properties of document before returned
  protected populate(doc: T, property: string) { return doc[property] }

  // Override this method to modify document before returned
  protected onBeforeFind(doc: T) { return doc }

  // Override this method to modify document before inserted in database
  protected onBeforeCreate(data: any) { return data }
  protected onAfterCreate(result: InsertOneResult<T>, data: Partial<T>) { return Promise.resolve(result) }

  protected onBeforeUpdate(query: Filter<T>, data: any) { return Promise.resolve(data) }
  protected onAfterUpdate(result: Document | UpdateResult, query: Filter<T>) { return Promise.resolve(result) }

  protected onAfterDelete(result: DeleteResult, query: Filter<T>, documents: T[]) { return Promise.resolve(result) }
}