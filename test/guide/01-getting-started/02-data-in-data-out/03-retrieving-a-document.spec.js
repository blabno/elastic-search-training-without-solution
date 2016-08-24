'use strict';

const _ = require('lodash');
const expect = require('chai').expect;
const util = require('../../../util');
const employees = require('../../../employees');
const describeSolution = util.describeSolution;

describe('Retrieving a document', () => {

  let fixture;

  const solution1 = '/guide/01-getting-started/02-data-in-data-out/03-retrieving-a-document-01.txt';
  const solution2 = '/guide/01-getting-started/02-data-in-data-out/03-retrieving-a-document-02.txt';

  before(util.indexDropper());

  before(() => {
    fixture = employees('jackSmith', 'jillJones');
    expect(_.keys(fixture.jackSmith).length).to.be.above(2);
    return util.seed([
      fixture.jillJones,
      { _id: 1, _source: fixture.jackSmith }
    ], { _index: 'megacorp', _type: 'employee' });
  });

  describeSolution(solution1, () => {
    it('should be able to retrieve employee with id 1 from megacorp index', () => {
      return util.executeSolution(solution1)
        .then(res => {
          expect(res.statusCode).to.equal(200);
          expect(res.body).to.have.property('_index', 'megacorp');
          expect(res.body).to.have.property('_type', 'employee');
          expect(res.body).to.have.property('_id', '1');
          expect(res.body).to.have.property('_source');
          expect(res.body._source).to.eql(fixture.jackSmith);
        });
    });
  });

  describeSolution(solution2, () => {
    var expectation1 = 'should be able to retrieve employee with id 1 from megacorp index and the response should contain only first_name and age';
    it(expectation1, () => {
      return util.executeSolution(solution2)
        .then(res => {
          expect(res.statusCode).to.equal(200);
          expect(res.body).to.have.property('_index', 'megacorp');
          expect(res.body).to.have.property('_type', 'employee');
          expect(res.body).to.have.property('_id', '1');
          expect(res.body).to.have.property('_source');
          expect(res.body._source).to.eql(_.pick(fixture.jackSmith, 'first_name', 'age'));
        });
    });
  });
});
