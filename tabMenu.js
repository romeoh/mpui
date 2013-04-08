/********************************************
 * Project : 동양 모바일로 스마트 고도화
 * Version : 1.0.00
 *******************************************/

/** 
 * 공통 탭메뉴를 구현합니다.
 * author: 백국경 (romeoh@uracle.co.kr)
 */

var initTabmenu = function() {
//(function(M, d) {
	var  tabMenu = document.querySelector('[data-tab]')
		,btnPrev = document.querySelector('[data-tab]').querySelector('.btnPrev')
		,btnNext = document.querySelector('[data-tab]').querySelector('.btnNext')
		,menu = document.querySelector('[data-tab]').querySelectorAll('li')
		,menuLength = menu.length
		,totalPage = Math.ceil( menuLength / 4 )
		,selectedMenu = tabMenu.dataset.tab
		,defaultPage = Math.ceil(selectedMenu / 4)
		,defaultPagePos
		,currentPage = defaultPage
		,isClicked = false
		,screenWidth = M.screen().width - 42
		,startPos
		,endPos
		,movePos
		,activeMenuIdx
	
	// 초기화
	defaultPagePos = -1 * screenWidth * (defaultPage-1) + 21 ;
	M('[data-tab] ul')
		.css('x', defaultPagePos+'px')
		.css('width', screenWidth*totalPage+'px');
	for(var i=1; i<menuLength+1; i++){
		M('[data-tab] li:nth-child('+i+')')
			.css('width', screenWidth/4+'px')
			.data('idx', i);
			
		M('[data-tab] li:nth-child('+i+') a')
			.data('href', M('[data-tab] li:nth-child('+i+') a')
			.attr('href'))
			.attr('href', '#');
	}
	M('[data-tab] li:nth-child('+selectedMenu+')').addClass('se');	// on
	setHiddenMenu(defaultPage);
	
	// event
	document.querySelector('[data-tab] ul').addEventListener('mousedown', dragHandler, false);
	document.querySelector('[data-tab] ul').addEventListener('touchstart', dragHandler, false);
	function dragHandler(evt){
		evt.preventDefault();
		
		switch (evt.type) {
			case 'mousedown': case 'touchstart':
				document.body.addEventListener('mousemove', dragHandler, false);
				document.body.addEventListener('touchmove', dragHandler, false);
				document.body.addEventListener('mouseup', dragHandler, false);
				document.body.addEventListener('touchend', dragHandler, false);
				
				isClicked = true;
				if ( M.browser().device == 'pc') {
					startPos = evt.pageX;
				} else {
					try{
						startPos = evt.touches[0].pageX;
					}catch(err){
						startPos = evt.pageX;
					}
				}
				
				M('[data-tab] button').animate({
					 opacity: '0'
					,time:'0.2s'
				});
				M('[data-show]').animate({
					 opacity: '1'
					,time:'0.2s'
				});
				
				if (evt.target.nodeName == 'SPAN') {
					activeMenuIdx = evt.target.parentNode.parentNode.dataset.idx
				} else if (evt.target.nodeName == 'A') {
					activeMenuIdx = evt.target.parentNode.dataset.idx
				} else if (evt.target.nodeName == 'LI') {
					activeMenuIdx = evt.target.dataset.idx
				}
				M('[data-tab] [data-idx="'+activeMenuIdx+'"]').addClass('on');
				
				break;
				
			case 'mousemove': case 'touchmove':
				if (isClicked) {
					if ( M.browser().device == 'pc') {
						endPos = evt.pageX;
					} else {
						try{
							endPos = evt.touches[0].pageX;
						}catch(err){
							endPos = evt.pageX;
						}
					}
					movePos = endPos - startPos;
					movePagePos = -1 * (currentPage-1) * screenWidth + movePos + 21
					
					if ( movePos >= 0 ){
						// console.log('--->');
						if( parseInt(M('[data-tab] ul').css('x')) >= 21 ) {
							M('[data-tab] ul').css('x', '21px');
							M('[data-tab] .btnPrev').data('button-show', 'false');
						} else {
							M('[data-tab] ul').css('x', movePagePos+'px');
						}
					} else {
						// console.log('<---');
						if( parseInt(M('[data-tab] ul').css('x')) <= -1 * (totalPage-1) * screenWidth + 21 ) {
							M('[data-tab] ul').css('x', -1 * (totalPage-1) * screenWidth + 21 + 'px');
						} else {
							M('[data-tab] ul').css('x', movePagePos+'px');
						}
					}
					M('[data-tab] [data-idx="'+activeMenuIdx+'"]').removeClass('on');
				}
				break;
				
			case 'mouseup': case 'touchend':
				isClicked = false;
				document.body.removeEventListener('mousemove', dragHandler, false);
				document.body.removeEventListener('touchmove', dragHandler, false);
				document.body.removeEventListener('mouseup', dragHandler, false);
				document.body.removeEventListener('touchend', dragHandler, false);
				
				if (endPos == undefined) {
					if( M('[data-tab] [data-idx="'+activeMenuIdx+'"] a').data('callback') == null ) {
						var  targetUrl = M('[data-tab] [data-idx="'+activeMenuIdx+'"] a').data('href').split('?')[0]
							,parameter = M('[data-tab] [data-idx="'+activeMenuIdx+'"] a').data('href').split('?')[1]
							,animation = 'NONE';
						if (targetUrl != "#") {
							parameter == undefined ? parameter = '' : parameter;
							moveToTab(targetUrl, parameter, animation);
						}
					} else {
						var param = M('[data-tab] [data-idx="'+activeMenuIdx+'"] a').data('callback-param') || '';
						eval( M('[data-tab] [data-idx="'+activeMenuIdx+'"] a').data('callback') ) ( param );
						
						M('[data-tab] li:nth-child('+selectedMenu+')').removeClass('se');
						selectedMenu = activeMenuIdx;
						M('[data-tab] li:nth-child('+selectedMenu+')').addClass('se');
					}
				}else{
					if (movePos < -10) {
						//console.log('<---');
						if (currentPage != totalPage) {
							currentPage++;
						}
					} else if (movePos > 10) {
						//console.log('--->');
						if (currentPage != 1) {
							currentPage--;
						}
					}
				}
				
				setHiddenMenu(currentPage);
				M('[data-tab] [data-idx="'+activeMenuIdx+'"]').removeClass('on');
				startPos = endPos = undefined;
				
				nextPagePos = -1 * (currentPage-1) * screenWidth + 21;
				M('[data-tab] ul').animate({
					 'x': nextPagePos+'px'
					,'time': '0.4s'
				});
				break;
		}
	}
	
	
	// show/hidden data
	function setHiddenMenu(_page) {
		var  from = (_page - 1) * 4
			,end = _page * 4 - 1
			
		for(var i=0; i<menuLength; i++){
			if (from > i || end < i) {
				// console.log('hidden', i)
				M('[data-tab] li:nth-child('+(i+1)+')').data('show', 'false');
			} else {
				// console.log('show', i)
				M('[data-tab] li:nth-child('+(i+1)+')').data('show', 'true');
			}
		}
		
		if(currentPage == '1'){
			M('[data-tab] .btnPrev').data('button-show', 'false');
			M('[data-tab] .btnNext').data('button-show', 'true');
		} else if(currentPage == totalPage) {
			M('[data-tab] .btnPrev').data('button-show', 'true');
			M('[data-tab] .btnNext').data('button-show', 'false');
		} else {
			M('[data-tab] .btnPrev').data('button-show', 'true');
			M('[data-tab] .btnNext').data('button-show', 'true');
		}
		
		M('[data-button-show="true"]').animate({
			 opacity: '1'
			,time:'0.2s'
		})
		if (M('[data-button-show="false"]').selector.length > 0) {
			M('[data-button-show="false"]').animate({
				 opacity: '0'
				,time:'0.2s'
			})
		}
		M('[data-show="false"]').animate({
			 opacity: '0'
			,time:'0.2s'
		});
		
	}
	
};//)( mpui, document );
window.addEventListener('load', initTabmenu, false);




















