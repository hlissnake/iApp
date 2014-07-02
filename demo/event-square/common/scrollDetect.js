define(function(require,exports,module){

    var winHeight = (window.innerHeight || document.documentElement.clientHeight)
    ,   Detect_Start = false
    ,   ScrollTop
    // ,   DetectPromise
    ,   detectList = []
    ,   RAF = 
        window.requestAnimationFrame || 
        window.webkitRequestAnimationFrame || 
        function(callback){
            setTimeout(callback, 1 / 20);
        };
    ;

    var onScroll = function(){
        ScrollTop = window.pageYOffset || document.documentElement.scrollTop;
    }

    function detect(){
        if( !Detect_Start ) return;
        var ob
        ,   offsetTop
        ;
        for(var i = 0, len = detectList.length; i < len ; i++) {
            ob = detectList[i];
            offsetTop = ob.el.offset().top;

            if(ob.detected) continue;

            if (ScrollTop + winHeight + (ob.offest || 50) > offsetTop) {
                // DetectPromise.then(function(){
                    ob.detected = true;
                    ob.fn.call(this);
                // })
            }
        }
        RAF(detect);
    }

    function detectStart(){
        $(window).on('scroll', onScroll);
        $(document).on('touchmove', onScroll);

        Detect_Start = true;
        RAF(detect);
    }

    function afterScroll(){
        setTimeout(function(){
            $(window).off('scroll', onScroll);
            $(document).off('touchmove', onScroll);

            Detect_Start = false;

            afterDetect();
        }, 300);
    }

    function afterDetect(){
        var allDetect = true;
        for(var i = 0, len = detectList.length; i < len ; i++) {
            if (!detectList[i].detected) {
                allDetect = false;
                break;
            }
        }
        if(allDetect) {
            $(document).off('touchstart', detectStart);
            $(document).off('touchend', afterScroll);
        }
    }

    exports = {

        add : function(node, callback, scrollTopOffest){
            detectList.push({
                el : $(node),
                fn : callback,
                offest : scrollTopOffest
            });
        },

        init : function(){
            var me = this;

            $(document).on('touchstart', detectStart);
            $(document).on('touchend', afterScroll);

            ScrollTop = window.pageYOffset || document.documentElement.scrollTop;
            detectStart();
            setTimeout(function(){
                afterDetect();
                Detect_Start = false;
            }, 400);
        }
    }

    return exports;

});