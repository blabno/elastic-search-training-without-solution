module.exports = function(esUrl,index) {
    return {
        getShopDivisions: function(position) {
            //search shop divisions sorted by distance from user position so that closes shops are first
            //include only shops within 300km

            //this will require geo distance sort and geo distance filter
        }
    }
};
