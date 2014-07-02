define(function (require, exports, module) {
	var Slider = require('../common/slider')
	;

	var BodyWidth = document.body.getBoundingClientRect().width
    ,	Resolution
    ,	FeedResolution
    ,	ClassResolution
    ;
    if(window.devicePixelRatio > 1){
        Resolution = '70x70';
        FeedResolution = '160x160'
        ClassResolution = '_90x90';
    } else {
        Resolution = '40x40';
        FeedResolution = '100x100'
        ClassResolution = '_50x50';
    }

    function loadImg(img, isBackGround){
        var el = img[0];
        if (!isBackGround) {
	        var loading = $('<div class="image-loading"></div>')
	        img.after(loading);
	    }
        var timg = new Image();

        timg.onload = function(){
            if (isBackGround) {
            	el.style.backgroundImage = 'url(' + timg.src + ')';
            } else {
            	loading.remove();
            	el.src = timg.src;
            }
            el.style.webkitTransition = 'opacity 0.5s ease';
            el.style.opacity = '1';
            loading = img = el = timg = timg.onload = timg.onerror = null;
        };
        timg.onerror = function () {
            loading = img = el = timg = timg.onload = timg.onerror = null;
        };
        timg.src = img.data('src');
    }

    // Banner Slider 对象
	var BannerSlider;

	// banner渲染
	function renderBanner(data) {
		var html = []
		,	len = data.length
		,	item
		,	src
		;
		if ( len > 1) {
			for (var i = 0; i < len; i++) {
				item = data[i];
				src = getImgUrl(item.img);
				html.push('<div class="banner-item" data-index="' + (i+1) + '" data-event="'+ (item.eventId || '') +'" data-href="'+ (item.href || '') + '" data-feed="' + item.feedId + '" data-user="' + item.userId + '">\
		                    <img data-src="'+ src +'">\
			             </div>');
			 	// BannerSlider.masterPages[i].appendChild($(html)[0])
			}
			// $('#banner-list').append(html);

			BannerSlider = new Slider({
				el : '#banner-slider',
				items : html,
				interval : 5000,
				loadClass : 'image-loading'
			});

			// Native Bridge Event
			document.addEventListener('pause', function(){
				BannerSlider.stop();
			});

			document.addEventListener('resume', function(){
				BannerSlider.resume();
			});

		} else {
			item = data[0];
			src = getImgUrl(item.img);
			html = '<div class="banner-item" data-index="1" data-event="'+ (item.eventId || '') +'" data-href="'+ (item.href || '') + '" data-feed="' + item.feedId + '" data-user="' + item.userId + '">\
		                    <img data-src="'+ src +'" style="opacity: 0">\
			             </div>';
			$('#banner-slider').append(html);
			loadImg($('#banner-slider img'));
		}
		// $('#banner-list').append(html);
		$('#banner-slider').css('opacity', 1);
	}

	function renderSmallBanner(data){
		var smallBanner = $('#smallBanner')
		,	html = ''
		,	item
		,	src
		;
		for( var i in data) {
			item = data[i];
			src = getImgUrl(item.img);
			html += '<div' + (item.isCheckin ? ' id="checkin-icon"' : '') + ' class="banner-item" data-index="small_' + (i*1+1) + '" data-event="'+ (item.eventId || '') +'" data-href="'+ (item.href || '') + '" data-feed="' + item.feedId + '" data-user="' + item.userId + '">\
	                    <img src="'+ src +'" data-src="'+ src +'">\
		             </div>';
		}
		smallBanner.html(html);
		$('.banner-item', smallBanner).css('width', BodyWidth * 288 / 640 );
		// smallBanner.css('opacity', 1);
	}

	// 渲染扎堆类型
	function renderEvent(res, i) {
		var subHtml
		,	src = res.cover_pic
		;
	    src = src.replace('320x480.jpg', Resolution + '.jpg');
		subHtml = 
		'<li class="recommend-item border border-bottom clearfix" data-type="' + res.type + '" data-index="' + (i+1) + '" data-id="'+ res.event_id +'" data-feed="' + res.feedId + '" data-user="' + res.userId + '">\
			<img class="img" src="'+ getImgUrl(src) +'" alt="">\
			<div class="recommend-detail">\
				<p class="summary">'+ (res.title || '') +'</p>\
				<p class="info"><span class="number">'+ res.post_num +'</span>帖  热度：<span class="temp">'+ res.temp +'</span>°C</p>\
			</div>\
		 </li>';
		return subHtml;
	}

	var Video = 'isVideo'
	,	Audio = 'isAudio'
	,	MultiPics = 'isMulti'
	;
	// 分享帖子附件中的数据，判断当前是否视频、音频、图片
	// function analysisAttachment(attachment){
	// 	var type, thumbnail, item
	// 	,	isVideo = false
	// 	,	isAudio = false
	// 	,	isSinglePhoto = false
	// 	,	result = {}
	// 	;
	// 	for (var i = 0, len = attachment.length; i < len; i++) {
	// 		item = attachment[i];
	// 		type = item.type;
	// 		thumbnail = item.thumbnail;

	// 		if (type == 'video') {
	// 			isVideo = true;
	// 			result.type = Video;
	// 			break;
	// 		} else if (type == 'audio' || type == 'music') {
	// 			isAudio = true;
	// 			result.type = Audio;
	// 			break;
	// 		}
	// 	}
	// 	if (!isAudio && !isVideo) {
	// 		for (var i = 0, len = attachment.length; i < len; i++) {
	// 			item = attachment[i];
	// 			type = item.type;
	// 			thumbnail = item.thumbnail;

	// 			if (type == 'photo') {
	// 				// 为了视觉样式更美观，多图模式暂时去掉，只返回附件列表中一张photo
	// 				// if(isSinglePhoto == true) {
	// 				// 	if( !(result.src instanceof Array) ) {
	// 				// 		result.src = [result.src];
	// 				// 	}
	// 				// 	if(result.src.length >= 4){
	// 				// 		break;
	// 				// 	}
	// 				// 	result.src.push(thumbnail);
	// 				// 	result.type = MultiPics;
	// 				// } else {
	// 				// 	isSinglePhoto = true;
	// 					result.type = false;
	// 					result.src = thumbnail;
	// 					break;
	// 				// }
	// 			}
	// 		}
	// 	}

	// 	return result;
	// }

	// 渲染帖子类型
	function renderFeed(res, i) {
		var subHtml = ''
		// ,	attachmentRes = analysisAttachment(res.attachment)
		,	attachmentType = res.postType //attachmentRes.type
		;
		if(attachmentType == 'video') {
			// res.postPic = 'http://gtms04.alicdn.com/tps/i4/TB1HR3uFXXXXXb6bFXXcxGJ1pXX-108-108.jpg';
			res.icon = 'video';
			res.defaultContent = '精彩视频快来看，猛搓扎堆速围观！';
			subHtml = singleFeed(res, i);
		} else if (attachmentType == 'audio' || attachmentType == 'music') {
			// res.postPic = 'http://gtms03.alicdn.com/tps/i3/TB1tsvzFpXXXXajbpXXcxGJ1pXX-108-108.jpg';
			res.icon = 'audio';
			res.defaultContent = '来听听他们倾述了什么...';
			subHtml = singleFeed(res, i);
		// } else if (attachmentType == MultiPics) {
		// 	res.src = attachmentRes.src;
		// 	subHtml = multiFeed(res, i);
		} else if (attachmentType == 'link' || attachmentType == 'text' || attachmentType == 'photo') {
			res.defaultContent = '又有人晒图了，猛搓扎堆速围观！';
			// res.src = attachmentRes.src;
			subHtml = singleFeed(res, i);
		}

		return subHtml;
	}

	// 单图帖子，包括视频、音频
	function singleFeed(res, i){
		var subHtml, src = res.postPic;
	    src = src.replace('200x200.jpg', FeedResolution + '.jpg');
		subHtml = 
		'<li class="recommend-item feed border border-bottom clearfix" data-index="' + (i+1) + '" data-id="'+ res.event_id +'">\
			' + (src ? '<div class="img" data-src="'+ getImgUrl(src) +'"></div>' : '') + '\
			' + (res.icon ? '<div class="' + res.icon + '"></div>' : '') + '\
			<div class="recommend-detail' + (src ? '' : ' no-pic') + '">\
				<p class="summary">'+ (res.postContent || res.defaultContent) +'</p>\
				<p class="info">来自 <span>' + res.title + '<span></p>\
			</div>\
		 </li>';
		 return subHtml;
	}

	// // 单图帖子，包括视频、音频
	// function singleFeed(res, i){
	// 	var subHtml, src = res.src;
	//     src = src.replace('200x200.jpg', FeedResolution + '.jpg');
	// 	subHtml = 
	// 	'<li class="recommend-item feed clearfix" data-index="' + (i+1) + '" data-feed="' + res.post_id + '" data-user="111601">\
	// 		' + (src ? '<img src="'+ getImgUrl(src) +'" alt="">' : '') + '\
	// 		<div class="recommend-detail' + (src ? '' : ' no-pic') + '">\
	// 			<p class="summary">'+ (res.content || res.defaultContent) +'</p>\
	// 			<p class="info">来自 ' + res.author + '</p>\
	// 		</div>\
	// 	 </li>';
	// 	 return subHtml;
	// }

	// 多图帖子，最多四张图片
	// function multiFeed(res, i){
	// 	var imgHtml = ''
	// 	,	pics = res.src
	// 	,	len = pics.length > 4 ? 4 : pics.length
	// 	;
	// 	imgHtml = '<div class="pics-box">'
	// 	for(var i = 0, src; i < len; i++) {
	// 		src = pics[i].replace('200x200.jpg', FeedResolution + '.jpg');
	// 		imgHtml += '<img class="img" src="'+ getImgUrl(src) +'" alt="">'
	// 	}
	// 	imgHtml += '</div>'

	// 	var subHtml = 
	// 	'<li class="recommend-item feed clearfix" data-index="' + (i+1) + '" data-feed="' + res.post_id + '" data-user="11801">\
	// 		<div class="multiPics">\
	// 			<p class="summary">'+ (res.content || res.defaultContent) +'</p>' + imgHtml + '\
	// 			<p class="info">来自 ' + res.author + '</p>\
	// 		</div>\
	// 	</li>';
	// 	return subHtml;
	// }

	// 官方推荐扎堆
	function renderRecommend(data, isFeed) {
		var html = ''
		,	subHtml
		;
		for (var i = 0, len = data.length; i < len; i++) {
			var item = data[i];
			if (isFeed) { //item.attachment) {
				subHtml = renderFeed(item, i);
			} else {
				subHtml = renderEvent(item, i);
			}
			html += subHtml; 
		}
		$('#recommend-list').html(html);
		$('#recommend-list').css('opacity', 1);
		$('#recommend-loading').remove();
		if(isFeed) {
			$('#recommend-list .img').each(function(i, img){
				loadImg($(img), true);
			});
		}
	}

	function renderCategory(data){
		var html = ''
		,	len = data.length
		;
		for (var i = 0; i < len; i++) {
			var res = data[i]
			,	src = res.img
			;
	        src = src + ClassResolution + '.jpg';
			html += 
			'<li class="class-item border border-bottom clearfix" data-type="'+ res.typeId +'">\
				<img src="'+ getImgUrl(src) +'" alt="">\
				<div class="class-detail">\
					<p class="summary">'+ (res.title || '') +'</p>\
					<p class="info">'+ res.summary +'</p>\
				</div>\
			 </li>';
		}
		$('#class-list').html(html);
		$('#class-list').css('opacity', 1);
	}

	exports.banner = function (bannerJson) {
		renderBanner(bannerJson);
	}

	exports.smallBanner = function (smallBannerJson) {
		renderSmallBanner(smallBannerJson);
	}

	exports.recommend = function(recommendJson){
		renderRecommend(recommendJson, false);
	}

	exports.recommendFeed = function(recommendFeedJson) {
		renderRecommend(recommendFeedJson, true);
	}

	exports.category = function(categoryJson){
		renderCategory(categoryJson);
		// Detect.init();
	}

	exports.skeleton = function(){

		$('#banner-slider').css('height', BodyWidth * 248 / 640);
		$('#smallBanner').css('height', BodyWidth * 120 / 640 + 8)
		$('#main-view').show();

	}
})