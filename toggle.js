/********************************************
 * Project : 동양 모바일로 스마트 고도화
 * Version : 1.0.00
 *******************************************/

/** 
 * 공통 toggle 함수 구현. 
 * author: 백국경 (romeoh@uracle.co.kr)
 */

var initToggle = function() {
	var  press = document.querySelectorAll('[data-press]')
		,timeoutId = null
		,pressValue
	
	if (press.length > 0) {
		M('[data-press]').on('mousedown', eventHandler);
		M('[data-press]').on('touchstart', eventHandler);
	}
	
	function eventHandler(evt) {
		switch (evt.type) {
			case 'mousedown': case 'touchstart':
				evt.currentTarget.addEventListener('mousemove', eventHandler, false);
				evt.currentTarget.addEventListener('mouseup', eventHandler, false);
				evt.currentTarget.addEventListener('touchmove', eventHandler, false);
				evt.currentTarget.addEventListener('touchend', eventHandler, false);
				pressValue = evt.currentTarget.dataset.press;
				if (!evt.currentTarget.classList.contains('dim') ) {
					timeoutId = setTimeout(function(target){
						target.classList.add('on');
						timeoutId = null;
					}, 50, evt.currentTarget);
				}
				break;
			case 'mousemove': case 'touchmove':
				evt.currentTarget.removeEventListener('mousemove', eventHandler, false);
				evt.currentTarget.removeEventListener('mouseup', eventHandler, false);
				evt.currentTarget.removeEventListener('touchmove', eventHandler, false);
				evt.currentTarget.removeEventListener('touchend', eventHandler, false);
				if (!evt.currentTarget.classList.contains('dim') ) {
					clearTimeout(timeoutId);
					timeoutId = null;
					evt.currentTarget.classList.remove('on');
				}
				break;
			case 'mouseup': case 'touchend':
				evt.currentTarget.removeEventListener('mousemove', eventHandler, false);
				evt.currentTarget.removeEventListener('mouseup', eventHandler, false);
				evt.currentTarget.removeEventListener('touchmove', eventHandler, false);
				evt.currentTarget.removeEventListener('touchend', eventHandler, false);
				if (!evt.currentTarget.classList.contains('dim') ) {
					clearTimeout(timeoutId);
					timeoutId = null;
					M('[data-press="'+pressValue+'"]').removeClass('se');
					evt.currentTarget.classList.remove('on');
					evt.currentTarget.classList.add('se');
				}
				break;
		}
	}
	
}
window.addEventListener('initToggle', initToggle, false);