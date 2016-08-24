'use strict';

const _ = require('lodash');
const expect = require('chai').expect;
const util = require('../../../util');
const describeSolution = util.describeSolution;

describe('What is a document?', () => {

  before(util.indexDropper());

  const solution1 = '/guide/01-getting-started/02-data-in-data-out/01-what-is-a-document-01.txt';

  describe('when there is no megacorp index', () => {

    describeSolution(solution1, () => {
      it('should be able to index new employee with id 1', () => {
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
            expect(_(res.body).chain().get('_source').values().value()).to.eql(['Jones']);
          });
      });
    });
  });
});
