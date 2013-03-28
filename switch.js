/********************************************
 * Project : 동양 모바일로 스마트 고도화
 * Version : 1.0.00
 *******************************************/

/** 
 * switch 컴포넌트를 구현합니다.
 * author: 백국경 (romeoh@uracle.co.kr)
 */
var initSwitch = function(){
	var  rightPos = M('[data-switch]').first().css('clientWidth') - parseInt(M('[data-switch] input').css('width')) - 1
		,switchPos
		,switchCondition
	
	for (var i=0; i<M('[data-switch]').selector.length; i++) {
		var  nth = i + 1
		if (document.querySelectorAll('[data-switch]')[i].getAttribute('data-switch') == 'on') {
			document.querySelectorAll('[data-switch]')[i].querySelector('input').style['webkitTransform'] = 'translate3d(0,0,0)';
			document.querySelectorAll('[data-switch]')[i].setAttribute('data-onoff', 'on');
			switchPos = 0;
		} else {
			document.querySelectorAll('[data-switch]')[i].querySelector('input').style['webkitTransform'] = 'translate3d('+rightPos+'px,0,0)';
			document.querySelectorAll('[data-switch]')[i].setAttribute('data-onoff', 'off');
			switchPos = rightPos;
		}
	}
	
	M('[data-switch] input')
		.drag({
			 'vertical': false
			,'left': rightPos+'px'
			,'right': '0px'
			,'onEnd': function(evt, mp){
				if (this.direction == 1) {
					switchPos = rightPos;
					mp.parent().parent().data('onoff', 'off')
				} else if (this.direction == -1) {
					switchPos = 0;
					mp.parent().parent().data('onoff', 'on')
				} else {
					if (switchPos == 0) {
						switchPos = rightPos;
						mp.parent().parent().data('onoff', 'off')
					} else {
						switchPos = 0;
						mp.parent().parent().data('onoff', 'on')
					}
				}
				mp.animate({
					 'x': switchPos + 'px'
					,'time':'0.2s'
				})
				// 콜백
				eval(M('[data-switch]').data('switch-callback')) (mp.parent().parent().selector[0], mp.parent().parent().data('onoff') );
			}
		})
	
}
initSwitch();
