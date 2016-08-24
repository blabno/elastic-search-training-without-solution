'use strict';

const _ = require('lodash');
const expect = require('chai').expect;
const util = require('../../../util');
const employees = require('../../../employees');
const describeSolution = util.describeSolution;

describe('Optimistic concurrency control', () => {

  const solution1 = '/guide/01-getting-started/02-data-in-data-out/08-optimistic-concurrency-control-01.txt';

  before(util.indexDropper());

  before(() => {
    const fixture = employees('jackSmith');
    return util.seed([
      { _id: 1, _source: fixture.jackSmith }
    ], { _index: 'megacorp', _type: 'employee' });
  });

  describeSolution(solution1, () => {
    describe('when last version number of employee 1 document from megacorp index is 1', () => {
      it('should be able to update that document only if the version has not changed', () => {
        return util.executeSolution(solution1)
          .then(res => {
            expect(res.statusCode).to.equal(200);
            expect(res.body).to.have.property('_index', 'megacorp');
            expect(res.body).to.have.property('_type', 'employee');
            expect(res.body).to.have.property('_id', '1');
            expect(res.body).to.have.property('_version', 2);
            expect(res.body).to.have.property('created', false);
            return util.executeSolution(solution1);
          })
          .then(res => expect(res.statusCode).to.equal(409));
      });
    });
  });
});
