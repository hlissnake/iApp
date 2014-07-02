define(function (require, exports, module) {
	var iApp = require('iApp/index')
	,	DragTop = require('iApp/util/drag')
	// ,	Detect = require('./common/scrollDetect.js')
	;

    require('./common/fastClick')(document.body);
	require('./common/promise');

    // 图片Url格式化方法
    window.getImgUrl = function(url){
        return url;
    }
// alert('e');
//     if(window.location.href != 'http://cdnprepub.tms.taobao.com/go/market/laiwang/event-square/index.php') {
//     	window.location.href = 'http://cdnprepub.tms.taobao.com/go/market/laiwang/event-square/index.php';
//     }

    // 探测当前环境是否支持 webp 格式
    // var detectWebpSupport = $.Deferred(function(promise){
        if ( LaiWang.base.android ) {
		// 	promise.resolve();
		// 	return promise;
		// } else {
	        var img = new Image();
	        img.onload = function(){
	            window.getImgUrl = function(url){
	                return url + '_.webp';
	            }
	            img = img.onload = img.onerror = null;
	            // promise.resolve();
	        }
	        img.onerror = function(){
	            img = img.onload = img.onerror = null;
	            // promise.resolve();
	        }
	        img.src = 'http://gtms03.alicdn.com/tps/i3/T1lxXGFSxbXXXe1I2r-1-1.png_.webp';
		}
    // });

	if($.os.ios) {
		$('#app').height(document.body.getBoundingClientRect().height - 40);
	}

    var MainNode = document.getElementById('app')
	,   DragUpNode = document.getElementById('drag-up')
	,   DragContent = document.getElementById('drag-content')
	,   MaxDistance = 90
	,   LoadCategoryModule = false
	;
	var RefreshDrag = new DragTop({

		dragEl : document.getElementById('main-view').querySelector('.app-view-content'),

		onDrag : function(e){

		  var moveDistance = Math.floor(e.dragDistance * 0.4)
		  ,	  dragEl = this.dragEl
		  ,	  offsetTop = this.offsetY
		  ;

		  MainNode.style.webkitTransform = 'translate(0, ' + moveDistance + 'px) translateZ(0)';
		  DragUpNode.style.webkitTransform = 'translate(0, ' + (moveDistance - offsetTop) + 'px) translateZ(0)';

		  if((moveDistance - offsetTop) >= MaxDistance) {
		    if(LoadCategoryModule == false) {
		      DragContent.innerHTML = '放手，是一种态度';
		      LoadCategoryModule = true;
		    }
		  } else {
		    DragContent.innerHTML = '使劲...';
		    LoadCategoryModule = false;
		  }
		},

		onDragStart : function(){
		  DragUpNode.style.webkitTransition = '';//display = 'block';
		  MainNode.style.webkitTransition = '';
		},

		onDragEnd : function(){
		  if(LoadCategoryModule) {
        	DragUpNode.classList.add('loading');
		    LoadCategoryModule = false;
		    window.location.reload(true);
		  } else {
		    DragContent.innerHTML ='使劲...';
		    MainNode.style.webkitTransition = 'all 200ms ease';
		    MainNode.style.webkitTransform = 'translate(0, 0) translateZ(0)';
		    DragUpNode.style.webkitTransition = 'all 200ms ease';
		    DragUpNode.style.webkitTransform = 'translate(0, 0) translateZ(0)';
		  }
		}

	});

	window.App = new iApp('#app', {
		backBtnCls : 'app-button-back'
		// footBar : ''
	});

	App.addView({

		id : 'main-view',

		oninit : function(){
    		if( App.useIScroll) {
				$(document.body).on('iapp-iscrollReady', function(){
					RefreshDrag.dragEl = App.getView('main-view').iscroll;
				});
			}
			require("./new");
		},

		onload : function(){
			RefreshDrag.resume();
		},

		onhide : function(){
			LaiWang.event.trigger('pause');
			RefreshDrag.stop();
		}
	});

	App.addView({

		id : 'category-view',

		cache : false,

		html:'<section class="hotspot" id="allClass">\
			    <h3>分类大全</h3>\
			    <ul class="hotspot-list"></ul>\
			  </section>\
			  <section id="allTag">\
			    <ul></ul>\
			  </section>\
			  <div class="button app-button-back">返回</div>',

		oninit : function(){
			$('#start-loading').addClass('loading');
			require.async("./category", function (Category){
				Category.render();
			});
		},

		onhide : function(){
			LaiWang.event.trigger('resume');
		}
	});

	App.addView({

		id : 'rise-view',

		cache : false,

		html : '<ul id="rank-list"></ul>\
			  	<div class="button app-button-back">返回</div>',

		oninit : function(){
			$('#start-loading').addClass('loading');
			require.async("./rank", function (module){
				module.rise();
			});
		},

		onhide : function(){
			LaiWang.event.trigger('resume');
		}

	});

	App.addView({

		id : 'hot-view',

		cache : false,

		html : '<ul class="rank-tab-list" id="rank-list"></ul>\
				<ul class="category-list"> </ul>\
				<ul class="rank-tab">\
					<li class="current first">总榜单</li>\
					<li class="category-tab">分类</li>\
				</ul>\
			  	<div class="button app-button-back">返回</div>',

		oninit : function(){
			$('#start-loading').addClass('loading');
			require.async("./rank", function (module){
				module.hot();
			});
		},

		onhide : function(){
			LaiWang.event.trigger('resume');
		}

	});

	App.addView({

		id : 'guess-view',

		cache : false,

		html : '<h3 class="rank-title">猜你喜欢</h3>\
		      	<ul class="guess-list"></ul>\
			  	<div class="button app-button-back">返回</div>',

		oninit : function(){
			$('#start-loading').addClass('loading');
			require.async("./guess", function (module){
				module.guess();
			});
		},

		onhide : function(){
			LaiWang.event.trigger('resume');
		}

	});

	App.initView('main-view');

})