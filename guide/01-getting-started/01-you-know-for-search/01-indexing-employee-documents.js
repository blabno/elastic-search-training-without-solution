var $http = require('http-as-promised');

var baseUrl = 'http://localhost:9200';

//Ok, so go ahead and hit those urls

//$http.get(`${baseUrl}`).spread(function (res) {
//    console.log(res.body);
//    /**
//     * This should respond with something like:
//     */
//    //{
//    //  "name" : "Anthropomorpho",
//    //  "cluster_name" : "elasticsearch",
//    //  "version" : {
//    //    "number" : "2.3.2",
//    //    "build_hash" : "b9e4a6acad4008027e4038f6abed7f7dba346f94",
//    //    "build_timestamp" : "2016-04-21T16:03:47Z",
//    //    "build_snapshot" : false,
//    //    "lucene_version" : "5.5.0"
//    //  },
//    //  "tagline" : "You Know, for Search"
//    //}
//    /**
//     * So you know what the version of ES and Lucene is.
//     */
//});
//
//JSON is great… for computers. Even if it’s pretty-printed, trying to find relationships in the data is tedious. Human eyes, especially when looking at an ssh terminal, need compact and aligned text. The cat API aims to meet this need.
//$http.get(`${baseUrl}/_cat`).spread(function (res) {
//    console.log(res.body);
//    /**
//     * This should respond with something like:
//     */
//    // /_cat/allocation
//    // /_cat/shards
//    // /_cat/shards/{index}
//    // /_cat/master
//    // /_cat/nodes
//    // /_cat/indices
//    // /_cat/indices/{index}
//    // /_cat/segments
//    // /_cat/segments/{index}
//    // /_cat/count
//    // /_cat/count/{index}
//    // /_cat/recovery
//    // /_cat/recovery/{index}
//    // /_cat/health
//    // /_cat/pending_tasks
//    // /_cat/aliases
//    // /_cat/aliases/{alias}
//    // /_cat/thread_pool
//    // /_cat/plugins
//    // /_cat/fielddata
//    // /_cat/fielddata/{fields}
//    // /_cat/nodeattrs
//    // /_cat/repositories
//    // /_cat/snapshots/{repository}
//    /**
//     * Nice, some mre info to discover, let's try /_cat/_indices
//     */
//});
//$http.put(`${baseUrl}/blogs`, {error: false}).then(function () {
//    $http.get(`${baseUrl}/_cat/indices?v`).spread(function (res) {
//        console.log(res.body);
//        /**
//         * This should respond with something like:
//         */
//        //health status index pri rep docs.count docs.deleted store.size pri.store.size
//        //yellow open   blogs   5   1          0            0       650b           650b
//        /**
//         * Oh, so this is the way to see what indices we've got in the system, how many docs there are and what's the size of index
//         */
//    });
//    $http.get(`${baseUrl}/_cat/indices/blogs?v`).spread(function (res) {
//        console.log(res.body);
//        /**
//         * This should respond with something like:
//         */
//        //health status index pri rep docs.count docs.deleted store.size pri.store.size
//        //yellow open   blogs   5   1          0            0       650b           650b
//        /**
//         * Oh, so this is the way to see what indices we've got in the system, how many docs there are and what's the size of index
//         */
//    });
//});

//https://www.elastic.co/guide/en/elasticsearch/guide/current/_indexing_employee_documents.html

//So now you know how to check some general info about your cluster, what indexes there are, but how do that data get in and how to query it?
//Double check what indexes you've got, can you see megacorp index? No, that's fine. Now watch how easy it is to create new index and put data into it:

//var employee = {
//    'first_name': 'John',
//    'last_name': 'Smith',
//    'age': 25,
//    'about': 'I love to go rock climbing',
//    'interests': ['sports', 'music']
//};
//$http.put(`${baseUrl}/megacorp/employee/1`, {json: employee}).spread(function (res) {
//    console.log(res.statusCode);
//    console.log(JSON.stringify(res.body, null, '  '))
////    You should get 201 status code in response and following document
////    {
////      "_index": "megacorp",
////      "_type": "employee",
////      "_id": "1",
////      "_version": 0,
////      "_shards": {
////        "total": 2,
////        "successful": 1,
////        "failed": 0
////      },
////      "created": false
////    }
////    Ok, look again at what indexes you've got now.
////    You've got new index (megacorp) with one document in it, was that easy or what?
////    Now try to execute the same put command again, can you find the difference in response?
////    The response status code should be now 200 instead of 201, cause document has not been created. Also _version should be higher than zero and "created"
////    attribute should be false.
////    Conclusion? With PUT you can create new or update existing documents.
//
//});

//Try using PUT without id
//$http.put(`${baseUrl}/megacorp/employee`, {error:false, json: {}}).spread(function (res) {
//    console.log(res.statusCode);
//    console.log(JSON.stringify(res.body, null, '  '))
//    //You will get 400 status code and following text:
//    //No handler found for uri [/megacorp/employee/] and method [PUT]
////    Conclusion? You can use PUT only if you know the id.
//});

//What if you do not know the id? POST to the rescue
//$http.post(`${baseUrl}/megacorp/employee`, {error: false, json: {}}).spread(function (res) {
//    console.log(res.statusCode);
//    console.log(JSON.stringify(res.body, null, '  '));
//    //You will get 201 status code with familiar body:
//    //{
//    //  "_index": "megacorp",
//    //  "_type": "employee",
//    //  "_id": "AVd_Lxu5WZjPZScZMpCF",
//    //  "_version": 1,
//    //  "_shards": {
//    //    "total": 2,
//    //    "successful": 1,
//    //    "failed": 0
//    //  },
//    //  "created": true
//    //}
//});
//

//See if you can use POST with id
$http.post(`${baseUrl}/megacorp/employee/123`, {error: false, json: {}}).spread(function (res) {
    console.log(res.statusCode);
    console.log(JSON.stringify(res.body, null, '  '));
    //You will get 201 status code with familiar body:
    //{
    //  "_index": "megacorp",
    //  "_type": "employee",
    //  "_id": "AVd_Lxu5WZjPZScZMpCF",
    //  "_version": 1,
    //  "_shards": {
    //    "total": 2,
    //    "successful": 1,
    //    "failed": 0
    //  },
    //  "created": true
    //}

//    How about doing it again?
    $http.post(`${baseUrl}/megacorp/employee/123`, {error: false, json: {}}).spread(function (res) {
        console.log(res.statusCode);
        console.log(JSON.stringify(res.body, null, '  '));
    //    200 and created=false
    });
});

//So why should don't we use POST always, well, that's what I do, PUT is just more compatible with HTTP philosophy.
//You can find more about indexing the document in reference: https://www.elastic.co/guide/en/elasticsearch/reference/current/docs-index_.html
