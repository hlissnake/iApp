define(function(require, exports, module){

	var LocalStorageDateKey = 'event-square-popup-time'
	,	CollapseTimeoutId // 弹幕收起计时器
	,	BodyHeight = $(window).height()
	;

    var Cache = {
	    set: function(key, value) {
	        try {
	            if (window.localStorage) {
	                window.localStorage.setItem(key, value);
	            }
	        } catch (e) {
	            return false;
	        }
	    },
	    get: function(key) {
	        try {
	            if (window.localStorage) {
	                return window.localStorage.getItem(key);
	            }
	        } catch (e) {
	            return false;
	        }
	    },
	    end: 0
	};

	function loadImage(el, src, callback){
		var img = new Image();

        img.onload = function(){
            el.style.backgroundImage = 'url(' + src + ')';
            el = img = img.onload = img.onerror = null;
            callback();
        };
        img.onerror = function () {
            el = img = img.onload = img.onerror = null;
        };
        img.src = src;
	}

	function preventTouchEvent(e){
		e.preventDefault();
	}

	function collapsePopup(el){
		el.style.webkitTransition = 'all 0.3s ease-out';
		el.style.webkitTransform = 'translateY(-' + ($.os.ios ? '100%)' : BodyHeight + 'px)');
		document.body.removeEventListener('touchmove', preventTouchEvent);
	}

	function collapseTimtout(el, internalTime){
		return setTimeout(function(){
			collapsePopup(el);
		}, internalTime || 3000);
	}

	function dragMoveEvent(DragCallback, CancelCallback){
		var popup = document.getElementById('popup')
		,	aleadyTop = false
		,	startY
		,	DragThershold = 80
		,	OverThershold = false
		;
		popup.addEventListener('touchstart', function(e){
			var touch = e.touches.length ? e.touches[0] : e.changedTouches[0];
            startY = touch.pageY;
            popup.style.webkitTransition = 'none';
            CollapseTimeoutId && clearTimeout(CollapseTimeoutId);
        });

		popup.addEventListener('touchmove', function(e){
			var touch = e.touches.length ? e.touches[0] : e.changedTouches[0];
			if(startY > touch.pageY) {
				var moveDistance = touch.pageY - startY;
				popup.style.webkitTransform = 'translateY(' + moveDistance + 'px)';

				if(-moveDistance >= DragThershold) {
					OverThershold = true;
				} else {
					OverThershold = false;
				}
			}
		});

		popup.addEventListener('touchend', function(e){
			if(OverThershold) {
				DragCallback();
				OverThershold = false;
			} else {
				CancelCallback();
				popup.style.webkitTransition = 'all 0.2s ease-out';
				popup.style.webkitTransform = 'translateY(0)';
			}
		});
	}

	function showPopup(data){

		var popupEl = $('<div id="popup" class="collapse" data-event="' + data.eventId + '" data-href="' + data.href + '"></div>')
		,	el = popupEl[0]
		;
		$(document.body).append(popupEl);

		// 加载背景图片，完成后在继续后续操作
		loadImage(el, data.img, function(){
			// el.classList.remove('collapse');
			el.classList.add('drop-down');
			CollapseTimeoutId = collapseTimtout(el, 4000);
			// el.addEventListener('webkitAnimationEnd', function(){});
			document.body.addEventListener('touchmove', preventTouchEvent, false);
		});

		dragMoveEvent(function(){
			collapsePopup(el);
		}, function(){
			CollapseTimeoutId = collapseTimtout(el)
		});

		popupEl.on('click', function(e){
			collapsePopup(el);
			e.preventDefault();
            var _this = $(this)
            ,   eventId = _this.data('event')
            ,   href = _this.data('href')
            ;
            if (href) {
                if( window['isLogout'] || LaiWang.base.version == 'Unknown' ) {
                    window.location.href = href;
                } else {
                    LaiWang.util.open({
                        type: 'web',
                        url: href
                    });
                }
            } else if(eventId) {
                if( window['isLogout'] || LaiWang.base.version == 'Unknown' ) {
                    window.location.href = 'http://www.laiwang.com/event/share.htm?eventId=' + eventId;
                } else {
                    LaiWang.util.open({
                        type: 'event',
                        id: eventId,
                		filterType : 4
                    });
                }
            }
            LaiWang.api.ut('event_square_tanchuang_click', ',obj_id=tanchuang1');
		})
	}

	exports.init = function(popupJson){
		if(popupJson && popupJson.length > 0) {
			var now = +new Date
			,	previousDate = Cache.get(LocalStorageDateKey)
			;
			// 不支持LocalStorage时，则立即显示弹层提示
			if( previousDate == false) {
				showPopup(popupJson[0]);
				return false;
			}
			// 第一次访问本地未存储时，或者 距离上一次访问已超过24小时时
			if( previousDate == null || (previousDate && (now - previousDate >= 86400000)) ) {//
				showPopup(popupJson[0]);
				Cache.set(LocalStorageDateKey, now);
				return true;
			}
		}
	}

});