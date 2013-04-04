/********************************************
 * mpui.js
 * morpheus UI Framework
 * Author : 백국경 (romeoh@uracle.co.kr)
 * Copyright © 2013 Uracle Co., Ltd. 
 * 166 Samseong-dong, Gangnam-gu, Seoul, 135-090, Korea All Rights Reserved.
 * 베타버전입니다. 버그는 romeoh@uracle.co.kr로 보고해주세요.
 *******************************************/
 
(function(g, d, w, undefined) {
var  version = "Morpheus UI 0.1.2"
	,hasTouch = 'ontouchstart' in w || false
	,startEvt = hasTouch ? 'touchstart' : 'mousedown'
	,moveEvt = hasTouch ? 'touchmove' : 'mousemove'
	,endEvt = hasTouch ? 'touchend' : 'mouseup'
	,cancelEvt = hasTouch ? 'touchcancel' : 'mouseup'
Mui = function(_selector) {
	return new Mui.fn.init(_selector);
}
 
Mui.fn = Mui.prototype = {
 
	/* 초기화 */
	init: function(_selector) {
		if (!w.isMobile) {
			w.isMobile = Mui.browser().device !== 'pc'
		}
		if (!_selector) return this;
 
		if (typeof _selector === "string") {
			this.selector = d.querySelectorAll(_selector);
			Mui.selector = _selector;
			Mui.that = this;
			return this;
		}
		if (typeof _selector === "object") {
			this.selector = d.querySelectorAll(_selector.nodeName);
			Mui.that = this;
			return this;
		}
	},
 
	/* add class */
	addClass: function(_className) {
		selector = this.selector;
		for (var i=0; i<selector.length; i++) {
			if (_className != '') {
				if (!selector[i].classList) {
					selector[i].className = selector[i].className + ' ' + _className;
					return this;
				}
				selector[i].classList.add(_className);
			}
		}
		return this;
	},
 
	/* remove class */
	removeClass: function(_className) {
		selector = this.selector;
		for (var i=0; i<selector.length; i++) {
			if (_className != '') {
				if (!selector[i].classList) {
					selector[i].className = selector[i].className.replace(_className, '');
					return this;
				}
				selector[i].classList.remove(_className);
			}
		}
		return this;
	},
 
	/* toggleClass */
	toggleClass: function(_className) {
		selector = this.selector;
		for (var i=0; i<selector.length; i++) {
			if (_className != '') {
				selector[i].classList.toggle(_className);
			}
		}
		return this;
	},
	
	/* hasClass */
	hasClass: function(_className) {
		selector = this.selector;
		for (var i=0; i<selector.length; i++) {
			if (_className != '') {
				if (!selector[i].classList) {
					if (selector[i].className.indexOf(_className) == '-1') {
						return false;
					} else {
						return true;
					}
				}
				return selector[i].classList.contains(_className);
			}
		}
	},
	
	/* CSS */
	css: function(_key, _value) {
		var  selector = this.selector
			,transScale = ''
			,transRotate = ''
			,transPos = ''
			,transX = ''
			,transY = ''
		if (_value === undefined) {
			if (_key == 'clientWidth') {
				return selector[0].clientWidth;
			} else if (_key == 'clientHeight') {
				//console.dir(selector[0].clientHeight)
				return selector[0].clientHeight;
			} else if (_key == 'x') {
				var  matrix = document.defaultView.getComputedStyle(selector[0], null).webkitTransform
					,matrixX = matrix.substr(7, matrix.length - 8).split(', ')[4];
				matrixX == undefined ? matrixX = '0px' : matrixX = matrixX + 'px'
				return matrixX;
			} else if (_key == 'y') {
				var  matrix = document.defaultView.getComputedStyle(selector[0], null).webkitTransform
					,matrixY = matrix.substr(7, matrix.length - 8).split(', ')[5];
				matrixY == undefined ? matrixY = '0px' : matrixY = matrixY + 'px'
				return matrixY;
			} else {
				style = document.defaultView.getComputedStyle(selector[0], null);
				return w['style'][_key];
			}
		} else {
			for (var i=0; i<selector.length; i++) {
				if (_key == 'scale') {
					transScale = ' scale(' + _value + ') ';
					selector[i].style['webkitTransform'] = transScale;
					return this;
				}
				if (_key == 'rotate') {
					transRotate = ' rotate(' + _value + ') ';
					selector[i].style['webkitTransform'] += transRotate;
					return this;
				}
				if (_key == 'x') {
					selector[i].style['webkitTransform'] = 'translate3d('+_value+', 0,0)';
				}
				if (_key == 'y') {
					selector[i].style['webkitTransform'] = 'translate3d(0, '+_value+', 0)';
				}
				selector[i].style[_key] = _value;
			}
			return this;
		}
	},
 
	/* get/set attributes */
	attr: function(_key, _value) {
		selector = this.selector;
		if (_value == undefined) {
			if (_key == 'checked') {
				return selector[0].checked;
			}else {
				return selector[0].getAttribute(_key);
			}
		} else {
			for (var i=0; i<selector.length; i++) {
				if (typeof _value == 'boolean') {
					eval("selector[i]."+_key+" = "+_value);
				} else if (_key == 'checked') {
					selector[i].checked = _value;
				} else {
					selector[i].setAttribute(_key, _value);
				}
			}
		}
		return this;
	},
	
	/* remove attributes */
	removeAttr: function(_key) {
		selector = this.selector;
		for (var i=0; i<selector.length; i++) {
			selector[i].removeAttribute(_key);
		}
		return this;
	},
	
	/* get/set attributes */
	val: function(_value) {
		selector = this.selector;
		if (_value == undefined) {
			return selector[0].value;
		} else {
			for (var i=0; i<selector.length; i++) {
				selector[i].value = _value;
			}
		}
		return this;
	},
 
	/* get/set data */
	data:function(_key, _value) {
		selector = this.selector;
		if (_value == undefined) {
			return selector[0].getAttribute("data-"+_key);
		} else {
			if (typeof _value === "object") {
				for (var i=0; i<selector.length; i++) {
					selector[i].setAttribute("data-"+_key, JSON.stringify(_value));
				}
			} else if (typeof _value === "string" || typeof _value === "number") {
				for (var i=0; i<selector.length; i++) {
					selector[i].setAttribute("data-"+_key, _value);
				}
			}
		}
		return this;
	},
 
	/* innerHTML */
	html: function(_value) {
		selector = this.selector;
		if (_value == undefined) {
			return selector[0].innerHTML;
		} else {
			for (var i=0; i<selector.length; i++) {
				selector[i].innerHTML = _value;
			}
		}
		return this;
	},
 
	/* text */
	text: function(_value) {
		selector = this.selector;
		if (_value == undefined) {
			return selector[0].textContent;
		} else {
			for (var i=0; i<selector.length; i++) {
				selector[i].textContent = _value;
			}
		}
		return this;
	},
 
	/* animation */
	animate: function(_option, _callback) {
		var  styleText = ""
			,time = _option.time || "1s"
			,delay = _option.delay || "0s"
			,callBack = _callback || null
			,selector = this.selector
			,obj
			,prefix = mpui.browser().prefix
			,transX = _option.x || this.css('x')
			,transY = _option.y || this.css('y')
			,transZ = _option.z || this.css('z')
			,transScale = _option.scale || ''
			,transRotate = _option.rotate || ''
			,trans3d = (_option.x != '') ? true : 
						(_option.y != '') ? true : 
						(_option.z != '') ? true : 
						(_option.scale != '') ? true : 
						(_option.rotate != '') ? true : 
						false
			

		for (var i=0; i<selector.length; i++) {
			for (var _key in _option) {
				var _value = _option[_key];
				switch (_key) {
					case 'scale':
						transScale = ' scale('+_value+') ';
					break;
					case 'rotate':
						transRotate = ' rotate('+_value+') ';
					break;
					case 'time': case 'delay':
					break;
					default:
						styleText += _key + ":" + _value + "; ";
					break;
				}
			}
			
			if (callBack) {
				this.selector[i].callback = callBack;
			}
			var style = document.defaultView.getComputedStyle(this.selector[i], null)
			if( style['position'] == "static" ){
				this.selector[i].style.position = "relative";
			}
			styleText += "-webkit-transition:all " + time + " ease " + delay + "; ";
			
			if (trans3d) {
				transX == '' ? transX = 0 : transX
				transY == '' ? transY = 0 : transY
				transZ == '' ? transZ = 0 : transZ
				styleText += '-webkit-transform:translate3d(' + transX + ', ' + transY + ', 0) ' + transScale + transRotate;
			}
			selector[i].style.cssText += styleText;

			selector[i].addEventListener("webkitTransitionEnd", this.transEnd = function(event) {
				if (!obj) {
					obj = event;
					obj.currentTarget.style['webkitTransition'] = "";
					if (callBack !== "") {
						id = "id" + Math.floor(Math.random()*1000000000) || '';
						event.currentTarget.setAttribute('data-id', id);
						if (callBack) {
							eval(callBack)(event, M('[data-id="' + id + '"]'));
							delete event.currentTarget.callback;
						}
						event.target.removeAttribute('data-id');
					}
				}
			}, false);
		}
		return this;
	},

	animateStop: function(){
		var selector = this.selector
		for (var i=0; i<selector.length; i++) {
			selector[i].style['webkitTransition'] = '';
			callback = selector[i].callback
			if (callback) {
				eval(callback)(undefined, selector[i].getAttribute('data-id'));
			}
			selector[i].removeEventListener("webkitTransitionEnd", this.transEnd, false)
		}
	},
 
	/* click 이벤트 * // iOS에서 click 이벤트 0.3초 딜레이 되는 현상있음.*
	click: function(_callback, _bubble) {
		selector = this.selector;
		bubble = _bubble || false;
		for (var i=0; i<selector.length; i++) {
			selector[i].that = this;
			selector[i].addEventListener("click", function(evt) {
				if (evt.currentTarget.id != '') {
					eval(_callback)(evt, evt.currentTarget.that);
				} else {
					id = "id" + Math.floor(Math.random()*1000000000) || '';
					evt.currentTarget.dataset.id = id;
					eval(_callback)(evt, M('[data-id="' + id + '"]'));
					//evt.target.removeAttribute('data-id');
				}
			}, bubble);
		}
		return this;
	},
	/**/
	
	/* click 이벤트 */
	click: function(_callback, _bubble) {
		selector = this.selector;
		bubble = _bubble || false;
		for (var i=0; i<selector.length; i++) {
			selector[i].that = this;
			selector[i].bubble = bubble;
			if (!selector[i].callback) {
				selector[i].callback = []
			}
			selector[i].callback.push(_callback);
			
			if ( M.browser().device == 'pc' ) {
				selector[i].addEventListener("mousedown", Mui.prototype.clickHandler, bubble);
			} else {
				selector[i].addEventListener("touchstart", Mui.prototype.clickHandler, bubble);
			}
		}
		return this;
	},
	
	clickHandler: function(evt){
		var id
		
		switch(evt.type){
			case 'mousedown': case 'touchstart':
				if ( M.browser().device == 'pc' ) {
					evt.currentTarget.addEventListener("mouseup", Mui.prototype.clickHandler, evt.currentTarget.bubble);
					evt.currentTarget.addEventListener("mousemove", Mui.prototype.clickHandler, evt.currentTarget.bubble);
				} else {
					evt.currentTarget.addEventListener("touchend", Mui.prototype.clickHandler, evt.currentTarget.bubble);
					evt.currentTarget.addEventListener("touchmove", Mui.prototype.clickHandler, evt.currentTarget.bubble);
				}
				
				id = "id" + Math.floor(Math.random() * 1000000000) || '';
				evt.currentTarget.setAttribute('data-click-event-id', id)
				this.muiSelector = '[data-click-event-id="' + id + '"]';
				this.start = [];
				if ( M.browser().device == 'pc' ) {
					this.start = [evt.pageX, evt.pageY];
				} else {
					this.start = [evt.touches[0].pageX, evt.touches[0].pageY];
				}
			break;
			case 'mousemove': case 'touchmove':
				if ( M.browser().device == 'pc' ) {
					evt.currentTarget.removeEventListener("mouseup", Mui.prototype.clickHandler, evt.currentTarget.bubble);
				} else {
					evt.currentTarget.removeEventListener("touchend", Mui.prototype.clickHandler, evt.currentTarget.bubble);
				}
			break;
			case 'mouseup': case 'touchend':
				if ( M.browser().device == 'pc' ) {
					evt.currentTarget.removeEventListener("mouseup", Mui.prototype.clickHandler, evt.currentTarget.bubble);
				} else {
					evt.currentTarget.removeEventListener("touchend", Mui.prototype.clickHandler, evt.currentTarget.bubble);
				}
				this.end = [];
				
				try {
					this.end = [evt.touches[0].pageX, evt.touches[0].pageY];
				} catch(err) {
					this.end = [evt.pageX, evt.pageY];
				}
				
				//for (var i=0; i<evt.currentTarget.callback.length; i++) {
					eval(evt.currentTarget.callback[0]) (evt, Mui(this.muiSelector));
				//}
				evt.currentTarget.removeAttribute('data-click-event-id');
			break;
		}
	},
	/**/
	
	/* event bind */
	on: function(_event, _callback, _bubble) {
		var  selector = this.selector
			,events = []
			,bubble = _bubble || false
			,id
			
		for (var i=0; i<selector.length; i++) {
			if (selector[i].getAttribute('data-eventid') == undefined) {
				id = "id" + Math.floor(Math.random()*1000000000) || '';
				selector[i].setAttribute('data-eventid', id);
			}
			selector[i].addEventListener(_event, ids = function(evt) {
				eval(_callback)(evt, M('[data-eventid="'+evt.currentTarget.getAttribute('data-eventid')+'"]'));
			}, bubble);
			if (Mui.eventListener[id] == undefined) {
				Mui.eventListener[id] = {};
			}
			Mui.eventListener[id][_event] = [];
			Mui.eventListener[id][_event].push(ids, bubble);
		}
		return this;
	},
	
	/* event unbind */
	off: function(_event) {
		selector = this.selector;
		for (var i=0; i<selector.length; i++) {
			if (Mui.eventListener[selector[i].getAttribute('data-eventid')] != undefined) {
				selector[i].removeEventListener(
						_event, 
						Mui.eventListener[selector[i].getAttribute('data-eventid')][_event][0], 
						Mui.eventListener[selector[i].getAttribute('data-eventid')][_event][1]
					);
				delete Mui.eventListener[selector[i].getAttribute('data-eventid')];
				selector[i].removeAttribute('data-eventid')
			}
		}
		return this;
	},
	
	/* focus / blur */
	focus: function(_callback) {
		selector = this.selector;
		for (var i=0; i<selector.length; i++) {
			selector[i].focus();
			if (_callback) {
				eval(_callback)();
			}
		}
		return this;
	},
	
	/* focus */
	blur: function(_callback) {
		selector = this.selector;
		for (var i=0; i<selector.length; i++) {
			selector[i].blur();
			if (_callback) {
				eval(_callback)();
			}
		}
		return this;
	},
	
	/* Traversal */
	children: function() {
		var  childNodes = this.selector[0].childNodes
			,nodes = '';
			
		for (var i=0; i<childNodes.length; i++) {
			if (childNodes[i].nodeType == '1') {
				nodes = nodes + ', ' + Mui.selector +" "+ childNodes[i].nodeName;
			}
		}
		nodes = nodes.replace(',', '');
		return Mui( nodes );
	},
	
	parent: function() {
		return Mui.prototype.traversal(this.selector[0].parentNode);
	},
	
	first: function(){
		return Mui.prototype.traversal(this.selector[0].firstElementChild);
	},
	
	next: function() {
		return Mui.prototype.traversal(this.selector[0].nextElementSibling);
	},
	
	last: function(){
		return Mui.prototype.traversal(this.selector[0].lastElementChild);
	},
	
	prev: function() {
		return Mui.prototype.traversal(this.selector[0].previousElementSibling);
	},
	
	find: function(_elem) {
		this.selector = this.selector[0].querySelectorAll(_elem);
		Mui.selector = _elem;
		Mui.that = this;
		return this;
	},
	
	traversal: function(_childNodes) {
		if (_childNodes.id == '') {
			id = "id" + Math.floor(Math.random()*1000000000) || ''
			_childNodes.setAttribute('data-traversalid', id);
			setTimeout(function(){
				_childNodes.removeAttribute('data-traversalid');
			}, 0);
			return Mui( '[data-traversalid="'+id+'"]' );
		} else {
			return Mui( '#'+_childNodes.id );
		}
	},
	
	// DOM Insertion
	append: function(_elem, _option){
		var  elem = Mui(Mui.selector)
			,appendEle = d.createElement(_elem)
			
		elem.selector[0].appendChild(Mui.prototype.createElement(_elem, _option));
		return this;
	},
	
	prepend: function(_elem, _option){
		var  elem = Mui(Mui.selector)
			,appendEle = d.createElement(_elem)
		
		elem.selector[0].insertBefore(Mui.prototype.createElement(_elem, _option), elem.selector[0].childNodes[0]);
		return this;
	},
	
	before: function(_elem, _option){
		var  elem = Mui(Mui.selector)
			,parentEle = elem.selector[0].parentElement
			,appendEle = d.createElement(_elem)
			
		parentEle.insertBefore(Mui.prototype.createElement(_elem, _option), elem.selector[0]);
		return this;
	},
	
	after: function(_elem, _option){
		var  elem = Mui(Mui.selector)
			,parentEle = elem.selector[0].parentElement
		
		parentEle.insertBefore(Mui.prototype.createElement(_elem, _option), elem.selector[0].nextSibling);
		return this;
	},
	
	insertAfter: function(_elem){
		var  elem = Mui(Mui.selector)
			,parentEle = elem.selector[0].parentElement
		
		parentEle.insertBefore(d.querySelector(Mui.selector), d.querySelector(_elem).nextSibling);
		return this;
	},
	
	insertBefore: function(_elem){
		var  elem = Mui(Mui.selector)
			,parentEle = elem.selector[0].parentElement
		
		parentEle.insertBefore(d.querySelector(Mui.selector), d.querySelector(_elem));
		return this;
	},
	
	createElement : function(_elem, _option){
		var appendEle = d.createElement(_elem);
		for(var name in _option){
			if(name == 'text'){
				text = d.createTextNode( _option[name] );
				appendEle.appendChild(text);
			} else if( name.indexOf('data') == 0){
				appendEle.dataset[name.replace('data-', '')] = _option[name];
			} else {
				appendEle[name] = _option[name];
			}
		}
		return appendEle;
	},
 
	remove: function(){
		var  elem = Mui(Mui.selector)
			,selector = this.selector
			,childNodes = elem.selector[0].parentNode
		
		for (var i=0; i<selector.length; i++) {
			childNodes.removeChild(selector[i]);
		}
		return this;
	},
 
	/* drag and drop */
	drag: function(_option) {
		var  selector = this.selector
			,dragOption = {}
		
		if (!d.dragOption) {
			d.dragOption = {}
		}
		if (!_option) {
			_option = {};
		}
 
		dragOption.handler 	= _option.handler == undefined ? selector : d.querySelectorAll(_option.handler);
		Mui.dragInit.mpSelector = this;
		
		if ( w.isMobile ) {
			dragOption.handler[0].addEventListener('touchstart', Mui.dragInit, false);
			dragOption.handler[0].dragOption = this.drag.arguments[0];
			dragOption.handler[0].dragOption.target = this.selector;
		} else {
			dragOption.handler[0].addEventListener('mousedown', Mui.dragInit, false);
			dragOption.handler[0].dragOption = this.drag.arguments[0];
			dragOption.handler[0].dragOption.target = this.selector;
		}
		return this;
	},
 
	/* drag and drop */
	stopDrag: function() {
		var  selector = this.selector
		if ( w.isMobile ) {
			selector[0].removeEventListener('touchstart', Mui.dragInit, false);
		} else {
			selector[0].removeEventListener('mousedown', Mui.dragInit, false);
		}
		return this;
	}
}
 
Mui.eventListener = {}
 
Mui.dragInit = function(evt){
	if (evt) {
		var  point = hasTouch ? evt.touches[0] : evt
			,scroller = Mui.dragInit.mpSelector
	}
	switch (evt.type) {
		case 'mousedown': case 'touchstart':
			d.dragOption = {}
			if (!evt.currentTarget.dragOption) {
				evt.currentTarget.dragOption = {};
			}
			d.dragOption.vertical 	= evt.currentTarget.dragOption.vertical == undefined ? true : evt.currentTarget.dragOption.vertical;
			d.dragOption.horizon 	= evt.currentTarget.dragOption.horizon 	== undefined ? true : evt.currentTarget.dragOption.horizon;
			d.dragOption.scale 		= evt.currentTarget.dragOption.scale	== undefined ? 1 	: evt.currentTarget.dragOption.scale;
			d.dragOption.opacity 	= evt.currentTarget.dragOption.opacity 	== undefined ? 1 	: evt.currentTarget.dragOption.opacity;
			d.dragOption.css 		= evt.currentTarget.dragOption.css 		== undefined ? null : evt.currentTarget.dragOption.css;
			d.dragOption.oneway 	= evt.currentTarget.dragOption.oneway 	== undefined ? false: evt.currentTarget.dragOption.oneway;
			d.dragOption.left 		= evt.currentTarget.dragOption.left 	== undefined ? null : evt.currentTarget.dragOption.left;
			d.dragOption.right 		= evt.currentTarget.dragOption.right 	== undefined ? null : evt.currentTarget.dragOption.right;
			d.dragOption.top 		= evt.currentTarget.dragOption.top 		== undefined ? null : evt.currentTarget.dragOption.top;
			d.dragOption.bottom 	= evt.currentTarget.dragOption.bottom 	== undefined ? null : evt.currentTarget.dragOption.bottom;
			
			d.dragOption.onStart 	= evt.currentTarget.dragOption.onStart 	== undefined ? null : evt.currentTarget.dragOption.onStart;
			d.dragOption.onMove 	= evt.currentTarget.dragOption.onMove 	== undefined ? null : evt.currentTarget.dragOption.onMove;
			d.dragOption.onEnd 		= evt.currentTarget.dragOption.onEnd 	== undefined ? null : evt.currentTarget.dragOption.onEnd;
			d.dragOption.onCancel 	= evt.currentTarget.dragOption.onCancel == undefined ? null : evt.currentTarget.dragOption.onCancel;
 
			Mui.dragInit.target = evt.currentTarget.dragOption.target[0]
			scroller.length = 0;
			scroller[0] = Mui.dragInit.target
			scroller.selector = []
			scroller.selector[0] = Mui.dragInit.target
			Mui.dragInit.startPos = [];		// [objPos, mousePos]
			Mui.dragInit.endPos = [];
			Mui.dragInit.lastPos = [];
			Mui.dragInit.centerPos = [];	// [가로, 세로]
			Mui.dragInit.firstDirection = null;
			if (scroller.css('position') == 'static') {
				scroller.css('position', 'relative')
			}
 
			d.addEventListener(moveEvt, Mui.dragInit, false);
			d.addEventListener(endEvt, Mui.dragInit, false);
			Mui.dragInit.startPos[1] = [point.pageX, point.pageY];
			
			Mui.dragInit.startPos[0] = [parseFloat(scroller.css('x'))||0, parseFloat(scroller.css('y'))||0];
			Mui.dragInit.centerPos[0] = [Mui.dragInit.startPos[0][0] - Mui.dragInit.startPos[1][0]];
			Mui.dragInit.centerPos[1] = [Mui.dragInit.startPos[0][1] - Mui.dragInit.startPos[1][1]];
			w.direction = 0;
			w.updown = 0;
			w.startX = Mui.dragInit.startPos[1][0];
			w.startY = Mui.dragInit.startPos[1][1];

			// scale
			if (d.dragOption.scale != 1) {
				scroller.css('scale', d.dragOption.scale);
			}
			// opacity
			if (d.dragOption.opacity != 1) {
				scroller.css('opacity', d.dragOption.opacity);
			}
			// css
			if (d.dragOption.css) {
				scroller.addClass(d.dragOption.css);
			}
			// 콜백
			if (d.dragOption.onStart) {
				eval(d.dragOption.onStart)(point, scroller);
			}
		break;
		
		case 'mousemove': case 'touchmove':
			var  transX = ''
				,transY = ''
			
			if (Mui.dragInit.endPos[1] != undefined) {
				Mui.dragInit.lastPos[1] = Mui.dragInit.endPos[1];
			} else {
				Mui.dragInit.lastPos[1] = 0
			}
			Mui.dragInit.endPos[0] = [parseFloat(scroller.css('x'))||0, parseFloat(scroller.css('y'))||0];
			Mui.dragInit.endPos[1] = [point.pageX, point.pageY];
			Mui.dragInit.posDirection = Mui.dragInit.endPos[1][0] - Mui.dragInit.lastPos[1][0];
			Mui.dragInit.posUpdown = Mui.dragInit.endPos[1][1] - Mui.dragInit.lastPos[1][1];
			if (Mui.dragInit.posDirection > 0) {
				w.direction = 1;
			} else if (Mui.dragInit.posDirection < 0) {
				w.direction = -1;
			} else {
				w.direction = 0;
			}
			if (Mui.dragInit.posUpdown > 0) {
				w.updown = 1;
			} else if (Mui.dragInit.posUpdown < 0) {
				w.updown = -1;
			} else {
				w.updown = 0;
			}
			w.distanceX = Mui.dragInit.endPos[1][0] - Mui.dragInit.startPos[1][0];
			w.distanceY = Mui.dragInit.endPos[1][1] - Mui.dragInit.startPos[1][1];

			if( !Mui.dragInit.firstDirection ){
				if(Math.abs(Mui.dragInit.endPos[1][1] - Mui.dragInit.startPos[1][1]) > Math.abs(Mui.dragInit.endPos[1][0] - Mui.dragInit.startPos[1][0])){
					Mui.dragInit.firstDirection = 'horizon';
				}else {
					Mui.dragInit.firstDirection = 'vertical';
				}
				if (d.dragOption.vertical && d.dragOption.horizon && !d.dragOption.oneway) {
					Mui.dragInit.firstDirection = 'all';
				}
			}
			
			// oneway option
			if (d.dragOption.oneway){
				if (Mui.dragInit.firstDirection == 'vertical'){
					evt.preventDefault();
					var  left = parseFloat(point.pageX) + parseFloat(Mui.dragInit.centerPos[0])
					
					// limit
					if (d.dragOption.left && d.dragOption.right) {
						if ( parseFloat(d.dragOption.left) < left && parseFloat(d.dragOption.right) > left ) {
							transX = left+'px';
						}
					} else if (d.dragOption.left) {
						if ( parseFloat(d.dragOption.left) < left ) {
							transX = left+'px';
						}
					} else if (d.dragOption.right) {
						if ( parseFloat(d.dragOption.right) > left ) {
							transX = left+'px';
						}
					} else {
						transX = left+'px';
					}
				} else if (Mui.dragInit.firstDirection == 'horizon'){
					evt.preventDefault();
					var top = parseFloat(point.pageY) + parseFloat(Mui.dragInit.centerPos[1])
					
					// limit
					if (d.dragOption.top && d.dragOption.bottom) {
						if ( parseFloat(d.dragOption.top) < top && parseFloat(d.dragOption.bottom) > top ) {
							transY = top+'px';
						}
					} else if (d.dragOption.top) {
						if ( parseFloat(d.dragOption.top) < top ) {
							transY = top+'px';
						}
					} else if (d.dragOption.bottom) {
						if ( parseFloat(d.dragOption.bottom) > top ) {
							transY = top+'px';
						}
					} else {
						transY = top+'px';
					}
				}
				
				if (!transX){
					transX = scroller.css('x');
				}
				if (!transY){
					transY = scroller.css('y');
				}
				Mui.dragInit.target.style['webkitTransform'] = 'translate3d('+transX+', '+transY+', 0)'
			} else {
				if (d.dragOption.vertical){
					if (Mui.dragInit.firstDirection == 'vertical') {
						Mui.dragEnd(evt);
						transY = scroller.css('y');
					} else {
						// console.log('세로');
						evt.preventDefault();
						var top = parseFloat(point.pageY) + parseFloat(Mui.dragInit.centerPos[1])
						
						// limit
						if (d.dragOption.top && d.dragOption.bottom) {
							if ( parseFloat(d.dragOption.top) < top && parseFloat(d.dragOption.bottom) > top) {
								transY = top+'px';
							} else if (parseFloat(d.dragOption.top) > top) {
								transY = d.dragOption.top;
							} else if (parseFloat(d.dragOption.bottom) < top) {
								transY = d.dragOption.bottom;
							}
						} else if (d.dragOption.top) {
							if ( parseFloat(d.dragOption.top) < top ) {
								transY = top+'px';
							}
						} else if (d.dragOption.bottom) {
							if ( parseFloat(d.dragOption.bottom) > top ) {
								transY = top+'px';
							}
						} else {
							transY = top+'px';
						}
					}
				}
				
				if (d.dragOption.horizon){
					if (Mui.dragInit.firstDirection == 'horizon') {
						Mui.dragEnd(evt);
						transX = scroller.css('x');
					} else {
						evt.preventDefault();
						var left = parseFloat(point.pageX) + parseFloat(Mui.dragInit.centerPos[0])
						
						// limit
						if (d.dragOption.left && d.dragOption.right) {
							if ( parseFloat(d.dragOption.left) < left && parseFloat(d.dragOption.right) > left ) {
								transX = left+'px'
							} else if (parseFloat(d.dragOption.left) > left) {
								transX = d.dragOption.left;
							} else if (parseFloat(d.dragOption.right) < left) {
								transX = d.dragOption.right;
							}
						} else if (d.dragOption.left) {
							if ( parseFloat(d.dragOption.left) < left ) {
								transX = left+'px'
							}
						} else if (d.dragOption.right) {
							if ( parseFloat(d.dragOption.right) > left ) {
								transX = left+'px'
							}
						} else {
							transX = left+'px';
						}
					}
				}
				
				if (!transX){
					transX = scroller.css('x');
				}
				if (!transY){
					transY = scroller.css('y');
				}
				Mui.dragInit.target.style['webkitTransform'] = 'translate3d('+transX+', '+transY+', 0)';
			}
			if (d.dragOption.onMove) {
				eval(d.dragOption.onMove)(evt, scroller);
			}
		break;
		
		case 'mouseup': case 'touchend':
			//Mui.dragEnd();
			if ( w.isMobile ) {
				d.removeEventListener('touchmove', Mui.dragInit, false);
				d.removeEventListener('touchend', Mui.dragInit, false);
			} else {
				d.removeEventListener('mousemove', Mui.dragInit, false);
				d.removeEventListener('mouseup', Mui.dragInit, false);
				
			}
 
			// reset
			if (d.dragOption.scale != 1) {
				scroller.css('scale', 1);
			}
			if (d.dragOption.opacity != 1) {
				scroller.css('opacity', 1);
			}
			// css
			if (d.dragOption.css != 1) {
				scroller.removeClass(d.dragOption.css);
			}
			
			if (Mui.dragInit.endPos.length == 0) {
				w.direction = 0;
				w.updown = 0;
			} else {
				if ( Mui.dragInit.firstDirection == 'vertical' ) {
					w.updown = 0;
				} else {
					if (Mui.dragInit.endPos[1][1] - Mui.dragInit.startPos[1][1] > 0) {
						//console.log('->');
						w.updown = 1;
					} else if(Mui.dragInit.endPos[1][1] - Mui.dragInit.startPos[1][1] < 0) {
						//console.log('<-');
						w.updown = -1;
					}
				}
				
				if ( Mui.dragInit.firstDirection == 'horizon' ) {
					w.direction = 0;
				} else {
					if (Mui.dragInit.endPos[1][0] - Mui.dragInit.startPos[1][0] > 0) {
						//console.log('->');
						w.direction = -1;
					} else if (Mui.dragInit.endPos[1][0] - Mui.dragInit.startPos[1][0] < 0) {
						//console.log('<-');
						w.direction = 1;
					}
				}
			}
			if (typeof Mui.dragInit.endPos[1] != 'undefined') {
				w.distanceX = Mui.dragInit.endPos[1][0] - Mui.dragInit.startPos[1][0];
				w.distanceY = Mui.dragInit.endPos[1][1] - Mui.dragInit.startPos[1][1];
			} else {
				w.distanceX = 0;
				w.distanceY = 0;
			}
			if (d.dragOption.onEnd) {
				eval(d.dragOption.onEnd)(evt, scroller);
			}
		break;
	}
}
 
Mui.dragEnd = function(evt){
	d.removeEventListener(moveEvt, Mui.dragInit, false);
	d.removeEventListener(endEvt, Mui.dragInit, false);
	
	// reset
	if (d.dragOption.scale != 1) {
		scroller.css('scale', 1);
	}
	if (d.dragOption.opacity != 1) {
		scroller.css('opacity', 1);
	}
	// css
	if (d.dragOption.css) {
		scroller.removeClass(d.dragOption.css);
	}
	if (d.dragOption.onCancel) {
		eval(d.dragOption.onCancel)(evt, scroller);
	}
}
 
/* Ajax */
Mui.ajax = function(_option) {
	var  xhr = new XMLHttpRequest()
		,url = _option.url || ''
		,async = _option.async || false
		,type = _option.type || 'GET'
		,beforeSend = _option.beforeSend || null
		,complete = _option.complete || null
		,success = _option.success || null
		,error = _option.error || null
		//,data = _option.data || ''
		//,cache = _option.cache || ''
	
	// 접속시도
	if(beforeSend){
		eval(beforeSend)();
	}
	
	xhr.open(type, url, async);
	xhr.onreadystatechange = function(){
		if (xhr.readyState == 4) {
			eval (success) (xhr.responseText);
			
			// 접속 완료
			if(complete){
				eval(complete)();
			}
		}
	}
	xhr.send();
	return this
}
Mui.done = function() {
	//console.log('cccc')
	return this
}
 
/* check browser */
Mui.browser = function() {
	var  ua = navigator.userAgent
		,browserName = (/chrome/gi).test(ua) ? "chrome" : 
					(/safari/gi).test(ua) ? "safari" : 
					(/simulator/gi).test(ua) ? "ios simulator" : 
					(/presto/gi).test(ua) ? "opera" : 
					(/firefox/gi).test(ua) ? "firefox" : 
					(/triden/gi).test(ua) ? "ie" : "other"
		,device = (/iphone|ipad|ipod|android/gi).test(ua) ? "mobile" : "pc"
		,os = (/iphone|ipad|ipod/gi).test(ua) ? "ios" : 
				(/android/gi).test(ua) ? "android" :
				(/mac/gi).test(ua) ? "macOS" : 
				(/windows/gi).test(ua) ? "Windows" : "other"
		,prefix = (/presto/gi).test(ua) ? "-o-" : 
					(/webkit/gi).test(ua) ? "-webkit-" :
					(/firefox/gi).test(ua) ? "-moz-" : 
					(/triden/gi).test(ua) ? "-ms-" : ""
		,androidVersion
		,androidName;
	switch(browserName) {
		case "opera": case "safari":
			try{
				browserVer = ua.match(/version\/([0-9.]+)/ig).toString().split("/")[1];
			}catch(err) {
				browserVer = undefined;
			}
		break;
		case "chrome":
			browserVer = ua.match(/chrome\/([0-9.]+)/ig).toString().split("/")[1];
		break;
		case "firefox":
			browserVer = ua.match(/firefox\/([0-9.]+)/ig).toString().split("/")[1];
		break;
		case "ie":
			browserVer = ua.match(/MSIE ([0-9.]+)/ig).toString().split(" ")[1];
		break;
		default:
			browserVer = undefined;
		break;
	}
	if (os == "android") {
		androidVersion = ua.match(/android ([0-9.]+)/ig).toString().split(" ")[1];
		switch(androidVersion) {
			case "1.0":
				androidName = "applepie";
			break;
			case "1.1":
				androidName = "bananabread";
			break;
			case "1.5":
				androidName = "cupcake";
			break;
			case "1.6":
				androidName = "donut";
			break;
			case "2.0": case "2.0.1": case "2.1":
				androidName = "eclair";
			break;
			case "2.2": case "2.2.1": case "2.2.2":
				androidName = "Froyo";
			break;
			case "2.3": case "2.3.2": case "2.3.3": case "2.3.4": case "2.3.5": case "2.3.6": case "2.3.7":
				androidName = "gingerbread";
			break;
			case "3.0": case "3.1": case "3.2":
				androidName = "honeycomb";
			break;
			case "4.0": case "4.0.1": case "4.0.2": case "4.0.3": case "4.0.4":
				androidName = "icecreamsandwich";
			break;
			case "4.1":
				androidName = "jellybean";
			break;
			default:
				androidName = undefined;
			break;
		}
	}
	return {
		 "device":device
		,"os":os
		,"browser":browserName
		,"browserVer":browserVer
		,"androidName":androidName
		,"androidVersion":androidVersion
		,"prefix":prefix
	}
}
 
Mui.screen = function() {
	return {"width": w.innerWidth, "height": w.innerHeight};
}
 
Mui.json = function(_value, _type) {
	if (_type == 0) {
		return JSON.stringify(_value);
	}
	if (_type == 1) {
		if (_value != ''){
			return JSON.parse(_value);
		} else {
			return {}
		}
	}
	if (typeof _value === 'object') {
		return JSON.stringify(_value);
	} else {
		if (_value != ''){
			return JSON.parse(_value);
		} else {
			return {}
		}
	}
}
 
/* version */
Mui.version = function() {
	console.log(version);
}
 
/* String utils */
Mui.trim = function(_value) {
	return _value.replace(/^\s+|\s+$/g,"");
}
Mui.leftTrim = function(_value) {
	return _value.replace(/^\s+/,"");
}
Mui.rightTrim = function(_value) {
	return _value.replace(/\s+$/,"");
},
Mui.isNumber = function(_value) {
	return !isNaN(parseFloat(_value)) && isFinite(_value);
}
camelize = function(_value) {
	return _value.replace (/(?:^|[-_])(\w)/g, function (_, c) {
		return c ? c.toUpperCase () : '';
	})
}
decamelize = function(_value) {
	return _value.replace(/([a-z])([A-Z])/g,'$1-$2').toLowerCase();
}
Mui.toCurrency = function(_value) {
	if ( _value !== 0 && isNaN(_value) ) return '';
	if (_value === 0) return 0;
	if ( _value === '' ) return '';
	_value = ''+_value;
	
	var  unit
		,point = _value.split('.')[1]
		,amountStr
		
	if( !Mui.isNumber(_value.substr(0, 1)) ) {
		unit = _value.substr(0, 1);
		_value = parseFloat(_value.replace(unit, ''));
	}
	amountStr = String(_value);
	amountArray = amountStr.split(".");
	var currencyArray = new Array();
	var start, end = amountArray[0].length;
	while(end > 0) {
		start = Math.max(end - 3, 0);
		currencyArray.unshift( amountArray[0].slice(start, end) );
		end = start;
	}
	amountArray[0] = currencyArray.join(",");
	if (unit != undefined) {
		amountArray[0] = unit + amountArray[0];
	}
	if (point != undefined) {
		amountArray[0] = amountArray[0] + "." + point;
	}
	return amountArray[0];
}
Mui.toNumber = function(_value) {
	var amountArray = new Array();
	var currencyArray = new Array();
 
	for (var i=0; i<_value.toString().length; i++) {
		amountArray[i] = _value.toString().substr(i, 1);
 
		if (amountArray[i] == ",") amountArray.splice(i);
		if (amountArray[i] == ".") amountArray.splice(i);
		if (amountArray[i] != undefined) currencyArray.push(amountArray[i]);
	}
	return currencyArray.join("")
}
Mui.format = function(_value, _format) {
	var  str = ''
		,j = 0
		
	for(var i=0; i<_format.length; i++){
		if( _format.substr(i, 1) == "0") {
			str += _value.substr(j, 1);
			j++;
		} else {
			str += _format.substr(i, 1);
		}
	}
	return str;
}
Mui.scroll = function(vscroll, hscroll){
	if (arguments.length == 1) {
		w.scrollTo(w.pageXOffset, vscroll);
	} else if (arguments.length == 2) {
		w.scrollTo(hscroll, vscroll);
	} else if (arguments.length == 0) {
		return {y: w.pageYOffset, x: w.pageXOffset};
	}
}
Mui.getUrl = function(){
	return d.URL.split('/html/')[1].split('?')[0];
}

Mui.storage = function(key, value){
	if (value == undefined) {
		// getter
		return localStorage.getItem(key);
	}
	//setter
	localStorage.setItem(key, value);
}

/* parameter from url */
Mui.getParameter = function(_key) {
	address = location.href;
	if (address.indexOf("?") != -1) {
		parameters = address.slice(address.indexOf("?")+1, address.length).split("&");
		for (var i=0; i<parameters.length; i++) {
			key = parameters[i].split("=")[0];
			if (key == _key) {
				return decodeURIComponent(parameters[i].split("=")[1]);
			} else {
				return undefined;
			}
		}
	} else {
		return undefined;
	}
}
 
Mui.extend = function(_pName, _option) {
 
}
/* 전역변수 할당 */
Mui.fn.init.prototype = Mui.fn;
w.mpui = w.M = Mui;
})(this, document, window);