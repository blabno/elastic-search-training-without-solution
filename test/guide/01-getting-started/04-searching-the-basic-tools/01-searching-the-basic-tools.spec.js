'use strict';

const _ = require('lodash');
const expect = require('chai').expect;
const util = require('../../../util');
const employees = require('../../../employees');
const describeSolution = util.describeSolution;

describe('Searching, The Basic Tools', () => {
  const solution1 = '/guide/01-getting-started/04-searching-the-basic-tools/01-searching-the-basic-tools-01.txt';
  const solution2 = '/guide/01-getting-started/04-searching-the-basic-tools/01-searching-the-basic-tools-02.txt';
  const solution3 = '/guide/01-getting-started/04-searching-the-basic-tools/01-searching-the-basic-tools-03.txt';
  const solution4 = '/guide/01-getting-started/04-searching-the-basic-tools/01-searching-the-basic-tools-04.txt';
  let fixture;

  beforeEach(util.allIndicesDropper());

  beforeEach(() => {
    fixture = employees();
    return util.seed([
      { _index: 'othercorp', _type: 'address', _source: { city: 'Warsaw' } },
      { _index: 'othercorp', _type: 'employee', _source: fixture.jillJones },
      { _index: 'megacorp', _type: 'employee', _source: fixture.kennySmith },
      { _index: 'megacorp', _type: 'employee', _source: fixture.jackSmith },
      { _index: 'othercorp', _type: 'customer', _source: fixture.kennyZachs },
      { _index: 'megacorp', _type: 'customer', _source: fixture.henrySmithson },
      { _index: 'xcorp', _type: 'employee', _source: fixture.jillJones },
      { _index: 'xcorp', _type: 'product', _source: {} }
    ]);
  });

  describe('when there are documents of different types across many indices', () => {
    describeSolution(solution1, () => {
      it('should be able to find them all', function () {
        this.timeout(1000);
        return util.executeSolution(solution1)
          .then(res => {
            expect(res.statusCode).to.equal(200);
            const indices = _.chain(res.body).get('hits.hits').map('_index').uniq().sortBy().value();
            const types = _.chain(res.body).get('hits.hits').map('_type').uniq().sortBy().value();
            expect(indices).to.eql(['megacorp', 'othercorp', 'xcorp']);
            expect(types).to.eql(['address', 'customer', 'employee', 'product']);
            return util.indexDropper('xcorp')();
          })
          .then(() => util.executeSolution(solution1))
          .then(res => {
            expect(res.statusCode).to.equal(200);
            const indices = _.chain(res.body).get('hits.hits').map('_index').uniq().sortBy().value();
            const types = _.chain(res.body).get('hits.hits').map('_type').uniq().sortBy().value();
            expect(indices).to.eql(['megacorp', 'othercorp']);
            expect(types).to.eql(['address', 'customer', 'employee']);
          });
      });
    });
    describeSolution(solution2, () => {
      it('should be able to find all employees and customers from megacorp and othercorp indices', () => {
        return util.executeSolution(solution2)
          .then(res => {
            expect(res.statusCode).to.equal(200);
            const indices = _.chain(res.body).get('hits.hits').map('_index').uniq().sortBy().value();
            const types = _.chain(res.body).get('hits.hits').map('_type').uniq().sortBy().value();
            expect(indices).to.eql(['megacorp', 'othercorp']);
            expect(types).to.eql(['address', 'customer', 'employee']);
          });
      });
    });
    describeSolution(solution3, () => {
      it('should be able to find all employees and customers from all indices', () => {
        const randomIndexName = '' + Math.random();
        return util.seed([
            { _index: randomIndexName, _type: 'employee', _source: fixture.jillJones }
          ])
          .then(() => util.executeSolution(solution3))
          .then(res => {
            expect(res.statusCode).to.equal(200);
            const indices = _.chain(res.body).get('hits.hits').map('_index').uniq().sortBy().value();
            const types = _.chain(res.body).get('hits.hits').map('_type').uniq().sortBy().value();
            expect(indices).to.eql([randomIndexName, 'megacorp', 'othercorp', 'xcorp']);
            expect(types).to.eql(['customer', 'employee']);
          });
      });
    });
    describeSolution(solution4, () => {
      it(
        'should be able to find all employees and customers from all indices whose last_name is Smith and are above 21 years of age',
        () => {
          return util.executeSolution(solution4)
            .then(res => {
              expect(res.statusCode).to.equal(200);
              expect(_(res.body.hits.hits).map('_source').value()).to.eql([fixture.kennySmith]);
            });
        });
    });
  });
});
