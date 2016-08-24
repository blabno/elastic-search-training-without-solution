'use strict';

var _ = require('lodash');
var fs = require('fs');
var $http = require('http-as-promised');
var Promise = require('bluebird');

var esUrl = process.env.ELASTIC_SEARCH_URL || 'http://localhost:9200';

function describeSolution(solutionPath, setup) {
  describe(`with solution from file ${solutionPath}`, setup);
}

function allIndicesDropper() {
  return function () {
    return $http.get(`${esUrl}/_cat/indices?format=json`, { json: true }).spread(function (res) {
      return Promise.map(res.body, function (row) {
        return $http.del(`${esUrl}/${row.index}?refresh=true`);
      });
    });
  }
}

function indexDropper() {
    var indexes = _.toArray(arguments);
    if (!indexes.length) {
        indexes.push('megacorp');
    }
    return function () {
        return Promise.map(indexes, function (indexName) {
            return $http.del(`${esUrl}/${indexName}?refresh=true`, {error: false}).spread(function (res) {
                if (404 !== res.statusCode && 200 !== res.statusCode) {
                    throw new Error(JSON.stringify(res, null, '  '))
                }
            });
        });
    }
}

function put(path, payload) {
    return $http.put(`${esUrl}${path}`, {json: payload});
}

function seed(dataset, options) {
    dataset = _.reduce(dataset, function (acc, item) {
            var itemDescription = item._source ? item : {};
            var itemSource = item._source ? item._source : item;
            acc.push(JSON.stringify({index: _.extend({}, options, _.omit(itemDescription, '_source'))}));
            acc.push(JSON.stringify(itemSource));
            return acc;
        }, []).join('\n') + '\n';
    return $http.post(`${esUrl}/_bulk?refresh=true`, {body: dataset})
}

function solutionRequest(solution, textBody) {
    var options = {resolve: 'response', error: false};
    if (textBody) {
        options.body = solution.payload
    } else {
        options.json = JSON.parse(solution.payload || true);
    }
    return $http[solution.method || 'get'](`${esUrl}${solution.url}`, options).then(function (result)
    {
        return $http.post(`${esUrl}/_refresh`).then(function ()
        {
            return result;
        });
    });
}

function toSolution(txtFile) {
    return Promise.promisify(fs.readFile)(__dirname + '/..' + txtFile).then(function (result) {
        result = result.toString().split('\n');
        var solution = {};
        if (0 === result[0].indexOf('GET')) {
            solution.url = result[0].substring(3).trim();
        } else if (0 === result[0].indexOf('PUT')) {
            solution.url = result[0].substring(3).trim();
            solution.method = 'put';
        } else if (0 === result[0].indexOf('POST')) {
            solution.url = result[0].substring(4).trim();
            solution.method = 'post';
        } else if (0 === result[0].indexOf('HEAD')) {
            solution.url = result[0].substring(4).trim();
            solution.method = 'head';
        } else if (0 === result[0].indexOf('DELETE')) {
            solution.url = result[0].substring(6).trim();
            solution.method = 'del';
        } else {
            throw new Error('Unsupported HTTP method: ' + result[0]);
        }
        result.shift();
        solution.payload = result.join('\n');
        if (!solution.payload.length) {
            delete solution.payload;
        }
        return solution
    });
}

function executeSolution(solutionPath) {
    return toSolution(solutionPath)
      .then(solutionRequest);
}

module.exports = {
    describeSolution: describeSolution,
    allIndicesDropper: allIndicesDropper,
    indexDropper: indexDropper,
    executeSolution: executeSolution,
    seed: seed,
    solutionRequest: solutionRequest,
    toSolution: toSolution,
    put: put
};
