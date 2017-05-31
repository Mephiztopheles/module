new Module( "OS", ( Program ) => {
    class OS {
        constructor() {
            this.desktop = $( "desktop" );
            $( "body" ).append( this.desktop );


        }

        reboot() {

        }
    }


    document.addEventListener( "DOMContentLoaded", function () {
        const os = new OS;
        os.reboot();
    } );

    return OS;
}, "Program" );

new Module( "Program", function () {
    class Program {
        constructor() {

        }

        install() {

        }
    }
    return Program;
} );

Module.verbose();