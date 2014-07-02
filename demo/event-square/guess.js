define(function(require, exports, modules) {
    var $ = Zepto
    ,   scrolling = false
    ,   Resolution = ''
    ,   ua = window.navigator.userAgent
    ,   isAndroid = (/Android/i).test(ua)
    ,   uidIndex = LaiWang.base.token.indexOf('_')
    ,   uid = LaiWang.base.token.substr(uidIndex + 1)
    ,   data_source_rank = 'http://api.laiwang.com/v2/internal/event/eventTop2.jsonp'
    ,   data_source_guess = 'http://api.laiwang.com/v2/internal/event/eventFlock.jsonp?size=20&uid=' + uid
    ,   TPL = '<li class="cluster-item" data-eventid="${eventId}">\
                        <div class="cluster-num">${num}<span class="arrow"></span></div>\
                        <div class="cluster-con">\
                            <img class="cluster-img" src="${src}">'+
                            '<div class="cluster-detail">'+     
                                '<p class="name">${name}</p>'+      
                                '<p class="info"><span class="count">${count}</span>人&nbsp;&nbsp;&nbsp;热度：<span class="temp">${temp}</span>°C</p>\
                            </div>\
                        </div>\
                    </li>' 

    // ,   RankPromise = $.Deferred(function(promise){
    //         $.ajax({
    //             url: data_source_rank,
    //             dataType: 'jsonp',
    //             data: {
    //                 t: new Date().getTime()
    //             },
    //             success: function(result) {
    //                 promise.resolve(result);              
    //             },
    //             error: function() {
    //                 promise.reject();
    //             }
    //         });
    //     }) 

    ,   GuessPromise = $.Deferred(function(promise){
            $.ajax({
                url: data_source_guess,
                dataType: 'jsonp',
                data: {
                    t: new Date().getTime()
                },
                success: function(result) {
                    promise.resolve(result);              
                },
                error: function() {
                    promise.reject();
                }
            });
        })   

    ,   Page = {

        initRank: function(loadPromise) {
            this.loadDataSource(this.renderView, 'rank');
        },

        initGuess : function(loadPromise){
            this.loadDataSource(this.renderView, 'guess');
        },

        loadDataSource: function(callback, model, data_source, loadPromise) { 
            var self = this;

            if(model == 'rank') {
                RankPromise.done(function(result){
                    $('#start-loading').removeClass('loading');
                    callback && callback.call(self, result, model); 
                });
            } else if (model == 'guess') {
                GuessPromise.done(function(result){
                    $('#start-loading').removeClass('loading');
                    callback && callback.call(self, result, model); 
                });
            }

        },
        renderView: function(result, model) {  
            if (result) {
                this.initClusterList(result, model);
            }
        },
        initClusterList: function(data, model) {
            var clusterList = $('.'+ model +'-list')
            ,   clusterHTML = ''
            ,   new_TPL = TPL
            ;
            if(model=="guess"){
                new_TPL = TPL.replace(/<div class="cluster-num">\${num}<span class="arrow"><\/span><\/div>/g, '');
            }else if(model=="rank"){
                if(isAndroid){
                    new_TPL = TPL.replace(/<span class="arrow"><\/span>/g, '');
                }
            }
            if (data) {
                for (var i in data) {
                    if(model=="guess"){
                        if(i < 4) {
                            continue;
                        }
                    }
                    var value = data[i]
                    ,   j = i-0+1
                    ,   src = ''
                    ;

                    src = this.handleImg(value.cover_pic);
               
                    clusterHTML = clusterHTML +
                        new_TPL.replace(/\${eventId}/g, value.event_id)
                        .replace(/\${num}/g, j)
                        .replace(/\${src}/g, src)
                        .replace(/\${name}/g, value.title)
                        .replace(/\${count}/g, value.member_num)
                        .replace(/\${temp}/g, value.temp);
                }
            }
            clusterList.html(clusterHTML);
            this.triggerCluster(".cluster-item", model);
        },
        handleImg: function(src){
            if(window.devicePixelRatio > 1){
                Resolution = '70x70';
            } else {
                Resolution = '40x40';
            }
            src = src.replace('320x480.jpg', Resolution + '.jpg'); 
            return src;
        },
        triggerCluster: function(selector, model) {
            var that = this;

            $(selector).on('click', function(e) {
                var eventId = $(this).data('eventid');
                that.openCluster(eventId);
                if (model == 'rank'){
                    LaiWang.api.ut('event_square_top_eventdetail',',event_id='+eventId);
                } else if (model == 'guess') {
                    LaiWang.api.ut('event_square_guess_eventdetail',',event_id='+eventId);
                }
            });
        },
        openCluster: function(url, code) {
            var urlString = url.toString();

            if (urlString.indexOf('.htm') > -1 || urlString.indexOf('.html') > -1 || urlString.indexOf('.php') > -1) {
                if( window['isLogout'] || LaiWang.base.version == 'Unknown' ) {
                    window.location.href = url;
                } else {
                    LaiWang.util.open({
                        type: 'web',
                        url: url
                    });
                }
            } else {
                if( window['isLogout'] || LaiWang.base.version == 'Unknown' ) {
                    window.location.href = 'http://www.laiwang.com/event/share.htm?eventId=' + url;
                } else {
                    var obj = {
                        type: 'event',
                        id: url
                    };
                    if (code) {
                        obj.code = code;
                    }
                    LaiWang.util.open(obj);
                }
            }
        }
    };

    exports.rank = function() {
        Page.initRank();
    }

    exports.guess = function() {
        Page.initGuess();
    }
});
