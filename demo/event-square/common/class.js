define(function(require, exports, module){

    function extend(d, b){
        for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
        function __() { this.constructor = d; }
        __.prototype = b.prototype;
        d.prototype = new __();
    }

    exports.mixin = function(d, m){
        for (var p in m) if (m.hasOwnProperty(p)) d.prototype[p] = m[p];
    }

    exports.extend = function (d, b, methods) {
        if( typeof b == 'function' ) {
            extend(d, b);
            if(methods) this.mixin(d, methods);
            d._super = b;
        } else if ( typeof b == 'object' ) {
            this.mixin(d, b);
            d._super = function(){};
        }
    }

});