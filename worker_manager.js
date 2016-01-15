/**
 * @author Xeip Studios, Inc / http://xeipstudios.com
 * @author Adam Velma / http://www.adamvelma.com
 * 
 * Web Worker Manager
 * 
 * [Description]
 */

function WebWorkerManager () {
    
    var self = this;
    
    this.workers = {};
    
    this.workerLimit = 8;
    
    this.queue = {};
    
    this.callback;
    
    this.defaultWorker = "core_worker.js";
    
    this.queListener = null;
    
    this.queCount = 0;
    
    this.staging = {};
    
    this.init = function () {
        
        /**
         * Add things to objects we need.
         */
        Array.prototype.remove = function( index ){
            this.splice( index, 1 );
        }
        
        Object.size = function( obj ) {
            var size = 0, key;
            for ( key in obj ) {
                if ( obj.hasOwnProperty( key ) ) size++;
            }
            return size;
        };
        
        self.startQueListener();
        
    };
    
    this.initiateWorker = function ( workerSerial, workerName, persist ) {
        
        var workerObject;
        
        if (persist) {
            
            workerObject = self.getWorkerByName( workerName );
            if ( workerObject && !workerObject.active ) {
                return workerObject;
            } else if ( workerObject && workerObject.active ) {
                return false;
            }
            
        }
        
        var worker = new Worker( workerName ? workerName : self.defaultWorker );
        worker.addEventListener( 'message', self.prepareFinishWork, false );
        workerObject = {
            name: workerName,
            worker: worker,
            persist: false,
            active: true
        };
        self.workers[ workerSerial ] = workerObject;
        return self.workers[ workerSerial ];
        
    };
    
    this.startQueListener = function () {
        
        self.queListener = setInterval( function () {
            
            if (Object.size(self.queue) > 0) {
                
                $.each(self.queue, function (key, queItem) {
                    
                    if ( queItem.active == false && Object.size( self.workers ) < self.workerLimit ) {
                        self.doWork( self.queue[ key ] );
                    }
                    
                });
            }
            
        }, 500 );
        
    };
    
    this.addWork = function ( dataObject, callback, workerName, persist ) {
        
        workerName = typeof workerName !== 'undefined' ? workerName : self.defaultWorker;
        persist = typeof persist !== 'undefined' ? persist : false;
        
        var serial = self.createSerial();
        self.addToQue( serial, dataObject, callback, workerName, persist );
        
    };
    
    this.addToQue = function ( serial, dataObject, callback, workerName, persist ) {
        
        var queObject = {
            serial: serial,
            data: dataObject,
            callback: callback,
            workerName: workerName,
            persist: persist,
            active: false
        }
        self.queue[ self.queCount ] = queObject;
        self.queCount++;
        
    };
    
    this.doWork = function ( queItem ) {
        
        var workerSerial = self.createSerial();
        var workerObject = self.initiateWorker( workerSerial, queItem.workerName, queItem.persist );

        if ( workerObject ) {
            
            var itemKey = self.getQueItemKeyBySerial( queItem.serial );
            self.queue[itemKey].active = true;
            
            if ( queItem.persist ) {
                workerSerial = self.getWorkerKeyByName( queItem.workerName );
            }
            
            workerObject.worker.postMessage({
                data: queItem.data,
                workerSerial: workerSerial,
                serial: queItem.serial
            });
            
        }
        
    };
    
    this.getQueItemKeyBySerial = function ( serial, test ) {
        
        test = typeof test !== 'undefined' ? test : false;
        var returnKey = false;
        
        $.each( self.queue, function ( key, item ) {
            
            if ( item.serial == serial ) {
                returnKey = key;
            }
            
        });
        
        return returnKey;
        
    };
    
    this.prepareFinishWork = function ( dataObject ) {
        
        if ( dataObject.data.action === 'parse' ) {
            
            if ( !self.staging.hasOwnProperty( dataObject.data.serial ) ) {
                self.staging[ dataObject.data.serial ] = {};
            }
            
            if ( typeof dataObject.data.data === 'object' ) {
                self.set( self.staging[ dataObject.data.serial ], dataObject.data[ 'objectPath' ], dataObject.data.data, false );
            } else {
                self.staging[ dataObject.data.serial ] = dataObject.data.data;
            }
            
        } else if ( dataObject.data.action === 'done' ) {
            self.finishWork( dataObject.data );
        } 
        
    };
    
    this.finishWork = function ( dataObject ) {
        
        var itemKey = self.getQueItemKeyBySerial( dataObject.serial, true );
        
        if ( self.queue[ itemKey ].callback ) {
            self.queue[ itemKey ].callback( self.staging[ dataObject.serial ] );
            delete self.queue[ itemKey ];
        }
        
        delete self.staging[ dataObject.serial ];
        
        if ( dataObject.persist ) {
            self.workers[ dataObject.workerSerial ].active = false;
        } else {
            self.workers[ dataObject.workerSerial ].worker.terminate();
            delete self.workers[ dataObject.workerSerial ];
        }
        
    };
    
    this.getWorkerByName = function ( workerName ) {
        
        for ( workerObject in self.workers ) {
            if ( workerObject.workerName == workerName ) {
                return workerObject;
            }
        }
        
        return false;
        
    };
    
    this.getWorkerKeyByName = function ( workerName ) {
        
        var returnKey = false;
        
        $.each( self.workers, function ( key, workerObject ) {
            if ( workerObject.workerName == workerName ) {
                returnKey = key;
            }
            
        });
        
        return returnKey;
        
    };
    
    this.workerIsActive = function ( workerName ) {
        
        var workerObject = self.getWorkerByName( workerName );
        return workerObject.active === true;
        
    };
    
    this.workerIsPersisted = function ( workerName ) {
        
        var workerObject = self.getWorkerByName( workerName );
        return workerObject.persist === true;
        
    };
    
    this.createSerial = function () {
        
        var length = 15;
        var chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        var result = '';
        
        for ( var i = length; i > 0; --i ) result += chars[ Math.floor( Math.random() * chars.length ) ];
        
        return result;
        
    };
    
    this.setValueByArray = function ( obj, parts, value, overwrite ){

        if( !parts ){
            throw 'No parts array passed in';
        }
        
        if( parts.length === 0 ){
            throw 'parts should never have a length of 0';
        }
        
        if( parts.length === 1 ){
            
            if ( !obj.hasOwnProperty( parts[ 0 ] ) ) {
                obj[ parts [ 0 ] ] = value;
            } else if ( obj.hasOwnProperty( parts[ 0 ] ) && overwrite ) {
                obj[ parts[ 0 ] ] = value;
            } else {
                obj[ parts[ 0 ] ] += value;
            }
            
        } else {
            
            var next = parts.shift();
            
            if( !obj[ next ] ){
                obj[ next ] = {};
            }
            self.setValueByArray( obj[ next ], parts, value );
            
        }
    };

    this.getValueByArray = function ( obj, parts, value ){
        
        if( !parts ) {
            return null;
        }
        
        if( parts.length === 1 ){
            return obj[ parts[ 0 ] ];
        } else {
            var next = parts.shift();
            
            if( !obj[ next ] ){
                return null;
            }
            return getValueByArray( obj[ next ], parts, value );
        }
        
    };

    this.set = function ( obj, path, value, overwrite ) {
        
        overwrite = typeof overwrite === "undefined" ? true : overwrite;
        self.setValueByArray( obj, path.split( '.' ), value, overwrite );
        
    };

    this.get = function(obj, path){
        
        return self.getValueByArray(obj, path.split('.'));
        
    };
    
    self.init();
    
};