new Module( function ( s3 ) {
    console.log( s3 );
    return "s1";
} ).require( "test.js" );

new Module( function ( s3 ) {
    console.log( s3 );
    return "s2";
} ).require( "test.js" );