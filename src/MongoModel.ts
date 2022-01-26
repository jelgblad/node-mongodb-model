import {
  Collection,
  CreateIndexesOptions,
  Db,
  DeleteResult,
  Filter,
  FindOptions,
  IndexSpecification,
  InsertOneResult,
  OptionalId,
  TimeSeriesCollectionOptions,
  UpdateFilter,
  UpdateOptions,
  UpdateResult
} from 'mongodb';
import { deserialize, serialize } from 'bson';
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

type AnyHookPost = (...args) => void;
type AnyHook = (...args) => MaybePromise<AnyHookPost | void>;

export type IndexDefinition = { indexSpec: IndexSpecification, options?: CreateIndexesOptions }

export class MongoModel<T = unknown> {

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

  /** @ignore */
  private _schema: IMongoJSONSchema;


  constructor(db: () => Promise<Db>, collectionName: string, options?: IModelOptions) {
    this.db = db;
    this.collectionName = collectionName;
    // this.schema = options?.schema
    // this.indexDefinitions = options?.indices

    this._schema = options && options.schema;

    this.prepareCollection(options);
  }

  collection() {
    return new Promise<Collection<T>>(resolve => {

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
  private _hooksOnFind: AnyHook[] = [];

  /** @ignore */
  private _hooksOnCreate: AnyHook[] = [];

  /** @ignore */
  private _hooksOnUpdate: AnyHook[] = [];

  /** @ignore */
  private _hooksOnDelete: AnyHook[] = [];

  /**
   * The **onFind**-hook runs when `find` or `findOne` are called.
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
   * Hooks runs in the order they are defined.
   * 
   * @param hook  A function that is called before cursor is created in MongoDB and optionally returns a function that is called after results are returned from MongoDB.
   * 
   * @category Hooks
   */
  onFind(
    hook: (filter: Filter<T>, args: any) =>
      MaybePromise<((doc: T | void, err?: any) => MaybePromise<void>) | void>
  ) {
    this._hooksOnFind.push(hook);
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
   * Hooks runs in the order they are defined.
   * 
   * @param hook  A function that is called before cursor is created in MongoDB and optionally returns a function that is called after results are returned from MongoDB.
   * 
   * @category Hooks
   */
  onCreate(
    hook: (data: OptionalId<T>, args: any) =>
      MaybePromise<((result: InsertOneResult<T> | void, err?: any) => MaybePromise<void>) | void>
  ) {
    this._hooksOnCreate.push(hook);
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
   * Hooks runs in the order they are defined.
   * 
   * @param hook  A function that is called before cursor is created in MongoDB and optionally returns a function that is called after results are returned from MongoDB.
   * 
   * @category Hooks
   */
  onUpdate(
    hook: (filter: Filter<T>, updateFilter: UpdateFilter<T>, args: any) =>
      MaybePromise<((result: UpdateResult | void, err?: any) => MaybePromise<void>) | void>
  ) {
    this._hooksOnUpdate.push(hook);
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
   * Hooks runs in the order they are defined.
   * 
   * @param hook  A function that is called before cursor is created in MongoDB and optionally returns a function that is called after results are returned from MongoDB.
   * 
   * @category Hooks
   */
  onDelete(
    hook: (filter: Filter<T>, args: any) =>
      MaybePromise<((result: DeleteResult | void, err?: any) => MaybePromise<void>) | void>
  ) {
    this._hooksOnDelete.push(hook);
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

    // Call pre-hooks
    const postHooks = await this._callPreHooks(this._hooksOnFind, filter, queryOptions?.hookArgs);

    try {
      let data = await col.find(filter, options).toArray() as T[];
      data = await Promise.all(data.map(d => this._populateAll(d, queryOptions?.populate || [])));

      // Call post-hooks
      for (const d of data) {
        await this._callPostHooks(postHooks, d);
      }

      return data;
    }
    catch (err) {

      // Call post-hooks
      await this._callPostHooks(postHooks, null, err);

      // Throw error again
      throw err;
    }
  }

  /**
   * @category Queries
   */
  async findOne(filter?: Filter<T>, options?: FindOptions<T>, queryOptions?: IQueryOptions): Promise<void | T> {

    const col = await this.collection();

    // Call pre-hooks
    const postHooks = await this._callPreHooks(this._hooksOnFind, filter, queryOptions?.hookArgs);

    try {
      let data = await col.findOne(filter, options) as T;

      if (!data) return null;

      data = await this._populateAll(data, queryOptions?.populate || []);

      // Call post-hooks
      await this._callPostHooks(postHooks, data);
      // await Promise.all(postOnFindHooks.map(hook => hook ? hook(data) : null));

      return data;
    }
    catch (err) {

      // Call post-hooks
      await this._callPostHooks(postHooks, null, err);

      // Throw error again
      throw err;
    }
  }

  /**
   * @category Queries
   */
  async create(data: OptionalId<T>, queryOptions?: IQueryOptions) {

    const col = await this.collection();

    // Call pre-hooks
    const postHooks = await this._callPreHooks(this._hooksOnCreate, data, queryOptions?.hookArgs);

    try {
      const result = await col.insertOne(data);

      // Call post-hooks
      await this._callPostHooks(postHooks, result);

      return result;
    }
    catch (err) {

      // Call post-hooks
      await this._callPostHooks(postHooks, null, err);

      // Throw error again
      throw err;
    }
  }

  /**
   * @category Queries
   */
  async update(filter: Filter<T>, updateFilter: UpdateFilter<T>, options?: UpdateOptions, queryOptions?: IQueryOptions) {

    const col = await this.collection();

    // Call pre-hooks
    const postHooks = await this._callPreHooks(this._hooksOnUpdate, filter, updateFilter, queryOptions?.hookArgs);

    try {
      const result = await col.updateMany(filter, updateFilter, options) as UpdateResult;

      // Call post-hooks
      await this._callPostHooks(postHooks, result);

      return result;
    }
    catch (err) {

      // Call post-hooks
      await this._callPostHooks(postHooks, null, err);

      // Throw error again
      throw err;
    }
  }

  /**
   * @category Queries
   */
  async delete(filter?: Filter<T>, options?: FindOptions<T>, queryOptions?: IQueryOptions) {

    const col = await this.collection();

    // Call pre-hooks
    const postHooks = await this._callPreHooks(this._hooksOnDelete, filter, queryOptions?.hookArgs);

    try {
      const result = await col.deleteMany(filter);

      // Call post-hooks
      await this._callPostHooks(postHooks, result);

      return result;
    }
    catch (err) {

      // Call post-hooks
      await this._callPostHooks(postHooks, null, err);

      // Throw error again
      throw err;
    }
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

  readonly utils = {
    /**
     * Delete properties on *obj* based on rules supplied in *IModelOptions.schema*.
     *  
     * @param obj  Object to trim.
     * 
     * @category Hooks
     */
    trimObject: (obj) => {
      return this._trimObjectShallow(obj, this._schema);
    }
  }

  /** @ignore */
  private _trimObjectShallow(obj: any, schema: IMongoJSONSchema) {
    if (schema.additionalProperties === false) {
      for (const key in obj) {
        if (!schema.properties || Object.keys(schema.properties).indexOf(key) < 0) {
          delete obj[key];
        }
        else if (schema.properties && schema.properties[key] && typeof obj[key] === 'object') {
          this._trimObjectShallow(obj[key], schema.properties[key] as IMongoJSONSchema);
        }
      }
    }
  }

  /**
   * @ignore
   * 
   * Call hooks in series with the supplied args, and return optional post-hooks
   * @param hooks Array of hook-functions to call
   * @param args Args to pass to hook-function
   * @returns Array of postHook-functions
   */
  private async _callPreHooks(hooks: AnyHook[], ...args: unknown[]) {
    // Post hooks
    const postHooks: AnyHookPost[] = [];

    // Loop hooks
    for (const hook of hooks) {
      // Call and await the pre-hook
      const postHook = await hook(...args);

      // Check if hook returned a postHook
      if (postHook) {
        // Cue up post-hooks
        postHooks.push(postHook);
      }
    }

    return postHooks;
  }

  /**
   * @ignore
   * 
   * Call post-hooks in series with the supplied args
   * @param hooks Array of hook-functions to call
   * @param args Args to pass to hook-function
   */
  private async _callPostHooks(hooks: AnyHookPost[], ...args: unknown[]) {
    for (const hook of hooks) {
      await hook(...args);
    }
  }
}
