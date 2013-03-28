/**
var indicator
document.querySelector('#btn').addEventListener('click', function(){
	indicator = new Indicator('로딩중입니다.');
	indicator.hide();
}, false)
/**/

var Indicator = function(msg) {
	var that = this

	that.txtMsgMargin = 20
	that.posX = 0
	that.intervalId
	that.b = that.d.querySelector('body')
	that.init(msg);
}

Indicator.prototype = {
	d: document,
	w: window,
	init: function(msg){
		var that = this

		if (!that.w.indicatorIdx) {
			that.w.indicatorIdx = 1;
			that.initUi(msg);
			that.animate();
			return 0;
		}
		that.w.indicatorIdx++;
	},

	initUi: function(msg) {
		var  that = this
			,str = ''
			,component = that.d.createElement('div')
			,screenWidth = that.w.innerWidth
			,screenHeight = that.w.innerHeight
			,componentStyle = 'width:100%; height:'+screenHeight+'px; z-index:100; position:absolute; top:0; left:0 '
			,txtMsgWidth = 0
		
		component.setAttribute('style', componentStyle);
		component.id = 'indicatorComponent';
		that.b.insertBefore(component, that.b.childNodes[0]);

		str += '<div id="indiBack">';
		str += '	<div id="indiImg" style="position:absolute; width:25px; height:25px; background:url(js/loading.png); no-repeat; top:35px; left:35px; position:absolute; z-index:103"></div>';
		str += '	<div id="indiTxt" style="color:#fff; white-space:nowrap; position:absolute; bottom:10px; z-index:102"></div>';
		str += '	<div style="background:#000; opacity:0.5; border-radius:20px; width:100%; height:100%"></div>';
		str += '</div>';
		component.innerHTML = str;
		that.d.querySelector('#indiTxt').innerHTML = msg;

		txtMsgWidth = that.d.querySelector('#indiTxt').clientWidth;
		MsgBoxWidth = txtMsgWidth + that.txtMsgMargin * 2;

		// 인디케이터 박스
		var indiBoxStyle = 'width:'+(txtMsgWidth + that.txtMsgMargin*2)+'px; height:'+(txtMsgWidth + that.txtMsgMargin*2)+'px; top:'+(screenHeight/2 - MsgBoxWidth/2)+'px; left:'+(screenWidth/2 - MsgBoxWidth/2)+'px; position:absolute';
		that.d.querySelector('#indiBack').setAttribute('style', indiBoxStyle);
		
		// 인디케이터 메세지
		that.d.querySelector('#indiTxt').style.bottom = that.txtMsgMargin + 'px';
		that.d.querySelector('#indiTxt').style.left = that.txtMsgMargin + 'px';
		
		// 인디케이터
		that.d.querySelector('#indiImg').style.top = MsgBoxWidth/2 - 12 - 15 + 'px';
		that.d.querySelector('#indiImg').style.left = MsgBoxWidth/2 - 12 + 'px';

		component.addEventListener('load', function(evt){
			evt.stopPropagation();
		}, false);		
	},

	animate: function(){
		var  that = this
		that.intervalId = setInterval(function(){
			that.aniInterval.call(that);
		}, 100);
	},

	aniInterval: function(){
		var  that = this

		that.posX = that.posX - 25;
		this.d.querySelector('#indiImg').style.backgroundPosition = that.posX+'px 0';
	},

	hide: function(){
		var  that = this
			,indicator = document.querySelector('#indicatorComponent')
		
		if (that.w.indicatorIdx === 1) {
			that.b.removeChild(indicator);
			clearInterval(that.intervalId)
		} else {
			that.w.indicatorIdx--;
		}
	}
}




























