import { JSONSchema7 } from 'json-schema'

// https://docs.mongodb.com/manual/reference/operator/query/jsonSchema/#omissions
type OmittedTypes = '$ref' | '$schema' | 'default' | 'definitions' | 'format' | 'id'

type BSONTypes = 'double'
  | 'string'
  | 'object'
  | 'array'
  | 'binData'
  | 'undefined'           // Deprecated.
  | 'objectId'
  | 'bool'
  | 'date'
  | 'null'
  | 'regex'
  | 'dbPointer'           // Deprecated.
  | 'javascript'
  | 'symbol'              // Deprecated.
  | 'javascriptWithScope' // Deprecated in MongoDB 4.4.
  | 'int'
  | 'timestamp'
  | 'long'
  | 'decimal'             // New in version 3.4.
  | 'minKey'
  | 'maxKey'

type IMongoJsonSchemaDefinition = IMongoJSONSchema | boolean

export interface IMongoJSONSchema extends Omit<JSONSchema7, OmittedTypes> {

  properties?: {
    [key: string]: IMongoJsonSchemaDefinition
  } | undefined

  items?: IMongoJsonSchemaDefinition | IMongoJsonSchemaDefinition[] | undefined

  // https://docs.mongodb.com/manual/reference/operator/query/jsonSchema/#extensions
  bsonType?: BSONTypes | BSONTypes[]
}