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

[src/MongoModel.ts:60](https://github.com/jelgblad/node-mongodb-model/blob/512c83c/src/MongoModel.ts#L60)

## Properties

### collectionName

• `Readonly` **collectionName**: `string`

#### Defined in

[src/MongoModel.ts:45](https://github.com/jelgblad/node-mongodb-model/blob/512c83c/src/MongoModel.ts#L45)

___

### db

• `Readonly` **db**: () => `Promise`<`Db`\>

#### Type declaration

▸ (): `Promise`<`Db`\>

##### Returns

`Promise`<`Db`\>

#### Defined in

[src/MongoModel.ts:44](https://github.com/jelgblad/node-mongodb-model/blob/512c83c/src/MongoModel.ts#L44)

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

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `hook` | `HookOnCreate`<`T`\> | A function that is called before cursor is created in MongoDB and optionally returns a function that is called after results are returned from MongoDB. |

#### Returns

`void`

#### Defined in

[src/MongoModel.ts:222](https://github.com/jelgblad/node-mongodb-model/blob/512c83c/src/MongoModel.ts#L222)

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

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `hook` | `HookOnDelete`<`T`\> | A function that is called before cursor is created in MongoDB and optionally returns a function that is called after results are returned from MongoDB. |

#### Returns

`void`

#### Defined in

[src/MongoModel.ts:276](https://github.com/jelgblad/node-mongodb-model/blob/512c83c/src/MongoModel.ts#L276)

___

### onFind

▸ **onFind**(`hook`): `void`

The **onFind**-hook runs when `find`, `findOne` or `findById` are called.

```typescript
myModel.onFind(() => {
 // This runs before
 return () => {
   // This runs after
 }
})
```

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `hook` | `HookOnFind`<`T`\> | A function that is called before cursor is created in MongoDB and optionally returns a function that is called after results are returned from MongoDB. |

#### Returns

`void`

#### Defined in

[src/MongoModel.ts:195](https://github.com/jelgblad/node-mongodb-model/blob/512c83c/src/MongoModel.ts#L195)

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

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `hook` | `HookOnUpdate`<`T`\> | A function that is called before cursor is created in MongoDB and optionally returns a function that is called after results are returned from MongoDB. |

#### Returns

`void`

#### Defined in

[src/MongoModel.ts:249](https://github.com/jelgblad/node-mongodb-model/blob/512c83c/src/MongoModel.ts#L249)

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

[src/MongoModel.ts:302](https://github.com/jelgblad/node-mongodb-model/blob/512c83c/src/MongoModel.ts#L302)

___

## Other Methods

### collection

▸ **collection**(): `Promise`<`Collection`<`Document`\>\>

#### Returns

`Promise`<`Collection`<`Document`\>\>

#### Defined in

[src/MongoModel.ts:69](https://github.com/jelgblad/node-mongodb-model/blob/512c83c/src/MongoModel.ts#L69)

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

[src/MongoModel.ts:400](https://github.com/jelgblad/node-mongodb-model/blob/512c83c/src/MongoModel.ts#L400)

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

[src/MongoModel.ts:449](https://github.com/jelgblad/node-mongodb-model/blob/512c83c/src/MongoModel.ts#L449)

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

[src/MongoModel.ts:317](https://github.com/jelgblad/node-mongodb-model/blob/512c83c/src/MongoModel.ts#L317)

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

[src/MongoModel.ts:327](https://github.com/jelgblad/node-mongodb-model/blob/512c83c/src/MongoModel.ts#L327)

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

[src/MongoModel.ts:376](https://github.com/jelgblad/node-mongodb-model/blob/512c83c/src/MongoModel.ts#L376)

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

[src/MongoModel.ts:350](https://github.com/jelgblad/node-mongodb-model/blob/512c83c/src/MongoModel.ts#L350)

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

[src/MongoModel.ts:422](https://github.com/jelgblad/node-mongodb-model/blob/512c83c/src/MongoModel.ts#L422)
