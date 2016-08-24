'use strict';

const _ = require('lodash');
const expect = require('chai').expect;
const util = require('../../../util');
const employees = require('../../../employees');
const describeSolution = util.describeSolution;

describe('Routing a document to a shard', () => {
  const solution1 = '/guide/01-getting-started/03-distributed-document-store/01-routing-a-document-to-a-shard-01.txt';
  const solution2 = '/guide/01-getting-started/03-distributed-document-store/01-routing-a-document-to-a-shard-02.txt';
  const solution3 = '/guide/01-getting-started/03-distributed-document-store/01-routing-a-document-to-a-shard-03.txt';

  before(util.indexDropper());

  before(() => {
    const payload = {
      settings: {
        index: {
          number_of_shards: 2
        }
      },
      mappings: {
        customer: {
          _routing: {
            required: true
          }
        }
      }
    };
    return util.put('/megacorp', payload);
  });

  const scenario = 'when there is a megacorp index composed of 2 shards and customers are either premium or not and premium should go into separate shard';
  describe(scenario, () => {
    describeSolution(solution1, () => {
      it('should be able to index new employee with id 1 that is premium customer', () => {
        return util.executeSolution(solution1)
          .then(res => {
            expect(res.statusCode).to.equal(201);
            return util.solutionRequest({ url: '/megacorp/customer/_search?routing=true' });
          })
          .then(res => {
            expect(res.statusCode).to.equal(200);
            expect(res.body).to.have.deep.property('hits.hits');
            expect(res.body.hits.hits).to.have.length(1);
            return util.solutionRequest({ url: '/megacorp/customer/_search?routing=false' });
          })
          .then(res => {
            expect(res.statusCode).to.equal(200);
            expect(res.body).to.have.deep.property('hits.hits');
            expect(res.body.hits.hits).to.have.length(0);
          });
      });
    });

    describeSolution(solution2, () => {
      before(() => {
        const fixture = employees('jackSmith', 'jillJones', 'kennySmith', 'kennyZachs', 'jillSmith', 'henrySmithson');
        return util.seed([
          { _routing: true, _source: fixture.jackSmith },
          { _routing: true, _source: fixture.jillJones },
          { _routing: false, _source: fixture.kennySmith },
          { _routing: false, _source: fixture.kennyZachs },
          { _routing: false, _source: fixture.jackSmith },
          { _routing: false, _source: fixture.henrySmithson }
        ], { _index: 'megacorp', _type: 'customer' });
      });

      it('should be able to fetch all premium customers', () => {
        return util.executeSolution(solution2)
          .then(res => {
            expect(res.statusCode).to.equal(200);
            expect(res.body).to.have.deep.property('hits.total', 3);
          });
      });
    });

    describeSolution(solution3, () => {
      it('should be able to fetch all non-premium customers', () => {
        return util.executeSolution(solution3)
          .then(res => {
            expect(res.statusCode).to.equal(200);
            expect(res.body).to.have.deep.property('hits.total', 4);
          });
      });
    });
  });
});
