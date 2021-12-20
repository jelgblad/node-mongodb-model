[mongodb-model](../README.md) / [Exports](../modules.md) / MongoModel

# Class: MongoModel<T\>

## Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends `OptionalId`<`Document`\> |

## Table of contents

### Constructors

- [constructor](MongoModel.md#constructor)

### Properties

- [collectionName](MongoModel.md#collectionname)
- [db](MongoModel.md#db)

### Hooks Methods

- [onCreate](MongoModel.md#oncreate)
- [onDelete](MongoModel.md#ondelete)
- [onFind](MongoModel.md#onfind)
- [onUpdate](MongoModel.md#onupdate)
- [populate](MongoModel.md#populate)

### Other Methods

- [collection](MongoModel.md#collection)

### Queries Methods

- [create](MongoModel.md#create)
- [delete](MongoModel.md#delete)
- [exists](MongoModel.md#exists)
- [find](MongoModel.md#find)
- [findById](MongoModel.md#findbyid)
- [findOne](MongoModel.md#findone)
- [update](MongoModel.md#update)

## Constructors

### constructor

• **new MongoModel**<`T`\>(`db`, `collectionName`, `options?`)

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends `Document` & { `_id?`: `ObjectId`  } |

#### Parameters

| Name | Type |
| :------ | :------ |
| `db` | () => `Promise`<`Db`\> |
| `collectionName` | `string` |
| `options?` | [`IModelOptions`](../interfaces/IModelOptions.md) |

#### Defined in

[src/MongoModel.ts:60](https://github.com/jelgblad/node-mongodb-model/blob/a921d83/src/MongoModel.ts#L60)

## Properties

### collectionName

• `Readonly` **collectionName**: `string`

#### Defined in

[src/MongoModel.ts:45](https://github.com/jelgblad/node-mongodb-model/blob/a921d83/src/MongoModel.ts#L45)

___

### db

• `Readonly` **db**: () => `Promise`<`Db`\>

#### Type declaration

▸ (): `Promise`<`Db`\>

##### Returns

`Promise`<`Db`\>

#### Defined in

[src/MongoModel.ts:44](https://github.com/jelgblad/node-mongodb-model/blob/a921d83/src/MongoModel.ts#L44)

## Hooks Methods

### onCreate

▸ **onCreate**(`hook`): `void`

The **onCreate**-hook runs when `create` is called.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `hook` | `HookOnCreate`<`T`\> | A function that is called before cursor is created in MongoDB and optionally returns a function that is called after results are returned from MongoDB.  ```typescript myModel.onCreate(() => {  // This runs before  return () => {    // This runs after  } }) ``` |

#### Returns

`void`

#### Defined in

[src/MongoModel.ts:220](https://github.com/jelgblad/node-mongodb-model/blob/a921d83/src/MongoModel.ts#L220)

___

### onDelete

▸ **onDelete**(`hook`): `void`

The **onDelete**-hook runs when `delete` is called.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `hook` | `HookOnDelete`<`T`\> | A function that is called before cursor is created in MongoDB and optionally returns a function that is called after results are returned from MongoDB.  ```typescript myModel.onDelete(() => {  // This runs before  return () => {    // This runs after  } }) ``` |

#### Returns

`void`

#### Defined in

[src/MongoModel.ts:272](https://github.com/jelgblad/node-mongodb-model/blob/a921d83/src/MongoModel.ts#L272)

___

### onFind

▸ **onFind**(`hook`): `void`

The **onFind**-hook runs when `find`, `findOne` or `findById` are called.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `hook` | `HookOnFind`<`T`\> | A function that is called before cursor is created in MongoDB and optionally returns a function that is called after results are returned from MongoDB.  ```typescript myModel.onFind(() => {  // This runs before  return () => {    // This runs after  } }) ``` |

#### Returns

`void`

#### Defined in

[src/MongoModel.ts:194](https://github.com/jelgblad/node-mongodb-model/blob/a921d83/src/MongoModel.ts#L194)

___

### onUpdate

▸ **onUpdate**(`hook`): `void`

The **onUpdate**-hook runs when `update` is called.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `hook` | `HookOnUpdate`<`T`\> | A function that is called before cursor is created in MongoDB and optionally returns a function that is called after results are returned from MongoDB.  ```typescript myModel.onUpdate(() => {  // This runs before  return () => {    // This runs after  } }) ``` |

#### Returns

`void`

#### Defined in

[src/MongoModel.ts:246](https://github.com/jelgblad/node-mongodb-model/blob/a921d83/src/MongoModel.ts#L246)

___

### populate

▸ **populate**(`property`, `callback`): `void`

The **populate**-callback runs when `find`, `findOne` or `findById` are called with the specified property in the `populate`-options array.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `property` | `string` | The name of the property to populate. |
| `callback` | (`doc`: `T`) => `any` | A function that returns a value, or a Promise for a value, that will be populated on the specified property.  ```typescript myModel.populate('myParent', doc => {  return myModel.findById(doc.parent_id); }) ``` |

#### Returns

`void`

#### Defined in

[src/MongoModel.ts:297](https://github.com/jelgblad/node-mongodb-model/blob/a921d83/src/MongoModel.ts#L297)

___

## Other Methods

### collection

▸ **collection**(): `Promise`<`Collection`<`Document`\>\>

#### Returns

`Promise`<`Collection`<`Document`\>\>

#### Defined in

[src/MongoModel.ts:69](https://github.com/jelgblad/node-mongodb-model/blob/a921d83/src/MongoModel.ts#L69)

___

## Queries Methods

### create

▸ **create**(`data`): `Promise`<`InsertOneResult`<`Document`\>\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `data` | `Partial`<`T`\> |

#### Returns

`Promise`<`InsertOneResult`<`Document`\>\>

#### Defined in

[src/MongoModel.ts:395](https://github.com/jelgblad/node-mongodb-model/blob/a921d83/src/MongoModel.ts#L395)

___

### delete

▸ **delete**(`filter?`, `options?`): `Promise`<`DeleteResult`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `filter?` | `Filter`<`T`\> |
| `options?` | `FindOptions`<`T`\> |

#### Returns

`Promise`<`DeleteResult`\>

#### Defined in

[src/MongoModel.ts:444](https://github.com/jelgblad/node-mongodb-model/blob/a921d83/src/MongoModel.ts#L444)

___

### exists

▸ **exists**(`filter?`): `Promise`<`boolean`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `filter?` | `Filter`<`T`\> |

#### Returns

`Promise`<`boolean`\>

#### Defined in

[src/MongoModel.ts:312](https://github.com/jelgblad/node-mongodb-model/blob/a921d83/src/MongoModel.ts#L312)

___

### find

▸ **find**(`filter?`, `options?`, `queryOptions?`): `Promise`<`T`[]\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `filter?` | `Filter`<`T`\> |
| `options?` | `FindOptions`<`T`\> |
| `queryOptions?` | [`IQueryOptions`](../interfaces/IQueryOptions.md) |

#### Returns

`Promise`<`T`[]\>

#### Defined in

[src/MongoModel.ts:322](https://github.com/jelgblad/node-mongodb-model/blob/a921d83/src/MongoModel.ts#L322)

___

### findById

▸ **findById**(`id`, `options?`, `queryOptions?`): `Promise`<`T`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `id` | `string` |
| `options?` | `FindOptions`<`T`\> |
| `queryOptions?` | [`IQueryOptions`](../interfaces/IQueryOptions.md) |

#### Returns

`Promise`<`T`\>

#### Defined in

[src/MongoModel.ts:371](https://github.com/jelgblad/node-mongodb-model/blob/a921d83/src/MongoModel.ts#L371)

___

### findOne

▸ **findOne**(`filter?`, `options?`, `queryOptions?`): `Promise`<`T`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `filter?` | `Filter`<`T`\> |
| `options?` | `FindOptions`<`T`\> |
| `queryOptions?` | [`IQueryOptions`](../interfaces/IQueryOptions.md) |

#### Returns

`Promise`<`T`\>

#### Defined in

[src/MongoModel.ts:345](https://github.com/jelgblad/node-mongodb-model/blob/a921d83/src/MongoModel.ts#L345)

___

### update

▸ **update**(`filter`, `updateFilter`, `options?`): `Promise`<`UpdateResult`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `filter` | `Filter`<`Document`\> |
| `updateFilter` | `UpdateFilter`<`T`\> |
| `options?` | `UpdateOptions` |

#### Returns

`Promise`<`UpdateResult`\>

#### Defined in

[src/MongoModel.ts:417](https://github.com/jelgblad/node-mongodb-model/blob/a921d83/src/MongoModel.ts#L417)
