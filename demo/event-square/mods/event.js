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
                type:'event',
                id:id,
                filterType:4
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

    var Event = {
        init:function(){
            this.typeEvent();
        },

        //分类大全
        typeEvent:function(){
            doc.on('click','.type',function(e){
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
                    url = 'http://m.laiwang.com/market/laiwang/event-square-new.php?_pro_=true&showtabbar=false&showmenu=false&eventType=' + id;
                }

                // LaiWang.util.open({
                //     type: 'web',
                //     url: id,
                //     showmenu:false
                // });
                openWeb(url);
                var utName = 'event_square_type';
                LaiWang.api.ut(utName,',type_id='+id+',source='+source);
            });
        }

    }

    exports.init = function(){

        Event.init();

    }

    return exports;
});
