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

- [\_trimObjectShallow](MongoModel.md#_trimobjectshallow)
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

[src/MongoModel.ts:78](https://github.com/jelgblad/node-mongodb-model/blob/0f3ce78/src/MongoModel.ts#L78)

## Properties

### collectionName

• `Readonly` **collectionName**: `string`

#### Defined in

[src/MongoModel.ts:59](https://github.com/jelgblad/node-mongodb-model/blob/0f3ce78/src/MongoModel.ts#L59)

___

### db

• `Readonly` **db**: () => `Promise`<`Db`\>

#### Type declaration

▸ (): `Promise`<`Db`\>

##### Returns

`Promise`<`Db`\>

#### Defined in

[src/MongoModel.ts:58](https://github.com/jelgblad/node-mongodb-model/blob/0f3ce78/src/MongoModel.ts#L58)

___

### utils

• `Readonly` **utils**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `trimObject` | (`obj`: `any`) => `void` |

#### Defined in

[src/MongoModel.ts:558](https://github.com/jelgblad/node-mongodb-model/blob/0f3ce78/src/MongoModel.ts#L558)

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
| `hook` | `HookOnCreate`<`T`\> | A function that is called before cursor is created in MongoDB and optionally returns a function that is called after results are returned from MongoDB. |

#### Returns

`void`

#### Defined in

[src/MongoModel.ts:241](https://github.com/jelgblad/node-mongodb-model/blob/0f3ce78/src/MongoModel.ts#L241)

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
| `hook` | `HookOnDelete`<`T`\> | A function that is called before cursor is created in MongoDB and optionally returns a function that is called after results are returned from MongoDB. |

#### Returns

`void`

#### Defined in

[src/MongoModel.ts:285](https://github.com/jelgblad/node-mongodb-model/blob/0f3ce78/src/MongoModel.ts#L285)

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

Hooks runs in the order they are defined.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `hook` | `HookOnFind`<`T`\> | A function that is called before cursor is created in MongoDB and optionally returns a function that is called after results are returned from MongoDB. |

#### Returns

`void`

#### Defined in

[src/MongoModel.ts:219](https://github.com/jelgblad/node-mongodb-model/blob/0f3ce78/src/MongoModel.ts#L219)

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
| `hook` | `HookOnUpdate`<`T`\> | A function that is called before cursor is created in MongoDB and optionally returns a function that is called after results are returned from MongoDB. |

#### Returns

`void`

#### Defined in

[src/MongoModel.ts:263](https://github.com/jelgblad/node-mongodb-model/blob/0f3ce78/src/MongoModel.ts#L263)

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

[src/MongoModel.ts:304](https://github.com/jelgblad/node-mongodb-model/blob/0f3ce78/src/MongoModel.ts#L304)

___

## Other Methods

### \_trimObjectShallow

▸ `Private` **_trimObjectShallow**(`obj`, `schema`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `obj` | `any` |
| `schema` | [`IMongoJSONSchema`](../interfaces/IMongoJSONSchema.md) |

#### Returns

`void`

#### Defined in

[src/MongoModel.ts:571](https://github.com/jelgblad/node-mongodb-model/blob/0f3ce78/src/MongoModel.ts#L571)

___

### collection

▸ **collection**(): `Promise`<`Collection`<`T`\>\>

#### Returns

`Promise`<`Collection`<`T`\>\>

#### Defined in

[src/MongoModel.ts:89](https://github.com/jelgblad/node-mongodb-model/blob/0f3ce78/src/MongoModel.ts#L89)

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

[src/MongoModel.ts:410](https://github.com/jelgblad/node-mongodb-model/blob/0f3ce78/src/MongoModel.ts#L410)

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

[src/MongoModel.ts:486](https://github.com/jelgblad/node-mongodb-model/blob/0f3ce78/src/MongoModel.ts#L486)

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

[src/MongoModel.ts:319](https://github.com/jelgblad/node-mongodb-model/blob/0f3ce78/src/MongoModel.ts#L319)

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

[src/MongoModel.ts:329](https://github.com/jelgblad/node-mongodb-model/blob/0f3ce78/src/MongoModel.ts#L329)

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

[src/MongoModel.ts:370](https://github.com/jelgblad/node-mongodb-model/blob/0f3ce78/src/MongoModel.ts#L370)

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

[src/MongoModel.ts:448](https://github.com/jelgblad/node-mongodb-model/blob/0f3ce78/src/MongoModel.ts#L448)
