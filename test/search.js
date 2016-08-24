'use strict';

var _ = require('lodash');
var $http = require('http-as-promised');
var expect = require('chai').expect;

var esUrl = process.env.ELASTIC_SEARCH_URL || 'http://localhost:9200';
var index = 'training';

describe.skip('search', function () {


    before(function () {
        var x;
        return $http.del(`${esUrl}/training`, {error: false}).spread(function (res) {
            if (404 !== res.statusCode && 200 !== res.statusCode) {
                throw new Error(JSON.stringify(res, null, '  '))
            }
        });
    });

    beforeEach(function () {
        var payload = _.reduce(require('./products.json'), function (acc, item) {
                acc.push(JSON.stringify({index: {_index: 'training', _type: 'product'}}));
                acc.push(JSON.stringify(item));
                return acc;
            }, []).join('\n') + '\n';
        return $http.post(`${esUrl}/_bulk?refresh=true`, {body: payload}).spread(function (res) {
            expect(res.statusCode).to.equal(200);
        })
    });

    it('should ...', function () {
        var payload = {
            query: {
                match: {
                    category: 'Laptopy'
                }
            }
        };
        return $http.post(`${esUrl}/training/product/_search`, {json: payload}).spread(function (res, body) {
            expect(res.statusCode).to.equal(200);
            expect(body).to.have.deep.property('hits.total', 100);
        });
    });

    it('should ...', function () {
        var payload = {
            query: {
                match: {
                    category: 'Sporty drużynowe'
                }
            }
        };
        return $http.post(`${esUrl}/training/product/_search`, {json: payload}).spread(function (res, body) {
            console.log(JSON.stringify(body, null, '  '))
            expect(res.statusCode).to.equal(200);
            expect(body).to.have.deep.property('hits.total', 200);
        });
    });

    it('should ...', function () {
        var payload = {
            query: {
                match: {
                    name: 'bramkarskie rękawice'
                }
            }
        };
        return $http.post(`${esUrl}/training/product/_search`, {json: payload}).spread(function (res, body) {
            console.log(JSON.stringify(body, null, '  '))
            expect(res.statusCode).to.equal(200);
            expect(body).to.have.deep.property('hits.total', 252);
        });
    });

    it('should ...', function () {
        var payload = {
            query: {
                match: {
                    name: 'RĘKAWICE BRAMKARSKIE UHLSPORT 5/7'
                }
            }
        };
        return $http.post(`${esUrl}/training/product/_search`, {json: payload}).spread(function (res, body) {
            console.log(JSON.stringify(body, null, '  '))
            expect(res.statusCode).to.equal(200);
            expect(body).to.have.deep.property('hits.total', 424);
        });
    });
});
