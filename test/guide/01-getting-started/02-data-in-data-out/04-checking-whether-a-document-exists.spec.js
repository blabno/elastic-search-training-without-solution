'use strict';

const _ = require('lodash');
const expect = require('chai').expect;
const util = require('../../../util');
const employees = require('../../../employees');
const describeSolution = util.describeSolution;

describe('Checking whether a document exists', () => {

  let fixture;

  const solution1 = '/guide/01-getting-started/02-data-in-data-out/04-checking-whether-a-document-exists-01.txt';
  const solution2 = '/guide/01-getting-started/02-data-in-data-out/04-checking-whether-a-document-exists-02.txt';

  before(util.indexDropper());

  before(() => {
    fixture = employees('jackSmith');
    expect(_.keys(fixture.jackSmith).length).to.be.above(2);
    return util.seed([
      { _id: 1, _source: fixture.jackSmith }
    ], { _index: 'megacorp', _type: 'employee' });
  });

  describeSolution(solution1, () => {
    var expectation1 = 'should be able to check if employee with id 1 from megacorp index exists without fetching entire document';
    it(expectation1, () => {
      return util.executeSolution(solution1)
        .then(res => {
          expect(res.statusCode).to.equal(200);
          expect(res).to.not.have.property('body');
        });
    });
  });

  describeSolution(solution2, () => {
    var expectation2 = 'should be able to check if employee with id 2 from megacorp index exists without fetching entire document';
    it(expectation2, () => {
      return util.executeSolution(solution2)
        .then(res => {
          expect(res.statusCode).to.equal(404);
          expect(res).to.not.have.property('body');
        });
    });
  });
});
