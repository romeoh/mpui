/**********************************************************************
 mpui.js
 모피어스 프레임웍의 UI 라이브러리 구현 스크립트
 Author : 백국경 (romeoh@uracle.co.kr)
 Copyright (c) 2001-2012 Uracle Co., Ltd.
 166 Samseong-dong, Gangnam-gu, Seoul, 135-090, Korea All Rights Reserved.
 ************************************************************************/
 
(function(g, d, undefined){
var version = "Morpheus UI 0.0.1",
Mui = function(_selector){
	return new Mui.fn.init(_selector);
}

Mui.fn = Mui.prototype = {
	
	/* 초기화 */
	init: function(_selector){
		if(!_selector) return this;
		
		if(typeof _selector === "string"){
			this.length = 1;
			this[0] = d.querySelector(_selector);
			return this;
		}
		if(_selector === "body"){
			this.length = 1;
			this[0] = d.body;
			return this;
		}
		if(_selector.nodeType){
			this.length = 1;
			this[0] = _selector;
			return this;
		}
		if(_selector === window){
			this.length = 1;
			this[0] = window;
			return this;
		}
	},
	
	/* add class */
	addClass: function(_className){
		this[0].className.indexOf(_className)
		if(this[0].className.indexOf(_className) == -1){
			this[0].className += " " + _className;
			this[0].className = mpui.trim( this[0].className );
		}
		if(_className == ""){
			this[0].className = "";
		}
		return this;
	},
	
	after: function(){},
	ajax: function(){},
	
	/* animation */
	animate: function(_option, _duration, _callback){
		var  styleText = ""
			,time = "1s"
			,delay = "0s"
		if(mpui(this[0]).css("position") == "static"){
			mpui(this[0]).css("position", "relative").css("display", "block");
		}
		prefix = mpui.browser().prefix;
		
		for(var _key in _option){
			_value = eval("_option." + _key);
			if(_key != "onFinish"){
				if(_key == "time"){
					time = _value;
					continue;
				}
				if(_key == "delay"){
					delay = _value;
					continue;
				}
				mpui(this[0]).css(_key, _value);
				if(this[0].style.cssText.indexOf(_key) == -1){
					console.log(prefix+"transform:"+_key+"("+_value+")")
					this[0].style.cssText += prefix+"transform:"+_key+"("+_value+")";
				}
			}
		}
		this[0].style.cssText += prefix+"transition:all "+time+"s "+delay+"s"
		console.log(this[0].style);
	},
	
	append: function(_value){
		this[0].appendChild(_value)
	},
	
	appendTo: function(){},
	
	/* get/set attributes */
	attr: function(_key, _value){
		if(_value == undefined){
			//getter
			return this[0].getAttribute(_key);
		}else{
			//setter
			this[0].setAttribute(_key, _value);
		}
		return this;
	},
	
	before: function(){},
	
	/* event bind */
	bind: function(_event, _callback){
		this[0].addEventListener(_event, _callback, false);
		return this;
	},
	
	blur: function(){},
	change: function(){},
	
	/* click 이벤트 */
	click: function(_callback){
		this[0].addEventListener("click", function(evt){
			eval(_callback)(evt);
		}, false);
		return this;
	},
	
	contextmenu: function(){},
	
	/* CSS */
	css: function(_key, _value){
		if(_value === undefined){
			//get
			return eval("document.defaultView.getComputedStyle(this[0], null)."+_key);
		}else{
			//set
			styleText = _key + "='" + _value + "'";
			//this[0].style.cssText += styleText;
			eval("this[0].style." + styleText);
			return this;
		}
		
	},
	
	/* get/set data */
	data:function(_key, _value){
		if(_value == undefined){
			//getter
			return this[0].getAttribute("data-"+_key);
		}else{
			//setter
			if(typeof _value === "object"){
				this[0].setAttribute("data-"+_key, JSON.stringify(_value));
			}else if(typeof _value === "string"){
				this[0].setAttribute("data-"+_key, _value);
			}
		}
		return this;
	},
	
	/* drag and drop */
	drag: function(){
		this[0].addEventListener("mousedown", function(){
			console.log("down");
		}, false);
		this[0].addEventListener("mousemove", function(){
			console.log("move");
		}, false);
		this[0].addEventListener("mouseup", function(){
			console.log("up");
		}, false);
	},
	drop: function(){},
	
	dblclick: function(){},
	delay: function(){},
	die: function(){},
	each: function(){},
	end: function(){},
	find: function(){},
	first: function(){},
	focus: function(){},
	hasClass: function(){},
	height: function(){},
	hover: function(){},
	
	/* innerHTML */
	html: function(_value){
		if(_value == undefined){
			return this[0].innerHTML;
		}else{
			this[0].innerHTML = _value;
			return this;	
		}
	},
	
	innerHeight: function(){},
	innerWidth: function(){},
	keydown: function(){},
	keypress: function(){},
	keyup: function(){},
	last: function(){},
	live: function(){},
	load: function(){},
	
	/* mouse Event */
	mousedown: function(_callback){
		this[0].addEventListener("mousedown", function(evt){
			eval(_callback)(evt);
		}, false);
		return this;
	},
	mousemove: function(_callback){
		this[0].addEventListener("mousemove", function(evt){
			eval(_callback)(evt);
		}, false);
		return this;
	},
	mouseout: function(_callback){
		this[0].addEventListener("mouseout", function(evt){
			eval(_callback)(evt);
		}, false);
		return this;
	},
	mouseover: function(_callback){
		this[0].addEventListener("mouseover", function(evt){
			eval(_callback)(evt);
		}, false);
		return this;
	},
	mouseup: function(_callback){
		this[0].addEventListener("mouseup", function(evt){
			eval(_callback)(evt);
		}, false);
		return this;
	},
	
	/* touchEvent */
	touchstart: function(_callback){
		if('ontouchstart' in document.documentElement){
			//mobile
			this[0].addEventListener("touchstart", function(evt){
				evt.preventDefault();
				eval(_callback)(evt);
			}, false);
			return this;
		}else{
			//pc
			this[0].addEventListener("mousedown", function(evt){
				mpui.fn.isMouseDown = true;
				eval(_callback)(evt);
			}, false);
			return this;
		}
	},
	
	touchmove: function(_callback){
		if('ontouchmove' in document.documentElement){
			//mobile
			this[0].addEventListener("touchmove", function(evt){
				eval(_callback)(evt);
			}, false);
			return this;
		}else{
			//pc
			console.log(mpui.fn.isMouseDown)
			if(mpui.fn.isMouseDown){
				document.addEventListener("mousemove", function(evt){
					eval(_callback)(evt);
				}, false);
			}
			return this;
		}
	},
	touchend: function(_callback){
		if('ontouchend' in document.documentElement){
			//mobile
			this[0].addEventListener("touchend", function(evt){
				eval(_callback)(evt);
			}, false);
			return this;
		}else{
			//pc
			this[0].addEventListener("mouseup", function(evt){
				mpui.fn.isMouseDown = false;
				eval(_callback)(evt);
			}, false);
			return this;
		}
	},
	
	next: function(){},
	offset: function(){},
	outerHeight: function(){},
	outerWidth: function(){},
	parent: function(){},
	position: function(){},
	prev: function(){},
	prop: function(){},
	push: function(){},
	
	/* window.domcontentloaded */
	ready: function(_callback){
		this[0].addEventListener("DOMContentLoaded", function(){
			eval(_callback)();
		}, false);
		return this;
	},
	
	removeAttr: function(){},
	
	/* remove class */
	removeClass: function(_classname){
		if(_classname){
			this[0].className = mpui.trim( this[0].className.replace(_classname, "") );
		}else{
			this[0].className = "";
		}
		return this;
	},
	
	replaceAll: function(){},
	scroll: function(){},
	scrollLeft: function(){},
	scrollTop: function(){},
	show: function(){},
	slice: function(){},
	sort: function(){},
	text: function(){},
	toArray: function(){},
	toggle: function(){},
	
	/* toggleClass */
	toggleClass: function(_className){
		if(this[0].className.indexOf(_className) != -1){
			this[0].className = mpui.trim( this[0].className.replace(_className, "") );
		}else{
			this[0].className += " "+_className;
			this[0].className = mpui.trim( this[0].className );
		}
	},
	
	trigger: function(){},
	
	/* event unbind */
	unbind: function(_event, _callback){
		this[0].removeEventListener(_event, _callback, false);
		return this;
	},
	
	unload: function(){},
	width: function(){},
	
	isMouseDown:false
}

Mui.ajax = function(){
},

/* check browser */
Mui.browser = function(){
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
	switch(browserName){
		case "opera": case "safari":
			try{
				browserVer = ua.match(/version\/([0-9.]+)/ig).toString().split("/")[1];
			}catch(err){
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
	if(os == "android"){
		androidVersion = ua.match(/android ([0-9.]+)/ig).toString().split(" ")[1];
		switch(androidVersion){
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
},

Mui.screen = function(){
	return {"width":window.innerWidth, "height":window.innerHeight};
},

Mui.find = function(){},
Mui.parseJSON = function(){},
Mui.parseXML = function(){},

/* version */
Mui.version = function(){
	console.log(version);
},

/* String utils */
Mui.trim = function(_value){
	return _value.replace(/^\s+|\s+$/g,"");
},
Mui.leftTrim = function(_value){
	return _value.replace(/^\s+/,"");
},
Mui.rightTrim = function(_value){
	return _value.replace(/\s+$/,"");
},
Mui.isNumber = function(_value){
	return !isNaN(parseFloat(_value)) && isFinite(_value);
},
camelize = function(_value){
	return _value.replace (/(?:^|[-_])(\w)/g, function (_, c) {
		return c ? c.toUpperCase () : '';
	})
},
decamelize = function(_value){
	return _value.replace(/([a-z])([A-Z])/g,'$1-$2').toLowerCase();
},
Mui.toCurrency = function(_value){
	if(isNaN(_value)) return "NaN";
	_value = Math.round(_value*100) / 100;
	var amountStr = String(_value);
	var amountArray = amountStr.split(".");
	if(amountArray[1] == undefined) amountArray[1] = "";
	if(amountArray[1].length == 1) amountArray[1] += "";

	var currencyArray = new Array();
	var start, end = amountArray[0].length;
	while(end > 0) {
		start = Math.max(end - 3, 0);
		currencyArray.unshift(amountArray[0].slice(start, end));
		end = start;
	}
	amountArray[0] = currencyArray.join(",");
	return (amountArray.join(""));
},
Mui.toNumber = function(_value){
	var amountArray = new Array();
	var currencyArray = new Array();

	for(var i=0; i<_value.toString().length; i++){
		amountArray[i] = _value.toString().substr(i, 1);

		if(amountArray[i] == ",") amountArray.splice(i);
		if(amountArray[i] == ".") amountArray.splice(i);
		if(amountArray[i] != undefined) currencyArray.push(amountArray[i]);
	}
	return currencyArray.join("")
},

/* parameter from url */
Mui.getParameter = function(_key){
	address = location.href;
	if(address.indexOf("?") != -1){
		parameters = address.slice(address.indexOf("?")+1, address.length).split("&");
		for(var i=0; i<parameters.length; i++){
			key = parameters[i].split("=")[0];
			if(key == _key){
				return decodeURIComponent(parameters[i].split("=")[1]);
			}else{
				return undefined;
			}
		}
	}else{
		return undefined;
	}
},

/* WNInterface */
Mui.location = {
	href: function(_url, _option){
		var url = _url.split("?")[0],
			param = _url.split("?")[1],
			stack = "NEW_SCR",
			animate = "DEFAULT",
			orient = "DEFAULT";
		if(_option != undefined){
			if(_option.stack){
				stack = _option.stack;
			}
			if(_option.animate){
				animate = _option.animate;
			}
			if(_option.orient){
				orient = _option.orient;
			}
		}
		WNMoveToHtmlPage(url, param, stack, animate, orient);
	},
	back: function(_option){
		var param = "",
			animate = "DEFAULT";
		if(_option != undefined){
			if(_option.param){
				param = _option.param;
			}
			if(_option.animate){
				animate = _option.animate;
			}
		}
		WNBackPage(param, animate);
	}
}

Mui.extend = function(_pName, _option){
	
}

fishing();
function fishing(){
	alink = document.querySelectorAll("a");
	for(var i=0; i<alink.length; i++){
		alink[i].addEventListener("click", function(evt){
			evt.preventDefault();
			Mui.location.href(evt.currentTarget.getAttribute("href"));
		}, false)
	}
}

/* 전역변수 할당 */
Mui.fn.init.prototype = Mui.fn;
g.mpui = g.$mp = Mui;
})(this, document);


