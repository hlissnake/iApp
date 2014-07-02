define(function (require, exports, module) {
// window.ScrollDrag = (function(){

    var Class = require('./class')

    var ScrollOffest = 0
    ,   RAF = 
        window.requestAnimationFrame || 
        window.webkitRequestAnimationFrame || 
        function(callback){
            setTimeout(callback, 1 / 30);
        };
    ;

    var touchmoveEventPrevent = function(e){
        e.preventDefault();
    }

    function getOffsetY(target){
        return target.pageYOffset || target.scrollTop;
    }

    var ScrollDrag = function(options){
        // this.DocumentHeight = $(document).height();
        this.stopped = false;
        this.DragEnable = false;
        this.isDragUp = false;
        for (var option in options) {
            if (options.hasOwnProperty(option)) 
                this[option] = options[option];
        }
        this.init();
    }

    Class.extend(ScrollDrag, {

        init : function(){
            var me = this
            ,   startY = 0
            ,   aleadyTop = false
            ,   DragEnable = false
            ;

            document.addEventListener('touchstart', function(e){
                if (me.stopped) return;
                var touch = e.touches.length ? e.touches[0] : e.changedTouches[0];
                startY = touch.pageY;
                aleadyTop = false;
                // swipeStartTime = (+new Date);
                // if have Y property，then change to iscroll object
                if(me.dragEl.y != undefined) {
                    getOffsetY = function(target){
                        return -target.y;  // iscroll Y坐标系和CSS坐标系是相反的
                    }
                }
            });

            document.addEventListener('touchmove', function(e){
                if (me.stopped) return;

                var touch = e.touches.length ? e.touches[0] : e.changedTouches[0]
                ,   ScrollTop = getOffsetY(me.dragEl)
                ;
                // if (me.dragDown) {
                if (ScrollTop <= ScrollOffest) {
                    me.offsetY = ScrollTop;
                    if(!aleadyTop) {
                        aleadyTop = true;
                        startY = touch.pageY;
                        me.onDragStart && me.onDragStart.call(me, e);
                    }
                    if(startY < touch.pageY) {
                        e.dragDistance = touch.pageY - startY;
                        DragEnable = true;
                        me.DragMove = true;
                        touchmoveEventPrevent(e);
                        // me.onDrag && me.onDrag.call(me, e);//console.log('move');
                        me.event = e;
                        me.trick(e);
                    }
                } else {
                    DragEnable = false;
                }
                // }
            });

            document.addEventListener('touchend', function(e){
                if (me.stopped) return;
                if (DragEnable) {
                    DragEnable = false;
                    me.onDragEnd && me.onDragEnd.call(me, e);
                }
            });

        },

        // 使用RAF来确保动画流畅性，保证下一帧在当前渲染操作完之后执行
        trick : function(e){
            var me = this;
            if(!me.stopped && me.DragMove) {
                RAF(function(){
                    me.trick(e);
                });
                me.onDrag && me.onDrag.call(me, e);//console.log('raf move');
                me.DragMove = false;
            }
        },

        stop : function(){
            this.stopped = true;
        },

        resume : function(){
            this.stopped = false;
        }
    });

    return ScrollDrag;

});//();