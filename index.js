/**
 * Based on : https://github.com/component/queue
 */

var type = require( "type-component" ),
  drainedTimeout,
  noop = function () {};

function Queue( worker, concurrency ) {
  var self = this;

  self.worker = worker;
  self.concurrency = type( concurrency ) === "number" ? concurrency : 1;
  self.pending = 0;
  self.jobs = [];

}

Queue.prototype.drain = noop;

Queue.prototype.push = function ( data, callback ) {
  var self = this;

  callback = type( callback ) === "function" ? callback : noop;

  self.jobs.push( {
    data: data,
    callback: callback
  } );

  setTimeout( self.run.bind( self ), 0 );
};

Queue.prototype.run = function () {
  var self = this;

  while ( self.pending < self.concurrency ) {
    var job = self.jobs.shift();
    if ( !job ) {
      break;
    }
    self.exec( job );
  }
};

Queue.prototype.exec = function ( job ) {
  var self = this;

  self.pending++;

  self.worker( job.data, function () {

    job.callback.apply( self, arguments );
    self.pending--;
    self.run();

    clearTimeout( drainedTimeout );

    drainedTimeout = setTimeout( function () {
      if ( self.jobs.length === 0 ) {
        self.drain();
      }
    }, 10 );

  } );

};

module.exports = Queue;