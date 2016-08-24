'use strict';

const _ = require('lodash');
const expect = require('chai').expect;
const util = require('../../../util');
const employees = require('../../../employees');
const describeSolution = util.describeSolution;

describe('Highlighting our searches', () => {

  beforeEach(util.indexDropper());

  const solution1 = '/guide/01-getting-started/01-you-know-for-search/07-highlighting-our-searches-01.txt';

  describe('when there is a megacorp index', () => {

    describe('and we have already indexed some employees', () => {

      let fixture;

      beforeEach(() => {
        fixture = employees('jackSmith', 'jillJones', 'kennySmith', 'kennyZachs', 'jillSmith', 'henrySmithson');
      });

      describeSolution(solution1, () => {
        const expectation1 = 'you should be able to fetch employees whose bio contains phrase "rock climbing" and highlight the occurrence of phrase in the bio';
        it(expectation1, () => {
          return util.seed(_.values(fixture), { _index: 'megacorp', _type: 'employee' })
            .then(() => util.executeSolution(solution1))
            .then(res => {
              expect(res.statusCode).to.equal(200);
              expect(res.body).to.have.deep.property('hits.hits');
              expect(_(res.body.hits.hits).map('_source').sortBy('last_name', 'first_name').value())
                .to
                .eql([fixture.jillJones]);
              expect(_(res.body.hits.hits).map('highlight.bio').sortBy('last_name', 'first_name').value())
                .to
                .eql([['I love to go <em>rock</em> <em>climbing</em>']]);
            });
        });

        it(expectation1, () => {
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
                .eql([fixture.henrySmithson, fixture.kennyZachs]);
              expect(_(res.body.hits.hits)
                .sortBy('_source.last_name', '_source.first_name')
                .map('highlight.bio')
                .sortBy('last_name', 'first_name')
                .value())
                .to
                .eql([
                  ['What better than <em>rock</em> <em>climbing</em> with friends?'],
                  ['I love to go <em>rock</em> <em>climbing</em>']
                ]);
            });
        });
      });
    });
  });
});
