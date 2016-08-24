'use strict';

const _ = require('lodash');
const expect = require('chai').expect;
const util = require('../../../util');
const employees = require('../../../employees');
const describeSolution = util.describeSolution;

describe('Cheaper in bulk', () => {
  const solution1 = '/guide/01-getting-started/02-data-in-data-out/11-cheaper-in-bulk-01.txt';
  let fixture;

  before(util.indexDropper('megacorp', 'othercorp'));

  before(() => {
    fixture = employees();
    return util.seed([
      { _id: 1, _source: fixture.jillJones },
      { _id: 3, _index: 'othercorp', _type: 'customer', _source: fixture.kennyZachs }
    ], { _index: 'megacorp', _type: 'employee' });
  });

  describeSolution(solution1, () => {
    const expectation1 = 'should be able to index new employee into megacorp, remove employee with id 1 from megacorp, update just last_name of customer 3 in othercorp to 72';
    it(expectation1, () => {
      return util.toSolution(solution1)
        .then(solution => {
          return util.solutionRequest(solution, true);
        })
        .then(res => {
          res.body = JSON.parse(res.body);
          expect(res.statusCode).to.equal(200);
          expect(res.body).to.have.property('errors', false);
          expect(res.body).to.have.property('items');
          expect(res.body.items).to.have.length(3);
          expect(res.body.items).to.have.deep.property('0.create');
          expect(res.body.items).to.have.deep.property('0.create.status', 201);
          expect(res.body.items).to.have.deep.property('1.delete');
          expect(res.body.items).to.have.deep.property('1.delete.status', 200);
          expect(res.body.items).to.have.deep.property('2.update');
          expect(res.body.items).to.have.deep.property('2.update.status', 200);
          return util.solutionRequest({ url: '/othercorp/customer/3' });
        }).then(res => {
          expect(res.statusCode).to.equal(200);
          expect(fixture.kennyZachs).to.not.have.property('age', 72);
          fixture.kennyZachs.age = 72;
          expect(res.body._source).to.eql(fixture.kennyZachs);
        });
    });
  });
});
