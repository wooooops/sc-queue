var should = require( "should" ),
  Queue = require( ".." );

describe( "queue", function () {

  var testObjects = [ {
    name: "David"
  }, {
    name: "Leonie"
  }, {
    name: "Max"
  } ];

  it( "should run tasks in a queue and call the drain callback when the queue is empty", function ( done ) {

    var q = new Queue( function ( data, callback ) {

      setTimeout( function () {

        callback();

      }, 10 );

    }, 4 );

    q.drain = done;

    testObjects.forEach( function ( obj ) {

      q.push( obj );

    } );

    q.push( {
      name: "Daniel"
    } );

    q.push( {
      name: "Andrew"
    } );

    setTimeout( function () {
      q.push( {
        name: "Chris"
      } );
    }, 20 );

  } );

  it( "should run a queue with at least one erroneous task which can be identified in the drain callback", function ( done ) {

    var q = new Queue( function ( data, callback ) {

      var error = data.hasOwnProperty( "name" ) ? null : new Error( "A name is missing" );
      callback( error );

    } );

    q.drain = function ( errors ) {
      errors.should.have.a.lengthOf( 2 );
      done();
    };

    testObjects.forEach( function ( obj ) {

      q.push( obj );

    } );

    q.push( {
      chicken: "tasty"
    } );

    q.push( {
      duck: "delicious"
    } );

  } );

  it( "should run a queue with at least one erroneous task which should be fixed and added back to the queue", function ( done ) {

    var numTimesTheErroneousWasRun = 0;

    var q = new Queue( function ( data, callback ) {

      if ( !data.hasOwnProperty( "name" ) || data.name == "chicken" ) {
        numTimesTheErroneousWasRun++;
        if ( !data.hasOwnProperty( "name" ) ) {
          data.name = "chicken";
        } else {
          data.name = "mr chicken";
        }
        q.push( data );
      };

      callback();

    } );

    q.drain = function ( errors ) {
      numTimesTheErroneousWasRun.should.equal( 2 );
      done();
    };

    testObjects.forEach( function ( obj ) {

      q.push( obj );

    } );

    q.push( {
      chicken: "tasty"
    } );

    q.push( {
      name: "duck"
    } );

  } );

} );