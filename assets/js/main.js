class OS {
    constructor() {
        this.desktop = new HTML( "desktop" );
        HTML.get( "body" ).append( this.desktop );


    }

    reboot() {

    }
}

class HTML {
    constructor( selector ) {
        if ( typeof selector === "string" ) {
            this.html = document.createElement( selector );
            console.log( this.html )
        } else {
            this.html = selector;
            console.log( this.html )
        }
    }

    append( el ) {
        this.html.appendChild( el.html );
    }

    static get( selector ) {
        return new HTML( document.querySelector( selector ) );
    }
}

class Program {
    constructor( name, path, files ) {
        this.name  = name;
        this.path  = path;
        this.files = files;
    }


    static load( type, src ) {

    }

    install() {
        var index = 0,
            files = this.files;

        function load( index ) {
            $.ajax( {
                url    : this.path + files[ index ],
                success: function () {

                }
            } )
        }

        this.files.forEach( file => {
            $.ajax()
        } )

    }
}

(function ( global ) {
    function triggerCallbacks( list, args ) {
        if ( Array.isArray( list ) ) {
            for ( let i in list ) {
                if ( list.hasOwnProperty( i ) ) {
                    list[ i ].apply( this, args );
                }
            }
        } else if ( typeof ( list ) === "function" ) {
            list.apply( this, args );
        }
    }

    const privates = new WeakMap();
    /*var privates = {
        state      : Symbol( "state" ),
        successArgs: Symbol( "successArgs" )
    };*/
    class FancyPromise {
        constructor() {
            privates.set( this, {
                state      : FancyPromise.PENDING,
                successArgs: undefined,
                success    : [],
                errorArgs  : undefined,
                error      : [],
                complete   : []
            } );
        }

        get state() {
            return privates.get( this ).state;
        }

        then( onSuccess, onError, onFinish ) {
            if ( typeof ( onSuccess ) === "function" ) {
                if ( this.state === FancyPromise.SUCCESS ) {
                    triggerCallbacks.call( this, onSuccess, successArgs );
                } else {
                    privates.get( this ).success.push( onSuccess );
                }
            }
            let errorArgs = privates.get( this ).errorArgs;
            if ( typeof( onError ) === "function" ) {
                if ( this.state === FancyPromise.REJECTED ) {
                    triggerCallbacks.call( this, onError, errorArgs );
                } else {
                    privates.get( this ).error.push( onError );
                }
            }
            if ( typeof( onFinish ) === "function" ) {
                if ( this.state === FancyPromise.REJECTED || this.state === FancyPromise.SUCCESS ) {
                    triggerCallbacks.call( this, onFinish, errorArgs.length ? errorArgs : successArgs );
                } else {
                    privates.get( this ).complete.push( onFinish );
                }
            }
            return this;
        }

        resolve() {
            if ( privates.get( this ).state === FancyPromise.PENDING ) {
                var successArgs                  = Array.prototype.slice.call( arguments );
                privates.get( this ).successArgs = successArgs;
                privates.get( this ).state       = FancyPromise.SUCCESS;
                triggerCallbacks.call( this, privates.get( this ).success, successArgs );
                triggerCallbacks.call( this, privates.get( this ).complete, successArgs );
            }
            return this;
        }
    }
    FancyPromise.PENDING  = "PENDING";
    FancyPromise.SUCCESS  = "SUCCESS";
    FancyPromise.REJECTED = "REJECTED";
    global.FancyPromise   = FancyPromise;
})( window );

var p = new FancyPromise();
p.then( function ( str, num ) {
    console.log( str, num );
    return str;
} );


document.addEventListener( "DOMContentLoaded", function () {
    const os = new OS;
} );


/*
(function ( Fancy ) {
    var NAME    = "FancyPromise",
        VERSION = "0.0.2",
        logged  = false,
        STATES  = { "PENDING": 0, "SUCCESS": 1, "REJECTED": 2, "CANCELED": 3 };


    var privates = {
        state: new Symbol( "state" )
    };
    class FancyPromise {
        constructor() {
            this[ privates.state ] = FancyPromise.PENDING;
        }

        then( onSuccess, onError, onFinish ) {
            if ( Fancy.getType( onSuccess ) === "function" ) {
                if ( this.state === STATES.SUCCESS ) {
                    triggerCallbacks.call( this, onSuccess, successArgs );
                } else {
                    success.push( onSuccess );
                }
            }
            if ( Fancy.getType( onError ) === "function" ) {
                if ( this.state === STATES.REJECTED ) {
                    triggerCallbacks.call( this, onError, errorArgs );
                } else {
                    error.push( onError );
                }
            }
            if ( Fancy.getType( onFinish ) === "function" ) {
                if ( this.state === STATES.REJECTED || this.state === STATES.SUCCESS ) {
                    triggerCallbacks.call( this, onFinish, errorArgs.length ? errorArgs : successArgs );
                } else {
                    complete.push( onFinish );
                }
            }
            return this;
        }

        resolve() {
            if ( this[ privates.state ] === STATES.PENDING ) {
                this.successArgs = arguments;
                this[ privates.state ]       = STATES.SUCCESS;
                triggerCallbacks.call( this, success, successArgs );
                triggerCallbacks.call( this, complete, successArgs );
            }
            return this;
        }
    }
    function FancyPromise() {
        this.name    = NAME;
        this.version = VERSION;
        var state    = STATES.PENDING;
        if ( !logged ) {
            logged = true;
            Fancy.version( this );
        }
        Object.defineProperty( this, "state", {
            get         : function () {
                return state;
            },
            enumerable  : true,
            configurable: false
        } );
        var success     = [],
            successArgs = [],
            error       = [],
            errorArgs   = [],
            complete    = [];

        /!**
         * apply watcher to this promise
         * @param onSuccess
         * @param onError
         * @param onFinish
         * @returns {FancyPromise}
         *!/
        this.then = function ( onSuccess, onError, onFinish ) {
            if ( Fancy.getType( onSuccess ) === "function" ) {
                if ( state === STATES.SUCCESS ) {
                    triggerCallbacks.call( this, onSuccess, successArgs );
                } else {
                    success.push( onSuccess );
                }
            }
            if ( Fancy.getType( onError ) === "function" ) {
                if ( state === STATES.REJECTED ) {
                    triggerCallbacks.call( this, onError, errorArgs );
                } else {
                    error.push( onError );
                }
            }
            if ( Fancy.getType( onFinish ) === "function" ) {
                if ( state === STATES.REJECTED || state === STATES.SUCCESS ) {
                    triggerCallbacks.call( this, onFinish, errorArgs.length ? errorArgs : successArgs );
                } else {
                    complete.push( onFinish );
                }
            }
            return this;
        };


        /!**
         * will resolve the promise and call all assigned success- and complete-functions
         * @returns {FancyPromise}
         *!/
        this.resolve = function () {
            if ( state === STATES.PENDING ) {
                successArgs = arguments;
                state       = STATES.SUCCESS;
                triggerCallbacks.call( this, success, successArgs );
                triggerCallbacks.call( this, complete, successArgs );
            }
            return this;
        };
        /!**
         * will reject the promise and call all error- and complete-functions
         * @returns {FancyPromise}
         *!/
        this.reject = function () {
            if ( state === STATES.PENDING ) {
                errorArgs = arguments;
                state     = STATES.REJECTED;
                triggerCallbacks.call( this, error, errorArgs );
                triggerCallbacks.call( this, complete, errorArgs );
            }
            return this;
        };
        /!**
         * will cancel the promise and prevent it to be resolved or rejected
         *!/
        this.cancel = function () {
            state    = STATES.CANCELED;
            success  = [];
            error    = [];
            complete = [];
        };
        return this;
    }

    FancyPromise.api = FancyPromise.prototype = {};
    FancyPromise.api.version = VERSION;
    FancyPromise.api.name    = NAME;

    Fancy.promise        = function () {
        return new FancyPromise();
    };
    Fancy.promise.states = STATES;
    /!**
     * will reject if one rejection found and will resolve when all promises are resolved
     * @param promises
     * @returns {FancyPromise}
     *!/
    Fancy.promise.all = function ( promises ) {
        var promise   = new FancyPromise(),
            _promises = [],
            length    = 0,
            success   = [];
        if ( Fancy.getType( promises ) === "array" && promises.length ) {
            for ( var i in promises ) {
                if ( promises.hasOwnProperty( i ) && promises[ i ] instanceof FancyPromise ) {
                    _promises.push( promises[ i ] );
                }
            }
            if ( !_promises.length ) {
                return promise.resolve();
            }
            _promises.forEach( function ( it, i ) {
                it.then( function () {
                    success[ i ] = arguments;
                    console.log( arguments );
                    length++;
                    if ( length === _promises.length ) {
                        promise.resolve.apply( promise, success );
                    }
                }, function () {
                    promise.reject.apply( promise, arguments );
                } );
            } );
        } else {
            promise.resolve();
        }

        return promise;
    };

})( Fancy );*/

(function ( global ) {
    const privates = new WeakMap();
    const modules  = {};
    var loaded     = [];

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
        constructor( fn ) {
            this.module       = fn;
            var currentScript = getCurrentScript();
            var scriptPath    = currentScript.getFileName();
            privates.set( this, {
                files : [],
                script: scriptPath
            } );
            if ( !modules[ scriptPath ] ) {
                modules[ scriptPath ] = [];
            }
            modules[ scriptPath ].push( this );
        }

        install() {
            if ( privates.get( this ).installed ) {
                return false;
            }
            privates.get( this ).installed = true;

            var files    = privates.get( this ).files;
            var promises = [];
            return new Promise( resolve => {
                files.forEach( file => {
                    promises.push( new Promise( function ( resolve ) {
                        var script    = document.createElement( "script" );
                        script.src    = file;
                        script.onload = () => {
                            var mods = [];
                            if ( modules[ file ] ) {
                                modules[ file ].forEach( mod => {
                                    mods.push( mod.install() );
                                } );
                            }
                            Promise.all( mods ).then( function ( modules ) {
                                resolve( modules )
                            } );
                        };
                        document.head.appendChild( script );
                    } ) );
                } );
                Promise.all( promises ).then( response => {
                    var mods = [];
                    response.forEach( list => mods = mods.concat( list ) );
                    resolve( this.module.apply( null, mods ) );
                } );
            } );
        }

        require( ...path ) {
            var rootPath = privates.get( this ).script;
            path.forEach( file => {
                var root = rootPath.split( "/" );
                root.pop();
                var parts = file.split( "/" );
                var path  = "";
                parts.forEach( part => {
                    if ( part === ".." ) {
                        root.splice( root.length - 1, 1 );
                    } else {
                        path += "/" + part;
                    }
                } );
                var filePath = root.join( "/" ) + path;
                if ( !~loaded.indexOf( filePath ) ) {
                    loaded.push( filePath );
                    privates.get( this ).files.push( filePath );
                } else {
                    console.warn( filePath, "already requested" )
                }
            } );
            return this;
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

new Module( function ( service, s1, s2 ) {
    console.log( service, TEST, s1, s2 );
} ).require( "../programs/test/install.js" ).require( "../programs/test/main.js" );


setTimeout( function () {
    window.__ = new Module( function ( service ) {
        console.log( service );
    } ).require( "../programs/test/later.js" );
}, 4000 );