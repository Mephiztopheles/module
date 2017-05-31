function checkDomain( value, Domain ) {
    if ( !value || !value.constructor || !(value.constructor === Domain || Object.getPrototypeOf( value.constructor ) === Domain) ) {
        throw new TypeError( "You cannot add " + item.constructor.name + " to HasMany<" + Domain.name + ">" );
    }
}

class HasMany extends Array {
    constructor( Domain ) {
        super();
        defineProperty( this, "$domain", {
            value       : Domain,
            configurable: false,
            writable    : false,
            enumerable  : false
        } );
        defineProperty( this, "total", {
            value     : 0,
            writable  : true,
            enumerable: false
        } );
    }

    add( ...items ) {
        var list = [];
        each( items, ( item ) => {
            var q = $q.defer();
            checkDomain( item, this.$domain );
            item.save().then( ( result ) => {
                if ( !~this.indexOf( result ) ) {
                    if ( !this.findByAnd( { id: result.id, class: result.class } ) ) {
                        this.splice( this.length, 0, result );
                    }
                }
                q.resolve( result );
            }, ( reason ) => {
                q.reject( rejection( reason, "HasMany", "add" ) );
            } );
            list.push( q.promise );
        } );
        return $q.all( list );
    }

    remove( item ) {
        var index = this.indexOf( item ),
            q     = $q.defer();
        if ( getType( item ) === "number" ) {
            index = item;
            item  = this[ index ];
        }
        if ( index !== -1 ) {
            if ( item.id ) {
                item.delete().then( ( result ) => {
                    this.splice( index, 1 );
                    q.resolve( result );
                }, ( reason ) => {
                    q.reject( rejection( reason, "HasMany", "remove" ) );
                } );
            } else {
                this.splice( index, 1 );
                q.resolve();
            }
        }
        return q.promise;
    }

    set( items ) {
        this.splice( 0 );
        each( items, ( item ) => {
            this.push( item );
        } );
    }

    push( ...items ) {
        each( items, ( item ) => {
            checkDomain( item, this.$domain );
            this.splice( this.length, 0, item );
        } );
        return this.length;
    }
}

var a = new HasMany( Program );