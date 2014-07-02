define(function (require, exports, module) {
	var Event = require('./mods/event')
	// ,	Detect = require('./common/scrollDetect')	
	;

	var BodyWidth = document.body.getBoundingClientRect().width

	// banner渲染
	function renderBanner (data) {
		var html = ''
		,	len = data.length
		,	startIndex = Math.floor(Math.random() * (len - 1))
		;
		for (var i = startIndex; i < startIndex + 2; i++) {
			var item = data[i];
			html += '<li class="banner-item" data-event="'+ (item.eventId || '') +'" data-href="'+ (item.href || '') +'">\
	                    <p class="summary">'+ item.title +'</p>\
	                    <img src="" data-src="'+ item.img +'" data-loaded="false">\
		             </li>';
		}
		$('#banner .banner-list').append(html);
	}	

	// 分类大全渲染
	function renderHotspot (data) {
		var html = '',
			res = [],
			width = BodyWidth * 0.3,
			node = $('#allClass ul');

		for (var i = 0, len = data.length; i < 9 && i < len; i++) {
			var item = data[i];
			html += '<li class="hotspot-item type" data-type="'+item.typeId+'" style="width:' + width +'px;height:' + width + 'px;">\
	                    <p class="summary">'+ item.name +'</p>\
	                    <img src="" data-src="'+ item.img +'" data-loaded="false" width="100%" height="100%">\
	                 </li>';
		}
		node.css('height', BodyWidth);
		node.append(html);
	}

	// 标签大全渲染
	function renderTag (data) {
		var html = '';

		for (var i = 9, len = data.length; i < len; i += 3) {
			html += 
			'<li class="classify-row">\
                <ul>';
			for (var j = i; j < i + 3 && j < len; j++) {
				html += 
				'<li class="classify-column type" data-type="'+ data[j].typeId +'"><span>'+ data[j].name +'</span></li>';
			}
			html += '</ul></li>'
		}
		//http://m.laiwang.com/market/laiwang/event-square-new.php?_pro_=true&showtabbar=false&showmenu=false&eventType=tab-
		// 
		$('#allTag ul').append(html);
	}

	// 图片加载函数
	function LoadImg(_img, src, callback) {
		// var ar = _img.data('loaded');
		if (!_img || _img.attr('data-loaded') !== "false") {
			return;
		}
		_img.css('opacity', 0);

		var loading = _img.siblings('.loading');
		loading.addClass('image-loading');

		var img = new Image();
		img.onload = function () {
			_img.animate({'opacity': 1}, 300);
			_img.get(0).src = src;
			callback && callback.call(_img);
			loading.removeClass('image-loading');
			_img.attr('data-loaded', true);
			img = img.onload = img.onerror = null;
		};
		img.onerror = function () {
			if (_img.attr('data-loaded')) {
                _img.removeAttr('data-loaded');
            }
            img = img.onload = img.onerror = null;
		};
		img.src = src;
	}

	// 批量加载图片
	function LoadImgArr(arr) {
		var list = $(arr);
		list.each(function (index, item) {
			var el = $(this);
			LoadImg(el, el.data('src'), function () {
				el.attr('data-loaded', true);
			});
		});
	}

	var DataPromise = $.Deferred(function(promise){
		$.ajax({
			url : 'http://m.laiwang.com/go/rgn/laiwang/event-square/v4.php',
			dataType : 'jsonp',
	        success : function(data){
	        	promise.resolve(data);
	        },
	        error : function(){
	        	promise.reject();
	        }
		});
		return promise;
	})

	exports.render = function () {

		// var doc = $('#doc')
		// ,	loading = $('#doc .start-loading')
		// ;

		// 渲染banner
		// DataPromise.done(function(data){
		// 	doc.show();
		// 	loading.remove();

		// 	renderBanner(data.BannerJson);
		// 	var bannerImg = $('#banner li img');
		// 	// banner 不需要滚动加载
		// 	LoadImgArr(bannerImg);
		// })

		// 渲染分类大全
		DataPromise.done(function(data){
			// doc.show();
			// loading.remove();
			$('#start-loading').removeClass('loading');
			$('#category-view .category').css('opacity', 1);
			
			renderHotspot(data.CategoryJson);
			var hotspotList = $('#allClass');
			var imgList = $('li img', hotspotList);
			LoadImgArr(imgList);
		});

		DataPromise.then(function(data){
			renderTag(data.CategoryJson);
		});

		// 渲染标签大全 滚动加载
		// Detect.add('#allTag', function () {
		// 	DataPromise.then(function(data){
		// 		renderTag(data.CategoryJson);
		// 	});
		// });
		// Detect.init();
		Event.init();

		$('#category-dragbtn').on('click', function(){
			App.back();
		})

	}
})