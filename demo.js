// Animations
function animate(object) {
    
    this.goRight = function (object) {
        object.animate({'marginLeft':'+=500px'}, 1000, function () {
            self.goLeft($(this));
        });
    };
    
    this.goLeft = function (object) {
        object.animate({'marginLeft':'-=500px'}, 1000, function () {
            self.goRight($(this));
        });
    }
    
    self.goRight(object);
}

$(document).ready(function () {
    var thisObject = $('div[class="image-container"]').eq(0);
    animate(thisObject);
    thisObject = $('div[class="image-container"]').eq(1);
    animate(thisObject);
});
// GLOBALS
var jsActive = false;

function runTest (type) {
    
    var self = this;
    this.type = type;
    this.loops = $('input[name="loops"]').val();
    this.outputContainer = $('div[class="response"]').eq( type === 'jsonly' ? 0 : 1 );
    this.running = false;
    
    this.init = function () {
        
        if ( self.type === 'jsonly' ) {
            
            if ( jsActive ) {
                self.outputContainer.append( self.respond( "JS TEST IS ALREADY RUNNING" ) );
            } else {
            
                jsActive = true;
                self.runJsOnly();
                
            }
            
        }

        if ( self.type === 'worker' ) {
            self.runWebWorkerTest();
        }
        
    };
    
    this.getTime = function () {
        return new Date().getTime();
    };
    
    this.runJsOnly = function () {
        
        self.outputContainer.append( self.respond( "JS ONLY - Test started." ) );
        
        var array = [];
        var startTime = self.getTime();
        
        for ( var x = 0; x < parseInt(self.loops); x++ ) {
            array.push(x);
        }
        
        self.outputContainer.append( self.respond( 
            "JS ONLY - Test Finished <br/> " + self.millisecondsToStr( self.getTime() - startTime )
        ) );

        jsActive = false;
        
    };
    
    this.runWebWorkerTest = function () {
        
        self.outputContainer.append( self.respond( "Web worker - Test started." ) );
        
        var manager = new WebWorkerManager();
        manager.addWork({cmd: 'test', parameters: ['red']}, self.workerDone);
    }
    
    this.workerDone = function ( e ) {
        
        self.outputContainer.append( self.respond( 
            "Worker - Test Finished <br/> " + e
        ) );
        
    };
    
    this.respond = function (text) {
        return "<div>" + text + "</div>";
    };
    
    this.millisecondsToStr = function ( milliseconds ) {

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
    
    self.init();
    
}