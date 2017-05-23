new Module( function ( s3 ) {
    return "s1 - " + s3;
} ).require( "test.js" );

new Module( function ( s3, service ) {
    console.log( service );
    return "s2 - " + s3;
} ).require( "test.js" );