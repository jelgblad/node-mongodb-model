[mongodb-model](../README.md) / [Exports](../modules.md) / IModelOptions

# Interface: IModelOptions

## Table of contents

### Properties

- [indices](IModelOptions.md#indices)
- [schema](IModelOptions.md#schema)
- [timeseries](IModelOptions.md#timeseries)
- [validationAction](IModelOptions.md#validationaction)
- [validationLevel](IModelOptions.md#validationlevel)

## Properties

### indices

• `Optional` **indices**: [`IndexDefinition`](../modules.md#indexdefinition)[]

#### Defined in

[src/MongoModel.ts:29](https://github.com/jelgblad/node-mongodb-model/blob/5a96a15/src/MongoModel.ts#L29)

___

### schema

• `Optional` **schema**: [`IMongoJSONSchema`](IMongoJSONSchema.md)

#### Defined in

[src/MongoModel.ts:26](https://github.com/jelgblad/node-mongodb-model/blob/5a96a15/src/MongoModel.ts#L26)

___

### timeseries

• `Optional` **timeseries**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `expireAfterSeconds?` | `number` |
| `timeseries` | `TimeSeriesCollectionOptions` |

#### Defined in

[src/MongoModel.ts:30](https://github.com/jelgblad/node-mongodb-model/blob/5a96a15/src/MongoModel.ts#L30)

___

### validationAction

• `Optional` **validationAction**: ``"error"`` \| ``"warn"``

#### Defined in

[src/MongoModel.ts:27](https://github.com/jelgblad/node-mongodb-model/blob/5a96a15/src/MongoModel.ts#L27)

___

### validationLevel

• `Optional` **validationLevel**: ``"off"`` \| ``"moderate"`` \| ``"strict"``

#### Defined in

[src/MongoModel.ts:28](https://github.com/jelgblad/node-mongodb-model/blob/5a96a15/src/MongoModel.ts#L28)
