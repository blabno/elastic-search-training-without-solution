'use strict';

const _ = require('lodash');
const expect = require('chai').expect;
const util = require('../../../util');
const employees = require('../../../employees');
const describeSolution = util.describeSolution;

describe('Search lite', () => {

  before(util.indexDropper('megacorp', 'othercorp'));

  const solution1 = '/guide/01-getting-started/01-you-know-for-search/03-search-lite-01.txt';
  const solution2 = '/guide/01-getting-started/01-you-know-for-search/03-search-lite-02.txt';

  describe('when there is a megacorp index', () => {

    describe('and we have already indexed some employees', () => {

      before(() => {
        const fixture = employees('jackSmith', 'jillJones', 'kennySmith', 'kennyZachs', 'jillSmith');
        return util.seed([
            fixture.jackSmith,
            fixture.jillJones,
            fixture.kennySmith,
            {
              _index: 'othercorp',
              _source: fixture.kennyZachs
            },
            {
              _type: 'customer',
              _source: fixture.jillSmith
            }],
          { _index: 'megacorp', _type: 'employee' });
      });

      describeSolution(solution1, () => {
        it('you should be able to fetch all three employees in one request', () => {
          return util.executeSolution(solution1)
            .then(res => {
              expect(res.statusCode).to.equal(200);
              expect(res.body).to.have.deep.property('hits.hits');
              expect(_(res.body.hits.hits).map('_source.last_name').uniq().sortBy().value()).to.eql(['Jones', 'Smith']);
              expect(res.body.hits.hits).to.have.length(3);
            });
        });
      });

      describeSolution(solution2, () => {
        it('you should be able to fetch employees whoose last_name is Smith', () => {
          return util.executeSolution(solution2)
            .then(res => {
              expect(res.statusCode).to.equal(200);
              expect(res.body).to.have.deep.property('hits.hits');
              expect(_(res.body.hits.hits).map('_source.last_name').uniq().value()).to.eql(['Smith']);
              expect(res.body.hits.hits).to.have.length(2);
            });
        });
      });
    });
  });
});
