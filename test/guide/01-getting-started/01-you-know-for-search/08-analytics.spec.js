'use strict';

const _ = require('lodash');
const expect = require('chai').expect;
const util = require('../../../util');
const employees = require('../../../employees');
const describeSolution = util.describeSolution;

describe('Analytics', () => {

  before(util.indexDropper());

  const solution1 = '/guide/01-getting-started/01-you-know-for-search/08-analytics-01.txt';
  const solution2 = '/guide/01-getting-started/01-you-know-for-search/08-analytics-02.txt';
  const solution3 = '/guide/01-getting-started/01-you-know-for-search/08-analytics-03.txt';

  describe('when there is a megacorp index', () => {

    describe('and we have already indexed some employees', () => {

      let fixture;

      before(() => {
        fixture = employees('jackSmith', 'jillJones', 'kennySmith', 'kennyZachs', 'jillSmith', 'henrySmithson');
      });

      describeSolution(solution1, () => {
        it('you should be able to fetch all employees interests (aggs names: all_interests)', () => {
          return util.seed(_.values(fixture), { _index: 'megacorp', _type: 'employee' })
            .then(() => util.executeSolution(solution1))
            .then(res => {
              expect(res.statusCode).to.equal(200);
              expect(res.body).to.have.deep.property('aggregations.all_interests.buckets');
              expect(_(res.body.aggregations.all_interests.buckets).map('key').sortBy().value())
                .to
                .eql(['climbing',
                      'cooking',
                      'music',
                      'rock',
                      'running',
                      'singing',
                      'windsurfing']);
            });
        });
      });
      describeSolution(solution2, () => {
        it('you should be able to fetch all interests of Smith employees (aggs names: all_interests)', () => {
          return util.seed(_.values(fixture), { _index: 'megacorp', _type: 'employee' })
            .then(() => util.executeSolution(solution2))
            .then(res => {
              expect(res.statusCode).to.equal(200);
              expect(res.body).to.have.deep.property('aggregations.all_interests.buckets');
              expect(_(res.body.aggregations.all_interests.buckets).map('key').sortBy().value())
                .to
                .eql(['cooking',
                      'music',
                      'running',
                      'singing']);
            });
        });
      });

      describeSolution(solution3, () => {
        it(
          'you should be able to fetch all employees interests and for each tell what is average age of people who are interested in that field (aggs names: all_interests, avg_age)',
          () => {
            return util.seed(_.values(fixture), { _index: 'megacorp', _type: 'employee' })
              .then(() => util.executeSolution(solution3))
              .then(res => {
                expect(res.statusCode).to.equal(200);
                expect(res.body).to.have.deep.property('aggregations.all_interests.buckets');
                expect(_(res.body.aggregations.all_interests.buckets).map(item => {
                  return item.key + ':' + item.avg_age.value;
                }).sortBy().value())
                  .to
                  .eql(['climbing:28.5',
                        'cooking:57',
                        'music:21',
                        'rock:24',
                        'running:26',
                        'singing:57',
                        'windsurfing:33']);
              });
          });
      });
    });
  });
});
