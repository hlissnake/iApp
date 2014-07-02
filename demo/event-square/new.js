define(function (require, exports, module) {
	var Render = require('./new/render')
	,	Event = require('./new/event')
	,	Detect = require('./common/scrollDetect.js')
    ,	newuserDetectPromise = require('./mods/newuser-detect').init()
    ,	Popup = require('./new/popup')
	;

	// 数据接口，根据Android版本来判断是否使用Jsbrigde 还是原生Jsonp
	var IO
	,	isNativeIO = false
	;
	if(LaiWang.base.version == 'Unknown') {
		IO = $.ajax;
	} else if( !LaiWang.util.versionRequirement('5.1.0') && LaiWang.base.android ) {
    	IO = $.ajax;
    } else {
    	isNativeIO = true;
    	IO = LaiWang.api.ajax;
    }

    // var CityEventPromise = $.Deferred(function(promise){
    // 	IO({
    // 		url : 'http://m.laiwang.com/market/laiwang/newbie-data.php',
    // 		dataType : isNativeIO ? '' : 'jsonp',
	   //      data : {
	   //      	t : +new Date
	   //      },
    //     	cache : false,
	   //      success : function(data){
	   //      	promise.resolve(data);
	   //      },
	   //      error : function(){
	   //      	promise.reject();
	   //      }
    // 	})
    // });

    // 页面数据 Promise
	var DataPromise = $.Deferred(function(promise){
		IO({
	        url : 'http://m.laiwang.com/go/rgn/laiwang/event-square-data/v5.php',//
	        dataType : isNativeIO ? '' : 'jsonp',
	        data : {
	        	'_' : +new Date
	        },
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

	var Abtest = false;
	// 推荐扎堆接口 Promise
	var EventFlockPromise = $.Deferred(function(promise){
		// 从客户端Token中获取用户UID
		var uidIndex = LaiWang.base.token.indexOf('_')
		,	uid = LaiWang.base.token.substr(uidIndex + 1)
		,	lastU = uid.substr(uid.length - 1)
		,	API_URL = 'http://api.laiwang.com/v2/internal/event/eventFlock2.jsonp?uid='
		;
		// // ABTest，针对1、6用户推荐帖子内容
		// if (uid == '11158519' || lastU == '1' || lastU == '6') {
		// 	// API_URL = 'http://search.laiwang.com//post_rec_new.php?b=0&c=5&u='; //10.232.42.188
		// 	Abtest = true;
		// 	$('#recommend').css('min-height', 400);
		// // } else {
		// // 	API_URL = 'http://api.laiwang.com/v2/internal/event/eventFlock.jsonp?uid=';
		// }

		$.ajax({
			url : API_URL + uid,
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
	var loadEventsData = function(eventId){
		return $.Deferred(function(promise){
	        $.ajax({
	            url : 'http://api.laiwang.com/v2/internal/event/list.jsonp',
	            data : {
	            	event_ids : eventId.join(',')
	            },
	            dataType : 'jsonp',
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

	function renderRecommend(eventData, eventDataLength){

		EventFlockPromise.done(function(flockData){
			// for (var j = 0; j < 4; j++) {
	  		//    eventId.push(flockData[j]['event_id']);
	  		// }
	        // 加载完毕 UT 埋点
            LaiWang.api.ut('event_plaza_load_finish');
		    var eventList = [];

		    // if(eventData && eventData.length > 0) {
		    // 	eventList = eventData.concat(flockData.slice(0, 5 - eventDataLength));
		    // } else {
		    	eventList = flockData.slice(0, 5 - eventDataLength);
		    // }
		    // if(Abtest) {
		    	Render.recommendFeed(eventList);
		  //   } else {
				// Render.recommend(eventList);
		  //   }
		});
	}

	$('#start-loading').removeClass('loading');
	Render.skeleton();

	DataPromise.done(function(data){

		clearTimeout(window.PageLoading);

        // 弹幕资源位模块
		Popup.init(data.popupJson);

		var eventId = []
		,	recommendJson = data.recommendJson
		,	len = recommendJson.length || 0
		;
		for (var j = 0; j < len; j++) {
            eventId.push(recommendJson[j].eventId);
        }

		// if( Abtest || eventId.length == 0) {
			renderRecommend([], 0);
		// } else {
		// 	var eventsPromise = loadEventsData(eventId);
		// 	eventsPromise.done(function(eventData){
		// 		var eventDataLength = eventData.length;
		// 		for(var i = 0; i < eventDataLength; i++) {
		// 			var ed = eventData[i];
		// 			ed['title'] = recommendJson[i].title;
		// 			ed['feedId'] = recommendJson[i].feedId;
		// 			ed['userId'] = recommendJson[i].userId;
		// 			ed['type'] = 'manual';
		// 		}
		// 		renderRecommend(eventData, eventDataLength);
		// 	});
		// }

		// 渲染 Banner 区块
		Render.banner(data.bannerJson);
		Render.smallBanner(data.smallBannerJson);

		$('#class-list').height(76 * (Math.ceil(data.categoryJson.length / 2)));
		Detect.add('#hot-class', function(){
			// 渲染 热门分类 区块
			Render.category(data.categoryJson);
		});

		// Scroll滚动检测启动
		Detect.init();

        // 事件绑定
		Event.init();

	});

	// Join city events using Geolocation 
	newuserDetectPromise.done(function(){
		var CitiesPromise = $.Deferred(function(promise){
			$.ajax({
		        url : 'http://m.laiwang.com/market/laiwang/newbie-data.php',//
		        dataType : 'jsonp',//isNativeIO ? '' : 
		        data : {
		        	'_' : +new Date
		        },
		        success : function(data){
		        	promise.resolve(data);
		        },
		        error : function(){
		        	promise.reject();
		        }
		    });
		    return promise;
		});

		// if (LaiWang.base.android) {
			// var androidGeolocationSuccess = false;
			// if (window.navigator.geolocation){
		 //    	window.navigator.geolocation.getCurrentPosition(function(position){
			// 		androidGeolocationSuccess = true;
			// 		CitiesPromise.done(function(data){
			// 			getCity(data, position.coords.longitude, position.coords.latitude); //
			// 		});
			// 	}, function(){
			// 		CitiesPromise.done(function(data){
			// 			getCity(data);
			// 		});
			// 	});
			// 	setTimeout(function(){
			// 		if (androidGeolocationSuccess) return;
			// 		CitiesPromise.done(function(data){
			// 			getCity(data);
			// 		});
			// 	}, 3000);
		 //    } else {
				CitiesPromise.done(function(data){
					getCity(data);
				});
		    // }
		// } else {
		//  	LaiWang.util.connect({
		//  		fn : 'requestLocationInfo',
		//  		param: LaiWang.base.token,
		//  		callback : function(position){
		//  			CitiesPromise.done(function(data){
		// 				getCity(data, position.coords.longitude, position.coords.latitude); //
		// 			});
		//  		}
		//  	});
		// }
	});

    function getCity(data, longitude, latitude){ //alert(longitude);
    	var GeolocationURL = 'http://api.laiwang.com/v2/event/mobile/number/location.jsonp';
    	var params = {
    		access_token : LaiWang.base.token
    	};
    	if (longitude && latitude) {
    		params.longitude = longitude;
    		params.latitude = latitude;
    	}
		$.ajax({
			url : GeolocationURL,
			dataType : 'jsonp',
			data : params,
			success : function(cityData){
				var city = cityData.value
				,	events = []
				,	cities = data.citiesJson
				,	defaultEvents = data.eventsJson
				;

				for(var i = 0, len = cities.length; i < len; i++) {
					if(cities[i].cityName == city) {
						events.push(cities[i].eventId);
					}
				}
				if(events.length == 0) { //alert('unmatch');
					var startIndex = Math.floor( Math.random() * (defaultEvents.length - 3) );
					for(var len = startIndex + 3; startIndex < len; startIndex++) {
						events.push(defaultEvents[startIndex].eventId);
					}
					LaiWang.api.ut('event_plaza_city_unmatch', ',event_id=' + events.join(':'));
				} else {
					LaiWang.api.ut('event_plaza_city', ',city=' + city);
				}
				joinEvents(events);
			}
		});
    }

    function joinEvents(eventIds){
		$.ajax({
	        url:"http://api.laiwang.com/v2/event/apply/for/newbie.jsonp",
	        data:{
	            eventIds : eventIds.join(','),
	            access_token : LaiWang.base.token
	        },
	        dataType:'jsonp',
	        success:function(res){
	            try{
	                window.localStorage.setItem('newUserJoinEvent','yes'); //alert('joined');
	            } catch(ev) {
	                // do nothing
	            }
	        }
	    });
    }

	if(LaiWang.util.versionRequirement('4.5.0')){
		var checkinUrl = isNativeIO ? 'http://api.laiwang.com/v2/internal/regis/index.json' : 'http://www.laiwang.com/apih5/regis/index';
	    IO({
	        url:checkinUrl,
	        data:{
	            size:10,
	            access_token : LaiWang.base.token
	        },
	        dataType : isNativeIO ? '' : 'jsonp',
	        cache:false,
	        success:function(res){
	            if(res && res.isRegistration){
	                $('#hasCheckin').show();
	                $('#hasCheckin').html('连续签到' + res.continueNum + '天')
	            }
	        },
	        error : function(res){
	            //to do
	        }
	    });
	}
})