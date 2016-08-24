var $http = require('http-as-promised');

var baseUrl = 'http://localhost:9200';

//https://www.elastic.co/guide/en/elasticsearch/guide/current/_retrieving_a_document.html

$http.get(`${baseUrl}/megacorp/employee/1`).spread(function (res) {
    console.log(JSON.stringify(JSON.parse(res.body), null, '  '))
    /**
     * This should respond with the document you have indexed:
     */
    //{
    //  "_index": "megacorp",
    //  "_type": "employee",
    //  "_id": "1",
    //  "_version": 7,
    //  "found": true,
    //  "_source": {
    //    "first_name": "John",
    //    "last_name": "Smith",
    //    "age": 25,
    //    "about": "I love to go rock climbing",
    //    "interests": [
    //      "sports",
    //      "music"
    //    ]
    //  }
    //}

    //Ok, but my document is inside _source, what's that mess around it? That is
});
