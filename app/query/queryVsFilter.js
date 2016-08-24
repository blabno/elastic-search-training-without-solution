module.exports = function(esUrl,index) {
    return {
        searchProducts: function() {
            //user passes just a phrase, best matching items should go first
        //    boost product name *3, tags*2
        //    This should use phrase query for product name and description and terms query for tags
        //    Add filter on price range
        }
    }
};
