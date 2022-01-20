import 'mocha';
import { expect } from 'chai';
import * as mongodb from 'mongodb';
import { getDb } from './database';
import { MongoModel } from '../src/MongoModel';

interface IModel {
  ref: string
  prop1?: string
  prop2?: string
}

let model: MongoModel<IModel>;

describe('MongoModel', () => {

  before(async () => {
    model = new MongoModel(getDb, 'myCollection');
    await model.delete();
  });


  describe('new MongoModel()', () => {
    it('should create a new MongoModel', () => {
      expect(model).to.instanceOf(MongoModel);
    });
  });


  // describe('MongoModel.collection()', () => {
  //   it('should return a Collecton', async () => {
  //     const collection = await model.collection();
  //     expect(collection).instanceOf(mongodb.Collection);
  //   });
  // });


  describe('MongoModel.onCreate()', () => {

    it('should mutate insertData', async () => {
      model.onCreate(d => {
        d.prop1 = 'defined in pre hook';
      });

      const insertData: IModel = {
        ref: 'MongoModel.onCreate()'
      };

      const result = await model.create(insertData);

      expect(insertData.prop1).to.equal('defined in pre hook');

      const doc = await model.findOne({ _id: result.insertedId });

      expect(doc && doc.prop1).to.equal('defined in pre hook');
    });

    it('should mutate result', async () => {
      model.onCreate(d => result => {
        (result as any).prop1 = 'defined in post hook';
      });

      const insertData: IModel = {
        ref: 'MongoModel.onCreate()'
      };

      const result = (await model.create(insertData)) as any;

      expect(result.prop1).to.equal('defined in post hook');
    });

    it('should pass hookArgs to hook', async () => {
      model.onCreate((d, args) => {
        // Attach hookArgs to data
        d.prop2 = args;
      });

      const insertData: IModel = {
        ref: 'MongoModel.onCreate()'
      };

      await model.create(insertData, { hookArgs: { arg1: 'value1' } });

      expect(insertData.prop2).to.eql({ arg1: 'value1' });
    });

    after(async () => {
      await model.delete({
        ref: 'MongoModel.onCreate()'
      });
    });
  });


  describe('MongoModel.onFind()', () => {

    before(async () => {
      await model.create({
        ref: 'MongoModel.onFind()',
        prop1: 'a'
      });

      await model.create({
        ref: 'MongoModel.onFind()',
        prop1: 'b'
      });
    });

    it('should mutate filter', async () => {
      model.onFind(f => {
        f.prop1 = 'b';
      });

      const filter: mongodb.Filter<IModel> = {
        ref: 'MongoModel.onFind()'
      };

      const docs = await model.find(filter);

      expect(filter.prop1).to.equal('b');
      expect(docs).length(1);
      expect(docs[0].prop1).to.equal('b');
    });

    it('should mutate documents', async () => {
      model.onFind(f => doc => {
        if (doc) {
          doc.prop1 = 'defined in post hook';
        }
      });

      const filter: mongodb.Filter<IModel> = {
        ref: 'MongoModel.onFind()'
      };

      const docs = await model.find(filter);

      docs.forEach(doc => {
        expect(doc.prop1).to.equal('defined in post hook');
      });
    });

    it('should pass hookArgs to hook', async () => {
      model.onFind((f, args) => {
        // Attach hookArgs to filter
        f.prop2 = args;
      });

      const filter: mongodb.Filter<IModel> = {
        ref: 'MongoModel.onFind()'
      };

      await model.find(filter, {}, { hookArgs: { arg1: 'value1' } });

      expect(filter.prop2).to.eql({ arg1: 'value1' });
    });

    after(async () => {
      await model.delete({
        ref: 'MongoModel.onFind()'
      });
    });
  });


  describe('MongoModel.onUpdate()', () => {

    before(async () => {
      await model.create({
        ref: 'MongoModel.onUpdate()'
      });
    });

    it('should mutate filter', async () => {
      model.onUpdate((f, uf) => {
        f.prop1 = 'defined in pre hook';
      });

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
      model.onUpdate((f, uf) => {
        uf.$set = {
          ...uf.$set,
          prop2: 'defined in pre hook'
        };
      });

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
      model.onUpdate((f, uf) => (result: any) => {
        result.prop1 = 'defined in post hook';
      });

      const filter: mongodb.Filter<IModel> = {
        ref: 'MongoModel.onUpdate()'
      };

      const updateFilter: mongodb.UpdateFilter<IModel> = {
        $set: { prop2: 'updated' }
      };

      const result = (await model.update(filter, updateFilter)) as any;

      expect(result.prop1).to.equal('defined in post hook');
    });

    it('should pass hookArgs to hook', async () => {
      model.onUpdate((f, uf, args) => {
        // Attach hookArgs to filter
        f.prop2 = args;
      });

      const filter: mongodb.Filter<IModel> = {
        ref: 'MongoModel.onUpdate()'
      };

      const updateFilter: mongodb.UpdateFilter<IModel> = {
        $set: { prop2: 'updated' }
      };

      await model.update(filter, updateFilter, {}, { hookArgs: { arg1: 'value1' } });

      expect(filter.prop2).to.eql({ arg1: 'value1' });
    });

    after(async () => {
      await model.delete({
        ref: 'MongoModel.onUpdate()'
      });
    });
  });


  describe('MongoModel.onDelete()', () => {

    it('should mutate filter', async () => {
      model.onDelete(f => {
        f.prop1 = 'defined in pre hook';
      });

      const filter: mongodb.Filter<IModel> = {
        ref: 'MongoModel.onDelete()'
      };

      await model.delete(filter);

      expect(filter.prop1).to.equal('defined in pre hook');
    });

    it('should mutate result', async () => {
      model.onDelete(f => (result: any) => {
        result.prop1 = 'defined in post hook';
      });

      const filter: mongodb.Filter<IModel> = {
        ref: 'MongoModel.onDelete()'
      };

      const result = (await model.delete(filter)) as any;

      expect(result.prop1).to.equal('defined in post hook');
    });

    it('should pass hookArgs to hook', async () => {
      model.onDelete((f, args) => {
        // Attach hookArgs to filter
        f.prop2 = args;
      });

      const filter: mongodb.Filter<IModel> = {
        ref: 'MongoModel.onDelete()'
      };

      await model.find(filter, {}, { hookArgs: { arg1: 'value1' } });

      expect(filter.prop2).to.eql({ arg1: 'value1' });
    });
  });


  describe('MongoModel.populate()', () => {

    before(async () => {

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



  describe('MongoModel.utils.trimObject()', () => {

    let trimModel: MongoModel;

    before(async () => {
      trimModel = new MongoModel(getDb, 'trimCollection', {
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

      trimModel.utils.trimObject(obj);

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

      trimModel.utils.trimObject(obj);

      expect(obj.c).not.ownProperty('cx');
      expect(obj.d).ownProperty('dx');
      expect(obj.e).ownProperty('ex');
    });

    after(async () => {
      await trimModel.delete({
        ref: 'MongoModel.utils.trimObject()'
      });
    });
  });

});
