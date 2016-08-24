'use strict';

const _ = require('lodash');
const expect = require('chai').expect;
const util = require('../../../util');
const employees = require('../../../employees');
const describeSolution = util.describeSolution;

describe('Retrieving multiple documents', () => {
  const solution1 = '/guide/01-getting-started/02-data-in-data-out/10-retrieving-multiple-documents-01.txt';
  let fixture;

  before(util.indexDropper('megacorp', 'othercorp'));

  before(() => {
    fixture = employees();
    return util.seed([
      { _id: 1, _source: fixture.jackSmith },
      { _id: 2, _source: fixture.jillJones },
      { _id: 1, _type: 'customer', _source: fixture.kennySmith },
      { _id: 1, _index: 'othercorp', _source: fixture.kennyZachs }
    ], { _index: 'megacorp', _type: 'employee' });
  });

  describeSolution(solution1, () => {
    const expectation1 = 'should be able to fetch employees with id 1 from megacorp index and with id 1 from othercorp index, the latter should contain only age and last_name in _source';
    it(expectation1, () => {
      return util.executeSolution(solution1)
        .then(res => {
          expect(res.statusCode).to.equal(200);
          expect(res.body).to.have.property('docs');
          expect(res.body.docs).to.have.length(2);
          expect(res.body.docs).to.have.deep.property('0._source');
          expect(_.get(res.body, 'docs.0._source')).to.eql(fixture.jackSmith);
          expect(res.body.docs).to.have.deep.property('1._source');
          expect(_.get(res.body, 'docs.1._source')).to.eql(_.pick(fixture.kennyZachs, 'last_name', 'age'));
        });
    });
  });
});
