'use strict';

const _ = require('lodash');
const expect = require('chai').expect;
const util = require('../../../util');
const employees = require('../../../employees');
const describeSolution = util.describeSolution;

describe('Deleting a document', () => {

  before(util.indexDropper());

  const solution1 = '/guide/01-getting-started/02-data-in-data-out/07-deleting-a-document-01.txt';

  before(() => {
    const fixture = employees('jackSmith');
    return util.seed([
      { _id: 1, _source: fixture.jackSmith }
    ], { _index: 'megacorp', _type: 'employee' });
  });

  describeSolution(solution1, () => {
    it('should be able to delete employee with id 1 from megacorp index', () => {
      return util.executeSolution(solution1)
        .then(res => {
          expect(res.statusCode).to.equal(200);
          expect(res.body).to.have.property('_index', 'megacorp');
          expect(res.body).to.have.property('_type', 'employee');
          expect(res.body).to.have.property('_id', '1');
          expect(res.body).to.have.property('found', true);
        });
    });
  });
});
