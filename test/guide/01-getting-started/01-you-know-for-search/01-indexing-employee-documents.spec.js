'use strict';

const _ = require('lodash');
const expect = require('chai').expect;
const util = require('../../../util');
const describeSolution = util.describeSolution;

describe('Indexing employee documents', () => {

  before(util.indexDropper());

  const solution1 = '/guide/01-getting-started/01-you-know-for-search/01-indexing-employee-documents-01.txt';
  const solution2 = '/guide/01-getting-started/01-you-know-for-search/01-indexing-employee-documents-02.txt';
  const solution3 = '/guide/01-getting-started/01-you-know-for-search/01-indexing-employee-documents-03.txt';

  describe('when there is no megacorp index', () => {

    describeSolution(solution1, () => {
      it('you should be able to index new employee with id 1, first_name Jack, age 21', () => {
        return util.executeSolution(solution1)
          .then(res => {
            expect(res.statusCode).to.equal(201);
            expect(res.body).to.have.property('_index', 'megacorp');
            expect(res.body).to.have.property('_type', 'employee');
            expect(res.body).to.have.property('_id', '1');
            expect(res.body).to.have.property('created', true);
            return util.solutionRequest({ url: '/megacorp/employee/1' });
          })
          .then(res => {
            expect(res.body).to.have.deep.property('_source.first_name', 'Jack');
            expect(res.body).to.have.deep.property('_source.age', 21);
          });
      });
    });
    describeSolution(solution2, () => {
      it('should be able to index new employee with id 2, first_name Jill, age 20', () => {
        return util.executeSolution(solution2)
          .then(res => {
            expect(res.statusCode).to.equal(201);
            expect(res.body).to.have.property('_index', 'megacorp');
            expect(res.body).to.have.property('_type', 'employee');
            expect(res.body).to.have.property('_id', '2');
            expect(res.body).to.have.property('created', true);
            return util.solutionRequest({ url: '/megacorp/employee/2' });
          })
          .then(res => {
            expect(res.body).to.have.deep.property('_source.first_name', 'Jill');
            expect(res.body).to.have.deep.property('_source.age', 20);
          });
      });
    });
    describeSolution(solution3, () => {
      it('should be able to index new employee with random id', () => {
        return util.executeSolution(solution3)
          .then(res => {
            expect(res.statusCode).to.equal(201);
            expect(res.body).to.have.property('_index', 'megacorp');
            expect(res.body).to.have.property('_type', 'employee');
            expect(res.body).to.have.property('_id');
            expect(res.body).to.have.property('created', true);
            return util.executeSolution(solution3);
          })
          .then(res => {
            expect(res.statusCode).to.equal(201);
            expect(res.body).to.have.property('_index', 'megacorp');
            expect(res.body).to.have.property('_type', 'employee');
            expect(res.body).to.have.property('_id');
            expect(res.body).to.have.property('created', true);
          });
      });
    });
  });
});
