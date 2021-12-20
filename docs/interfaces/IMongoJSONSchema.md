[mongodb-model](../README.md) / [Exports](../modules.md) / IMongoJSONSchema

# Interface: IMongoJSONSchema

## Hierarchy

- `Omit`<`JSONSchema7`, `OmittedTypes`\>

  ↳ **`IMongoJSONSchema`**

## Table of contents

### Properties

- [$comment](IMongoJSONSchema.md#$comment)
- [$id](IMongoJSONSchema.md#$id)
- [additionalItems](IMongoJSONSchema.md#additionalitems)
- [additionalProperties](IMongoJSONSchema.md#additionalproperties)
- [allOf](IMongoJSONSchema.md#allof)
- [anyOf](IMongoJSONSchema.md#anyof)
- [bsonType](IMongoJSONSchema.md#bsontype)
- [const](IMongoJSONSchema.md#const)
- [contains](IMongoJSONSchema.md#contains)
- [contentEncoding](IMongoJSONSchema.md#contentencoding)
- [contentMediaType](IMongoJSONSchema.md#contentmediatype)
- [dependencies](IMongoJSONSchema.md#dependencies)
- [description](IMongoJSONSchema.md#description)
- [else](IMongoJSONSchema.md#else)
- [enum](IMongoJSONSchema.md#enum)
- [examples](IMongoJSONSchema.md#examples)
- [exclusiveMaximum](IMongoJSONSchema.md#exclusivemaximum)
- [exclusiveMinimum](IMongoJSONSchema.md#exclusiveminimum)
- [if](IMongoJSONSchema.md#if)
- [items](IMongoJSONSchema.md#items)
- [maxItems](IMongoJSONSchema.md#maxitems)
- [maxLength](IMongoJSONSchema.md#maxlength)
- [maxProperties](IMongoJSONSchema.md#maxproperties)
- [maximum](IMongoJSONSchema.md#maximum)
- [minItems](IMongoJSONSchema.md#minitems)
- [minLength](IMongoJSONSchema.md#minlength)
- [minProperties](IMongoJSONSchema.md#minproperties)
- [minimum](IMongoJSONSchema.md#minimum)
- [multipleOf](IMongoJSONSchema.md#multipleof)
- [not](IMongoJSONSchema.md#not)
- [oneOf](IMongoJSONSchema.md#oneof)
- [pattern](IMongoJSONSchema.md#pattern)
- [patternProperties](IMongoJSONSchema.md#patternproperties)
- [properties](IMongoJSONSchema.md#properties)
- [propertyNames](IMongoJSONSchema.md#propertynames)
- [readOnly](IMongoJSONSchema.md#readonly)
- [required](IMongoJSONSchema.md#required)
- [then](IMongoJSONSchema.md#then)
- [title](IMongoJSONSchema.md#title)
- [type](IMongoJSONSchema.md#type)
- [uniqueItems](IMongoJSONSchema.md#uniqueitems)
- [writeOnly](IMongoJSONSchema.md#writeonly)

## Properties

### $comment

• `Optional` **$comment**: `string`

#### Inherited from

Omit.$comment

#### Defined in

node_modules/@types/json-schema/index.d.ts:622

___

### $id

• `Optional` **$id**: `string`

#### Inherited from

Omit.$id

#### Defined in

node_modules/@types/json-schema/index.d.ts:619

___

### additionalItems

• `Optional` **additionalItems**: `JSONSchema7Definition`

#### Inherited from

Omit.additionalItems

#### Defined in

node_modules/@types/json-schema/index.d.ts:651

___

### additionalProperties

• `Optional` **additionalProperties**: `JSONSchema7Definition`

#### Inherited from

Omit.additionalProperties

#### Defined in

node_modules/@types/json-schema/index.d.ts:669

___

### allOf

• `Optional` **allOf**: `JSONSchema7Definition`[]

**`see`** https://tools.ietf.org/html/draft-handrews-json-schema-validation-01#section-6.7

#### Inherited from

Omit.allOf

#### Defined in

node_modules/@types/json-schema/index.d.ts:685

___

### anyOf

• `Optional` **anyOf**: `JSONSchema7Definition`[]

#### Inherited from

Omit.anyOf

#### Defined in

node_modules/@types/json-schema/index.d.ts:686

___

### bsonType

• `Optional` **bsonType**: `BSONTypes` \| `BSONTypes`[]

#### Defined in

[src/IMongoJSONSchema.ts:39](https://github.com/jelgblad/node-mongodb-model/blob/a921d83/src/IMongoJSONSchema.ts#L39)

___

### const

• `Optional` **const**: `JSONSchema7Type`

#### Inherited from

Omit.const

#### Defined in

node_modules/@types/json-schema/index.d.ts:629

___

### contains

• `Optional` **contains**: `JSONSchema7`

#### Inherited from

Omit.contains

#### Defined in

node_modules/@types/json-schema/index.d.ts:655

___

### contentEncoding

• `Optional` **contentEncoding**: `string`

#### Inherited from

Omit.contentEncoding

#### Defined in

node_modules/@types/json-schema/index.d.ts:699

___

### contentMediaType

• `Optional` **contentMediaType**: `string`

**`see`** https://tools.ietf.org/html/draft-handrews-json-schema-validation-01#section-8

#### Inherited from

Omit.contentMediaType

#### Defined in

node_modules/@types/json-schema/index.d.ts:698

___

### dependencies

• `Optional` **dependencies**: `Object`

#### Index signature

▪ [key: `string`]: `JSONSchema7Definition` \| `string`[]

#### Inherited from

Omit.dependencies

#### Defined in

node_modules/@types/json-schema/index.d.ts:670

___

### description

• `Optional` **description**: `string`

#### Inherited from

Omit.description

#### Defined in

node_modules/@types/json-schema/index.d.ts:712

___

### else

• `Optional` **else**: `JSONSchema7Definition`

#### Inherited from

Omit.else

#### Defined in

node_modules/@types/json-schema/index.d.ts:680

___

### enum

• `Optional` **enum**: `JSONSchema7Type`[]

#### Inherited from

Omit.enum

#### Defined in

node_modules/@types/json-schema/index.d.ts:628

___

### examples

• `Optional` **examples**: `JSONSchema7Type`

#### Inherited from

Omit.examples

#### Defined in

node_modules/@types/json-schema/index.d.ts:716

___

### exclusiveMaximum

• `Optional` **exclusiveMaximum**: `number`

#### Inherited from

Omit.exclusiveMaximum

#### Defined in

node_modules/@types/json-schema/index.d.ts:636

___

### exclusiveMinimum

• `Optional` **exclusiveMinimum**: `number`

#### Inherited from

Omit.exclusiveMinimum

#### Defined in

node_modules/@types/json-schema/index.d.ts:638

___

### if

• `Optional` **if**: `JSONSchema7Definition`

**`see`** https://tools.ietf.org/html/draft-handrews-json-schema-validation-01#section-6.6

#### Inherited from

Omit.if

#### Defined in

node_modules/@types/json-schema/index.d.ts:678

___

### items

• `Optional` **items**: `IMongoJsonSchemaDefinition` \| `IMongoJsonSchemaDefinition`[]

#### Overrides

Omit.items

#### Defined in

[src/IMongoJSONSchema.ts:36](https://github.com/jelgblad/node-mongodb-model/blob/a921d83/src/IMongoJSONSchema.ts#L36)

___

### maxItems

• `Optional` **maxItems**: `number`

#### Inherited from

Omit.maxItems

#### Defined in

node_modules/@types/json-schema/index.d.ts:652

___

### maxLength

• `Optional` **maxLength**: `number`

**`see`** https://tools.ietf.org/html/draft-handrews-json-schema-validation-01#section-6.3

#### Inherited from

Omit.maxLength

#### Defined in

node_modules/@types/json-schema/index.d.ts:643

___

### maxProperties

• `Optional` **maxProperties**: `number`

**`see`** https://tools.ietf.org/html/draft-handrews-json-schema-validation-01#section-6.5

#### Inherited from

Omit.maxProperties

#### Defined in

node_modules/@types/json-schema/index.d.ts:660

___

### maximum

• `Optional` **maximum**: `number`

#### Inherited from

Omit.maximum

#### Defined in

node_modules/@types/json-schema/index.d.ts:635

___

### minItems

• `Optional` **minItems**: `number`

#### Inherited from

Omit.minItems

#### Defined in

node_modules/@types/json-schema/index.d.ts:653

___

### minLength

• `Optional` **minLength**: `number`

#### Inherited from

Omit.minLength

#### Defined in

node_modules/@types/json-schema/index.d.ts:644

___

### minProperties

• `Optional` **minProperties**: `number`

#### Inherited from

Omit.minProperties

#### Defined in

node_modules/@types/json-schema/index.d.ts:661

___

### minimum

• `Optional` **minimum**: `number`

#### Inherited from

Omit.minimum

#### Defined in

node_modules/@types/json-schema/index.d.ts:637

___

### multipleOf

• `Optional` **multipleOf**: `number`

**`see`** https://tools.ietf.org/html/draft-handrews-json-schema-validation-01#section-6.2

#### Inherited from

Omit.multipleOf

#### Defined in

node_modules/@types/json-schema/index.d.ts:634

___

### not

• `Optional` **not**: `JSONSchema7Definition`

#### Inherited from

Omit.not

#### Defined in

node_modules/@types/json-schema/index.d.ts:688

___

### oneOf

• `Optional` **oneOf**: `JSONSchema7Definition`[]

#### Inherited from

Omit.oneOf

#### Defined in

node_modules/@types/json-schema/index.d.ts:687

___

### pattern

• `Optional` **pattern**: `string`

#### Inherited from

Omit.pattern

#### Defined in

node_modules/@types/json-schema/index.d.ts:645

___

### patternProperties

• `Optional` **patternProperties**: `Object`

#### Index signature

▪ [key: `string`]: `JSONSchema7Definition`

#### Inherited from

Omit.patternProperties

#### Defined in

node_modules/@types/json-schema/index.d.ts:666

___

### properties

• `Optional` **properties**: `Object`

#### Index signature

▪ [key: `string`]: `IMongoJsonSchemaDefinition`

#### Overrides

Omit.properties

#### Defined in

[src/IMongoJSONSchema.ts:32](https://github.com/jelgblad/node-mongodb-model/blob/a921d83/src/IMongoJSONSchema.ts#L32)

___

### propertyNames

• `Optional` **propertyNames**: `JSONSchema7Definition`

#### Inherited from

Omit.propertyNames

#### Defined in

node_modules/@types/json-schema/index.d.ts:673

___

### readOnly

• `Optional` **readOnly**: `boolean`

#### Inherited from

Omit.readOnly

#### Defined in

node_modules/@types/json-schema/index.d.ts:714

___

### required

• `Optional` **required**: `string`[]

#### Inherited from

Omit.required

#### Defined in

node_modules/@types/json-schema/index.d.ts:662

___

### then

• `Optional` **then**: `JSONSchema7Definition`

#### Inherited from

Omit.then

#### Defined in

node_modules/@types/json-schema/index.d.ts:679

___

### title

• `Optional` **title**: `string`

**`see`** https://tools.ietf.org/html/draft-handrews-json-schema-validation-01#section-10

#### Inherited from

Omit.title

#### Defined in

node_modules/@types/json-schema/index.d.ts:711

___

### type

• `Optional` **type**: `JSONSchema7TypeName` \| `JSONSchema7TypeName`[]

**`see`** https://tools.ietf.org/html/draft-handrews-json-schema-validation-01#section-6.1

#### Inherited from

Omit.type

#### Defined in

node_modules/@types/json-schema/index.d.ts:627

___

### uniqueItems

• `Optional` **uniqueItems**: `boolean`

#### Inherited from

Omit.uniqueItems

#### Defined in

node_modules/@types/json-schema/index.d.ts:654

___

### writeOnly

• `Optional` **writeOnly**: `boolean`

#### Inherited from

Omit.writeOnly

#### Defined in

node_modules/@types/json-schema/index.d.ts:715
