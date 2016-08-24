module.exports = function (esUrl, index) {
    return {
        getShopCountInDistanceRangesFromUser: function (position) {
            //aggregate shops by distance from user, buckets should be ranges of 0-1km, 1km-10km, 10km-50km
        }
    }
};
