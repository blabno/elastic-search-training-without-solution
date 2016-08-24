'use strict';

var _ = require('lodash');
var app = require('../app/crud');
var expect = require('chai').expect;
var $http = require('http-as-promised');
var Promise = require('bluebird');

var esUrl = process.env.ELASTIC_SEARCH_URL || 'http://localhost:9200';
var index = 'training';

describe('Index', function () {

    before(function () {
        var x;
        return $http.del(`${esUrl}/training`, {error: false}).spread(function (res) {
            if (404 !== res.statusCode && 200 !== res.statusCode) {
                throw new Error(JSON.stringify(res, null, '  '))
            }
        });
    });

    describe('Create order', function () {
        var response;

        beforeEach(function () {
            var order = {
                customerName: "Jack",
                lineItems: [
                    {
                        productName: "Bananas"
                    },
                    {
                        productName: "Apples"
                    }
                ]
            };
            return app(esUrl, index).createOrder(order).spread(function (res) {
                response = res;
            });
        });
        it('should return document _id', function () {
            expect(response.body).to.have.property('_id');
        });
        it('should return document _type', function () {
            expect(response.body).to.have.property('_type', 'order');
        });
        it('should be able to fetch that document by _id', function () {
            return $http.get(`${esUrl}/training/order/${response.body._id}`, {json: true}).spread(function (res) {
                expect(res.body).to.have.deep.property('_source.customerName', 'Jack');
                expect(res.body).to.have.deep.property('_source.lineItems[0].productName', 'Bananas');
                expect(res.body).to.have.deep.property('_source.lineItems[1].productName', 'Apples');
            })
        });
    });

    describe('Update order', function () {
        var response;

        beforeEach(function () {
            var order = {
                customerName: "Jack",
                lineItems: [
                    {
                        productName: "Bananas"
                    },
                    {
                        productName: "Apples"
                    }
                ]
            };
            var appInstance = app(esUrl, index);
            return appInstance.createOrder(order).spread(function (res) {
                response = res;
                return appInstance.updateOrder(res.body._id, {customerName: 'John'});
            });
        });
        it('should be able to fetch that document by _id and get updated version', function () {
            return $http.get(`${esUrl}/training/order/${response.body._id}`, {json: true}).spread(function (res) {
                expect(res.body).to.have.deep.property('_source.customerName', 'John');
                expect(res.body).to.not.have.deep.property('_source.lineItems');
            })
        });
    });

    describe('Update order partially', function () {
        var response;

        beforeEach(function () {
            var order = {
                customerName: "Jack",
                lineItems: [
                    {
                        productName: "Bananas"
                    },
                    {
                        productName: "Apples"
                    }
                ]
            };
            var appInstance = app(esUrl, index);
            return appInstance.createOrder(order).spread(function (res) {
                response = res;
                return appInstance.updateOrderPartially(res.body._id, {customerName: 'John'});
            });
        });
        it('should be able to fetch that document by _id and get updated version', function () {
            return $http.get(`${esUrl}/training/order/${response.body._id}`, {json: true}).spread(function (res) {
                expect(res.body).to.have.deep.property('_source.customerName', 'John');
                expect(res.body).to.have.deep.property('_source.lineItems[0].productName', 'Bananas');
                expect(res.body).to.have.deep.property('_source.lineItems[1].productName', 'Apples');
            })
        });
    });

    describe('Remove order', function () {
        var response;

        beforeEach(function () {
            var order = {
                customerName: "Jack",
                lineItems: [
                    {
                        productName: "Bananas"
                    },
                    {
                        productName: "Apples"
                    }
                ]
            };
            var appInstance = app(esUrl, index);
            return appInstance.createOrder(order).spread(function (res) {
                response = res;
                return appInstance.removeOrder(res.body._id);
            });
        });
        it('should NOT be able to fetch that document by _id', function () {
            return $http.get(`${esUrl}/training/order/${response.body._id}`, {error: false}).spread(function (res) {
                expect(res.statusCode).to.equal(404);
            })
        });
    });

    describe('Search by products', function () {

        beforeEach(function () {
            var orders = [
                {
                    lineItems: [
                        {
                            productName: "Bananas"
                        },
                        {
                            productName: "Apples"
                        }
                    ]
                },
                {
                    lineItems: [
                        {
                            productName: "Bananas"
                        }
                    ]
                },
                {
                    lineItems: [
                        {
                            productName: "Apples"
                        }
                    ]
                },
                {
                    lineItems: [
                        {
                            productName: "Juice"
                        }
                    ]
                }
            ];
            var appInstance = app(esUrl, index);
            return Promise.map(orders, appInstance.createOrder);
        });
        it('should be able to fetch only orders related either to Apples or Bananas', function () {
            return app(esUrl, index).getOrdersByProducts('Apples', 'Bananas').spread(function (res) {
                expect(res.body).to.have.deep.property('hits.hits');
                expect(res.body).to.have.deep.property('hits.total');
                expect(res.body.hits.total).to.be.above(0);
                expect(res.body.hits.hits.length).to.be.above(0);
                _.forEach(res.body.hits.hits, function (order) {
                    var orderProducts = _.map(order._source.lineItems, 'productName');
                    expect(_.intersection(orderProducts, ['Apples', 'Bananas']).length).to.be.above(0);
                });

            });
        });
        it('should be able to fetch only orders related Juice', function () {
            return app(esUrl, index).getOrdersByProducts('Juice').spread(function (res) {
                expect(res.body).to.have.deep.property('hits.hits');
                expect(res.body).to.have.deep.property('hits.total');
                expect(res.body.hits.total).to.be.above(0);
                expect(res.body.hits.hits.length).to.be.above(0);
                _.forEach(res.body.hits.hits, function (order) {
                    var orderProducts = _.map(order._source.lineItems, 'productName');
                    expect(_.intersection(orderProducts, ['Juice']).length).to.be.above(0);
                });

            });
        });
    });

});
