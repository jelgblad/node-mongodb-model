import 'mocha';
import { expect } from 'chai';
import * as mongodb from 'mongodb';
import { getConnection } from './database';
import { MongoModel } from '../src/MongoModel';


interface IModel {
  ref: string
  prop1?: string
  prop2?: string
  prop3?: string
  prop4?: string
  prop5?: any
}

let model: MongoModel<IModel>;

describe('MongoModel', () => {

  describe('new MongoModel()', () => {

    before(async () => {
      model = new MongoModel(getConnection, 'myCollection');
      await model.delete();
    });

    it('should create a new MongoModel', () => {
      expect(model).to.instanceOf(MongoModel);
    });

    const tmpModel = new MongoModel<{ _id: number, hello: string }>(getConnection, 'tmpCollection');

    it('should be able to change type on _id', async () => {
      const result = await tmpModel.create({ _id: 1, hello: 'world' });
      expect(result.insertedId).to.equal(1);
    });

    after(async () => {
      await tmpModel.delete();
    });
  });


  // describe('MongoModel.collection()', () => {
  //   it('should return a Collecton', async () => {
  //     const collection = await model.collection();
  //     expect(collection).instanceOf(mongodb.Collection);
  //   });
  // });


  describe('MongoModel.onCreate()', () => {

    before(async () => {
      model = new MongoModel(getConnection, 'myCollection');
      await model.delete();
    });

    before(() => {
      model.onCreate((d, o, args) => {
        d.prop1 = 'defined in pre hook';

        // Attach hookArgs to data
        d.prop5 = args;

        return result => {
          if (result) {
            (result as any).prop1 = 'defined in post hook';
          }
        };
      });
    });

    it('should mutate insertData', async () => {

      const insertData: IModel = {
        ref: 'MongoModel.onCreate()'
      };

      const result = await model.create(insertData);

      expect(insertData.prop1).to.equal('defined in pre hook');

      const doc = await model.findOne({ _id: result.insertedId });

      expect(doc && doc.prop1).to.equal('defined in pre hook');
    });

    it('should mutate result', async () => {

      const insertData: IModel = {
        ref: 'MongoModel.onCreate()'
      };

      const result = (await model.create(insertData)) as any;

      expect(result.prop1).to.equal('defined in post hook');
    });

    it('should pass queryOptions to hook', async () => {

      const insertData: IModel = {
        ref: 'MongoModel.onCreate()'
      };

      await model.create(insertData, {}, { arg1: 'value1' });

      expect(insertData.prop5).to.eql({ arg1: 'value1' });
    });

    after(async () => {
      await model.delete({
        ref: 'MongoModel.onCreate()'
      });
    });
  });


  describe('MongoModel.onFind()', () => {

    before(async () => {

      model = new MongoModel(getConnection, 'myCollection');
      await model.delete();

      model.onFind((f, o, args) => {
        f.prop1 = 'b';

        // Attach hookArgs to filter
        if (args.test) {
          f.prop5 = args.test;
        }

        return doc => {
          if (doc) {
            doc.prop1 = 'defined in post hook';
            doc.prop2 = 'b';
          }
        };
      });

      await model.create({
        ref: 'MongoModel.onFind()',
        prop1: 'a',
        prop3: 'c',
        prop4: 'd'
      });

      await model.create({
        ref: 'MongoModel.onFind()',
        prop1: 'b'
      });
    });

    it('should mutate filter', async () => {

      const filter: mongodb.Filter<IModel> = {
        ref: 'MongoModel.onFind()'
      };

      const docs = await model.find(filter);

      // console.log(filter);
      // console.log(docs);

      expect(filter.prop1).to.equal('b');
      expect(docs).length(1);
      expect(docs[0].prop2).to.equal('b');
    });

    it('should mutate documents', async () => {

      const filter: mongodb.Filter<IModel> = {
        ref: 'MongoModel.onFind()'
      };

      const docs = await model.find(filter);

      docs.forEach(doc => {
        expect(doc.prop1).to.equal('defined in post hook');
      });
    });

    it('should pass queryOptions to hook', async () => {

      const filter: mongodb.Filter<IModel> = {
        ref: 'MongoModel.onFind()',
      };

      await model.find(filter, {}, { test: { arg1: 'value1' } });

      expect(filter.prop5).to.eql({ arg1: 'value1' });
    });

    it('should be able to add multiple hooks', async () => {

      model.onFind(f => {
        // f.prop3 = 'c';

        return result => {
          (result as any).prop1 = 'result hook 1';
        };
      });

      model.onFind(f => {
        // f.prop4 = 'd';

        return result => {
          (result as any).prop2 = 'result hook 2';
        };
      });

      // model.onFind(() => {
      //   console.log('1');
      //   return () => {
      //     console.log('A');
      //   };
      // });
      // model.onFind(() => {
      //   console.log('2');
      //   return () => {
      //     console.log('B');
      //   };
      // });
      // model.onFind(async () => {

      //   console.log('3a');

      //   await new Promise(resolve => {
      //     setTimeout(() => {
      //       resolve(null);
      //     }, 500);
      //   });

      //   console.log('3b');

      //   return () => {
      //     console.log('C');
      //   };
      // });
      // model.onFind(() => {
      //   console.log('4');
      //   return async () => {
      //     console.log('Da');

      //     await new Promise(resolve => {
      //       setTimeout(() => {
      //         resolve(null);
      //       }, 500);
      //     });

      //     console.log('Db');
      //   };
      // });
      // model.onFind(() => {
      //   console.log('5');
      //   return () => {
      //     console.log('E');
      //   };
      // });
      // model.onFind(() => {
      //   console.log('6');
      //   return () => {
      //     console.log('F');
      //   };
      // });


      const filter: mongodb.Filter<IModel> = {
        ref: 'MongoModel.onFind()'
      };

      const result = await model.find(filter);

      // expect(filter.prop3).to.equal('c');
      // expect(filter.prop4).to.equal('d');
      expect(result[0].prop1).to.equal('result hook 1');
      expect(result[0].prop2).to.equal('result hook 2');
    });

    // it('should pass error to caller', async () => {

    //   model.onFind((filer, queryOptions, error) => {
    //     console.log('before');

    //     throw new Error();

    //     return () => {
    //       console.log('after');
    //     };
    //   });

    //   const result = await model.findOne({});

    //   console.log(result);
    // });


    after(async () => {
      await model.delete({
        ref: 'MongoModel.onFind()'
      });
    });
  });


  describe('MongoModel.onUpdate()', () => {

    before(async () => {

      model = new MongoModel(getConnection, 'myCollection');
      await model.delete();

      model.onUpdate((f, uf, o, args) => {
        f.prop1 = 'defined in pre hook';

        // Attach hookArgs to filter
        f.prop5 = args;

        uf.$set = {
          ...uf.$set,
          prop2: 'defined in pre hook'
        };

        return (result: any) => {
          result.prop1 = 'defined in post hook';
        };
      });

      await model.create({
        ref: 'MongoModel.onUpdate()'
      });
    });

    it('should mutate filter', async () => {

      const filter: mongodb.Filter<IModel> = {
        ref: 'MongoModel.onUpdate()'
      };

      const updateFilter: mongodb.UpdateFilter<IModel> = {
        $set: { prop2: 'updated' }
      };

      await model.update(filter, updateFilter);

      expect(filter.prop1, 'filter should be mutated').to.equal('defined in pre hook');
    });

    it('should mutate updateFilter', async () => {

      const filter: mongodb.Filter<IModel> = {
        ref: 'MongoModel.onUpdate()'
      };

      const updateFilter: mongodb.UpdateFilter<IModel> = {
        $set: { prop2: 'updated' }
      };

      await model.update(filter, updateFilter);

      expect(updateFilter.$set.prop2, 'updateFilter should be mutated').to.equal('defined in pre hook');
    });

    it('should mutate result', async () => {

      const filter: mongodb.Filter<IModel> = {
        ref: 'MongoModel.onUpdate()'
      };

      const updateFilter: mongodb.UpdateFilter<IModel> = {
        $set: { prop2: 'updated' }
      };

      const result = (await model.update(filter, updateFilter)) as any;

      expect(result.prop1).to.equal('defined in post hook');
    });

    it('should pass queryOptions to hook', async () => {

      const filter: mongodb.Filter<IModel> = {
        ref: 'MongoModel.onUpdate()'
      };

      const updateFilter: mongodb.UpdateFilter<IModel> = {
        $set: { prop2: 'updated' }
      };

      await model.update(filter, updateFilter, {}, { arg1: 'value1' });

      expect(filter.prop5).to.eql({ arg1: 'value1' });
    });

    after(async () => {
      await model.delete({
        ref: 'MongoModel.onUpdate()'
      });
    });
  });


  describe('MongoModel.onDelete()', () => {

    before(async () => {
      model = new MongoModel(getConnection, 'myCollection');
      await model.delete();

      model.onDelete((f, o, args) => {
        f.prop1 = 'defined in pre hook';

        // Attach hookArgs to filter
        f.prop5 = args;

        return (result: any) => {
          result.prop1 = 'defined in post hook';
        };
      });
    });

    it('should mutate filter', async () => {

      const filter: mongodb.Filter<IModel> = {
        ref: 'MongoModel.onDelete()'
      };

      await model.delete(filter);

      expect(filter.prop1).to.equal('defined in pre hook');
    });

    it('should mutate result', async () => {

      const filter: mongodb.Filter<IModel> = {
        ref: 'MongoModel.onDelete()'
      };

      const result = (await model.delete(filter)) as any;

      expect(result.prop1).to.equal('defined in post hook');
    });

    it('should pass queryOptions to hook', async () => {

      const filter: mongodb.Filter<IModel> = {
        ref: 'MongoModel.onDelete()'
      };

      await model.delete(filter, {}, { arg1: 'value1' });

      expect(filter.prop5).to.eql({ arg1: 'value1' });
    });
  });


  describe('MongoModel.populate()', () => {

    before(async () => {

      model = new MongoModel(getConnection, 'myCollection');
      await model.delete();

      model.populate('prop2', d => {
        d.prop1 = 'mutated';
        return 'this is prop 2';
      });

      await model.create({
        ref: 'MongoModel.populate()',
        prop1: 'this is prop 1'
      });
    });

    it('should not mutate document', async () => {

      const doc = await model.findOne({ ref: 'MongoModel.populate()' }, {}, { populate: ['prop2'] });

      expect(doc && doc.prop1).to.equal('this is prop 1');
    });

    it('should populate specified property', async () => {

      const doc1 = await model.findOne({ ref: 'MongoModel.populate()' });
      const doc2 = await model.findOne({ ref: 'MongoModel.populate()' }, {}, { populate: ['prop2'] });

      expect(doc1 && doc1.prop2).to.not.equal('this is prop 2');
      expect(doc2 && doc2.prop2).to.equal('this is prop 2');
    });

    it('should not add invalid props to document', async () => {

      const doc = await model.findOne({ ref: 'MongoModel.populate()' }, {}, { populate: ['invalidProp'] });

      expect(doc).not.haveOwnPropertyDescriptor('invalidProp');
    });

    after(async () => {
      await model.delete({
        ref: 'MongoModel.populate()'
      });
    });
  });



  describe('MongoModel.create()', () => {
    it('should be able to use other database', async () => {

      const insertData: IModel = {
        ref: 'MongoModel.create()'
      };

      await model.create({ ...insertData, prop1: 'db1' }, { dbName: 'mongodb-model-test' });
      await model.create({ ...insertData, prop1: 'db2' }, { dbName: 'mongodb-model-test_alt' });

      expect(await model.exists({ ...insertData, prop1: 'db1' }, { dbName: 'mongodb-model-test' })).to.be.true;
      expect(await model.exists({ ...insertData, prop1: 'db2' }, { dbName: 'mongodb-model-test' })).to.be.false;

      expect(await model.exists({ ...insertData, prop1: 'db1' }, { dbName: 'mongodb-model-test_alt' })).to.be.false;
      expect(await model.exists({ ...insertData, prop1: 'db2' }, { dbName: 'mongodb-model-test_alt' })).to.be.true;
    });

    after(async () => {
      await model.delete({
        ref: 'MongoModel.create()'
      }, { dbName: 'mongodb-model-test_alt' });
    });
  });



  describe('MongoModel.utils.trimObject()', () => {

    before(async () => {

      model = new MongoModel(getConnection, 'myCollection');
      await model.delete();

      model = new MongoModel(getConnection, 'trimCollection', {
        schema: {
          properties: {
            a: { bsonType: 'string' },
            b: { bsonType: 'string' },
            c: {
              bsonType: 'object',
              properties: {
                ca: { bsonType: 'string' }
              },
              additionalProperties: false
            },
            d: {
              bsonType: 'object',
              properties: {
                da: { bsonType: 'string' }
              },
              additionalProperties: true
            },
            e: {
              bsonType: 'object',
              properties: {
                ea: { bsonType: 'string' }
              }
            }
          },
          additionalProperties: false
        }
      });
    });

    it('should mutate object', async () => {
      const obj = {
        a: 'this is a',
        b: 'this is b',
        c: {
          ca: 'this is ca',
          cx: 'this is cx'
        },
        x: 'this is x'
      };

      model.utils.trimObject(obj);

      expect(obj).not.ownProperty('x');
      expect(obj.c).ownProperty('ca');
      expect(obj.c).not.ownProperty('cx');
    });

    it('should respect additionalProperties == false', async () => {
      const obj = {
        c: {
          ca: 'this is ca',
          cx: 'this is cx'
        },
        d: {
          da: 'this is da',
          dx: 'this is dx'
        },
        e: {
          ea: 'this is ea',
          ex: 'this is ex'
        },
        x: 'this is x'
      };

      model.utils.trimObject(obj);

      expect(obj.c).not.ownProperty('cx');
      expect(obj.d).ownProperty('dx');
      expect(obj.e).ownProperty('ex');
    });

    after(async () => {
      await model.delete({
        ref: 'MongoModel.utils.trimObject()'
      });
    });
  });

});
