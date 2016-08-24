'use strict';

var _ = require('lodash');

var fixture = {
    jackSmith: {first_name: 'Jack', last_name: 'Smith', age: 21, interests: ['Running', 'Music']},
    jillJones: {first_name: 'Jill', last_name: 'Jones', age: 24, bio: 'I love to go rock climbing', interests: ['Running', 'Rock climbing']},
    kennySmith: {first_name: 'Kenny', last_name: 'Smith', age: 57, bio: 'I like to collect rock albums', interests: ['Cooking', 'Singing']},
    kennyZachs: {first_name: 'Kenny', last_name: 'Zachs', age: 33, bio: 'Natural born windsurfer', interests: ['Windsurfing', 'Running', 'Climbing']},
    jillSmith: {first_name: 'Jill', last_name: 'Smith', age: 46, bio: 'Climb the hill and Rock&Roll'},
    henrySmithson: {first_name: 'Henry', last_name: 'Smithson', age: 45}
};

module.exports = function () {
    var keys = arguments.length ? arguments : _.keys(fixture);
    return _(fixture)
        .chain()
        .pick(keys)
        .cloneDeep()
        .value();
};
