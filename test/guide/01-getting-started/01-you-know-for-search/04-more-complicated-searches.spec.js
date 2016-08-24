'use strict';

const _ = require('lodash');
const expect = require('chai').expect;
const util = require('../../../util');
const employees = require('../../../employees');
const describeSolution = util.describeSolution;

describe('More complicated searches', () => {

  before(util.indexDropper());

  const solution1 = '/guide/01-getting-started/01-you-know-for-search/04-more-complicated-searches-01.txt';
  const solution2 = '/guide/01-getting-started/01-you-know-for-search/04-more-complicated-searches-02.txt';

  describe('when there is a megacorp index', () => {

    describe('and we have already indexed some employees', () => {

      before(() => {
        const fixture = employees('jackSmith', 'jillJones', 'kennySmith', 'kennyZachs', 'jillSmith', 'henrySmithson');
        return util.seed(_.values(fixture), { _index: 'megacorp', _type: 'employee' });
      });

      describeSolution(solution1, () => {
        it('you should be able to fetch employees above 30 years of age with last_name Smith', () => {
          return util.executeSolution(solution1)
            .then(res => {
              expect(res.statusCode).to.equal(200);
              expect(res.body).to.have.deep.property('hits.hits');
              expect(_(res.body.hits.hits).map('_source.last_name').uniq().value()).to.eql(['Smith']);
              expect(_(res.body.hits.hits).map('_source.age').uniq().sortBy().value()).to.eql([46, 57]);
              expect(res.body.hits.hits).to.have.length(2);
            });
        });
      });

      describeSolution(solution2, () => {
        it('you should be able to fetch employees whoose last_name is Smith or Jones and age is between 24 and 46',
          () => {
            return util.executeSolution(solution2)
              .then(res => {
                expect(res.statusCode).to.equal(200);
                expect(res.body).to.have.deep.property('hits.hits');
                expect(_(res.body.hits.hits).map('_source.last_name').uniq().sortBy().value())
                  .to
                  .eql(['Jones', 'Smith']);
                expect(_(res.body.hits.hits).map('_source.age').uniq().sortBy().value()).to.eql([24, 46]);
                expect(res.body.hits.hits).to.have.length(2);
              });
          });
      });
    });
  });
});
