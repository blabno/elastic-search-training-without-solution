'use strict';

const _ = require('lodash');
const expect = require('chai').expect;
const util = require('../../../util');
const employees = require('../../../employees');
const describeSolution = util.describeSolution;

describe('Partial updates to documents', () => {

  const solution1 = '/guide/01-getting-started/02-data-in-data-out/09-partial-updates-to-documents-01.txt';
  const solution2 = '/guide/01-getting-started/02-data-in-data-out/09-partial-updates-to-documents-02.txt';
  const solution3 = '/guide/01-getting-started/02-data-in-data-out/09-partial-updates-to-documents-03.txt';

  let fixture;

  before(util.indexDropper());

  before(() => {
    fixture = employees('jackSmith');
    fixture.jackSmith.create_date = Date.now();
    return util.seed([
      { _id: 1, _source: fixture.jackSmith }
    ], { _index: 'megacorp', _type: 'employee' });
  });

  describeSolution(solution1, () => {
    it('should be able to update only age property of employee with id 1 from megacorp index to 18', () => {
      return util.executeSolution(solution1)
        .then(res => {
          expect(res.statusCode).to.equal(200);
          expect(res.body).to.have.property('_index', 'megacorp');
          expect(res.body).to.have.property('_type', 'employee');
          expect(res.body).to.have.property('_id', '1');
          return util.solutionRequest({ url: '/megacorp/employee/1' });
        })
        .then(res => {
          expect(res.statusCode).to.equal(200);
          expect(res.body).to.have.property('_source');
          fixture.jackSmith.age = 18;
          expect(res.body._source).to.eql(fixture.jackSmith);
        });
    });
  });

  describeSolution(solution2, () => {
    var expectation2 = 'should be able to update only age property of employee with id 1 from megacorp index by incrementing it';
    it(expectation2, () => {
      return util.executeSolution(solution2)
        .then(res => {
          expect(res.statusCode).to.equal(200);
          expect(res.body).to.have.property('_index', 'megacorp');
          expect(res.body).to.have.property('_type', 'employee');
          expect(res.body).to.have.property('_id', '1');
          return util.solutionRequest({ url: '/megacorp/employee/1' });
        })
        .then(res => {
          expect(res.statusCode).to.equal(200);
          expect(res.body).to.have.property('_source');
          fixture.jackSmith.age++;
          expect(res.body._source).to.eql(fixture.jackSmith);
          return util.executeSolution(solution2)
        })
        .then(res => {
          expect(res.statusCode).to.equal(200);
          expect(res.body).to.have.property('_index', 'megacorp');
          expect(res.body).to.have.property('_type', 'employee');
          expect(res.body).to.have.property('_id', '1');
          return util.solutionRequest({ url: '/megacorp/employee/1' });
        })
        .then(res => {
          expect(res.statusCode).to.equal(200);
          expect(res.body).to.have.property('_source');
          fixture.jackSmith.age++;
          expect(res.body._source).to.eql(fixture.jackSmith);
        });
    });
  });

  describeSolution(solution3, () => {
    var expectation3 = 'should be able to update only interest property of employee with id 1 from megacorp index by adding "Horses"';
    it(expectation3, () => {
      return util.executeSolution(solution3)
        .then(res => {
          expect(res.statusCode).to.equal(200);
          expect(res.body).to.have.property('_index', 'megacorp');
          expect(res.body).to.have.property('_type', 'employee');
          expect(res.body).to.have.property('_id', '1');
          return util.solutionRequest({ url: '/megacorp/employee/1' });
        })
        .then(res => {
          expect(res.statusCode).to.equal(200);
          expect(res.body).to.have.property('_source');
          fixture.jackSmith.interests.push('Horses');
          expect(res.body._source).to.eql(fixture.jackSmith);
          fixture.jackSmith.interests = [Date.now()];
          return util.seed([
            { _id: 1, _source: fixture.jackSmith }
          ], { _index: 'megacorp', _type: 'employee' });
        }).then(() => util.executeSolution(solution3))
        .then(res => {
          expect(res.statusCode).to.equal(200);
          expect(res.body).to.have.property('_index', 'megacorp');
          expect(res.body).to.have.property('_type', 'employee');
          expect(res.body).to.have.property('_id', '1');
          return util.solutionRequest({ url: '/megacorp/employee/1' });
        })
        .then(res => {
          expect(res.statusCode).to.equal(200);
          expect(res.body).to.have.property('_source');
          fixture.jackSmith.interests.push('Horses');
          expect(res.body._source).to.eql(fixture.jackSmith);
        });
    });
  });
});
