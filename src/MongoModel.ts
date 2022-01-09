import {
  Collection,
  CreateIndexesOptions,
  Db,
  DeleteResult,
  Document,
  Filter,
  FindOptions,
  IndexSpecification,
  InsertOneResult,
  ObjectId,
  OptionalId,
  TimeSeriesCollectionOptions,
  UpdateFilter,
  UpdateOptions,
  UpdateResult
} from 'mongodb';
import { deserialize, serialize } from 'BSON';
import { IMongoJSONSchema } from './IMongoJSONSchema';

export interface IQueryOptions {
  populate?: string[]
  hookArgs?: any
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

type MaybePromise<T> = Promise<T> | T;

type HookOnFind<T> = (filter: Filter<T>, args: any) => MaybePromise<((doc: T) => MaybePromise<void>) | void>;
// type HookOnFindIM<T> = (filter: Filter<T>, setFilter: (filter: Filter<T>) => void, args: any) => MaybePromise<((doc: T) => MaybePromise<T> | MaybePromise<void>) | void>;
type HookOnCreate<T> = (data: Partial<T>, args: any) => MaybePromise<((result: InsertOneResult<T>) => MaybePromise<InsertOneResult<void>> | MaybePromise<void>) | void>;
// type HookOnCreateIM<T> = (data: Partial<T>, setData: (data: Partial<T>) => void, args: any) => MaybePromise<((result: InsertOneResult<T>) => MaybePromise<InsertOneResult<T>> | MaybePromise<void>) | void>;
type HookOnUpdate<T> = (filter: Filter<T>, updateFilter: UpdateFilter<T>, args: any) => MaybePromise<((result: UpdateResult) => MaybePromise<void>) | void>;
// type HookOnUpdateIM<T> = (filter: Filter<T>, setFilter: (filter: Filter<T>) => void, updateFilter: UpdateFilter<T>, setUpdateFilter: (updateFilter: UpdateFilter<T>) => void, args: any) => MaybePromise<((result: UpdateResult) => MaybePromise<UpdateResult> | MaybePromise<void>) | void>;
type HookOnDelete<T> = (filter: Filter<T>, args: any) => MaybePromise<((result: DeleteResult) => MaybePromise<void>) | void>;
// type HookOnDeleteIM<T> = (filter: Filter<T>, setFilter: (filter: Filter<T>) => void, args: any) => MaybePromise<((result: DeleteResult) => MaybePromise<DeleteResult> | MaybePromise<void>) | void>;

export type IndexDefinition = { indexSpec: IndexSpecification, options?: CreateIndexesOptions }

export class MongoModel<T extends OptionalId<Document> = OptionalId<Document>> {

  readonly db: () => Promise<Db>
  readonly collectionName: string
  // readonly schema?: IMongoJSONSchema
  // readonly indexDefinitions?: IndexDefinition[]

  /** @ignore */
  private isCollectionReady = false;

  /** @ignore */
  private collectionReadyCallbacks: (() => void)[] = []

  /** @ignore */
  private populateCallbacks: {
    [property: string]: ((doc: any) => Promise<any>)
  } = {}

  constructor(db: () => Promise<Db>, collectionName: string, options?: IModelOptions) {
    this.db = db;
    this.collectionName = collectionName;
    // this.schema = options?.schema
    // this.indexDefinitions = options?.indices

    this.prepareCollection(options);
  }

  collection() {
    return new Promise<Collection>(resolve => {

      // Return immediately if ready
      if (this.isCollectionReady) {
        return resolve(this.db().then(db => db.collection(this.collectionName)));
      }

      // Define callback function
      const cb = () => {
        // Resolve promise
        return resolve(this.db().then(db => db.collection(this.collectionName)));
      };
      // Add callback function
      this.collectionReadyCallbacks.push(cb);
    });
  }

  /** @ignore */
  private async prepareCollection(options?: IModelOptions) {

    const db = await this.db();

    const validator = {
      ...(options?.schema && { $jsonSchema: options.schema })
    };
    const validationAction = options?.validationAction || undefined;
    const validationLevel = options?.validationLevel || undefined;

    const collectionExists = await db.listCollections({ name: this.collectionName }).toArray().then(cols => cols.length > 0);

    if (!collectionExists) {

      if (process.env.NODE_ENV === 'development') {
        console.log(`Creating collection "${this.collectionName}"...`);
      }

      try {
        await db.createCollection(this.collectionName, {
          ...(validationLevel && { validationAction }),
          ...(validationLevel && { validationLevel }),
          ...(options?.schema && { validator }),
          ...(options?.timeseries && { timeseries: options?.timeseries.timeseries }),
          ...(options?.timeseries?.expireAfterSeconds && { expireAfterSeconds: options?.timeseries.expireAfterSeconds }),
        });
      }
      catch (err) {
        console.error(err.message);
      }
    }
    else {

      if (options?.schema) {

        if (process.env.NODE_ENV === 'development') {
          console.log(`Updating validator for collection "${this.collectionName}"...`);
        }

        // Update validation
        await db.command({ collMod: this.collectionName, validator });
        await db.command({ collMod: this.collectionName, validationAction: validationAction });
        await db.command({ collMod: this.collectionName, validationLevel: validationLevel });
      }
    }

    if (options?.indices) {

      if (process.env.NODE_ENV === 'development') {
        console.log(`Updating indices for collection "${this.collectionName}"...`);
      }

      const col = db.collection(this.collectionName);

      options.indices.forEach(async def => {
        await col.createIndex(def.indexSpec, def.options);
      });
    }

    // Set isCollectionReady-flag
    this.isCollectionReady = true;

    if (process.env.NODE_ENV === 'development') {
      console.log(`Collection "${this.collectionName}" ready.`);
    }

    // Execute callbacks
    this.collectionReadyCallbacks.forEach(cb => cb());

    // Remove callbacks
    this.collectionReadyCallbacks.forEach(cb => {
      // Remove callback function
      this.collectionReadyCallbacks.splice(this.collectionReadyCallbacks.indexOf(cb, 1));
    });
  }


  /**
   * Hooks
   */

  /** @ignore */
  private _hookOnFind: HookOnFind<T> = undefined;

  /** @ignore */
  private _hookOnCreate: HookOnCreate<T> = undefined;

  /** @ignore */
  private _hookOnUpdate: HookOnUpdate<T> = undefined;

  /** @ignore */
  private _hookOnDelete: HookOnDelete<T> = undefined;

  /**
   * The **onFind**-hook runs when `find`, `findOne` or `findById` are called.
   * 
   * ```typescript
   * myModel.onFind(() => {
   *  // This runs before
   *  return () => {
   *    // This runs after
   *  }
   * })
   * ```
   * 
   * @param hook  A function that is called before cursor is created in MongoDB and optionally returns a function that is called after results are returned from MongoDB.
   * 
   * @category Hooks
   */
  onFind(hook: HookOnFind<T>) {

    if (process.env.NODE_ENV === 'development') {
      if (this._hookOnFind) {
        console.warn(`Callback for hook "onFind" was specified more than once. This might be a bug in your code...`);
      }
    }

    this._hookOnFind = hook;
  }

  /**
   * The **onCreate**-hook runs when `create` is called.
   *
   * ```typescript
   * myModel.onCreate(() => {
   *  // This runs before
   *  return () => {
   *    // This runs after
   *  }
   * })
   * ``` 
   * 
   * @param hook  A function that is called before cursor is created in MongoDB and optionally returns a function that is called after results are returned from MongoDB.
   * 
   * @category Hooks
   */
  onCreate(hook: HookOnCreate<T>) {

    if (process.env.NODE_ENV === 'development') {
      if (this._hookOnCreate) {
        console.warn(`Callback for hook "onCreate" was specified more than once. This might be a bug in your code...`);
      }
    }

    this._hookOnCreate = hook;
  }

  /**
   * The **onUpdate**-hook runs when `update` is called.
   * 
   * ```typescript
   * myModel.onUpdate(() => {
   *  // This runs before
   *  return () => {
   *    // This runs after
   *  }
   * })
   * ```
   * 
   * @param hook  A function that is called before cursor is created in MongoDB and optionally returns a function that is called after results are returned from MongoDB.
   * 
   * @category Hooks
   */
  onUpdate(hook: HookOnUpdate<T>) {

    if (process.env.NODE_ENV === 'development') {
      if (this._hookOnUpdate) {
        console.warn(`Callback for hook "onUpdate" was specified more than once. This might be a bug in your code...`);
      }
    }

    this._hookOnUpdate = hook;
  }

  /**
   * The **onDelete**-hook runs when `delete` is called.
   *
   * ```typescript
   * myModel.onDelete(() => {
   *  // This runs before
   *  return () => {
   *    // This runs after
   *  }
   * })
   * ```
   *  
   * @param hook  A function that is called before cursor is created in MongoDB and optionally returns a function that is called after results are returned from MongoDB.
   * 
   * @category Hooks
   */
  onDelete(hook: HookOnDelete<T>) {

    if (process.env.NODE_ENV === 'development') {
      if (this._hookOnDelete) {
        console.warn(`Callback for hook "onDelete" was specified more than once. This might be a bug in your code...`);
      }
    }

    this._hookOnDelete = hook;
  }


  /**
    * The **populate**-callback runs when `find`, `findOne` or `findById` are called with the specified property in the `populate`-options array.
    * 
    * ```typescript
    * myModel.populate('myParent', doc => {
    *  return myModel.findById(doc.parent_id);
    * })
    * ```
    * 
    * @param property  The name of the property to populate.
    * @param callback  A function that returns a value, or a Promise for a value, that will be populated on the specified property.
    * 
    * @category Hooks
    */
  populate(property: string, callback: (doc: T) => Promise<any> | any) {

    if (process.env.NODE_ENV === 'development') {
      if (this.populateCallbacks[property]) {
        console.warn(`Populate-callback for property "${property}" on model "${this.collectionName}" was specified more than once. This might be a bug in your code...`);
      }
    }

    this.populateCallbacks[property] = callback;
  }


  /**
   * @category Queries
   */
  exists(filter?: Filter<T>): Promise<boolean> {

    return this.collection()
      .then(col => col.find(filter).limit(1).count())
      .then(count => count === 1);
  }

  /**
   * @category Queries
   */
  async find(filter?: Filter<T>, options?: FindOptions<T>, queryOptions?: IQueryOptions): Promise<T[]> {

    const col = await this.collection();

    // Call pre-hook
    const postOnFind = this._hookOnFind && await this._hookOnFind(filter, queryOptions?.hookArgs);
    // const postOnFind = this._hookOnFind && await this._hookOnFind(filter, (newFilter) => {
    //   filter = newFilter;
    // }, queryOptions?.hookArgs) // immutable version

    let data = await col.find(filter, options).toArray() as T[];
    data = await Promise.all(data.map(d => this._populateAll(d, queryOptions?.populate || [])));

    // Call post-hook
    if (postOnFind) {
      await Promise.all(data.map(async d => await postOnFind(d)));
      // data = await Promise.all(data.map(async d => await postOnFind(d) || d)) // immutable version
    }

    return data;
  }

  /**
   * @category Queries
   */
  async findOne(filter?: Filter<T>, options?: FindOptions<T>, queryOptions?: IQueryOptions): Promise<void | T> {

    const col = await this.collection();

    // Call pre-hook
    const postOnFind = this._hookOnFind && await this._hookOnFind(filter, queryOptions?.hookArgs);
    // const postOnFind = this._hookOnFind && await this._hookOnFind(filter, (newFilter) => {
    //   filter = newFilter;
    // }, queryOptions?.hookArgs) // immutable version

    let data = await col.findOne(filter, options) as T;

    if (!data) return null;

    data = await this._populateAll(data, queryOptions?.populate || []);

    // Call post-hook
    if (postOnFind) {
      await postOnFind(data);
      // data = await postOnFind(data) || data; // immutable version
    }

    return data;
  }

  /**
   * @category Queries
   */
  async findById(id: string, options?: FindOptions<T>, queryOptions?: IQueryOptions): Promise<void | T> {

    const col = await this.collection();
    const filter = { _id: new ObjectId(id) } as Filter<T>;

    // Call pre-hook
    const postOnFind = this._hookOnFind && await this._hookOnFind(filter, queryOptions?.hookArgs);
    // const postOnFind = this._hookOnFind && await this._hookOnFind(filter, (newFilter) => {
    //   filter = newFilter;
    // }, queryOptions?.hookArgs) // immutable version

    let data = await col.findOne(filter, options) as T;

    if (!data) return null;

    data = await this._populateAll(data, queryOptions?.populate || []);

    // Call post-hook
    if (postOnFind) {
      await postOnFind(data);
      // data = await postOnFind(data) || data; // immutable version
    }

    return data;
  }

  /**
   * @category Queries
   */
  async create(data: Partial<T>, queryOptions?: IQueryOptions) {

    const col = await this.collection();

    // Call pre-hook
    const postOnCreate = this._hookOnCreate && await this._hookOnCreate(data, queryOptions?.hookArgs);
    // const postOnCreate = this._hookOnCreate && await this._hookOnCreate(data, (newData) => {
    //   data = newData;
    // }) // immutable version

    const result = await col.insertOne(data);

    // Call post-hook
    if (postOnCreate) {
      await postOnCreate(result);
    }
    // if (postOnCreate) {
    //   result = await postOnCreate(result) || result;
    // } // immutable version

    return result;
  }

  /**
   * @category Queries
   */
  async update(filter: Filter<T>, updateFilter: UpdateFilter<T>, options?: UpdateOptions, queryOptions?: IQueryOptions) {

    const col = await this.collection();

    // Call pre-hook
    const postOnUpdate = this._hookOnUpdate && await this._hookOnUpdate(filter, updateFilter, queryOptions?.hookArgs);
    // const postOnUpdate = this._hookOnUpdate && await this._hookOnUpdate(
    //   filter, (newFilter) => {
    //     filter = newFilter;
    //   },
    //   updateFilter, (newUpdateFilter) => {
    //     updateFilter = newUpdateFilter;
    //   }
    // ); // immutable version

    const result = await col.updateMany(filter, updateFilter, options) as UpdateResult;

    // Call post-hook
    if (postOnUpdate) {
      await postOnUpdate(result);
      // result = await postOnUpdate(result) || result; // immutable version
    }

    return result;
  }

  /**
   * @category Queries
   */
  async delete(filter?: Filter<T>, options?: FindOptions<T>, queryOptions?: IQueryOptions) {

    const col = await this.collection();

    // Call pre-hook
    const postOnDelete = this._hookOnDelete && await this._hookOnDelete(filter, queryOptions?.hookArgs);
    // const postOnDelete = this._hookOnDelete && await this._hookOnDelete(filter, (newFilter) => {
    //   filter = newFilter;
    // }) // immutable version

    // const documents = await this.find(query)
    // const documents = await col.find(filter, options).toArray() as T[]

    // console.log(documents)

    const result = await col.deleteMany(filter);

    // if (result.deletedCount < 1) {
    //   // throw new Error('not_found')
    // }

    // Call post-hook
    if (postOnDelete) {
      await postOnDelete(result);
      // result = await postOnDelete(result) || result; // immutable version
    }

    return result;
  }

  /** @ignore */
  private async _populateAll(doc: any, properties: string[]) {

    if (!doc) return;

    const populatedProps = await Promise.all(properties.map(prop => this._populate(doc, prop)));

    const newDoc = Object.assign({}, doc);

    properties.forEach((value, i) => {
      if (populatedProps[i]) {
        newDoc[value] = populatedProps[i];
      }
    });

    return newDoc;
  }

  /** @ignore */
  private async _populate(doc: any, property: string) {

    if (this.populateCallbacks[property]) {

      // Deep-clone document before passing it to callback
      const docClone = deserialize(serialize(doc));

      // Call populate callback for property
      return this.populateCallbacks[property](docClone);
    }
    else {
      if (process.env.NODE_ENV === 'development') {
        console.log(`No populate-handler for "${property}"`);
      }
    }
  }
}