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
  UpdateResult,
  MongoClient
} from 'mongodb';
import { deserialize, serialize } from 'bson';
import { IMongoJSONSchema } from './IMongoJSONSchema';

export type IQueryOptions = {
  // acept any property
  [key: string]: unknown

  // "hard-coded" properties
  populate?: string[]
}

export interface IModelOptions {
  defaultDatabase?: string
  schema?: IMongoJSONSchema
  validationAction?: 'error' | 'warn'
  validationLevel?: 'off' | 'moderate' | 'strict'
  indices?: IndexDefinition[]
  timeseries?: {
    timeseries: TimeSeriesCollectionOptions
    expireAfterSeconds?: number
  }
}

type MaybePromise<T> = Promise<T> | T;

type AnyHookPost = (...args) => void;
type AnyHook = (...args) => MaybePromise<AnyHookPost | void>;

export type IndexDefinition = { indexSpec: IndexSpecification, options?: CreateIndexesOptions }

export class MongoModel<T = unknown> {

  // readonly db: () => Promise<Db>
  readonly collectionName: string

  // readonly schema?: IMongoJSONSchema
  // readonly indexDefinitions?: IndexDefinition[]

  /** @ignore */
  private getConnection: () => Promise<MongoClient>

  /** @ignore */
  private options?: IModelOptions

  /** @ignore */
  private collectionReadyInDatabases: string[] = [];
  // private isCollectionReady = false;

  /** @ignore */
  private collectionReadyCallbacks: { [database: string]: (() => void)[] } = {}
  // private collectionReadyCallbacks: (() => void)[] = []

  /** @ignore */
  private populateCallbacks: {
    [property: string]: ((doc: any) => Promise<any>)
  } = {}

  /** @ignore */
  private _schema: IMongoJSONSchema;


  constructor(getConnection: () => Promise<MongoClient>, collectionName: string, options?: IModelOptions) {
    // this.db = db;
    this.getConnection = getConnection;

    this.collectionName = collectionName;
    // this.schema = options?.schema
    // this.indexDefinitions = options?.indices
    this.options = options;

    this._schema = options && options.schema;

    // this.prepareCollection(options);

    this.onFind((f, queryOptions) => async doc => {
      if (queryOptions && queryOptions.populate && doc) {
        await this._populateAll(doc, queryOptions.populate);
      }
    });
  }

  
  collection(database?: string) {

    const _database = database || this.options?.defaultDatabase;

    return new Promise<Collection<T>>(resolve => {
      this.getConnection().then(c => c.db(_database)).then(db => {

        // Return immediately if ready
        if (this.collectionReadyInDatabases.indexOf(db.databaseName) > -1) {
          return resolve(db.collection(this.collectionName));
        }
        else if (!(db.databaseName in this.collectionReadyCallbacks)) {

          // Create array for callbacks
          this.collectionReadyCallbacks[db.databaseName] = [];

          // Prepare collection
          this.prepareCollection(_database);
        }

        // Define callback function
        const cb = () => {
          // Resolve promise
          return resolve(db.collection(this.collectionName));
        };
        // Add callback function
        this.collectionReadyCallbacks[db.databaseName].push(cb);
      });
    });
  }


  /** @ignore */
  private async prepareCollection(database?: string) {

    // const db = await this.db();
    const db = await this.getConnection().then(c => c.db(database));

    const validator = {
      ...(this.options?.schema && { $jsonSchema: this.options.schema })
    };
    const validationAction = this.options?.validationAction || undefined;
    const validationLevel = this.options?.validationLevel || undefined;

    const collectionExists = await db.listCollections({ name: this.collectionName }).toArray().then(cols => cols.length > 0);

    if (!collectionExists) {

      if (process.env.NODE_ENV === 'development') {
        console.log(`Creating collection "${this.collectionName}" in database "${db.databaseName}"...`);
      }

      try {
        await db.createCollection(this.collectionName, {
          ...(validationLevel && { validationAction }),
          ...(validationLevel && { validationLevel }),
          ...(this.options?.schema && { validator }),
          ...(this.options?.timeseries && { timeseries: this.options?.timeseries.timeseries }),
          ...(this.options?.timeseries?.expireAfterSeconds && { expireAfterSeconds: this.options?.timeseries.expireAfterSeconds }),
        });
      }
      catch (err) {
        console.error(err.message);
      }
    }
    else {

      // Update schema
      if (this.options?.schema) {

        if (process.env.NODE_ENV === 'development') {
          console.log(`Updating validator for collection "${this.collectionName}" in database "${db.databaseName}"...`);
        }

        // Update validation
        await db.command({ collMod: this.collectionName, validator });
        await db.command({ collMod: this.collectionName, validationAction: validationAction });
        await db.command({ collMod: this.collectionName, validationLevel: validationLevel });
      }

      // Update timeseries
      if (this.options?.timeseries) {

        if (process.env.NODE_ENV === 'development') {
          console.log(`Updating timeseries options for collection "${this.collectionName}" in database "${db.databaseName}"...`);
        }

        // Set expireAfterSeconds
        await db.command({
          collMod: this.collectionName,
          expireAfterSeconds: this.options?.timeseries?.expireAfterSeconds
        });
      }
    }

    if (this.options?.indices) {

      if (process.env.NODE_ENV === 'development') {
        console.log(`Updating indices for collection "${this.collectionName}" in database "${db.databaseName}"...`);
      }

      const col = db.collection(this.collectionName);

      // Drop indexes
      await col.dropIndexes();

      // Recreate indexes
      this.options.indices.forEach(async def => {
        await col.createIndex(def.indexSpec, def.options);
      });
    }

    // Set isCollectionReady-flag
    this.collectionReadyInDatabases.push(db.databaseName);
    // this.isCollectionReady = true;

    if (process.env.NODE_ENV === 'development') {
      console.log(`Collection "${this.collectionName}" in database "${db.databaseName}" ready.`);
    }

    // Execute callbacks
    this.collectionReadyCallbacks[db.databaseName].forEach(cb => cb());

    // Remove callbacks
    this.collectionReadyCallbacks[db.databaseName].forEach(cb => {
      // Remove callback function
      this.collectionReadyCallbacks[db.databaseName].splice(this.collectionReadyCallbacks[db.databaseName].indexOf(cb, 1));
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
    hook: (filter: Filter<T>, queryOptions: void | IQueryOptions) =>
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
    hook: (data: OptionalId<T>, queryOptions: void | IQueryOptions) =>
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
    hook: (filter: Filter<T>, updateFilter: UpdateFilter<T>, queryOptions: void | IQueryOptions) =>
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
    hook: (filter: Filter<T>, queryOptions: void | IQueryOptions) =>
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
    const [postHooks, error] = await this._callPreHooks(this._hooksOnFind, filter, queryOptions);

    try {
      // Throw hook error
      if (error) throw error;

      const data = await col.find(filter, options).toArray() as T[];

      // Call post-hooks
      for (const d of data) {
        await this._callPostHooks(postHooks, d);
      }

      return data;
    }
    catch (err) {

      // Call post-hooks with error
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
    const [postHooks, error] = await this._callPreHooks(this._hooksOnFind, filter, queryOptions);

    try {
      // Throw hook error
      if (error) throw error;

      const data = await col.findOne(filter, options) as T;

      if (!data) return null;

      // Call post-hooks
      await this._callPostHooks(postHooks, data);
      // await Promise.all(postOnFindHooks.map(hook => hook ? hook(data) : null));

      return data;
    }
    catch (err) {

      // Call post-hooks with error
      await this._callPostHooks(postHooks, null, err);

      // Throw error again
      throw err;
    }
  }

  /**
   * @category Queries
   */
  async create(data: Partial<OptionalId<T>>, queryOptions?: IQueryOptions) {

    const col = await this.collection();

    // Call pre-hooks
    const [postHooks, error] = await this._callPreHooks(this._hooksOnCreate, data, queryOptions);

    try {
      // Throw hook error
      if (error) throw error;

      const result = await col.insertOne(data as OptionalId<T>);

      // Call post-hooks
      await this._callPostHooks(postHooks, result);

      return result;
    }
    catch (err) {

      // Call post-hooks with error
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
    const [postHooks, error] = await this._callPreHooks(this._hooksOnUpdate, filter, updateFilter, queryOptions);

    try {
      // Throw hook error
      if (error) throw error;

      const result = await col.updateMany(filter, updateFilter, options) as UpdateResult;

      // Call post-hooks
      await this._callPostHooks(postHooks, result);

      return result;
    }
    catch (err) {

      // Call post-hooks with error
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
    const [postHooks, error] = await this._callPreHooks(this._hooksOnDelete, filter, queryOptions);

    try {
      // Throw hook error
      if (error) throw error;

      const result = await col.deleteMany(filter);

      // Call post-hooks with error
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

    for (let i = 0; i < properties.length; i++) {
      if (populatedProps[i]) {
        doc[properties[i]] = populatedProps[i];
      }
    }

    return doc;
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
  private async _callPreHooks(hooks: AnyHook[], ...args: unknown[]): Promise<[AnyHookPost[], any]> {
    // Post hooks
    const postHooks: AnyHookPost[] = [];

    // Loop hooks
    for (const hook of hooks) {
      try {
        // Call and await the pre-hook
        const postHook = await hook(...args);

        // Check if hook returned a postHook
        if (postHook) {
          // Cue up post-hooks
          postHooks.push(postHook);
        }
      }
      catch (err) {
        return [postHooks, err];
      }
    }

    return [postHooks, null];
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
