[mongodb-model](README.md) / Exports

# mongodb-model

## Table of contents

### Classes

- [MongoModel](classes/MongoModel.md)

### Interfaces

- [IModelOptions](interfaces/IModelOptions.md)
- [IMongoJSONSchema](interfaces/IMongoJSONSchema.md)

### Type aliases

- [IQueryOptions](modules.md#iqueryoptions)
- [IndexDefinition](modules.md#indexdefinition)

## Type aliases

### IQueryOptions

Ƭ **IQueryOptions**: `Object`

#### Index signature

▪ [key: `string`]: `unknown`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `populate?` | `string`[] |

#### Defined in

[src/MongoModel.ts:19](https://github.com/jelgblad/node-mongodb-model/blob/ba847a7/src/MongoModel.ts#L19)

___

### IndexDefinition

Ƭ **IndexDefinition**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `indexSpec` | `IndexSpecification` |
| `options?` | `CreateIndexesOptions` |

#### Defined in

[src/MongoModel.ts:43](https://github.com/jelgblad/node-mongodb-model/blob/ba847a7/src/MongoModel.ts#L43)
