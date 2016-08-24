The main purpose of ElasticSearch is search, not storage.
Usually the data is stored somewhere else, i.e. in relational database. Then some mechanism takes subset of that data, usually denormalizes it for specific 
searches and indexes it in ElasticSearch.

Under the hood ElasticSearch uses Lucene (Java based full-text search engine).

Ok, so how easy it is to put document into ElasticSearch?

    curl -XPOST -H 'Content-type: application/json' localhost:9200/training/product -d '{"name":"Apples"}'
    curl -XPOST -H 'Content-type: application/json' localhost:9200/training2/product -d '{"name":"Oranges"}'
    curl -XPOST -H 'Content-type: application/json' localhost:9200/training/user -d '{"login":"max", "createDate": "2016-09-10"}'
    curl -XPUT -H 'Content-type: application/json' localhost:9200/training/password/123 -d '{"value":"bh123="}'
    
    
>If our data doesn’t have a natural ID, we can let Elasticsearch autogenerate one for us. 
>The structure of the request changes: instead of using the PUT verb (“store this document at this URL”), 
>we use the POST verb (“store this document under this URL”).

Ok, nice, so can I have the same _id for documents of different types?

    curl -XPUT -H 'Content-type: application/json' localhost:9200/training/password/123 -d '{"value":"bh123="}'
    curl -XPUT -H 'Content-type: application/json' localhost:9200/training/user/123 -d '{"nickname":"willy"}'
    
    curl 'localhost:9200/_search?pretty&q=_id:123'
    curl 'localhost:9200/_search?pretty' -d '{"query":{"term":{"_uid":"user#123"}}}'

https://www.elastic.co/guide/en/elasticsearch/guide/current/data-in-data-out.html

https://www.elastic.co/guide/en/elasticsearch/guide/current/inverted-index.html

The document in ES is just a set of fields. So we can have SQL tables `order` and `order_line_item` and to speed things up we could index that
into single document:

    {
        customerName: "string",
        lineItems: [
            {
                productName: "string"            
            }        
        ]
    }
    
If we would have only one order with 2 items that would be indexed as:

    {
        "_id": "123",
        "_uid": "order#123"
        "customerName": "jack",
        "lineItems.productName": [ "apples", "bananas" ]
    }
    
And that under the hood would look like this:
 
Inverted index "lineItems.productName":
 "apple" -> "123"
 "banana" -> "123"

Inverted index "customerName"
 "jack" -> "123"

Not that words have been analyzed (tokenized, lowercased and stop words have been removed).


https://www.elastic.co/guide/en/elasticsearch/reference/2.3/mapping-uid-field.html

##CRUD
 
Let's add some documents to ElasticSearch. ElasticSearch exposes REST API to access it's functionality.

    curl -XPOST -H 'Content-type: application/json' localhost:9200/training/product -d '{"name":"Apples"}'
    curl -XPOST -H 'Content-type: application/json' localhost:9200/training/product -d '{"name":"Bananas"}'
    curl -XPOST -H 'Content-type: application/json' localhost:9200/training/order -d '{"customerName":"Jack", "lineItems":[{productName:"Apples"},{productName:"Bananas"}]}'

Now we can search those documents:

    curl localhost:9200/training/_search
    curl localhost:9200/training/product/_search
    curl localhost:9200/training/order/_search

As you can see we can search across different document types, as well as specific type.

You can also get document by id:

    curl localhost:9200/training/product/some-id
    
If you want to store document under specific id:

    curl -XPOST -H 'Content-type: application/json' localhost:9200/training/product/your-id -d '{"name":"Apples"}'

It is also possible to do partial document update

    curl -XPOST -H 'Content-type: application/json' localhost:9200/training/order/your-id/_update -d '{"doc":{"customerName":"Nick"}}'

Keep in mind that it is not possible to add item to an array, i.e. into `lineItems`. You would have to pass the entire array.

In order to delete a document:

    curl -XDELETE localhost:9200/training/product/some-id

It is possible to do deleteByQuery, but it requires installation of additional plugin. That plugin used to be part of core, but for some reason (probably it was raising various issues) it has been removed from core.

It is also possible to modify multiple documents using bulk updates

TODO add example of bulk update.

ElasticSearch handles nicely bulks of 5k documents, although this number is heavily dependant on machine and configuration.

ElasticSearch is near-realtime. So if you try to fetch document right after you save or modify it, you will get 404 or an old version.
ES needs to refresh index, which usually takes ~1 second. You can pass `refresh` param to request that modifies data and it will wait until the index is refreshed.

TODO show example how ES works with and without "refresh" param


##Search

ElasticSearch uses concept of query and filter. Query is used to match and score documents, while filter is used just to match, without scoring. 

https://www.elastic.co/guide/en/elasticsearch/guide/current/_queries_and_filters.html

TODO show example of match query and term filter

Different search types require different ways of indexing data. ES uses mapping to decide how to index the data.
You can map document fields manually or let ES do it automatically.

Automatic mapping is nice for starting your adventure with ES, but it will run you in trouble, sooner or later. Consider this example:

    curl -XPOST -H 'Content-type: application/json' localhost:9200/training/product -d '{"price":100}'
    curl -XPOST -H 'Content-type: application/json' localhost:9200/training/product -d '{"price":99.99}'

On the first request ES will check if it has mapping for `price` field. If not it will try to guess the type. 
`Long` will be picked. Now on next request ES will try to cast value to long, so the searchable value will be 99.

Try this search:

```
    curl -XPOST -H 'Content-type: application/json' 'localhost:9200/training/product/_search?pretty' -d '{"query": {"range": {"price": {"gt": "99","lt": "100"}}}}'
```

Normally you would expect that it should return product with price 99.99, but since it was cast to 99 then it simply does not match the criteria.

**Conclusion: what you see in `_source` is not necessarily what you have indexed**

TODO Show how mapping looks like.

You might think that if you define field mappings per document type then in one type you can map "name" to "string" and in another type to "not_analyzed". 
Well, that is not true. ES requires to have fields of the same name to be mapped exactly the same within the same index.

https://www.elastic.co/guide/en/elasticsearch/guide/current/mapping-intro.html
https://www.elastic.co/guide/en/elasticsearch/guide/current/mapping.html

TODO showcase problem of 2 types with different mapping for same field name.

 
```
curl -XPUT localhost:9200/synonyms -d
'{
  "settings": {
    "analysis": {
      "filter": {
        "technologies_synonyms_filter": {
          "type": "synonym",
          "synonyms": [
            "mongo,mongodb => mongo",
            "angular,angularjs => angular",
            "javaee,java ee, java enterprise, java enterprise edition => javaee"
          ]
        }
      },
      "analyzer": {
        "technologies_synonyms": {
          "tokenizer": "standard",
          "filter": [
            "lowercase",
            "technologies_synonyms_filter"
          ]
        }
      }
    }
  },
  "mappings": {
    "task": {
      "dynamic":false,
      "properties": {
        "tags": {
          "type": "string",
          "analyzer": "technologies_synonyms"
        }
      }
    }
  }
}'
```
Now add document with MongoDB tag:
```
curl -XPOST localhost:9200/synonyms/task -d '{"tags":["MongoDB","AngularJS"]}'
```
And now let's search:
```
curl localhost:9200/synonyms/_search\?q=tags:mongo
curl localhost:9200/synonyms/_search\?q=tags:mongodb
```
Both should return the same results.

More details on how to pick proper analyzer or create your own: https://www.elastic.co/guide/en/elasticsearch/reference/current/analysis.html


Sorting: https://www.elastic.co/guide/en/elasticsearch/guide/current/_sorting.html#_sorting_on_multivalue_fields
