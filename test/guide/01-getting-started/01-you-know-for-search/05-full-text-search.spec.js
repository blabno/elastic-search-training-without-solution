'use strict';

const _ = require('lodash');
const expect = require('chai').expect;
const util = require('../../../util');
const employees = require('../../../employees');
const describeSolution = util.describeSolution;

describe('Full-text search', () => {

  beforeEach(util.indexDropper());

  const solution1 = '/guide/01-getting-started/01-you-know-for-search/05-full-text-search-01.txt';

  describe('when there is a megacorp index', () => {

    describe('and we have already indexed some employees', () => {

      let fixture;

      beforeEach(() => {
        fixture = employees('jackSmith', 'jillJones', 'kennySmith', 'kennyZachs', 'jillSmith', 'henrySmithson');
      });

      describeSolution(solution1, () => {
        it('you should be able to fetch employees whose bio has anything to do with "rock climbing"', () => {
          return util.seed(_.values(fixture), { _index: 'megacorp', _type: 'employee' })
            .then(() => util.executeSolution(solution1))
            .then(res => {
              expect(res.statusCode).to.equal(200);
              expect(res.body).to.have.deep.property('hits.hits');
              expect(_(res.body.hits.hits).map('_source').sortBy('last_name', 'first_name').value())
                .to
                .eql([fixture.jillJones, fixture.jillSmith, fixture.kennySmith]);
            });
        });

        it('you should be able to fetch employees whose bio has anything to do with "rock climbing"', () => {
          fixture.kennyZachs.bio = fixture.jillJones.bio;
          fixture.henrySmithson.bio = 'What better than rock climbing with friends?';
          delete fixture.jillJones;
          return util.seed(_.values(fixture), { _index: 'megacorp', _type: 'employee' })
            .then(() => util.executeSolution(solution1))
            .then(res => {
              expect(res.statusCode).to.equal(200);
              expect(res.body).to.have.deep.property('hits.hits');
              expect(_(res.body.hits.hits).map('_source').sortBy('last_name', 'first_name').value())
                .to
                .eql([fixture.jillSmith, fixture.kennySmith, fixture.henrySmithson, fixture.kennyZachs]);
            });
        });
      });
    });
  });
});
