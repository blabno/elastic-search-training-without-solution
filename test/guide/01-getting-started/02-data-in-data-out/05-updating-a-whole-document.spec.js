'use strict';

const _ = require('lodash');
const expect = require('chai').expect;
const util = require('../../../util');
const employees = require('../../../employees');
const describeSolution = util.describeSolution;

describe('Updating a whole document', () => {

  let fixture;

  const solution1 = '/guide/01-getting-started/02-data-in-data-out/05-updating-a-whole-document-01.txt';

  before(util.indexDropper());

  before(() => {
    fixture = employees('jackSmith');
    return util.seed([
      { _id: 1, _source: fixture.jackSmith }
    ], { _index: 'megacorp', _type: 'employee' });
  });

  describeSolution(solution1, () => {
    var expectation1 = 'should be able to completely overwrite employee with id 1 from megacorp index, after update the document should have only first_name and it should be set to Don';
    it(expectation1, () => {
      return util.executeSolution(solution1)
        .then(res => {
          expect(res.statusCode).to.equal(200);
          expect(res.body).to.have.property('_index', 'megacorp');
          expect(res.body).to.have.property('_type', 'employee');
          expect(res.body).to.have.property('_id', '1');
          expect(res.body).to.have.property('created', false);
          return util.solutionRequest({ url: '/megacorp/employee/1' });
        })
        .then(res => {
          expect(res.statusCode).to.equal(200);
          expect(res.body).to.have.property('_source');
          expect(res.body._source).to.eql({ 'first_name': 'Don' });
        });
    });
  });
});
