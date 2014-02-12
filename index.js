/**
 * Based on : https://github.com/component/queue
 */

var is = require( "sc-is" ),
  drainedTimeout,
  noop = function () {};

function Queue( worker, concurrency ) {
  var self = this;

  self.worker = worker;
  self.concurrency = is.a.number( concurrency ) ? concurrency : 1;
  self.pending = 0;
  self.jobs = [];
  self.errors = [];

}

Queue.prototype.drain = noop;
Queue.prototype.push = function ( data, callback ) {
  var self = this;

  callback = is.a.func( callback ) ? callback : noop;

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

  self.worker( job.data, function ( error ) {

    if ( error ) {
      self.errors.push( {
        data: job.data,
        error: error
      } );
    }
    job.callback.apply( self, arguments );
    self.pending--;
    self.run();

    clearTimeout( drainedTimeout );

    drainedTimeout = setTimeout( function () {
      if ( self.jobs.length === 0 ) {
        self.drain( self.errors.length > 0 ? self.errors : null );
        self.errors = [];
      }
    }, 10 );

  } );

};

module.exports = Queue;