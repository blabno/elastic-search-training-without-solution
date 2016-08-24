'use strict';

const _ = require('lodash');
const expect = require('chai').expect;
const util = require('../../../util');
const describeSolution = util.describeSolution;

describe('Creating a new document', () => {

  before(util.indexDropper());

  const solution1 = '/guide/01-getting-started/02-data-in-data-out/06-creating-a-new-document-01.txt';

  describeSolution(solution1, () => {
    it('should be able to index employee with id 1 into megacorp index, but only if it does not exist', () => {
      return util.executeSolution(solution1)
        .then(res => {
          expect(res.statusCode).to.equal(201);
          expect(res.body).to.have.property('_index', 'megacorp');
          expect(res.body).to.have.property('_type', 'employee');
          expect(res.body).to.have.property('_id', '1');
          expect(res.body).to.have.property('created', true);
          return util.executeSolution(solution1);
        })
        .then(res => expect(res.statusCode).to.equal(409));
    });
  });
});
