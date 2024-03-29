import { Db } from 'mongodb';
import { MongoClient } from 'mongodb';
// import mongodb = require('mongo-mock');
// const MongoClient = mongodb.MongoClient;

const MONGODB_CONNECTION = 'mongodb://host.docker.internal/mongodb-model-test';

if (!MONGODB_CONNECTION) {
  throw new Error('Environment variable "MONGODB_CONNECTION" is invalid or missing');
}

let connection: any = null;

export const getConnection = async (): Promise<MongoClient> => {

  if (!connection) {
    connection = await MongoClient.connect(MONGODB_CONNECTION);
  }

  return connection;
};
