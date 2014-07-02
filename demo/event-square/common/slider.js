define(function(require, exports, module){
	
    var Class = require('./class')
    ,   SwipeView = require('./swipeView')
    ;

    var windowWidth = document.body.getBoundingClientRect().width;

    function loadImg(img, loadClass){
        var el = img[0];
        // if( !loaded ) {
            var loading = $('<div class="' + loadClass + '"></div>')
            img.after(loading);
            var timg = new Image();

            timg.onload = function(){
                loading.remove();
                el.src = timg.src;
                el.style.webkitTransition = 'opacity 0.5s ease';
                el.style.opacity = '1';
                loading = img = el = timg = timg.onload = timg.onerror = null;
            };
            timg.onerror = function () {
                loading = img = el = timg = timg.onload = timg.onerror = null;
            };
            timg.src = img.data('src');
        // }
    }

    function Slider(options){
        // 轮播Banner slider
        for (var option in options) {
            if (options.hasOwnProperty(option)) 
                this[option] = options[option];
        }
        // this.bannerSlider = {};
        this.imgLoadMap = [];
        this.autoSlide = 0;
        this.slide_len = 0;
        this.scrollIndex = 0;

        this.init();
    }

    Class.extend(Slider, {

        init : function(){
            var scroller = $(this.el)
            ,   list = this.items
            ,   me = this
            ,   bannerSliderwindowWidth
            ;
            me.slide_len = list.length
            // list.width(windowWidth);
            // scroller.children('ul').width(   * me.slide_len );

            // 已经构建IScroll对象，refresh操作
            bannerSlider = new SwipeView(this.el, {
                numberOfPages: list.length
            });
            var html = '<ul class="banner-arrow-list">';

            bannerSlider.masterPages[0].innerHTML = list[list.length-1];
            for(var i = 0; i < list.length; i++) {
                html += '<li class="arrow-item' + (i == 0 ? ' active' : '') + '"></li>';
                if(i < 2) {
                    bannerSlider.masterPages[i+1].innerHTML = list[i];
                }
                this.imgLoadMap[i] = false;
            }
            html += '</ul>';
            me.sliderArrow = $(html);
            scroller.after(me.sliderArrow);

            bannerSlider.onTouchStart(function(){
                me.stop();
                me.resume();
            });
            bannerSlider.onFlip(function(e){
                var pageIndex = bannerSlider.pageIndex,
                    upcoming,
                    i;
                for (i=0; i<3; i++) {
                    var dataset = bannerSlider.masterPages[i].dataset;
                    upcoming = dataset.upcomingPageIndex;

                    if ( upcoming != dataset.pageIndex ) {
                        bannerSlider.masterPages[i].innerHTML = list[upcoming];
                        var img = $('img', bannerSlider.masterPages[i])
                        if (me.imgLoadMap[upcoming]) {
                            img.attr('src', img.data('src'));
                            img.css('opacity', 1);
                        }
                    }
                }
                var activePage = $('.swipeview-active', bannerSlider.slider)
                ,   index = activePage.data('pageIndex')
                ;
                // if ( pageIndex == dataset.pageIndex ) {
                var img = $('img', activePage);
                if( !me.imgLoadMap[pageIndex] ) {
                    loadImg(img, me.loadClass || 'image-loading');
                    me.imgLoadMap[pageIndex] = true;
                }
                // }
                $('.active', me.sliderArrow).removeClass('active');
                $('li', me.sliderArrow).eq(index).addClass('active');

            });
            // bannerSlider.onMoveOut(function(){
            //     var img = $('img', bannerSlider.masterPages[i]);
            //     // img.each(function(i, v){
            //     //     var el = $(v);
            //     loadImg(img, me.loadClass || 'image-loading');
            // })

            setTimeout(function(){
                // bannerSlider.refresh();
                me.scrollInterval();
            }, 200);

            this.bannerSlider = bannerSlider;

            var images = $('img', scroller);
            loadImg(images.eq(1), false, me.loadClass || 'image-loading');
            me.imgLoadMap[0] = true;

        },

        scrollInterval : function(){
            var me = this
            ,   interval = me.interval || 3000
            ;
            if(me.autoSlide) {
                me.autoSlide = clearTimeout(me.autoSlide);
            }
            this.autoSlide = setTimeout(function(){ //console.log('slide ' + scrollIndex);
                // me.scrollIndex++;
                // if(me.scrollIndex >= me.slide_len){
                //     me.scrollIndex = 0;
                // }
                me.bannerSlider.next();
                me.scrollInterval();
            }, interval);
        },

        stop : function(){
            clearTimeout(this.autoSlide);
        },

        resume : function(){
            this.bannerSlider && this.scrollInterval();
        }

    });

    return Slider;

})