var proxyquire = require('proxyquire');
var Promise = require('bluebird');
var _ = require('lodash');
var file = require('file');
var Mocha = require('mocha');
var fs = require('fs');
var path = require('path');

function SilentReporter(runner) {
}

function run(taskFile, silently) {
  if (!silently) {
    console.info('Running', taskFile);
  }
  var mocha = new Mocha({ bail: true, reporter: silently ? SilentReporter : 'spec' });
  mocha.addFile(taskFile);
  return new Promise(function (resolve, reject) {
    Object.keys(require.cache).forEach(function (file) {
      delete require.cache[file];
    });
    mocha.run(function (failures) {
      if (failures) {
        reject();
      } else {
        resolve();
      }
    });
  });
}

var taskFiles = [];
function isTaskFile(file) {
  return !!file.match(/.*\.spec\.js$/);
}
file.walkSync('test/guide', function (dirPath, dirs, files) {
  _.forEach(_.filter(files, isTaskFile), file => taskFiles.push(path.resolve(dirPath, file)));
});


function isSolutionFile(file) {
  return !!file.match(/.*\.txt$/);
}
var solutionFiles = [];
file.walkSync('guide', function (dirPath, dirs, files) {
  _.forEach(_.filter(files, isSolutionFile), file => solutionFiles.push(path.resolve(dirPath, file)));
});


function shiftTasksTillUndone() {
  function shift() {
    if (!taskFiles.length) {
      return Promise.resolve();
    }
    return run(taskFiles[0], true).then(() => {
      taskFiles.shift();
      return shift();
    }).catch(_.noop);
  }

  return shift().finally(() => {
    if (taskFiles.length) {
      console.info('Your next task:');
      printScenario(taskFiles[0]);
      console.info('\n\nModify solution files to trigger validation.');
    } else {
      console.info('Congratulations! You have solved all tasks!');
      process.exit(0);
    }
  });
}

var running = false;
function runTasksUntilAllDone() {
  if (!taskFiles.length || running) {
    return Promise.resolve();
  }
  running = true;
  return run(taskFiles[0])
    .then(shiftTasksTillUndone, _.noop)
    .finally(() => {
      running = false;
    });
}

function printScenario(taskFile) {
  var indent = 0;

  function stringIndent(indent) {
    return _.reduce(new Array(indent), acc=>acc + ' ', '');
  }

  var it = global.it;
  var describe = global.describe;
  var before = global.before;

  global.before = _.noop;
  global.describe = (txt, setup) => {
    console.info(`${stringIndent(indent)}${txt}`);
    indent += 2;
    setup();
    indent -= 2;
  };
  global.it = txt => console.info(`${stringIndent(indent)}${txt}`);

  proxyquire(taskFile, {});

  global.it = it;
  global.describe = describe;
  global.before = before;
}

shiftTasksTillUndone().then(() => {
  _.forEach(solutionFiles, solutionFile => fs.watchFile(solutionFile, _.debounce(runTasksUntilAllDone, 100)));
});

