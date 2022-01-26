[mongodb-model](../README.md) / [Exports](../modules.md) / MongoModel

# Class: MongoModel<T\>

## Type parameters

| Name | Type |
| :------ | :------ |
| `T` | `unknown` |

## Table of contents

### Constructors

- [constructor](MongoModel.md#constructor)

### Properties

- [collectionName](MongoModel.md#collectionname)
- [db](MongoModel.md#db)
- [utils](MongoModel.md#utils)

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
- [findOne](MongoModel.md#findone)
- [update](MongoModel.md#update)

## Constructors

### constructor

• **new MongoModel**<`T`\>(`db`, `collectionName`, `options?`)

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | `unknown` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `db` | () => `Promise`<`Db`\> |
| `collectionName` | `string` |
| `options?` | [`IModelOptions`](../interfaces/IModelOptions.md) |

#### Defined in

[src/MongoModel.ts:64](https://github.com/jelgblad/node-mongodb-model/blob/91514fd/src/MongoModel.ts#L64)

## Properties

### collectionName

• `Readonly` **collectionName**: `string`

#### Defined in

[src/MongoModel.ts:45](https://github.com/jelgblad/node-mongodb-model/blob/91514fd/src/MongoModel.ts#L45)

___

### db

• `Readonly` **db**: () => `Promise`<`Db`\>

#### Type declaration

▸ (): `Promise`<`Db`\>

##### Returns

`Promise`<`Db`\>

#### Defined in

[src/MongoModel.ts:44](https://github.com/jelgblad/node-mongodb-model/blob/91514fd/src/MongoModel.ts#L44)

___

### utils

• `Readonly` **utils**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `trimObject` | (`obj`: `any`) => `void` |

#### Defined in

[src/MongoModel.ts:508](https://github.com/jelgblad/node-mongodb-model/blob/91514fd/src/MongoModel.ts#L508)

## Hooks Methods

### onCreate

▸ **onCreate**(`hook`): `void`

The **onCreate**-hook runs when `create` is called.

```typescript
myModel.onCreate(() => {
 // This runs before
 return () => {
   // This runs after
 }
})
```

Hooks runs in the order they are defined.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `hook` | (`data`: `OptionalId`<`T`\>, `args`: `any`) => `MaybePromise`<`void` \| (`result`: `void` \| `InsertOneResult`<`T`\>, `err?`: `any`) => `MaybePromise`<`void`\>\> | A function that is called before cursor is created in MongoDB and optionally returns a function that is called after results are returned from MongoDB. |

#### Returns

`void`

#### Defined in

[src/MongoModel.ts:230](https://github.com/jelgblad/node-mongodb-model/blob/91514fd/src/MongoModel.ts#L230)

___

### onDelete

▸ **onDelete**(`hook`): `void`

The **onDelete**-hook runs when `delete` is called.

```typescript
myModel.onDelete(() => {
 // This runs before
 return () => {
   // This runs after
 }
})
```

Hooks runs in the order they are defined.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `hook` | (`filter`: `Filter`<`T`\>, `args`: `any`) => `MaybePromise`<`void` \| (`result`: `void` \| `DeleteResult`, `err?`: `any`) => `MaybePromise`<`void`\>\> | A function that is called before cursor is created in MongoDB and optionally returns a function that is called after results are returned from MongoDB. |

#### Returns

`void`

#### Defined in

[src/MongoModel.ts:280](https://github.com/jelgblad/node-mongodb-model/blob/91514fd/src/MongoModel.ts#L280)

___

### onFind

▸ **onFind**(`hook`): `void`

The **onFind**-hook runs when `find` or `findOne` are called.

```typescript
myModel.onFind(() => {
 // This runs before
 return () => {
   // This runs after
 }
})
```

Hooks runs in the order they are defined.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `hook` | (`filter`: `Filter`<`T`\>, `args`: `any`) => `MaybePromise`<`void` \| (`doc`: `void` \| `T`, `err?`: `any`) => `MaybePromise`<`void`\>\> | A function that is called before cursor is created in MongoDB and optionally returns a function that is called after results are returned from MongoDB. |

#### Returns

`void`

#### Defined in

[src/MongoModel.ts:205](https://github.com/jelgblad/node-mongodb-model/blob/91514fd/src/MongoModel.ts#L205)

___

### onUpdate

▸ **onUpdate**(`hook`): `void`

The **onUpdate**-hook runs when `update` is called.

```typescript
myModel.onUpdate(() => {
 // This runs before
 return () => {
   // This runs after
 }
})
```

Hooks runs in the order they are defined.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `hook` | (`filter`: `Filter`<`T`\>, `updateFilter`: `UpdateFilter`<`T`\>, `args`: `any`) => `MaybePromise`<`void` \| (`result`: `void` \| `UpdateResult`, `err?`: `any`) => `MaybePromise`<`void`\>\> | A function that is called before cursor is created in MongoDB and optionally returns a function that is called after results are returned from MongoDB. |

#### Returns

`void`

#### Defined in

[src/MongoModel.ts:255](https://github.com/jelgblad/node-mongodb-model/blob/91514fd/src/MongoModel.ts#L255)

___

### populate

▸ **populate**(`property`, `callback`): `void`

The **populate**-callback runs when `find`, `findOne` or `findById` are called with the specified property in the `populate`-options array.

```typescript
myModel.populate('myParent', doc => {
 return myModel.findById(doc.parent_id);
})
```

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `property` | `string` | The name of the property to populate. |
| `callback` | (`doc`: `T`) => `any` | A function that returns a value, or a Promise for a value, that will be populated on the specified property. |

#### Returns

`void`

#### Defined in

[src/MongoModel.ts:302](https://github.com/jelgblad/node-mongodb-model/blob/91514fd/src/MongoModel.ts#L302)

___

## Other Methods

### collection

▸ **collection**(): `Promise`<`Collection`<`T`\>\>

#### Returns

`Promise`<`Collection`<`T`\>\>

#### Defined in

[src/MongoModel.ts:75](https://github.com/jelgblad/node-mongodb-model/blob/91514fd/src/MongoModel.ts#L75)

___

## Queries Methods

### create

▸ **create**(`data`, `queryOptions?`): `Promise`<`InsertOneResult`<`T`\>\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `data` | `OptionalId`<`T`\> |
| `queryOptions?` | [`IQueryOptions`](../interfaces/IQueryOptions.md) |

#### Returns

`Promise`<`InsertOneResult`<`T`\>\>

#### Defined in

[src/MongoModel.ts:391](https://github.com/jelgblad/node-mongodb-model/blob/91514fd/src/MongoModel.ts#L391)

___

### delete

▸ **delete**(`filter?`, `options?`, `queryOptions?`): `Promise`<`DeleteResult`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `filter?` | `Filter`<`T`\> |
| `options?` | `FindOptions`<`T`\> |
| `queryOptions?` | [`IQueryOptions`](../interfaces/IQueryOptions.md) |

#### Returns

`Promise`<`DeleteResult`\>

#### Defined in

[src/MongoModel.ts:447](https://github.com/jelgblad/node-mongodb-model/blob/91514fd/src/MongoModel.ts#L447)

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

[src/MongoModel.ts:317](https://github.com/jelgblad/node-mongodb-model/blob/91514fd/src/MongoModel.ts#L317)

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

[src/MongoModel.ts:327](https://github.com/jelgblad/node-mongodb-model/blob/91514fd/src/MongoModel.ts#L327)

___

### findOne

▸ **findOne**(`filter?`, `options?`, `queryOptions?`): `Promise`<`void` \| `T`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `filter?` | `Filter`<`T`\> |
| `options?` | `FindOptions`<`T`\> |
| `queryOptions?` | [`IQueryOptions`](../interfaces/IQueryOptions.md) |

#### Returns

`Promise`<`void` \| `T`\>

#### Defined in

[src/MongoModel.ts:358](https://github.com/jelgblad/node-mongodb-model/blob/91514fd/src/MongoModel.ts#L358)

___

### update

▸ **update**(`filter`, `updateFilter`, `options?`, `queryOptions?`): `Promise`<`UpdateResult`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `filter` | `Filter`<`T`\> |
| `updateFilter` | `UpdateFilter`<`T`\> |
| `options?` | `UpdateOptions` |
| `queryOptions?` | [`IQueryOptions`](../interfaces/IQueryOptions.md) |

#### Returns

`Promise`<`UpdateResult`\>

#### Defined in

[src/MongoModel.ts:419](https://github.com/jelgblad/node-mongodb-model/blob/91514fd/src/MongoModel.ts#L419)
