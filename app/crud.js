'use strict';

var _ = require('lodash');
var $http = require('http-as-promised');

module.exports = function (esUrl, index) {
    return {
        createOrder: function (order) {
            return $http.post(`${esUrl}/${index}/order?refresh=true`, {json: order});
        },
        updateOrder: function (id, order) {
            return $http.put(`${esUrl}/${index}/order/${id}`, {json: order});
        },
        updateOrderPartially: function (id, order) {
            return $http.post(`${esUrl}/${index}/order/${id}/_update`, {json: {doc: order}});
        },
        removeOrder: function (id) {
            return $http.del(`${esUrl}/${index}/order/${id}`, {json: true});
        },
        getOrdersByProducts: function () {
            var payload = {
                query: {
                    terms: {
                        'lineItems.productName': _(arguments).toArray().map(_.lowerCase).value()
                    }
                }
            };
            return $http.post(`${esUrl}/${index}/order/_search`, {json: payload});
        }
    }
};
