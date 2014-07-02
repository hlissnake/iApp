define(function (require, exports, module) {

    var srcRegexp = /(^|\?|&)source=([^&]*)($|&)/,
        s = window.location.href.match(srcRegexp),
        source = 'plaza';
    if(s){
        source = s[2];
    }

	var TOP_URL = 'http://api.laiwang.com/v2/internal/event/eventTop2.jsonp'
	,	CurrentType = ''
	,	RanklistMap = {}
	,	Resolution
   	,	TPL = 
   		'<li class="cluster-item" data-eventid="${eventId}">\
            <div class="cluster-num">${num}<span class="arrow"></span></div>\
            <div class="cluster-con">\
                <img class="cluster-img" src="${src}">\
                <div class="cluster-detail">\
                    <p class="name">${name}</p>\
                    <p class="info"><span class="count">${count}</span>人&nbsp;&nbsp;&nbsp;热度：<span class="temp">${temp}</span>°C</p>\
                </div>\
            </div>\
        </li>'
    ;
	if(LaiWang.base.android){
        TPL = TPL.replace(/<span class="arrow"><\/span>/g, '');
    }
    if(window.devicePixelRatio > 1){
        Resolution = '70x70';
    } else {
        Resolution = '40x40';
    }

    // 页面数据 Promise
	var DataPromise = $.Deferred(function(promise){
		$.ajax({
	        url : 'http://m.laiwang.com/go/rgn/laiwang/event-square/v4.php',
	        dataType : 'jsonp',
        	cache : false,
	        success : function(data){
	        	promise.resolve(data);
	        },
	        error : function(){
	        	promise.reject();
	        }
	    });
	    return promise;
	});
		
	// 扎堆详情数据接口 Promise
	var loadRank = function(from, type){
		var params = {}; 
		if (from) {
			params['from'] = from;
		} else if (type) {
			params['type'] = type;//encodeURIComponent(type);
		}
		return $.Deferred(function(promise){
	        $.ajax({
	            url : TOP_URL,
	            dataType : 'jsonp',
	            data : params,
        		cache : false,
	            success : function(data){
	            	promise.resolve(data);
	            },
		        error : function(){
		        	promise.reject();
		        }
	        });
		    return promise;
		});
	}

	// 预加载上升榜数据内容
	var newHotPromise = loadRank('newHot');
	var allRankPromise = loadRank('all');

	function initHotEvent(){
		var categoryList = $('#hot-view .category-list')
		,	categoryItems = $('#hot-view .category-list li')
		,	categoryTab = $('#hot-view .category-tab')
		,	tabItems = $('#hot-view .rank-tab li')
		;
		$('#hot-view .rank-tab').on('click', 'li', function(e){
			var me = $(this);

			if (me.hasClass('category-tab')) {
				categoryList.toggleClass('show');
			} else if (me.hasClass('first')) {
				categoryList.removeClass('show');
				if(CurrentType != 'all') {
					renderContext(RanklistMap[ 'all' ]);
					CurrentType = 'all';
				}
			}
			if ( !me.hasClass('current') ) {
				tabItems.removeClass('current');
				me.addClass('current');
			}
		})

		categoryList.on('click', '.title-item', function(e){
			var type = $(this).data('type')
			,	data = RanklistMap[ type ]
			;
			categoryItems.removeClass('selected');
			$(this).addClass('selected');
			categoryTab.text(type);
			categoryList.removeClass('show');

			CurrentType = type;

			if (data) {
				renderContext(data);
			} else {
				$('#start-loading').addClass('loading');
        		$('#rank-list').css('opacity', 0);
        		
				var rankDataPromise = loadRank('', type);
				rankDataPromise.done(function(rankData){
					$('#start-loading').removeClass('loading');
					RanklistMap[type] = rankData;
					renderContext(rankData);
				});
			}

		});
	}

	function initEvent(){

		$('#rank-list').on('click', '.cluster-item',  function(e) {
            var eventId = $(this).attr('data-eventid');

            LaiWang.api.ut('event_square_top_eventdetail',',event_id=' + eventId + ',source=' + source + ',typeid=' + CurrentType);

            if (eventId.indexOf('.htm') > -1 || eventId.indexOf('.html') > -1 || eventId.indexOf('.php') > -1) {
                if( LaiWang.base.version == 'Unknown' ) {
			        window.location.href = eventId;
			    } else {
	                LaiWang.util.open({
	                    type: 'web',
	                    url: eventId
	                });
			    }
            } else {
                if( LaiWang.base.version == 'Unknown' ) {
			        window.location.href = 'http://www.laiwang.com/event/share.htm?eventId=' + eventId;
			    } else {
	                LaiWang.util.open({
	                    type: 'event',
	                    id: eventId,
                		filterType : 4
	                });
	            }
            }
        });
	}

	function renderSkeleton(loadPromise){
		var view = $('#rank-view');
        view.show();
		// // 扎堆列表 iScroll
  //       RankScroller = new IScroll('#rank-scroller');
  //       // 分类侧边栏 iScroll
  //       new IScroll('#category-scroller');
	}

	function renderCategory(data){
        var categoryList = $('#hot-view .category-list')
        ,	html = ''
        ;
        if (data) {
            for (var i in data) {
                var value = data[i]
                ,   j = i - 0 + 1
                ,   src = ''
                ;
                html += '<li class="border border-bottom title-item" data-from="' + (value.from || '') + '" data-type="' + value.name + '" ><span>' + value.name + '</span></li>'
            }
        }
        categoryList.html(html);
	}

	function renderContext(data){
        var clusterList = $('#rank-list')
        ,	html = ''
        ;
        if (data) {
            for (var i in data) {
                var value = data[i]
                ,   j = i - 0 + 1
                ,   src = ''
                ;
            	src = value.cover_pic.replace('320x480.jpg', Resolution + '.jpg'); 
                html += TPL.replace(/\${eventId}/g, value.event_id)
                    .replace(/\${num}/g, j)
                    .replace(/\${src}/g, src)
                    .replace(/\${name}/g, value.title)
                    .replace(/\${count}/g, value.member_num)
                    .replace(/\${temp}/g, value.temp);
            }
        }
        clusterList.html(html);
        clusterList[0].style.opacity = '1';
        // RankScroller.refresh();
        // RankScroller.scrollTo(0,0);
	}

	exports.rise = function(){
		newHotPromise.done(function(data){
			$('#start-loading').removeClass('loading');
			// RanklistMap['newHot'] = data;
			renderContext(data);
		});

        // 事件绑定
		initEvent();
	}

	exports.hot = function(){
		DataPromise.done(function(category){
			$('#start-loading').removeClass('loading');

			var categoryData = category.CategoryJson.slice(0,9);

			// categoryData.unshift({
			// 	from : 'all',
			// 	name : '全部'
			// });
			// categoryData.unshift({
			// 	from : 'newHot',
			// 	name : '上升榜'
			// });

			renderCategory(categoryData);
			// renderSkeleton();

			allRankPromise.done(function(data){
				CurrentType = 'all';
				RanklistMap['all'] = data;
				renderContext(data);
			});

	        // 事件绑定
			initEvent();
			initHotEvent();
		});
	}
})