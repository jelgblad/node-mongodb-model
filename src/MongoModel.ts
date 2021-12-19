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
  TimeSeriesCollectionOptions,
  Db,
  Collection
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

type HookOnFind<T> = (filter: Filter<T>, setFilter: (filter: Filter<T>) => void) => ((doc: T) => Promise<T> | T | void) | void;
type HookOnCreate<T> = (data: Partial<T>, setData: (data: Partial<T>) => void) => ((result: InsertOneResult<T>) => Promise<InsertOneResult<T>> | InsertOneResult<T> | void) | void;
type HookOnUpdate<T> = (filter: Filter<T>, setFilter: (filter: Filter<T>) => void, updateFilter: UpdateFilter<T>, setUpdateFilter: (updateFilter: UpdateFilter<T>) => void) => ((result: UpdateResult) => Promise<UpdateResult> | UpdateResult | void) | void;
type HookOnDelete<T> = (filter: Filter<T>, setFilter: (filter: Filter<T>) => void) => ((result: DeleteResult) => Promise<DeleteResult> | DeleteResult | void) | void;

export type IndexDefinition = { indexSpec: IndexSpecification, options?: CreateIndexesOptions }

export class MongoModel<T extends OptionalId<Document>> {

  readonly db: () => Promise<Db>
  readonly collectionName: string
  // readonly schema?: IMongoJSONSchema
  // readonly indexDefinitions?: IndexDefinition[]

  private isCollectionReady = false;
  private collectionReadyCallbacks: (() => void)[] = []

  private populateCallbacks: {
    [property: string]: ((doc: any) => Promise<any>)
  } = {}

  constructor(db: () => Promise<Db>, collectionName: string, options?: IModelOptions) {
    this.db = db
    this.collectionName = collectionName
    // this.schema = options?.schema
    // this.indexDefinitions = options?.indices

    this.prepareCollection(options)
  }

  collection() {
    return new Promise<Collection>(resolve => {

      // Return immediately if ready
      if (this.isCollectionReady) {
        return resolve(this.db().then(db => db.collection(this.collectionName)))
      }

      // Define callback function
      const cb = () => {
        // Resolve promise
        return resolve(this.db().then(db => db.collection(this.collectionName)))
      }
      // Add callback function
      this.collectionReadyCallbacks.push(cb)
    })
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


  // Hooks
  onFind: HookOnFind<T> = undefined;
  onCreate: HookOnCreate<T> = undefined;
  onUpdate: HookOnUpdate<T> = undefined;
  onDelete: HookOnDelete<T> = undefined;


  populate(property: string, callback: (doc: T) => Promise<any> | any) {

    if (process.env.NODE_ENV === 'development') {
      if (this.populateCallbacks[property]) {
        console.warn(`Populate-callback for property "${property}" on model "${this.collectionName}" was specified more than once. This might be a bug in your code...`)
      }
    }

    this.populateCallbacks[property] = callback;
  }


  exists(filter?: Filter<T>): Promise<boolean> {

    return this.collection()
      .then(col => col.find(filter).limit(1).count())
      .then(count => count === 1)
  }

  async find(filter?: Filter<T>, options?: FindOptions<T>, queryOptions?: IQueryOptions): Promise<T[]> {

    const col = await this.collection()

    // Call pre-hook
    const postOnFind = this.onFind && this.onFind(filter, (newFilter) => {
      filter = newFilter;
    })

    let data = await col.find(filter, options).toArray() as T[]
    data = await Promise.all(data.map(d => this._populateAll(d, queryOptions?.populate || [])))

    // Call post-hook
    if (postOnFind) {
      data = await Promise.all(data.map(d => postOnFind(d) || d))
    }

    return data;
  }

  async findOne(filter?: Filter<T>, options?: FindOptions<T>, queryOptions?: IQueryOptions): Promise<T> {

    const col = await this.collection()

    // Call pre-hook
    const postOnFind = this.onFind && this.onFind(filter, (newFilter) => {
      filter = newFilter;
    })

    let data = await col.findOne(filter, options) as T
    data = await this._populateAll(data, queryOptions?.populate || [])

    // Call post-hook
    if (postOnFind) {
      data = await postOnFind(data) || data;
    }

    return data;

    // return this.find(query, options, queryOptions)
    //   .then(x => x.length > 0 ? x[0] : null) // TODO: throw error, like findFyId??
  }

  async findById(id: string, options?: FindOptions<T>, queryOptions?: IQueryOptions): Promise<T> {

    const col = await this.collection()
    let filter = { _id: new ObjectId(id) } as Filter<T>

    // Call pre-hook
    const postOnFind = this.onFind && this.onFind(filter, (newFilter) => {
      filter = newFilter;
    })

    let data = await col.findOne(filter, options) as T
    data = await this._populateAll(data, queryOptions?.populate || [])

    // Call post-hook
    if (postOnFind) {
      data = await postOnFind(data) || data;
    }

    return data;
  }

  async create(data: Partial<T>) {

    const col = await this.collection()

    // Call pre-hook
    const postOnCrate = this.onCreate && this.onCreate(data, (newData) => { //TODO: Deep copy data!
      data = newData;
    })

    let result = await col.insertOne(data)

    // Call post-hook
    if (postOnCrate) {
      result = await postOnCrate(result) || result;
    }

    return result;
  }

  async updateOne(filter: Filter<Document>, updateFilter: UpdateFilter<T>, options?: UpdateOptions) {

    const col = await this.collection()

    // Call pre-hook
    const postOnUpdate = this.onUpdate && this.onUpdate(
      filter, (newFilter) => {
        filter = newFilter;
      },
      updateFilter, (newUpdateFilter) => {
        updateFilter = newUpdateFilter;
      }
    );

    let result = await col.updateOne(filter, updateFilter, options)

    // Call post-hook
    if (postOnUpdate) {
      result = await postOnUpdate(result) || result;
    }

    return result;
  }

  async delete(filter?: Filter<T>, options?: FindOptions<T>) {

    const col = await this.collection()

    // Call pre-hook
    const postOnDelete = this.onDelete && this.onDelete(filter, (newFilter) => {
      filter = newFilter;
    })

    // const documents = await this.find(query)
    // const documents = await col.find(filter, options).toArray() as T[]

    // console.log(documents)

    let result = await col.deleteMany(filter)

    // if (result.deletedCount < 1) {
    //   // throw new Error('not_found')
    // }

    // Call post-hook
    if (postOnDelete) {
      result = await postOnDelete(result) || result;
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
        console.log(`No populate-handler for "${property}"`)
      }

      return doc[property]
    }

    // Call populate callback for property
    return this.populateCallbacks[property](doc)
  }
}