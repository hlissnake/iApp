/**
 * Created by guizhong on 14-3-28.
 */
define(function(require,exports,module){

    var doc = $(document)
    ,   openEvent
    ,   openWeb
    ;

    var srcRegexp = /(^|\?|&)source=([^&]*)($|&)/,
        s = window.location.href.match(srcRegexp),
        source = 'plaza';
    if(s){
        source = s[2];
    }

    // if(!$.os.ios) {
    //     alert(LaiWang.util.versionRequirement('4.5.0'));
    //     alert(LaiWang.base.version);
    // }
    if( !LaiWang.util.versionRequirement('4.5.0') && LaiWang.base.android ) {
        openEvent = function(id){
            LaiWang.api.event({
                id: id
            });
        };
        openWeb = function(url){
            window.location.href = url;
        };
    } else {
        openEvent = function(id){
            LaiWang.util.open({
                type : 'event',
                id : id,
                filterType : 4
            });
        };
        openWeb = function(url){
            LaiWang.util.open({
                type: 'web',
                url: url,
                showmenu:false
            });
        };
    }
    if ( window['isLogout'] ) {
        openEvent = function(id){
            window.location.href = 'http://www.laiwang.com/event/share.htm?eventId=' + id;
        };
        openWeb = function(url){
            window.location.href = url;
        };
    } 

    exports = {

        init : function(){
            this.banner();
            this.redirect();
            this.recommend();
            this.category();
        },

        // banner
        banner : function(){

            // 签到
            $('#checkin-icon').on('click', function(e){
                LaiWang.api.ut("event_go_checkin");
            });

            $('#main-view').on('click', '.banner-item', function(e){
                e.preventDefault();
                var _this = $(this)
                ,   eventId = _this.data('event')
                ,   href = _this.data('href')
                ,   index = _this.data('index')
                ,   feedId = _this.data('feed')
                ,   userId = _this.data('user')
                ,   utName = 'event_square_topbanner_click'
                ;
                if (feedId&&feedId!=='undefined'&&userId&&userId!=='undefined'&&LaiWang.util.versionRequirement('4.6.0')){
                    LaiWang.util.open({
                        type:'feed_detail',
                        feedId:feedId,
                        userId:userId
                    });
                    LaiWang.api.ut(utName,',event_id=' + eventId + ',obj_id=banner' + index + ',source='+source);
                } else if(eventId) {
                    LaiWang.util.open({
                        type:'event',
                        id:eventId
                    });
                    openEvent(eventId);
                    LaiWang.api.ut(utName,',event_id=' + eventId + ',obj_id=banner' + index + ',source='+source);
                } else if (href) {
                    var timestamp = +new Date;
                    openWeb(href + '&t=' + timestamp);
                    if(_this.attr('id') != 'checkin-icon') {
                        LaiWang.api.ut(utName,',href=' + href + ',obj_id=banner' + index + ',source=' + source);
                    }
                }
            });
        },

        recommend : function(){
            $('#recommend').on('click', '.recommend-item', function(e) {
                e.preventDefault();
                var _this = $(this)
                ,   index = _this.data('index')
                ,   id = _this.data('id')
                // ,   feedId = _this.data('feed')
                // ,   userId = _this.data('user')
                ,   type = _this.data('type')
                ;
                // if (feedId&&feedId!=='undefined'&&userId&&userId!=='undefined'&&LaiWang.util.versionRequirement('4.6.0')){
                //     LaiWang.util.open({
                //         type:'feed_detail',
                //         feedId:feedId,
                //         userId:userId
                //     });
                if (id) {
                    openEvent(id);
                }
                if(type != 'manual') {
                    type = 'official';
                }
                LaiWang.api.ut('event_official_recommend_click', ',event_id=' + id + ',recommend_type=' + type + ',obj_id=position' + index + ',source='+source);
            });
        },

        redirect : function(){
            $('#rise-top').on('click', function(){
                App.forward('rise-view');
                LaiWang.api.ut('event_square_top_post');
            });

            $('#hot-top').on('click', function(){
                App.forward('hot-view');
                LaiWang.api.ut('event_square_top_post');
            });

            $('#event-flock').on('click', function(){
                App.forward('guess-view');
                LaiWang.api.ut('event_square_guess');
            });
        },

        category : function(){
            // 热门分类
            $('#hot-class').on('click','li',function(e){
                e.preventDefault();
                var _this = $(this)
                ,   id = _this.attr('data-type')
                ,   url
                ;
                if (id == 'tab-fensi') {
                    url = 'http://h5.m.taobao.com/laiwang/app/event-square/fans.html';
                } else if (id == 'tab-mingxing') {
                    url = 'http://m.laiwang.com/market/laiwang/star.php';
                } else {
                    url = 'http://m.laiwang.com/market/laiwang/event-square-new.php?_pro_=true&showtabbar=false&showmenu=false&eventType=' + id + (window['isLogout'] ? '&fromlw=true' : '');
                }
                openWeb(url);
                var utName = 'event_square_feed';
                LaiWang.api.ut(utName,',type_id='+id+',source='+source);
            });
        
        	$('.category .button').on('click', function(){
                // openWeb('http://m.laiwang.com/market/laiwang/event-square/new.php');
                LaiWang.api.ut('event_official_recommend_more_click', ',source='+source);
                App.forward('category-view');
        	})
        }

    }

    return exports;
});
