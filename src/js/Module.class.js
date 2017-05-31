(function ( global ) {
    const privates = new WeakMap();
    const modules  = {};
    let verbose    = false;
    const loaded   = [];

    function getCurrentScript() {
        return getCaller();
    }

    function getCaller() {
        return getStack()
    }

    function getStack() {
        // Save original Error.prepareStackTrace
        var origPrepareStackTrace = Error.prepareStackTrace;

        // Override with function that just returns `stack`
        Error.prepareStackTrace = function ( _, stack ) {
            return stack[ stack.length - 1 ]
        };
        // Create a new `Error`, which automatically gets `stack`
        var err                 = new Error();

        // Evaluate `err.stack`, which calls our new `Error.prepareStackTrace`
        var stack               = err.stack;
        // Restore original `Error.prepareStackTrace`
        Error.prepareStackTrace = origPrepareStackTrace;

        return stack
    }


    class Module {
        constructor( name, fn, ...injections ) {
            if ( typeof name === "function" ) {
                if ( fn ) {
                    injections.unshift( fn );
                }
                fn   = name;
                name = fn.name;
            }

            this.module       = fn;
            this.name         = name;
            let currentScript = getCurrentScript();
            let scriptPath    = currentScript.getFileName();
            privates.set( this, {
                files     : [],
                injections: injections,
                script    : scriptPath,
                installed : false
            } );
            if ( !modules[ scriptPath ] ) {
                modules[ scriptPath ] = [];
            }
            modules[ scriptPath ].push( this );
        }

        install() {
            if ( privates.get( this ).installed ) {
                return privates.get( this ).installed;
            }

            let files    = privates.get( this ).files;
            let promises = [];
            return privates.get( this ).installed = new Promise( resolve => {
                files.forEach( file => {
                    if ( loaded[ file ] ) {
                        promises.push( loaded[ file ] );
                        if ( verbose ) {
                            let split = file.split( "/" );
                            console.warn( this.name, split[ split.length - 1 ], "already installed" );
                        }
                    } else {
                        let promise    = new Promise( resolve => {
                            let script     = document.createElement( "script" );
                            script.src     = file;
                            script.onload  = () => {
                                let mods = [];
                                if ( modules[ file ] ) {
                                    modules[ file ].forEach( mod => {
                                        mods.push( mod.install() );
                                    } );
                                }
                                Promise.all( mods ).then( function ( modules ) {
                                    resolve( modules )
                                } );
                            };
                            script.onerror = () => {
                                throw `InstallError: (${this.name}) Script ${file} not found`;
                            };
                            document.head.appendChild( script );
                        } );
                        loaded[ file ] = promise;
                        promises.push( promise );
                    }
                } );
                Promise.all( promises ).then( response => {
                    let mods              = [];
                    let injections        = privates.get( this ).injections;
                    var injectionPromises = [];
                    if ( injections.length ) {
                        injections.forEach( ( name, index ) => {
                            let mod;
                            for ( let file in modules ) {
                                mod = modules[ file ].find( item => item.name === name );
                                if ( mod ) {
                                    break;
                                }
                            }
                            if ( mod ) {
                                if ( mod.hasOwnProperty( "response" ) ) {
                                    mods[ index ] = mod.response;
                                } else {
                                    injectionPromises.push( new Promise( resolve => {
                                        mod.install().then( () => {
                                            mods[ index ] = mod.response;
                                            resolve( mod.response );
                                        } )
                                    } ) );
                                }
                            } else {
                                throw `Error while installing module ${this.name}: module ${name} not found`;
                            }
                        } );
                    } else {
                        response.forEach( list => {
                            mods = mods.concat( list )
                        } );
                    }
                    Promise.all( injectionPromises ).then( () => {
                        this.response = this.module.apply( null, mods );
                        if ( verbose ) {
                            console.groupCollapsed( `Module "${this.name}" loaded` );
                            console.log( this.response );
                            console.groupEnd();
                        }
                        resolve( this.response );
                    } )
                } );
            } );
        }

        require( ...path ) {
            let rootPath = privates.get( this ).script;
            if ( Array.isArray( path[ 0 ] ) ) {
                path = path[ 0 ];
            }
            path.forEach( file => {
                let root = rootPath.split( "/" );
                root.pop();
                let parts = file.split( "/" );
                let path  = "";
                parts.forEach( part => {
                    if ( part === ".." ) {
                        root.splice( root.length - 1, 1 );
                    } else {
                        path += "/" + part;
                    }
                } );
                if ( !path.match( /\.js$/ ) ) {
                    path += ".js";
                }
                privates.get( this ).files.push( root.join( "/" ) + path );
            } );
            return this;
        }

        static verbose( value ) {
            if ( value === undefined ) {
                value = !value;
            }
            verbose = value;
        }
    }
    document.addEventListener( "DOMContentLoaded", function () {
        for ( let path in modules ) {
            if ( modules.hasOwnProperty( path ) ) {
                modules[ path ].forEach( module => {
                    module.install();
                } );
            }
        }
    } );
    global.Module = Module;
})( window );