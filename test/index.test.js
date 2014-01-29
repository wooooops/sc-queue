var should = require( "should" ),
  Queue = require( "../index" );

describe( "queue", function () {

  it( "should", function ( done ) {

    var testObjects = [ {
      name: "David"
    }, {
      name: "Leonie"
    }, {
      name: "Max"
    } ];

    var q = new Queue( function ( data, callback ) {

      setTimeout( function () {

        console.log( "data", data.name );
        callback( data.name === "Leonie" ? new Error( "Leonie had an oopsie" ) : null, "tasty" );

      }, 10 );

    }, 4 );

    q.drain = function () {

      console.log( "queue drained" );
      done();

    };

    testObjects.forEach( function ( obj ) {

      q.push( obj, function ( error, chicken ) {

        console.log( "obj", obj.name, "callback", error, chicken );

      } );

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

} );