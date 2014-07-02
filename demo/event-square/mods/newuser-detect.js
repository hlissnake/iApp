
define(function(require,exports,module){

    exports.init = function(){

//    window.location.href='http://demo.laiwang.com/lw/m/src/page/event-guide/demo/index.html?access_token='+LaiWang.base.token;
        // 新人跳转到新人引导页
        var lastIdNum = Number(LaiWang.base.token.slice(-1));
        var linePos = LaiWang.base.token.indexOf('_') || 0;
        var uid = LaiWang.base.token.slice(linePos+1);
        var isNewUserKey = 'isNewUser'+uid;

        // 改造成Promise模式，来管理页面数据请求模块的 并行异步过程
        var Promise = $.Deferred(function(promise){

            if(!/fromnewuserpage=true/.test(window.location.href)){ // 如果从新人广场页跳转过来的，不再跳转，否则死循环
                var isNotNewUser = false;
                try{
                    isNotNewUser = !!(window.localStorage.getItem(isNewUserKey) === 'no');
                }catch(e){

                }
                if(!isNotNewUser){
                    LaiWang.api.ut("event-act-start-query");
                    $.ajax({
                        url:"http://api.laiwang.com/v2/event/my/status.jsonp",
                        data:{
                            "access_token":LaiWang.base.token
                        },
                        dataType:'jsonp',
                        timeout:'8000',
                        success:function(data){
                            if(data.isEventNewbie===true){
                                try{
                                    window.localStorage.setItem(isNewUserKey,'yes');
                                }catch(ev){
                                    // do nothing
                                }
                                LaiWang.api.ut("event_plaza_eventnew");
                                promise.resolve();
                            }else{
                                try{
                                    window.localStorage.setItem(isNewUserKey,'no');
                                }catch(ev){
                                    // do nothing
                                }
                                LaiWang.api.ut("event_act_not_newuser");
                                promise.reject();
                            }
                        },
                        error:function(data){
                            LaiWang.api.ut("event_act_api_error");
                            promise.reject();
                        }
                    })
                } else {
                    LaiWang.api.ut("event_act_localstorage_notnew");
                    promise.reject();
                }
            } else {
                promise.reject();
            }
        });

        return Promise;
    }

})