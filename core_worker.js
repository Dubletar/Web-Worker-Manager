/* Imports */
//self.importScripts();

/* Constants */
var RETURN_LIMIT = 1000;

/* Variables */

/**
 * 
 * @param {object} e
 * @returns {object}
 */
onmessage = function ( e ) {
    
    var cmd = e.data.data.cmd;
    var parameters = e.data.data.hasOwnProperty( 'parameters' ) ? e.data.data.parameters : null;
    var options = e.data.data.hasOwnProperty( 'options' ) ? e.data.data.options : false;
    var result;
    
    if ( typeof self[ cmd ] === "function" ) {
        
        if ( typeof parameters === "string" ) {
            result = self[ cmd ]( parameters );
        } else if ( parameters !== null && typeof parameters === "object" ) {
            result = self[ cmd ].apply( this, Array.prototype.slice.call( parameters, 0 ));
        } else {
            result = self[ cmd ]();
        }
        
        self.respond( e.data, result );
        
    }
    
};

function respond ( dataObject, result ) {
    
    var startTime = new Date().getTime();
    
    dataObject[ 'action' ] = 'parse';
    dataObject.data = {};
    self.sendObjectData( dataObject, result );
    
    dataObject.action = 'done';
    self.postMessage( dataObject );
    
    var endTime = new Date().getTime();
    //console.log( self.millisecondsToStr( endTime - startTime ) );
    
}

function sendObjectData ( dataObject, result, objectPath ) {
    
    var pos;
    var data;
    objectPath = typeof objectPath === "undefined" ? '' : objectPath;
    var thisPath = objectPath;
    
    if ( typeof result === "object" ) {
        
        for ( key in result ) {      
            
            if ( typeof result[ key ] === "object" ) {

                thisPath = objectPath + ( objectPath.toString().length ? '.' + key : key );
                self.sendObjectData( dataObject, result[ key ], thisPath );

            } else {

                thisPath = objectPath + ( objectPath.toString().length ? '.' + key : key );
                data = result[ key ].toString();
                dataObject[ 'objectPath' ] = thisPath;

                if ( data.length > self.RETURN_LIMIT ) {
                    
                    for ( var y = 0; y < ( data.length / self.RETURN_LIMIT ); y++ ) {
                        
                        pos = y * self.RETURN_LIMIT;
                        dataObject.data = data.slice( pos, parseInt( pos + self.RETURN_LIMIT ) );
                        self.postMessage( dataObject );
                        
                    }
                    
                } else {
                    
                    dataObject.data = data;
                    self.postMessage( dataObject );
                    
                }

            }
        }
    } else {
        
        dataObject.data = JSON.stringify( result );
        self.postMessage( dataObject );
        
    }
    
}

onerror = function ( e ) { console.log( e ); };

function getObjectKeys( object ) {
    
    var keys = [];
    
    if ( typeof object === 'object' ) {
        for ( var key in object ) {
            keys.push( key );
        }
    }
    
    return keys;
    
}

function test( string, loops ) {
    
    loops = typeof loops !== 'undefined' ? loops : 100;
    var x = 0;
    var array = [];
    var startTime = new Date().getTime();
    
    while( x < loops ) {
        
        array.push( x );
        x++;
        
    };
    
    var endTime = new Date().getTime();
    
    return self.millisecondsToStr( endTime - startTime );
}

function millisecondsToStr ( milliseconds ) {
    
    function numberEnding ( number ) {
        return ( number > 1 ) ? 's' : '';
    }

    var temp = Math.floor( milliseconds / 1000 );
    var years = Math.floor( temp / 31536000 );
    
    if ( years ) {
        return years + ' year' + numberEnding( years );
    }
     
    var days = Math.floor( ( temp %= 31536000 ) / 86400 );
    if ( days ) {
        return days + ' day' + numberEnding( days );
    }
    
    var hours = Math.floor( ( temp %= 86400 ) / 3600 );
    if ( hours ) {
        return hours + ' hour' + numberEnding( hours );
    }
    
    var minutes = Math.floor( ( temp %= 3600 ) / 60 );
    if ( minutes ) {
        return minutes + ' minute' + numberEnding( minutes );
    }
    
    var seconds = temp % 60;
    if ( seconds ) {
        return seconds + ' second' + numberEnding( seconds );
    }
    
    return 'less than a second'; 
    
}