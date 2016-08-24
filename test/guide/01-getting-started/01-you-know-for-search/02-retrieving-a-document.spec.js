'use strict';

const _ = require('lodash');
const expect = require('chai').expect;
const util = require('../../../util');
const employees = require('../../../employees');
const describeSolution = util.describeSolution;

describe('Retrieving a document', () => {

  before(util.indexDropper());

  const solution1 = '/guide/01-getting-started/01-you-know-for-search/02-retrieving-a-document-01.txt';
  const solution2 = '/guide/01-getting-started/01-you-know-for-search/02-retrieving-a-document-02.txt';
  const solution3 = '/guide/01-getting-started/01-you-know-for-search/02-retrieving-a-document-03.txt';

  describe('when there is a megacorp index', () => {

    describe('and we have already indexed some employees', () => {

      before(() => {
        const fixture = employees('jackSmith', 'jillJones');
        return util.seed([{ _id: 1, _source: fixture.jackSmith }, { _id: 2, _source: fixture.jillJones }],
          { _index: 'megacorp', _type: 'employee' });
      });

      describeSolution(solution1, () => {
        it('you should be able to retrieve employee with id 1', () => {
          return util.executeSolution(solution1)
            .then(res => {
              expect(res.statusCode).to.equal(200);
              expect(res.body).to.have.property('_index', 'megacorp');
              expect(res.body).to.have.property('_type', 'employee');
              expect(res.body).to.have.property('_id', '1');
              expect(res.body).to.have.property('_source');
              expect(res.body).to.have.deep.property('_source.first_name', 'Jack');
            });
        });
      });

      describeSolution(solution2, () => {
        it('you should be able to check if there is employee with id 2 without fetching the actual document', () => {
          return util.executeSolution(solution2)
            .then(res => {
              expect(res.statusCode).to.equal(200);
              expect(res.body).to.be.undefined;
            });
        });
      });

      describeSolution(solution3, () => {
        it('you should be able to delete employee with id 2', () => {
          return util.executeSolution(solution3)
            .then(res => {
              expect(res.statusCode).to.equal(200);
              expect(res.body).to.have.property('_id', '2');
              expect(res.body).to.have.property('_index', 'megacorp');
              expect(res.body).to.have.property('_type', 'employee');
              expect(res.body).to.have.property('found', true);
            });
        });
      });
    });
  });
});
