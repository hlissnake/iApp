define(function(require, exports, module){
    
    var Class = require('./util/class')
    ,   DragTop = require('./util/drag')
    ,   NoOverflowScrolling = true
    ,   IScroll
    ,   iscrollList = {}
    ;

    var BodyHeight = document.body.getBoundingClientRect().height
    ,   MaxOpacity = 0.8
    ,   MaxScale = 0.9
    ;

    var addIScroll = function(view){
        var el = '#' + view.id;
        if(IScroll) {
            var iscroll = new IScroll(el);
            setTimeout(function(){
                iscroll.refresh();
            }, 800);
            view.iscroll = iscroll;
        } else {
            iscrollList[el] = view;
        }
    };

    if('webkitOverflowScrolling' in document.body.style && $.os.ios ) {
        NoOverflowScrolling = false;
    }
    if(NoOverflowScrolling) {
        document.body.classList.add('no-overflow-scrolling');
        NoOverflowScrolling = true;
        require.async('./util/iscroll', function(module){
            IScroll = module;
            for(i in iscrollList) {
                addIScroll( iscrollList[i] );
            }
            $(document.body).trigger('iapp-iscrollReady');
        });
    }

    var iApp = function(containerEl, options){

        for (var option in options) {
            if (options.hasOwnProperty(option)) 
                this[option] = options[option];
        }

        this.el = $(containerEl);
        this.viewList = {};
        this.viewStack = [];
        this.currentZindex = 0;
        this.useIScroll = NoOverflowScrolling;

        if(this.el.attr('id')) {
            this.id = this.el.attr('id');
        } else {
            this.id = +new Date;
            this.el.attr('id', this.id);
        }

        this.maskEl = $('<div class="app-mask"></div>')
        // this.loadEl = $('<div id="start-loading" style="z-index:2000;" class="loading"></div>');
        // this.el.append(this.loadEl);
        this.el.append(this.maskEl);

        this.initEvent();

        // IScroll 下暂时先屏蔽下拉转场操作，反正是适配低端机
        if(!NoOverflowScrolling) {
            this.initDrag();
        }
    }

    Class.extend(iApp, {

        initEvent : function(){
            var me = this;
            me.el.on('click', '.' + me.backBtnCls, function(e){
                e.preventDefault();
                me.back();
            });
        },

        initDrag : function(){
            var me = this
            ,   maskEl = me.maskEl[0]
            ,   MaxDistance = 100
            ,   OverThreshold = false
            ;

            this.dragObject = new DragTop({

                onDrag : function(e){

                    var moveDistance = Math.floor(e.dragDistance)
                    ,   opacity = MaxOpacity - MaxOpacity * moveDistance / BodyHeight
                    ,   scale = MaxScale + (1 - MaxScale) * moveDistance / BodyHeight
                    ;
                    me.dragEl.style.webkitTransform = 'translateY(' + moveDistance + 'px)';
                    me.previousViewEL.style.webkitTransform = 'scale(' + scale + ')';
                    maskEl.style.opacity = opacity;

                    if(moveDistance >= MaxDistance) {
                        if(OverThreshold == false) {
                            OverThreshold = true;
                        }
                    } else {
                        OverThreshold = false;
                    }
                },

                onDragStart : function(){
                    me.dragEl.style.webkitTransition = '';
                    me.previousViewEL.style.webkitTransition = '';
                    maskEl.style.webkitTransition = '';
                },

                onDragEnd : function(){
                    if(OverThreshold) {
                        me.scrollBack = true
                        OverThreshold = false;
                        me.back();
                    } else {
                        maskEl.style.webkitTransition = 'all 400ms ease';
                        maskEl.style.opacity = MaxOpacity;

                        me.dragEl.style.webkitTransition = 'all 200ms ease';
                        me.dragEl.style.webkitTransform = 'translateY(0px)';

                        me.previousViewEL.style.webkitTransform = 'scale(' + MaxScale + ')';
                        me.previousViewEL.style.webkitTransition = 'all 400ms ease';
                    }
                }
            });
            this.dragObject.stop();
        },

        addView : function(options){
            var id = options.id;
            this.viewList[id] = options;
        },

        getView : function(id) {
            return this.viewList[id];
        },

        forward : function(id){
            var view = this.viewList[id]
            this.load(view, true);
        },

        back : function(){
            if(this.viewStack.length < 2) return;
            var previousView = this.viewStack[this.viewStack.length - 2];
            this.load(previousView, false);
        },

        load : function(view, isForward){
            var me = this;

            if(!view) return;
            if(view.id == this.activeViewId) return;

            if(document.getElementById(view.id)) {
                this.transition(view, isForward);
                return;
            }

            if(!view.loaded && view.css) {
                $('head', document).append("<link type='text/css' rel='stylesheet' href='" + view.css + "'/>")
            }

            var pageEl = $('<div class="app-view" id="' + view.id + '"></div>')
            ,   viewEl = $('<div class="app-view-content"></div>')
            ;
            // add prime view container
            pageEl.append(viewEl);
            // add footer bar if exists
            if (view.footBar || me.footBar) {
                pageEl.append($('<div class="app-view-footer">' + (view.footBar || me.footBar) + '</div>'));
            }
            // add navigation bar if exists, excute it at last to make sure correct zIndex order
            if (view.navBar || me.navBar) {
                pageEl.append($('<div class="app-view-nav">' + (view.navBar || me.navBar) + '</div>'));
            }

            this.el.append(pageEl);
            // this.loadEl.addClass('loading');

            if(view.url) {

            } else if (view.html) {
                viewEl.append($(view.html));
                view.oninit.call(me);
                view.loaded = true;
            }
            // loadPromise.done(function(){
            this.transition(view, isForward);
            if(NoOverflowScrolling) {
                addIScroll(view);
            }
            // })
        },

        transition : function(view, isForward){
            var me = this
            ,   activeView
            ,   activeEl
            ,   viewEl = document.getElementById(view.id)
            ,   dragEl = viewEl.querySelector('.app-view-content')
            ,   maskEl = me.maskEl[0]
            ;
            if(isForward) {
                activeEl = document.getElementById(this.activeViewId);  
                activeView = this.viewStack[this.viewStack.length - 1];
                this.viewStack.push(view);
                this.currentZindex += 2;

                activeEl.style.webkitTransition = 'all 400ms ease';
                activeEl.style.webkitTransform = 'scale(' + MaxScale + ')';
                activeEl.style.zIndex = me.currentZindex - 2;

                if(maskEl.style.display = 'none') {
                    maskEl.style.display = 'block';
                }
                maskEl.style.zIndex = me.currentZindex - 1;
                maskEl.style.webkitTransition = '';
                maskEl.style.opacity = '0';

                viewEl.style.webkitTransform = 'translateY(' + BodyHeight + 'px) translateZ(0)';
                viewEl.style.zIndex = me.currentZindex;

                // Transition 动画使用SetTimeout分割，否则不会产生效果
                setTimeout(function(){
                    maskEl.style.webkitTransition = 'opacity 400ms ease';
                    maskEl.style.opacity = MaxOpacity;
                    viewEl.style.webkitTransition = 'all 400ms ease';
                    // viewEl.style.webkitTransform = 'translateY(-' + moveHeight + 'px)';
                    viewEl.style.webkitTransform = 'translateY(0) translateZ(0)';
                    view.onload && view.onload.call(me);
                    if(NoOverflowScrolling) {
                        setTimeout(function(){
                            view.iscroll.refresh();  
                        }, 0)
                    } else {
                        me.dragEl = viewEl;
                        me.dragObject.dragEl = dragEl;
                        me.dragObject.resume();
                    }
                })
                // me.currentViewEl = viewEl;
                me.previousViewEL = activeEl;

            } else {
                activeView = this.viewStack.pop();
                var activeEl = document.getElementById(activeView.id)
                // ,   moveHeight = $(activeEl).height()
                ,   isTransitionEnd = false
                ;
                function transitionEndCallback(e){
                    // me.el.height($(viewEl).height());
                    if (me.viewStack.length > 1 && !NoOverflowScrolling) {
                        me.dragEl = viewEl;
                        me.dragObject.dragEl = dragEl;
                        me.dragObject.resume();
                    } else {
                        maskEl.style.display = 'none';
                    }
                    maskEl.style.zIndex = me.currentZindex;

                    if(activeView.cache) {
                        $(activeEl).hide();
                    } else {
                        $(activeEl).remove();
                    }
                    isTransitionEnd = true;
                    activeEl.removeEventListener('webkitTransitionEnd', arguments.callee);
                    activeView = activeEl = null;
                }
                activeEl.addEventListener('webkitTransitionEnd', transitionEndCallback, false);

                // 500ms后查看webkitTransitionEnd 是否已执行，如果被滚屏动作中断UI进程，则补充执行
                // setTimeout(function(){
                //     if (isTransitionEnd) return;
                //     isTransitionEnd = null;
                //     transitionEndCallback();
                // }, 600);

                me.currentZindex -= 2;

                viewEl.style.webkitTransition = 'all 400ms ease';// 300ms';
                viewEl.style.webkitTransform = 'scale(1)';
                // activeEl.style.webkitTransform = 'translate(0px, -' + moveHeight + 'px) translateZ(0px)';
                // viewEl.style.opacity = '1';

                // viewEl.style.position = 'absolute';
                // viewEl.style.top = moveHeight + 'px';
                maskEl.style.webkitTransition = '';
                if(me.scrollBack) {
                    me.scrollBack = false;
                } else {
                    maskEl.style.opacity = MaxOpacity;
                }
                setTimeout(function(){
                    maskEl.style.webkitTransition = 'opacity 400ms ease';
                    maskEl.style.opacity = '0';
                })

                activeEl.style.webkitTransition = 'all 400ms ease';
                activeEl.style.webkitTransform = 'translateY(' + BodyHeight + 'px) translateZ(0)';//0px)';

                view.onload && view.onload.call(me);
                if(NoOverflowScrolling) {
                    setTimeout(function(){
                        view.iscroll.refresh();  
                    }, 0)
                } else {
                    me.dragObject.stop();
                }

                // me.currentViewEl = viewEl;
                if(this.viewStack.length > 1) {
                    me.previousViewEL = document.getElementById(this.viewStack[this.viewStack.length - 2].id);
                }
            }

            activeView.onhide && activeView.onhide.call(me);
            this.activeViewId = view.id;
        },

        initView : function(id){
            if(document.getElementById(id)) {
                if(NoOverflowScrolling) {
                    addIScroll(this.viewList[id]);
                }
                this.activeViewId = id;
                this.viewList[id].oninit.call(this);
                this.viewList[id].onload && this.viewList[id].onload.call(this);
            } else {
                this.load(id, true);
            }
            this.viewStack.push(this.viewList[id]);
        }

    })

    return iApp
})