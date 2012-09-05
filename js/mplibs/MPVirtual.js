/************************************************************************
 MPVirtual.js
 모피어스 프레임웍의 PC가상화 모듈 스크립트
 Author : 백국경 (romeoh@uracle.co.kr) & 이아연(ahyeon@uracle.co.kr)
 Copyright © 2001-2011 Uracle Co., Ltd. 
 166 Samseong-dong, Gangnam-gu, Seoul, 135-090, Korea All Rights Reserved.
 모피어스 프레임원을 이용한 하이브리드앱 PC개발을 위한 스크립스 함수들을 정의한다.
 ************************************************************************/
 
var MPVirtual = {
	checkAjax:true,
	funcFlag:undefined,
	
	/** 
	 * 가상모듈 초기화
	 */
	init: function(mode){
		if(MPVirtual.historyIdx == undefined){
			//if(parent.location.hash == "#m") MPVirtual.mobileMode();
			if(parent.location.hash == "#m") MPVirtual.mobileMode = "#m";
			else MPVirtual.mobileMode = "";
			MPVirtual.historyIdx = document.querySelectorAll("[data-url]").length;
			MPVirtual.pageMotionTime = 0.4;	
			if( mode == 'dev' ){
				MPVirtual.devMode = true;
				MPVirtual.newViewDefaultInitLeft = parent.window.innerWidth - 670;
			}else{
				MPVirtual.devMode = false;
			}
			MPVirtual.windowWidth = (MPVirtual.devMode == true)?220:parent.window.innerWidth;
			MPVirtual.windowHeight = (MPVirtual.devMode == true)?380:parent.window.innerHeight;
			MPVirtual.newViewDefaultTop = (MPVirtual.devMode == true)?(parent.window.innerHeight/2 - MPVirtual.windowHeight/2):0;
			MPVirtual.newViewDefaultLeft = (MPVirtual.devMode == true)?(parent.window.innerWidth - 670):0;
			MPVirtual.isHistoryBack = false;	// historyBack경우 onhashchange event발생안함
			MPVirtual.isMoveToWeb = false;		// moveToWeb 경우만 onhashchange event 발생함
			MPVirtual.serverList = new Array();
			MPVirtual.gVari = new GlobalVariable();
			
			MPVirtual.oldViewMotion = {}
			MPVirtual.newViewMotion = {}
			MPVirtual.release_version = "1.1.1.1";
			MPVirtual.release_date = '2012.05.10';
			MPVirtual.current_version = '100001';
			MPVirtual.str_manifest = '';
			MPVirtual.isFirstRun = true;
			
			MPVirtual.backPageFlag = false;
		}
		
		MPVirtual.loadAppManifestXml();
//		if(MPVirtual.historyIdx == 0) MPVirtual.loadHash();
	},
	
	/**
	 * AppManifest.xml 초기화 파일 호출(Ajax 호출)
	 */
	loadAppManifestXml: function(){
		var requestXmlHttp = new RequestAjax();
		requestXmlHttp.setAsync = false;
		requestXmlHttp.requestXmlHttp("../AppManifest.xml", MPVirtual.appManifestCbFunction);
	},

	/**
	 * AppManifest.xml 초기화 파일 READ
	 */
	getAppManifestXml: function(_xmlDoc){
		MPVirtual.loadAppManifestXml.developMode = _xmlDoc.getElementsByTagName("develop-mode")[0].childNodes[0].nodeValue;
		MPVirtual.loadAppManifestXml.firstPage = _xmlDoc.getElementsByTagName("startpage-name")[0].childNodes[0].nodeValue;
		MPVirtual.loadAppManifestXml.errorPage = _xmlDoc.getElementsByTagName("errorpage-name")[0].childNodes[0].nodeValue;
		MPVirtual.loadAppManifestXml.appVersion = _xmlDoc.getElementsByTagName("default-version")[0].childNodes[0].nodeValue;
		MPVirtual.loadAppManifestXml.serverAddr = _xmlDoc.querySelector("http-network").querySelector("http-connection-url").childNodes[0].nodeValue;
		MPVirtual.loadAppManifestXml.resourceSize = _xmlDoc.getElementsByTagName("resource-size")[0].childNodes[0].nodeValue;

		if( _xmlDoc.getElementsByTagName("show-screen-switching-indicator")[0] != undefined ){
			MPVirtual.loadAppManifestXml.showIndicator = _xmlDoc.getElementsByTagName("show-screen-switching-indicator")[0].childNodes[0].nodeValue;
		}else{
			MPVirtual.loadAppManifestXml.showIndicator = "Y";
		}
		MPVirtual.loadAppManifestXml.serverNode = _xmlDoc.getElementsByTagName("network-setting")[0].childNodes
		for(var i=0; i<MPVirtual.loadAppManifestXml.serverNode.length; i++){ 
			if( MPVirtual.loadAppManifestXml.serverNode[i].nodeType == 1 ){
				try{  
					MPVirtual.networkManager = MPVirtual.loadAppManifestXml.serverNode[i].querySelector("http-network-manager").firstChild.nodeValue; 
					MPVirtual.networkManager = MPVirtual.networkManager.split(".")[MPVirtual.networkManager.split(".").length-1];
					MPVirtual.serverList.push(
						new MPVirtual.pushToServerList(
							MPVirtual.loadAppManifestXml.serverNode[i].getAttribute("name"), 
							MPVirtual.loadAppManifestXml.serverNode[i].querySelector("http-connection-url").firstChild.nodeValue,
							MPVirtual.networkManager
						)
					);
				}catch(e){}
			}
		}
	}, 
	
	/**
	 * AppManifest.xml 초기화 파일 호출(Ajax 호출)
	 */
	appManifestCbFunction: function(_val){
		if(this.readyState == "4"){
			if(this.status == 200 || this.status == 0){
				MPVirtual.getAppManifestXml(this.responseXML); 
			}else{
				try{ 
					document.querySelector("#domIfrm" + MPVirtual.historyIdx).contentWindow.onHandlingNetworkError(); 
				}catch(e){
					console.log(e);
				};
				return false;
			}
		}
		if(MPVirtual.historyIdx == 0) {
			MPVirtual.loadHash();
		}
	}, 
	
	/**
	 * load hash
	 */
	loadHash: function(_className, _actionType, _animationType){
//		MPVirtual.loadIndicator(MPVirtual.historyIdx, "로딩중입니다.", "잠시만 기다려주세요.", 220, 50);
		var loadComponent = new LoadComponent(220,50);
		loadComponent.loadIndicator(MPVirtual.historyIdx, "로딩중입니다.", "잠시만 기다려주세요.", 220, 50);
		
		//해시태그 변경시 화면 생성
		if(parent.location.hash == "#"+_className) MPVirtual.hashChange(_className, _actionType, _animationType);
		if(MPVirtual.isMoveToWeb) window.addEventListener("hashchange", hashChangeHandler = function(e){ MPVirtual.hashChange(_className, _actionType, _animationType, e); }, false);
		
		if(MPVirtual.mpWrap == undefined) MPVirtual.mpWrap = parent.document.getElementById("mpWrap");
		//hash 설정, motion iframe
		if(MPVirtual.historyIdx != 0) parent.location.hash = _className; //최초실행이 아님
		else{ 
			//최초실행
			if(parent.location.hash == "" || parent.location.hash == "#m") MPVirtual.url = MPVirtual.loadAppManifestXml.firstPage;	//해쉬태그없음
			else MPVirtual.url = parent.location.hash.replace("#", "");	//해쉬태그있음
			MPVirtual.createView(MPVirtual.url, "NEW_SCR"); 
			document.querySelector("#domIfrm" + MPVirtual.historyIdx).style.opacity = 1;
		}
	},
	
	hashChange: function(_className, _actionType, _animationType, _event){
		MPVirtual.isMoveToWeb = false;
		try{ window.removeEventListener("hashchange", hashChangeHandler, false); } catch(e){}
		
		if(!MPVirtual.isHistoryBack){
			MPVirtual.url = parent.location.hash.replace("#", "");
			//CLEAR_TOP처리
			if(_actionType == "CLEAR_TOP") MPVirtual.clearTop(_className, _actionType, _animationType, _event);
			else MPVirtual.createView(MPVirtual.url, _actionType);
		}
	},
	
	//clear_top처리
	clearTop: function(_className, _actionType, _animationType, _event){
		MPVirtual.backPageFlag = true;
		MPVirtual.hashChange.stackAllLength = document.querySelectorAll("[data-stack-index]").length;
		var loadComponent = new LoadComponent();
		loadComponent.removeIndicator();
		while(MPVirtual.historyIdx){
			MPVirtual.hashChange.stackLength = document.querySelectorAll("[data-stack-index]").length;
			MPVirtual.hashChange.stackView = document.querySelector("[data-stack-index='"+MPVirtual.historyIdx+"']");
			MPVirtual.hashChange.stackUrl = MPVirtual.hashChange.stackView.getAttribute("data-url");
			
			if(_className.split("?")[0] != MPVirtual.hashChange.stackUrl){
				//스택제거
				if(MPVirtual.historyIdx == MPVirtual.hashChange.stackAllLength){
					MPVirtual.oldScreen = document.querySelector("[data-stack-index='"+MPVirtual.historyIdx+"']");
				}else{
					try{
						document.querySelector("#domIfrm" + MPVirtual.historyIdx).contentWindow.onDestroyPage();
					}catch(e){
						console.log(e);
					}
					mpWrap.removeChild(document.querySelector("[data-stack-index='"+MPVirtual.historyIdx+"']"));
				}
				
			}else{
				//console.log("새로운 화면: "+document.querySelector("[data-stack-index='"+MPVirtual.historyIdx+"']").id);
				document.querySelector("[data-stack-index='"+MPVirtual.historyIdx+"']").setAttribute("data-parameter", _className.split("?")[1]);
				MPVirtual.newScreen = document.querySelector("[data-stack-index='"+MPVirtual.historyIdx+"']");
				MPVirtual.newScreen.style.display = "block";
				MPVirtual.oldViewMotion.onFinish = MPVirtual.removeClearTopStack;
				switch(_animationType){
					case "NONE":
						MPVirtual.oldViewMotion.time = .1;
						MPVirtual.oldViewMotion.top = 1;
						MPVirtual.oldViewMotion.left = 0;
						MPVirtual.newViewDefaultLeft = 0;
						MPVirtual.newViewDefaultTop = 0;
						MPVirtual.newViewMotion.time = 0.1;
						MPVirtual.newViewMotion.top = 0;
						MPVirtual.newViewMotion.left = 0;
					break;
					case "DEFAULT": case "SLIDE_LEFT":
						MPVirtual.oldViewMotion.time = MPVirtual.pageMotionTime; 
						MPVirtual.oldViewMotion.top = (MPVirtual.devMode == true)?MPVirtual.newViewDefaultTop:0;
						var backFlag;
						if( MPVirtual.backPageFlag ){
							backFlag = MPVirtual.windowWidth*2;
						}else{
							backFlag = MPVirtual.windowWidth;
						}
						MPVirtual.oldViewMotion.left = (MPVirtual.devMode == true)?MPVirtual.newViewDefaultLeft - (backFlag*1):-1 * MPVirtual.windowWidth; 
						MPVirtual.newViewDefaultTop = (MPVirtual.devMode == true)?MPVirtual.newViewDefaultTop:0;
						MPVirtual.newViewDefaultLeft = (MPVirtual.devMode == true)?MPVirtual.newViewDefaultLeft:-1 * MPVirtual.windowWidth;
						MPVirtual.newViewMotion.time = MPVirtual.pageMotionTime;
						MPVirtual.newViewMotion.top = (MPVirtual.devMode == true)?MPVirtual.newViewDefaultTop:0;   
						MPVirtual.newViewMotion.left = (MPVirtual.devMode == true)?MPVirtual.newViewDefaultLeft - (MPVirtual.windowWidth*1):0;
					break;
					case "SLIDE_RIGHT":
						MPVirtual.oldViewMotion.time = MPVirtual.pageMotionTime;
						MPVirtual.oldViewMotion.top = 0;
						MPVirtual.oldViewMotion.left = MPVirtual.windowWidth;
						MPVirtual.newViewDefaultLeft = -1 * MPVirtual.windowWidth;
						MPVirtual.newViewDefaultTop = 0;
						MPVirtual.newViewMotion.time = MPVirtual.pageMotionTime;
						MPVirtual.newViewMotion.top = 0;
						MPVirtual.newViewMotion.left = 0;
					break;
					case "SLIDE_TOP":
						MPVirtual.oldViewMotion.time = MPVirtual.pageMotionTime;
						MPVirtual.oldViewMotion.top = -1 * MPVirtual.windowHeight;
						MPVirtual.oldViewMotion.left  = 0;
						MPVirtual.newViewDefaultTop = MPVirtual.windowHeight;
						MPVirtual.newViewDefaultLeft = 0;
						MPVirtual.newViewMotion.time = MPVirtual.pageMotionTime;
						MPVirtual.newViewMotion.top = 0;
						MPVirtual.newViewMotion.left = 0;
					break;
					case "SLIDE_BOTTOM":
						MPVirtual.oldViewMotion.time = MPVirtual.pageMotionTime;
						MPVirtual.oldViewMotion.top = MPVirtual.windowHeight;
						MPVirtual.oldViewMotion.left = 0;
						MPVirtual.newViewDefaultTop = -1 * MPVirtual.windowHeight;
						MPVirtual.newViewDefaultLeft = 0;
						MPVirtual.newViewMotion.time = MPVirtual.pageMotionTime;
						MPVirtual.newViewMotion.top = 0;
						MPVirtual.newViewMotion.left = 0;
					break;
					case "MODAL_LEFT":
						MPVirtual.oldViewMotion.time = MPVirtual.pageMotionTime;
						MPVirtual.oldViewMotion.top = 1;
						MPVirtual.oldViewMotion.left = 0;
						MPVirtual.newViewDefaultLeft = MPVirtual.windowWidth;
						MPVirtual.newViewDefaultTop = 0;
						MPVirtual.newViewMotion.time = MPVirtual.pageMotionTime;
						MPVirtual.newViewMotion.top = 0;
						MPVirtual.newViewMotion.left = 0;
					break;
					case "MODAL_RIGHT":
						MPVirtual.oldViewMotion.time = MPVirtual.pageMotionTime;
						MPVirtual.oldViewMotion.top = 1;
						MPVirtual.oldViewMotion.left = 0;
						MPVirtual.newViewDefaultLeft = -1 * MPVirtual.windowWidth;
						MPVirtual.newViewDefaultTop = 0;
						MPVirtual.newViewMotion.time = MPVirtual.pageMotionTime;
						MPVirtual.newViewMotion.top = 0;
						MPVirtual.newViewMotion.left = 0;
					break;
					case "MODAL_UP":
						MPVirtual.oldViewMotion.time = MPVirtual.pageMotionTime;
						MPVirtual.oldViewMotion.top = 1;
						MPVirtual.oldViewMotion.left = 0;
						MPVirtual.newViewDefaultTop = MPVirtual.windowHeight;
						MPVirtual.newViewDefaultLeft = 0;
						MPVirtual.newViewMotion.time = MPVirtual.pageMotionTime;
						MPVirtual.newViewMotion.top = 0;
						MPVirtual.newViewMotion.left = 0;
					break;
					case "MODAL_DOWN":
						MPVirtual.oldViewMotion.time = MPVirtual.pageMotionTime;
						MPVirtual.oldViewMotion.top = 1;
						MPVirtual.oldViewMotion.left = 0;
						MPVirtual.newViewDefaultTop = -1 * MPVirtual.windowHeight;
						MPVirtual.newViewDefaultLeft = 0;
						MPVirtual.newViewMotion.time = MPVirtual.pageMotionTime;
						MPVirtual.newViewMotion.top = 0;
						MPVirtual.newViewMotion.left = 0;
					break;
					case "FADE":
						MPVirtual.oldViewMotion.time = 2 * MPVirtual.pageMotionTime;
						MPVirtual.oldViewMotion.top = 1;
						MPVirtual.oldViewMotion.left = 0;
						MPVirtual.newViewDefaultTop = 0;
						MPVirtual.newViewDefaultLeft = 0;
						MPVirtual.newViewMotion.time = 2 * MPVirtual.pageMotionTime;
						MPVirtual.newViewMotion.opacity = 1;
						MPVirtual.newViewMotion.top = 0;
						MPVirtual.newViewMotion.left = 0;
					break;
					case "ZOOM_IN":
						MPVirtual.oldViewMotion.time = 2 * MPVirtual.pageMotionTime;
						MPVirtual.oldViewMotion.top = 1;
						MPVirtual.oldViewMotion.left = 0;
						MPVirtual.oldViewMotion.time = 2 * MPVirtual.pageMotionTime;
						MPVirtual.oldViewMotion.top = 1;
						MPVirtual.oldViewMotion.left = 0;
						MPVirtual.newViewDefaultTop = 0;
						MPVirtual.newViewDefaultLeft = 0;
						MPVirtual.newViewMotion.time = 2 * MPVirtual.pageMotionTime;
						MPVirtual.newViewMotion.opacity = 1;
						MPVirtual.newViewMotion.top = 0;
						MPVirtual.newViewMotion.left = 0;
						MPVirtual.newViewMotion.scale = 1;
						MPVirtual.newViewMotion.zoom = "IN";
					break;
					case "ZOOM_OUT":
						MPVirtual.oldViewMotion.time = 2 * MPVirtual.pageMotionTime;
						MPVirtual.oldViewMotion.top = 1;
						MPVirtual.oldViewMotion.left = 0;
						MPVirtual.newViewDefaultTop = 0;
						MPVirtual.newViewDefaultLeft = 0;
						MPVirtual.newViewMotion.time = 2 * MPVirtual.pageMotionTime;
						MPVirtual.newViewMotion.opacity = 1;
						MPVirtual.newViewMotion.top = 0;
						MPVirtual.newViewMotion.left = 0;
						MPVirtual.newViewMotion.scale = 1;
						MPVirtual.newViewMotion.zoom = "OUT";
					break;
				}
				break;
			}
			MPVirtual.historyIdx--;
		}
		if(MPVirtual.historyIdx == 0){
			//스택에 같은 화면 없음 onRestorePage() 호출됨
			MPVirtual.oldViewMotion.onFinish = MPVirtual.removeClearTopAll;
			MPVirtual.oldScreen.setAttribute("data-stack-index", MPVirtual.historyIdx);
			MPVirtual.createView(_className, _actionType)
		}else{
			//스택에 같은 화면 있음 onRestorePage() 호출됨
			if(!MPVirtual.newViewMotion.opacity) MPVirtual.newScreen.style.opacity = 1;
			
			if(MPVirtual.newViewMotion.zoom == "IN") MPVirtual.newScreen.style.cssText += "-webkit-transform:scale(0)"
			else if(MPVirtual.newViewMotion.zoom == "OUT") MPVirtual.newScreen.style.cssText += "-webkit-transform:scale(2)"
			
			MPVirtual.oldViewMotion.onFinish = MPVirtual.restoreCallBackClearTop;
			MPVirtual.newScreen.style.top = MPVirtual.newViewDefaultTop+"px";
			MPVirtual.newScreen.style.left = MPVirtual.newViewDefaultLeft+"px";
			MPTween(MPVirtual.oldScreen, MPVirtual.oldViewMotion);
			MPTween(MPVirtual.newScreen, MPVirtual.newViewMotion);
		}
	},
	
	//clearTop 스택 삭제
	removeClearTopStack: function(){
		try{
			document.querySelector("#domIfrm" + MPVirtual.hashChange.stackAllLength).contentWindow.onDestroyPage();
		}catch(e){
			console.log(e);
		}
		mpWrap.removeChild(document.querySelector("[data-stack-index='"+MPVirtual.hashChange.stackAllLength+"']"));
	},
	
	//화면생성
	createView: function(_url, _actionType){
		if( _actionType == "NO_HISTORY" ){
			MPVirtual.noHistoryFlag = true;
		}
		
		MPVirtual.createView.url = (_url != undefined )?_url.split("?")[0]:_url; 
		MPVirtual.createView.domIframe = document.createElement("iframe");
		   
		with(MPVirtual.createView.domIframe){
			id = "domIfrm" + (MPVirtual.historyIdx + 1); 
			src = _url;//+ '?screen_id=' + (MPVirtual.historyIdx + 1);
			style.width = MPVirtual.windowWidth + "px";
			style.height = MPVirtual.windowHeight + "px";
			style.top = MPVirtual.newViewDefaultTop + "px";
			style.left = MPVirtual.newViewDefaultLeft + "px";
			style.opacity = 0;
		}
		MPVirtual.mpWrap.appendChild(MPVirtual.createView.domIframe);
		MPVirtual.createView.domIframe.setAttribute("data-url", MPVirtual.createView.url);
		MPVirtual.createView.domIframe.setAttribute("data-action-type", _actionType);
		if(_actionType == "CLEAR_TOP") MPVirtual.historyIdx = 1;
		else MPVirtual.historyIdx = document.querySelectorAll("[data-url]").length;
		
		MPVirtual.createView.domIframe.setAttribute("data-stack-index", MPVirtual.historyIdx);
		
		//초기화 함수 실행
		document.querySelector("#domIfrm" + MPVirtual.historyIdx).contentWindow.addEventListener("load", loadComplete = function(e){
			if(e.srcElement.URL.indexOf(MPVirtual.createView.url.replace("..", "")) == -1){
				document.querySelector("#domIfrm" + MPVirtual.historyIdx).src = MPVirtual.loadAppManifestXml.errorPage;
			} 
			
			var tagName = eval("domIfrm" + (MPVirtual.historyIdx)).document.createElement("input");
			tagName.setAttribute("id", "mpScreenId");
			tagName.setAttribute("type", "hidden");
			tagName.setAttribute("value", MPVirtual.historyIdx);
			eval("domIfrm" + (MPVirtual.historyIdx)).document.body.appendChild(tagName);
			 
			MPVirtual.initPage(_actionType);
			document.querySelector("#domIfrm" + MPVirtual.historyIdx).contentWindow.removeEventListener("load", loadComplete, false);
		}, false);
		 
		MPVirtual.stackLog();
	},
	
	//페이지 모션
	pageMotion: function(_actionType){ 
		if(_actionType != "CLEAR_TOP"){
			MPVirtual.oldScreenIdx = MPVirtual.historyIdx - 1; 
			MPVirtual.oldScreen = document.querySelector("#domIfrm" + MPVirtual.oldScreenIdx);
		}
		MPVirtual.newScreen = document.querySelector("#domIfrm" + MPVirtual.historyIdx);
		if(!MPVirtual.newViewMotion.opacity) MPVirtual.newScreen.style.opacity = 1;
		
		if(MPVirtual.oldScreen != null){
			if(MPVirtual.newViewMotion.zoom == "IN") MPVirtual.newScreen.style.cssText += "-webkit-transform:scale(0)";
			else if(MPVirtual.newViewMotion.zoom == "OUT") MPVirtual.newScreen.style.cssText += "-webkit-transform:scale(2)";

			if( MPVirtual.devMode == true ){
				if( MPVirtual.historyIdx <= 2 ){
					MPVirtual.oldScreen.style.left = MPVirtual.newViewDefaultLeft + 'px';
					MPTween(MPVirtual.oldScreen, MPVirtual.oldViewMotion);
				}else{
					for( var z = 1; z < MPVirtual.historyIdx; z++ ){
						MPVirtual.oldViewMotion.left = (MPVirtual.newViewMotion.left - (MPVirtual.windowWidth*(MPVirtual.historyIdx-z)));
						MPTween(document.querySelector("#domIfrm" + z), MPVirtual.oldViewMotion); 
					}
				}
			}else{
				MPTween(MPVirtual.oldScreen, MPVirtual.oldViewMotion);
				MPTween(MPVirtual.newScreen, MPVirtual.newViewMotion);
			}
			MPTween(MPVirtual.newScreen, MPVirtual.newViewMotion);
		}
	},
	
	//NO_HISTORY 삭제
	removeNoHistoryStack: function(){ 
		// NO_HISTORY view 삭제
		if(document.querySelector("#domIfrm"+(MPVirtual.historyIdx-1)).getAttribute("data-action-type") == "NO_HISTORY"){
			mpWrap.removeChild(document.querySelector("[data-action-type='NO_HISTORY']"));
		}
		
		MPVirtual.historyIdx = document.querySelectorAll("[data-url]").length;
		MPVirtual.createView.domIframe.id = "domIfrm"+MPVirtual.historyIdx;
		MPVirtual.createView.domIframe.setAttribute("data-stack-index", MPVirtual.historyIdx);
		document.querySelector("#domIfrm"+(MPVirtual.historyIdx-1)).style.display = (MPVirtual.devMode == true)?"block":"none";
		
//		try{
			if(typeof document.querySelector("#domIfrm" + MPVirtual.historyIdx).contentWindow.onInitPage != undefined){
				document.querySelector("#domIfrm" + MPVirtual.historyIdx).contentWindow.onInitPage(); 
			}
//		}catch(e){
//			console.log(e);
//		}
		try{
			eval("domIfrm" + MPVirtual.historyIdx).removeEventListener("focus", MPVirtual.onResume, false);
			eval("domIfrm" + MPVirtual.historyIdx).removeEventListener("blur", MPVirtual.onPause, false);
		}catch(e){}
	},
	
	//clear_top 모션 완료후 스택삭제
	removeClearTopAll: function(){
		try{
			document.querySelector("[data-stack-index='0']").contentWindow.onDestroyPage();
		}catch(e){
			console.log(e);
		}
		mpWrap.removeChild(document.querySelector("[data-stack-index='0']"));
		document.querySelector("[data-stack-index='1']").setAttribute("data-action-type", "NEW_SCR");
	},
	
	//clear_top 모션 완료후 onRestorePage호출
	restoreCallBackClearTop: function(){
		mpWrap.removeChild(document.querySelector("[data-stack-index='"+MPVirtual.hashChange.stackAllLength+"']"));
		try{
			document.querySelector("#domIfrm" + MPVirtual.historyIdx).contentWindow.onRestorePage();	
		}catch(e){
			console.log(e);
		}
	},
	
	//pushToServerList
	pushToServerList: function(_serverName, _severUrl, _networkManager){
		this.serverName = _serverName;
		this.serverUrl = _severUrl;
		this.networkManager = _networkManager;
	},
	
	/**
	 * 페이지가 시작될때 호출된다. (실제적으로 페이지가 완전히 로드후 불려진다)
	 */
	initPage: function(_actionType){
		try{
			eval("domIfrm" + (MPVirtual.historyIdx)).addEventListener("focus", MPVirtual.onResume, false);
			eval("domIfrm" + (MPVirtual.historyIdx)).addEventListener("blur", MPVirtual.onPause, false);
		}catch(e){}

		if( (MPVirtual.historyIdx - 1) != 0 ){
			try{
				eval("domIfrm" + (MPVirtual.historyIdx-1)).removeEventListener("focus", MPVirtual.onResume, false);
				eval("domIfrm" + (MPVirtual.historyIdx-1)).removeEventListener("blur", MPVirtual.onPause, false);
			}catch(e){}
		}
		MPVirtual.pageMotion(_actionType);
		var loadComponent = new LoadComponent();
		loadComponent.removeIndicator();
//		MPVirtual.removeIndicator();
		
		parent.mpWrap.style.height = MPVirtual.windowHeight + "px";
		if(MPVirtual.isFirstRun){
//			try{
				if(typeof document.querySelector("#domIfrm" + MPVirtual.historyIdx).contentWindow.onInitPage != undefined){
					document.querySelector("#domIfrm" + MPVirtual.historyIdx).contentWindow.onInitPage();  
				}
//			}catch(e){
//				console.log(e);
//			}
			MPVirtual.isFirstRun = false;
		}
	},
	
	//스택확인 LOG
	stackLog: function(){
	},
	
	//  화면 상태 이벤트 함수인 onResume() 호출
	onResume: function(){
		try{
			document.querySelector("#domIfrm" + MPVirtual.historyIdx).contentWindow.onResume(); 
		}catch(e){
			//console.log(e);
		}
	},
	//  화면 상태 이벤트 함수인 onPause() 호출
	onPause: function(){
		try{
			document.querySelector("#domIfrm" + MPVirtual.historyIdx).contentWindow.onPause(); 
		}catch(e){
			//console.log(e);
		}
	},

	/**
	 * 화면 이동
	 */
	wnMoveToHtmlPage: function(_className, _actionType, _animationType, _orientation){
		MPVirtual.isMoveToWeb = true;
		//화면이동 모션에니메이션
		MPVirtual.oldViewMotion = {};
		MPVirtual.oldViewMotion.onFinish = MPVirtual.removeNoHistoryStack;
		MPVirtual.newViewMotion = {};
		switch(_animationType){
			case "NONE":
				MPVirtual.oldViewMotion.time = .1;
				MPVirtual.oldViewMotion.top = 1;
				MPVirtual.oldViewMotion.left = 0;
				MPVirtual.newViewDefaultLeft = 0;
				MPVirtual.newViewDefaultTop = 0;
				MPVirtual.newViewMotion.time = 0.1;
				MPVirtual.newViewMotion.top = 0;
				MPVirtual.newViewMotion.left = 0;
			break;
			case "DEFAULT": case "SLIDE_LEFT": 
				MPVirtual.oldViewMotion.time = MPVirtual.pageMotionTime; 
				MPVirtual.oldViewMotion.top = (MPVirtual.devMode == true)?MPVirtual.newViewDefaultTop:0;  
				var backFlag;
				if( MPVirtual.backPageFlag ){
					backFlag = MPVirtual.windowWidth*2;
				}else{
					backFlag = MPVirtual.windowWidth;
				}
				MPVirtual.oldViewMotion.left = (MPVirtual.devMode == true)?MPVirtual.newViewDefaultLeft - (backFlag*1):-1 * MPVirtual.windowWidth;
				MPVirtual.newViewDefaultLeft = (MPVirtual.devMode == true)?MPVirtual.newViewDefaultInitLeft + MPVirtual.windowWidth:MPVirtual.windowWidth;
				MPVirtual.newViewDefaultTop = (MPVirtual.devMode == true)?MPVirtual.newViewDefaultTop:0;
				MPVirtual.newViewMotion.time = MPVirtual.pageMotionTime;
				MPVirtual.newViewMotion.top = (MPVirtual.devMode == true)?MPVirtual.newViewDefaultTop:0;
				MPVirtual.newViewMotion.left = (MPVirtual.devMode == true)?MPVirtual.newViewDefaultLeft - MPVirtual.windowWidth:0; 
			break;
			case "SLIDE_RIGHT":
				MPVirtual.oldViewMotion.time = MPVirtual.pageMotionTime;
				MPVirtual.oldViewMotion.top = 0;
				MPVirtual.oldViewMotion.left = MPVirtual.windowWidth;
				MPVirtual.newViewDefaultLeft = -1 * MPVirtual.windowWidth;
				MPVirtual.newViewDefaultTop = 0;
				MPVirtual.newViewMotion.time = MPVirtual.pageMotionTime;
				MPVirtual.newViewMotion.top = 0;
				MPVirtual.newViewMotion.left = 0;
			break;
			case "SLIDE_TOP":
				MPVirtual.oldViewMotion.time = MPVirtual.pageMotionTime;
				MPVirtual.oldViewMotion.top = -1 * MPVirtual.windowHeight;
				MPVirtual.oldViewMotion.left = 0;
				MPVirtual.newViewDefaultTop = MPVirtual.windowHeight;
				MPVirtual.newViewDefaultLeft = 0;
				MPVirtual.newViewMotion.time = MPVirtual.pageMotionTime;
				MPVirtual.newViewMotion.top = 0;
				MPVirtual.newViewMotion.left = 0;
			break;
			case "SLIDE_BOTTOM":
				MPVirtual.oldViewMotion.time = MPVirtual.pageMotionTime;
				MPVirtual.oldViewMotion.top = MPVirtual.windowHeight;
				MPVirtual.oldViewMotion.left = 0;
				MPVirtual.newViewDefaultTop = -1 * MPVirtual.windowHeight;
				MPVirtual.newViewDefaultLeft = 0;
				MPVirtual.newViewMotion.time = MPVirtual.pageMotionTime;
				MPVirtual.newViewMotion.top = 0;
				MPVirtual.newViewMotion.left = 0;
			break;
			case "MODAL_LEFT":
				MPVirtual.oldViewMotion.time = MPVirtual.pageMotionTime;
				MPVirtual.oldViewMotion.top = 1;
				MPVirtual.oldViewMotion.left = 0;
				MPVirtual.newViewDefaultLeft = MPVirtual.windowWidth;
				MPVirtual.newViewDefaultTop = 0;
				MPVirtual.newViewMotion.time = MPVirtual.pageMotionTime;
				MPVirtual.newViewMotion.top = 0;
				MPVirtual.newViewMotion.left = 0;
			break;
			case "MODAL_RIGHT":
				MPVirtual.oldViewMotion.time = MPVirtual.pageMotionTime;
				MPVirtual.oldViewMotion.top = 1;
				MPVirtual.oldViewMotion.left = 0;
				MPVirtual.newViewDefaultLeft = -1 * MPVirtual.windowWidth;
				MPVirtual.newViewDefaultTop = 0;
				MPVirtual.newViewMotion.time = MPVirtual.pageMotionTime;
				MPVirtual.newViewMotion.top = 0;
				MPVirtual.newViewMotion.left = 0;
			break;
			case "MODAL_UP":
				MPVirtual.oldViewMotion.time = MPVirtual.pageMotionTime;
				MPVirtual.oldViewMotion.top = 1;
				MPVirtual.oldViewMotion.left = 0;
				MPVirtual.newViewDefaultTop = MPVirtual.windowHeight;
				MPVirtual.newViewDefaultLeft = 0;
				MPVirtual.newViewMotion.time = MPVirtual.pageMotionTime;
				MPVirtual.newViewMotion.top = 0;
				MPVirtual.newViewMotion.left = 0;
			break;
			case "MODAL_DOWN":
				MPVirtual.oldViewMotion.time = MPVirtual.pageMotionTime;
				MPVirtual.oldViewMotion.top = 1;
				MPVirtual.oldViewMotion.left = 0;
				MPVirtual.newViewDefaultTop = -1 * MPVirtual.windowHeight;
				MPVirtual.newViewDefaultLeft = 0;
				MPVirtual.newViewMotion.time = MPVirtual.pageMotionTime;
				MPVirtual.newViewMotion.top = 0;
				MPVirtual.newViewMotion.left = 0;
			break;
			case "FADE":
				MPVirtual.oldViewMotion.time = 2 * MPVirtual.pageMotionTime;
				MPVirtual.oldViewMotion.top = 1;
				MPVirtual.oldViewMotion.left = 0;
				MPVirtual.newViewDefaultTop = 0;
				MPVirtual.newViewDefaultLeft = 0;
				MPVirtual.newViewMotion.time = 2 * MPVirtual.pageMotionTime;
				MPVirtual.newViewMotion.opacity = 1;
				MPVirtual.newViewMotion.top = 0;
				MPVirtual.newViewMotion.left = 0;
			break;
			case "ZOOM_IN":
				MPVirtual.oldViewMotion.time = 2 * MPVirtual.pageMotionTime;
				MPVirtual.oldViewMotion.top = 1;
				MPVirtual.oldViewMotion.left = 0;
				MPVirtual.newViewDefaultTop = 0;
				MPVirtual.newViewDefaultLeft = 0;
				MPVirtual.newViewMotion.time = 2 * MPVirtual.pageMotionTime;
				MPVirtual.newViewMotion.opacity = 1;
				MPVirtual.newViewMotion.top = 0;
				MPVirtual.newViewMotion.left = 0;
				MPVirtual.newViewMotion.scale = 1;
				MPVirtual.newViewMotion.zoom = "IN";
			break;
			case "ZOOM_OUT":
				MPVirtual.oldViewMotion.time = 2 * MPVirtual.pageMotionTime;
				MPVirtual.oldViewMotion.top = 1;
				MPVirtual.oldViewMotion.left = 0;
				MPVirtual.newViewDefaultTop = 0;
				MPVirtual.newViewDefaultLeft = 0;
				MPVirtual.newViewMotion.time = 2 * MPVirtual.pageMotionTime;
				MPVirtual.newViewMotion.opacity = 1;
				MPVirtual.newViewMotion.top = 0;
				MPVirtual.newViewMotion.left = 0;
				MPVirtual.newViewMotion.scale = 1;
				MPVirtual.newViewMotion.zoom = "OUT";
			break;
		}
		MPVirtual.loadHash(_className, _actionType, _animationType); 
	},
	
	/**
	 * 이전 화면으로 이동한다.
	 */
	wnBackPage: function(_param, _animationType){
		MPVirtual.isHistoryBack = true;
		MPVirtual.backPageFlag = true;
		MPVirtual.historyIdx = document.querySelectorAll("[data-stack-index]").length;
		MPVirtual.oldScreenIdx = MPVirtual.historyIdx - 1;
		MPVirtual.oldScreen = document.querySelector("#domIfrm" + MPVirtual.oldScreenIdx);
		MPVirtual.newScreen = document.querySelector("#domIfrm" + MPVirtual.historyIdx);
		
		//parameter 존재함
		if(_param != "" && _param != undefined) MPVirtual.oldScreen.setAttribute("data-parameter", _param);
				
		//hash처리
		if(MPVirtual.historyIdx <= "2") parent.location.hash = MPVirtual.mobileMode;
		else parent.location.hash = document.querySelector("[data-stack-index='"+(MPVirtual.historyIdx-1)+"']").getAttribute("data-url");
		
		if(MPVirtual.historyIdx == "1") MPVirtual.wnExitProgram();
		else{
			document.querySelector("#domIfrm" + (MPVirtual.historyIdx-1)).style.display = "block";
			
			MPVirtual.newViewMotion.onFinish = "MPVirtual.removeStack";
			MPVirtual.oldViewMotion = {};
			switch(_animationType){
				case "NONE":
					MPVirtual.oldScreen.style.top = 0;
					MPVirtual.oldScreen.style.left = 0;
					MPVirtual.oldViewMotion.time = 0;
					MPVirtual.oldViewMotion.top = 0;
					MPVirtual.oldViewMotion.left = 0;
					MPVirtual.newViewMotion.time = 0;
					MPVirtual.newViewMotion.top = 0;
					MPVirtual.newViewMotion.left = 0;
					MPVirtual.newViewMotion.scale = 1;
					MPVirtual.newViewMotion.opacity = 1;
					MPVirtual.removeStack();
				break;
				case "SLIDE_LEFT":
					MPVirtual.oldScreen.style.top = 0;
					MPVirtual.oldScreen.style.left = MPVirtual.windowWidth + "px";
					MPVirtual.oldViewMotion.time = MPVirtual.pageMotionTime;
					MPVirtual.oldViewMotion.top = 0;
					MPVirtual.oldViewMotion.left = 0;
					MPVirtual.newViewMotion.time = MPVirtual.pageMotionTime;
					MPVirtual.newViewMotion.top = 0;
					MPVirtual.newViewMotion.left = -1 * MPVirtual.windowWidth;
					MPVirtual.newViewMotion.scale = 1;
					MPVirtual.newViewMotion.opacity = 1;
				break;
				case "DEFAULT": case "SLIDE_RIGHT":
					MPVirtual.oldScreen.style.top = (MPVirtual.devMode == true)?MPVirtual.newViewDefaultTop:0;     // original :       0
					MPVirtual.oldScreen.style.left = (MPVirtual.devMode == true)?MPVirtual.newViewDefaultInitLeft:-1 * MPVirtual.windowWidth + "px";     // original :       -1 * MPVirtual.windowWidth + "px" 
					MPVirtual.oldViewMotion.time = MPVirtual.pageMotionTime;
					MPVirtual.oldViewMotion.top = (MPVirtual.devMode == true)?MPVirtual.newViewDefaultTop:0;     // original :       0
					MPVirtual.oldViewMotion.left = (MPVirtual.devMode == true)?MPVirtual.newViewDefaultInitLeft:0;     // original :       0
					MPVirtual.newViewMotion.time = MPVirtual.pageMotionTime;     // original :      MPVirtual.pageMotionTime       
					MPVirtual.newViewMotion.top = (MPVirtual.devMode == true)?MPVirtual.newViewDefaultTop:0;     // original :       0
					MPVirtual.newViewMotion.left = MPVirtual.windowWidth;     // original :    MPVirtual.windowWidth       
					MPVirtual.newViewMotion.scale = 1;     // original :       1
					MPVirtual.newViewMotion.opacity = 1;     // original :       1
				break;
				case "SLIDE_TOP":
					MPVirtual.oldScreen.style.top = MPVirtual.windowHeight + "px";
					MPVirtual.oldScreen.style.left = 0;
					MPVirtual.oldViewMotion.time = MPVirtual.pageMotionTime;
					MPVirtual.oldViewMotion.top = 0;
					MPVirtual.oldViewMotion.left = 0;
					MPVirtual.newViewMotion.time = MPVirtual.pageMotionTime;
					MPVirtual.newViewMotion.top = -1 * MPVirtual.windowHeight;
					MPVirtual.newViewMotion.left = 0;
					MPVirtual.newViewMotion.scale = 1;
					MPVirtual.newViewMotion.opacity = 1;
				break;
				case "SLIDE_BOTTOM":
					MPVirtual.oldScreen.style.top = -1 * MPVirtual.windowHeight + "px";
					MPVirtual.oldScreen.style.left = 0;
					MPVirtual.oldViewMotion.time = MPVirtual.pageMotionTime;
					MPVirtual.oldViewMotion.top = 0;
					MPVirtual.oldViewMotion.left = 0;
					MPVirtual.newViewMotion.time = MPVirtual.pageMotionTime;
					MPVirtual.newViewMotion.top = MPVirtual.windowHeight;
					MPVirtual.newViewMotion.left = 0;
				break;
				case "MODAL_LEFT":
					MPVirtual.oldScreen.style.top = 0;
					MPVirtual.oldScreen.style.left = 0;
					MPVirtual.oldViewMotion.time = MPVirtual.pageMotionTime;
					MPVirtual.oldViewMotion.top = 0;
					MPVirtual.oldViewMotion.left = 0;
					MPVirtual.newViewMotion.time = MPVirtual.pageMotionTime;
					MPVirtual.newViewMotion.top = 0;
					MPVirtual.newViewMotion.left = -1 * MPVirtual.windowWidth;
					MPVirtual.newViewMotion.scale = 1;
					MPVirtual.newViewMotion.opacity = 1;
				break;
				case "MODAL_RIGHT":
					MPVirtual.oldScreen.style.top = 0;
					MPVirtual.oldScreen.style.left = 0;
					MPVirtual.oldViewMotion.time = MPVirtual.pageMotionTime;
					MPVirtual.oldViewMotion.top = 0;
					MPVirtual.oldViewMotion.left = 0;
					MPVirtual.newViewMotion.time = MPVirtual.pageMotionTime;
					MPVirtual.newViewMotion.top = 0;
					MPVirtual.newViewMotion.left = MPVirtual.windowWidth;
					MPVirtual.newViewMotion.scale = 1;
					MPVirtual.newViewMotion.opacity = 1;
				break;
				case "MODAL_UP":
					MPVirtual.oldScreen.style.top = 0;
					MPVirtual.oldScreen.style.left = 0;
					MPVirtual.oldViewMotion.time = MPVirtual.pageMotionTime;
					MPVirtual.oldViewMotion.top = 0;
					MPVirtual.oldViewMotion.left = 0;
					MPVirtual.newViewMotion.time = MPVirtual.pageMotionTime;
					MPVirtual.newViewMotion.top = -1 * MPVirtual.windowHeight;
					MPVirtual.newViewMotion.left = 0;
					MPVirtual.newViewMotion.scale = 1;
					MPVirtual.newViewMotion.opacity = 1;
				break;
				case "MODAL_DOWN":
					MPVirtual.oldScreen.style.top = 0;
					MPVirtual.oldScreen.style.left = 0;
					MPVirtual.oldViewMotion.time = MPVirtual.pageMotionTime;
					MPVirtual.oldViewMotion.top = 0;
					MPVirtual.oldViewMotion.left = 0;
					MPVirtual.newViewMotion.time = MPVirtual.pageMotionTime;
					MPVirtual.newViewMotion.top = MPVirtual.windowHeight;
					MPVirtual.newViewMotion.left = 0;
					MPVirtual.newViewMotion.scale = 1;
					MPVirtual.newViewMotion.opacity = 1;
				break;
				case "FADE":
					MPVirtual.oldScreen.style.top = 0;
					MPVirtual.oldScreen.style.left = 0;
					MPVirtual.oldViewMotion.time = 0.1;
					MPVirtual.oldViewMotion.top = 0;
					MPVirtual.oldViewMotion.left = 0;
					MPVirtual.newViewMotion.time = 2 * MPVirtual.pageMotionTime;
					MPVirtual.newViewMotion.top = 0;
					MPVirtual.newViewMotion.left = 0;
					MPVirtual.newViewMotion.scale = 1;
					MPVirtual.newViewMotion.opacity = 0;
				break;
				case "ZOOM_IN":
					MPVirtual.oldViewMotion.time = 0.1;
					MPVirtual.oldViewMotion.top = 0;
					MPVirtual.oldViewMotion.left = 0;
					MPVirtual.newViewDefaultTop = 0;
					MPVirtual.newViewDefaultLeft = 0;
					MPVirtual.newViewMotion.time = 2 * MPVirtual.pageMotionTime;
					MPVirtual.newViewMotion.opacity = 0;
					MPVirtual.newViewMotion.top = 0;
					MPVirtual.newViewMotion.left = 0;
					MPVirtual.newViewMotion.scale = 2;
				break;
				case "ZOOM_OUT":
					MPVirtual.oldViewMotion.time = 0.1;
					MPVirtual.oldViewMotion.top = 0;
					MPVirtual.oldViewMotion.left = 0;
					MPVirtual.newViewDefaultTop = 0;
					MPVirtual.newViewDefaultLeft = 0;
					MPVirtual.newViewMotion.time = 2 * MPVirtual.pageMotionTime;
					MPVirtual.newViewMotion.opacity = 0;
					MPVirtual.newViewMotion.top = 0;
					MPVirtual.newViewMotion.left = 0;
					MPVirtual.newViewMotion.scale = 0;
				break;
			}		
			setTimeout(function(){
				MPTween(MPVirtual.newScreen, MPVirtual.newViewMotion);
				MPTween(MPVirtual.oldScreen, MPVirtual.oldViewMotion);
			}, 0)
		}
	},
	
	//스텍제거
	removeStack: function(){
		try{
			document.querySelector("#domIfrm" + MPVirtual.historyIdx).contentWindow.onDestroyPage();
		}catch(e){
			console.log(e);
		}
		mpWrap.removeChild(MPVirtual.newScreen);
		MPVirtual.historyIdx = document.querySelectorAll("[data-url]").length;
		try{
			document.querySelector("#domIfrm" + MPVirtual.historyIdx).contentWindow.onRestorePage();
		}catch(e){
			console.log(e);
		}
		MPVirtual.isHistoryBack = false;
		MPVirtual.stackLog();
	},
	
	/**
	 * 사용자 공유변수(웹&네이티브) 변수를 설정한다.
	 */ 
	wnSetVariable: function(_key, _value){
		MPVirtual.gVari.put(_key, _value);
	},
	
	/**
	 * 사용자 공유변수(웹&네이티브) 변수를 얻어온다.
	 */
	wnGetVariable: function(_key){ 
		return MPVirtual.gVari.get(_key);
	},
	
	/**
	 * 공통 설정 정보를 네이티브 저장소에 저장한다.
	 */ 
	wnSetVariableToStorage: function(_key, _value){
		localStorage.setItem(_key, _value);
	},
	
	/**
	 * 공통 설정 정보를 네이티브 저장소에서 읽어온다. 
	 */ 
	wnGetVariableFromStorage: function(_key){
		return localStorage.getItem(_key);
	},
	
	/**
	 * JSON 형식의 요청 전문을 서버에 요청한다.
	 */ 
	wnHttpSendData: function(_targetServerName, _trCode, _callBackFuncName, _reqJSONData, _reqNetOptions, _screenId, _tagId){
		MPVirtual.wnHttpSendData.targetServerName 	= _targetServerName;
		MPVirtual.wnHttpSendData.trCode 				= _trCode;
		MPVirtual.wnHttpSendData.callBackFuncName 	= _callBackFuncName;
		MPVirtual.wnHttpSendData.reqJSONData 		= _reqJSONData; 
		MPVirtual.wnHttpSendData.isEncrypt 			= _reqNetOptions.encrypt;
		MPVirtual.wnHttpSendData.isIndicator 		= _reqNetOptions.indicator;
		MPVirtual.wnHttpSendData.indicatorMsg 		= _reqNetOptions.indicatorMsg;
		MPVirtual.wnHttpSendData.isDummy 			= _reqNetOptions.dummy;
		MPVirtual.wnHttpSendData.retargetUrl 		= _reqNetOptions.retargetUrl;
		MPVirtual.wnHttpSendData.tagId 		= _tagId;
		//////  indicator
		var isIndicator;
		if( MPVirtual.wnHttpSendData.isIndicator == true ){
			isIndicator = true;
		}else{
			isIndicator = false;
		}
		var indicatorId = _targetServerName + _trCode + ((_tagId!=undefined)?_tagId:'');
		if(commReqNetOptions.indicator) MPVirtual.requestIndicator(indicatorId, isIndicator);
		//server선택
		for(var k in MPVirtual.serverList){
			if(MPVirtual.serverList[k].serverName == _targetServerName){
				MPVirtual.wnHttpSendData.serverUrl = MPVirtual.serverList[k].serverUrl; 
				MPVirtual.wnHttpSendData.networkManagerJs = MPVirtual.serverList[k].networkManager.toString();
				break;
			}
		}
		 //  옵션 데이터에 'retargetUrl'이 있을 경우 해당 url 사용 
		if( MPVirtual.wnHttpSendData.retargetUrl ){
			MPVirtual.wnHttpSendData.serverUrl = MPVirtual.wnHttpSendData.retargetUrl; 
		} 
		setTimeout(function(){
			MPVirtual.loadJS("../js/" + MPVirtual.wnHttpSendData.networkManagerJs + ".js", "MPVirtual.connectToServer", _callBackFuncName, _tagId, _screenId);
		}, 10);
	},
	
	// js 파일 로딩 
	loadJS: function(jsName, callCb, callBackFuncName, tagId, screenId){
		try{
			document.querySelector("head").removeChild(MPVirtual.loadJS.scriptTag);
		}catch(e){}
		MPVirtual.loadJS.scriptTag = document.createElement("script");
		var idName = jsName.split("/")[(jsName.split("/")).length-1];
		idName = idName.split(".")[0];
		with( MPVirtual.loadJS.scriptTag ){
			type = "text/javascript";
			src = jsName;
			id = idName
		}
		document.querySelector("head").appendChild(MPVirtual.loadJS.scriptTag);
		document.querySelector("#" + idName).addEventListener("load", function(){
			if( typeof callCb == "function" ){
				callCb(callBackFuncName, tagId, screenId);
			}else if( typeof callCb == "string" ){
				eval(callCb)(callBackFuncName, tagId, screenId);
			}
		}, false);
	},
	
	//서버접속
	connectToServer: function(_callBackFuncName, _tagId, _screenId){
		var jsonData = {
			"head":MorpheusLib.classes.networkManager.head,
			"body":JSON.parse(MPVirtual.wnHttpSendData.reqJSONData)
		} 
		var parameters = "in=" + encodeURIComponent(JSON.stringify(jsonData)); 
		
		MorpheusLib.classes.networkManager.requestHeader.tagId = _tagId;
		MorpheusLib.classes.networkManager.requestHeader.screenId = _screenId;
		MorpheusLib.classes.networkManager.requestHeader.cbFunc = _callBackFuncName;
		
		MorpheusLib.classes.networkManager.requestHeader.onreadystatechange = function(aEvt){
			if (MorpheusLib.classes.networkManager.requestHeader.readyState == 4){
				if(MorpheusLib.classes.networkManager.requestHeader.status == 200 || MorpheusLib.classes.networkManager.requestHeader.status == 0){
					this.trCode = MorpheusLib.classes.networkManager.requestHeader.getResponseHeader("user_com_code");
					
					if(typeof this.cbFunc == "string"){
						eval("domIfrm" + this.screenId + ". " + this.cbFunc +"('"+this.trCode+"', "+JSON.stringify(JSON.parse(MorpheusLib.classes.networkManager.requestHeader.responseText).body) + ",'" + this.tagId +"');");
					}else if(typeof this.cbFunc == "function"){
						eval(this.cbFunc)(this.trCode, JSON.parse(MorpheusLib.classes.networkManager.requestHeader.responseText).body, this.tagId)
					}
					//eval("domIfrm" + this.screenId + ". " + this.cbFunc +"('"+this.trCode+"', "+JSON.stringify(JSON.parse(MorpheusLib.classes.networkManager.requestHeader.responseText).body) + ",'" + this.tagId +"');");
					var loadComponent = new LoadComponent();
					loadComponent.removeIndicator();
				}else{
					try{
						document.querySelector("#domIfrm" + MPVirtual.historyIdx).contentWindow.onHandlingNetworkError(); 
					}catch(e){
						console.log(e); 
					}
					return false;
				}
			}
		}
		MorpheusLib.classes.networkManager.requestHeader.send(parameters);
	},
	
	
	//  WNHttpSendData 함수의 Ajax 통신 후 콜백 함수 
	ajaxCbFunction: function(_val){ 
		if(this.readyState == "4"){
			if(this.status == 200 || this.status == 0){
				this.trCode = MorpheusLib.classes.networkManager.requestHeader.getResponseHeader("user_com_code");
				eval("domIfrm" + this.screenId + ". " + _val.target.cbFunc +"('"+this.trCode+"', "+JSON.stringify(JSON.parse(MorpheusLib.classes.networkManager.requestHeader.responseText).body) + ",'" + this.tagId +"');");
				var loadComponent = new LoadComponent();
				loadComponent.removeIndicator();
			}else{
				try{
					document.querySelector("#domIfrm" + MPVirtual.historyIdx).contentWindow.onHandlingNetworkError(); 
				}catch(e){
					console.log(e); 
				}
				return false;
			}
		}
	},
	
	 	
	//통신 인디케이터
	requestIndicator: function(_indicatorId, _comFuncFlag){
		if(commReqNetOptions.indicatorMsg == "") var msg = "서버에 접속중입니다";
		else var msg = commReqNetOptions.indicatorMsg;
		if( _comFuncFlag == true ){
			var loadComponent = new LoadComponent(320, 70);
			loadComponent.loadIndicator(_indicatorId, "로딩중입니다.", msg, 320, 70); 
		}
	},
	
	/**
	 * 로그 출력
	 */
	wnLog: function(_tag, _message, level){ 
		if( level == '' || level == undefined){
			console.trace(_tag + " : " + _message);
		}else if( (level).toUpperCase() == 'ERROR' ){
			console.error(_tag + " : " + _message);
		}else if( (level).toUpperCase() == 'INFO' ){
			console.info(_tag + " : " + _message);
		}else if( (level).toUpperCase() == 'DEBUG' ){
			console.debug(_tag + " : " + _message);
		}else if( (level).toUpperCase() == 'VERBOSE' ){
			console.trace();
		}
	},
	
	/**
	 * 장치 정보를 얻어온다. 
	 */
	wnGetDeviceInfo: function(){
		MPVirtual.wnGetDeviceInfo.deviceInfo = {};
//		MPVirtual.wnGetDeviceInfo.deviceInfo.DEVINFO_DEVICE_ID = navigator.platform;
		MPVirtual.wnGetDeviceInfo.deviceInfo.DEVINFO_DEVICE_ID = "";
		MPVirtual.wnGetDeviceInfo.deviceInfo.DEVINFO_SOFTWARE_VERSION = navigator.appVersion;
		MPVirtual.wnGetDeviceInfo.deviceInfo.DEVINFO_DISP_WIDTH = window.innerWidth;
		MPVirtual.wnGetDeviceInfo.deviceInfo.DEVINFO_DISP_HEIGHT = window.innerHeight;
		MPVirtual.wnGetDeviceInfo.deviceInfo.DEVINFO_MODEL = navigator.appName;
		MPVirtual.wnGetDeviceInfo.deviceInfo.DEVINFO_COMM_BRAND = navigator.vendor;
		MPVirtual.wnGetDeviceInfo.deviceInfo.DEVINFO_OS_VERSION = navigator.userAgent; 
		MPVirtual.wnGetDeviceInfo.deviceInfo.DEVINFO_PHONE_NUMBER = undefined; 
		return MPVirtual.wnGetDeviceInfo.deviceInfo;
	},
	
	/**
	 * Binary 형식의 요청 전문을 서버에 요청한다.
	 */ 
	wnSocketSendData: function(_targetServerName, _trCode, _callBackFuncName, _reqPacketData, _resTempleteData, _isEncrypt, _isIndicator, _indicatorMsg, _isDummy, _retargetUrl){
		MPVirtual.showInfo('WNSocketSendData');
	},
	
	/**
	 *  'WNHttpUpdateResources' 의 이전 함수명 (deprecated 함수)
	 */
	wnRequestAppUpdating: function(targetServerName, mode){
		MPVirtual.wnHttpUpdateResources(targetServerName, mode);
	},
	
	/**
	 * 프로그램(리소스) 업데이트를 요청한다.
	 */
	wnHttpUpdateResources: function(targetServerName, mode){
		_percentage = 0;
		setIntervalID = setInterval( 
					MPVirtual.progressBarFunc, 30
		);
	}, 
	
	/**
	 *  'WNHttpUpdateResources' 함수에 사용되는 프로그래스바 구현 함수  
	 */
	progressBarFunc: function(){ 				
		var _totalSize = Number(MPVirtual.loadAppManifestXml.resourceSize);
		if( _percentage <= 100 ){
			var _readSize = (_totalSize / 100) * _percentage;
			var _remainingSize = _totalSize - Number(_readSize);
			eval("domIfrm" + MPVirtual.historyIdx).CBUpdateResourceFilesOnProgress(_totalSize, _readSize, _remainingSize, _percentage);
			_percentage++;
		}else{
			clearInterval(setIntervalID);
			setIntervalID = "";
			eval("domIfrm" + MPVirtual.historyIdx).CBUpdateResourceFiles("SUCCESS");
		}
	},

	/**
	 *  'WNHttpUpdateResources' 함수에 사용되는 프로그래스바 구현 함수  
	 */
	fileUploadProgressBarFunc: function(divi){ 
		if( divi != undefined ){
			networDivi = divi;
		}
		var _totalSize = Number(MPVirtual.loadAppManifestXml.resourceSize);
		var currentDomIfrm  = eval("domIfrm" + MPVirtual.historyIdx);
		_percentage++; 
		if( _percentage <= 100 ){
			var _readSize = (_totalSize / 100) * _percentage;
			var _remainingSize = _totalSize - Number(_readSize); 
			if( networDivi == 'http' ){
				if( currentDomIfrm.CBHttpFileUpload != undefined ){
					if( currentDomIfrm.CBHttpFileUploadOnProgress != undefined ){
						currentDomIfrm.CBHttpFileUploadOnProgress(_totalSize, _readSize, _remainingSize, _percentage); 
						if( _percentage == 100 ){  
							currentDomIfrm.CBHttpFileUpload('SUCCESS', '');
						}
					}else{
						_percentage = 101;
						currentDomIfrm.CBHttpFileUpload('SUCCESS', '');					
					}
				}else{
					alert("'WNHttpFileUpload' WN 인터페이스 함수 사용시 \n 콜백 함수인 'CBHttpFileUpload' 필수 사용 함수입니다. \n 이 콜백 함수를 사용해 주시기 바랍니다.");
					MPVirtual.funcFlag = false;
				}
			}else if( networDivi == 'ftp' ){
				if( (currentDomIfrm.CBFtpUpload != undefined) || (currentDomIfrm.CBFtpFileUpload != undefined) ){
					if( currentDomIfrm.CBFtpUploadOnProgress != undefined ){
						currentDomIfrm.CBFtpUploadOnProgress(_totalSize, _readSize, _remainingSize, _percentage); 
						if( _percentage == 100 ){
							if( currentDomIfrm.CBFtpUpload != undefined ){
								currentDomIfrm.CBFtpUpload('SUCCESS', ''); 
							}else{
								currentDomIfrm.CBFtpFileUpload('SUCCESS', ''); 
							}
						}
					}else{
						_percentage = 101;
						if( currentDomIfrm.CBFtpUpload != undefined ){
							currentDomIfrm.CBFtpUpload('SUCCESS', ''); 
						}else{
							currentDomIfrm.CBFtpFileUpload('SUCCESS', ''); 
						}
					}
				}else{
					alert("'WNFtpFileUpload' WN 인터페이스 함수 사용시 \n 콜백 함수인 'CBFtpUpload' 나 'CBFtpFileUpload' 필수 사용 함수입니다. \n 이 콜백 함수를 사용해 주시기 바랍니다.");
					MPVirtual.funcFlag = false;
				}
			}
		}else{  
			clearInterval(fileUploadSetIntervalID);
			fileUploadSetIntervalID = "";
		}		
	},
	
	/**
	 * 진동 
	 */
	wnMakeVibration: function(_strMilliseconds){
		MPVirtual.makeVibration = {};
		MPVirtual.makeVibration.isVibration = false;
		MPVirtual.makeVibration.viewId = document.querySelector("#domIfrm"+MPVirtual.historyIdx);
		MPVirtual.makeVibration.viewLeft = MPVirtual.makeVibration.viewId.style.left.replace("px", "");
		MPVirtual.makeVibration.viewId.className = "";
		MPVirtual.initVibration();
		setTimeout(function(){ MPVirtual.makeVibration.isVibration = true; }, _strMilliseconds);
	},
	
	initVibration: function(){
		if(MPVirtual.makeVibration.isVibration) MPVirtual.makeVibration.viewId.style.left = 0 + "px";
		else{
			MPVirtual.makeVibration.viewId.style.left = - 2 + "px";
			setTimeout(MPVirtual.initVibrationYoyo, 30);
		}
	},
	
	initVibrationYoyo: function(){
		if(MPVirtual.makeVibration.isVibration) MPVirtual.makeVibration.viewId.style.left = 0 + "px";
		else{
			MPVirtual.makeVibration.viewId.style.left = 2 + "px";
			setTimeout(MPVirtual.initVibration, 30);
		}
	},
	
	/**
	 * 화면 이동 (To new native activity)
	 */
	wnMoveToNativePage: function(_className, _param, _actionType, _animationType, _orientation){ 
		MPVirtual.showInfo('WNMoveToNativeAct');
	},
	
	/**
	 * 전화걸기
	 */
	wnMakeCall: function(_phoneNo){
		MPVirtual.showInfo('WNMakeCall');
	},
	
	/**
	 * DatePicker을 호출 한다.
	 */
	wnPopupDatePicker: function(_callBackFuncName, _type, _initDate, _lowDate, _maxDate){
//		MPVirtual.loadComponent(300, 200);
		var loadComponent = new LoadComponent(300, 200);
		
		//type check
		switch(_type){
			case "HM12":
				MPVirtual.wnPopupDatePicker.hour = _initDate.substr(0, 2);
				MPVirtual.wnPopupDatePicker.minute = _initDate.substr(2, 2);
				MPVirtual.wnPopupDatePicker.part = _initDate.substr(4, 2);
			break;
			case "HM24":
				MPVirtual.wnPopupDatePicker.hour = _initDate.substr(0, 2);
				MPVirtual.wnPopupDatePicker.minute = _initDate.substr(2, 2);
			break;
			case "YMD":  
				MPVirtual.wnPopupDatePicker.year = _initDate.substr(0, 4);
				MPVirtual.wnPopupDatePicker.month = _initDate.substr(4, 2);
				MPVirtual.wnPopupDatePicker.day = _initDate.substr(6, 2);
				MPVirtual.wnPopupDatePicker.lowYear = ( _lowDate != "" )?_lowDate.substr(0, 4):'1970';
				MPVirtual.wnPopupDatePicker.lowMonth = ( _lowDate != "" )?_lowDate.substr(4, 2):'1';
				MPVirtual.wnPopupDatePicker.lowDay = ( _lowDate != "" )?_lowDate.substr(6, 2):'1';
				MPVirtual.wnPopupDatePicker.maxYear = ( _maxDate != "" )?_maxDate.substr(0, 4):'2030';
				MPVirtual.wnPopupDatePicker.maxMonth = ( _maxDate != "" )?_maxDate.substr(4, 2):'12';
				MPVirtual.wnPopupDatePicker.maxDay = ( _maxDate != "" )?_maxDate.substr(6, 2):'31'; 
			break;
			case "YM":
				MPVirtual.wnPopupDatePicker.year = _initDate.substr(0, 4);
				MPVirtual.wnPopupDatePicker.month = _initDate.substr(4, 2);
				MPVirtual.wnPopupDatePicker.lowYear = ( _lowDate != "" )?_lowDate.substr(0, 4):'1970';
				MPVirtual.wnPopupDatePicker.lowMonth = ( _lowDate != "" )?_lowDate.substr(4, 2):'1';
				MPVirtual.wnPopupDatePicker.maxYear = ( _maxDate != "" )?_maxDate.substr(0, 4):'2030';
				MPVirtual.wnPopupDatePicker.maxMonth = ( _maxDate != "" )?_maxDate.substr(4, 2):'12';
			break;
			case "MMYYYY":
				MPVirtual.wnPopupDatePicker.year = _initDate.substr(2, 4);
				MPVirtual.wnPopupDatePicker.month = _initDate.substr(0, 2);
				MPVirtual.wnPopupDatePicker.lowYear = ( _lowDate != "" )?_lowDate.substr(2, 4):'1970';
				MPVirtual.wnPopupDatePicker.lowMonth = ( _lowDate != "" )?_lowDate.substr(0, 2):'1';
				MPVirtual.wnPopupDatePicker.maxYear = ( _maxDate != "" )?_maxDate.substr(2, 4):'2030';
				MPVirtual.wnPopupDatePicker.maxMonth = ( _maxDate != "" )?_maxDate.substr(0, 2):'12';
			break;

			default:
				alert("날짜 형식이 맞지 않습니다. (wnPopupDatePicker)");
			break;
		}

		//Title
		MPVirtual.wnPopupDatePicker.popContent = "<p>";
		if(MPVirtual.wnPopupDatePicker.year != undefined) MPVirtual.wnPopupDatePicker.popContent += MPVirtual.wnPopupDatePicker.year+"년 ";
		if(MPVirtual.wnPopupDatePicker.month != undefined) MPVirtual.wnPopupDatePicker.popContent += MPVirtual.wnPopupDatePicker.month+"월 ";
		if(MPVirtual.wnPopupDatePicker.day != undefined) MPVirtual.wnPopupDatePicker.popContent += MPVirtual.wnPopupDatePicker.day+"일 ";
		if(MPVirtual.wnPopupDatePicker.hour != undefined) MPVirtual.wnPopupDatePicker.popContent += MPVirtual.wnPopupDatePicker.hour+"시 ";
		if(MPVirtual.wnPopupDatePicker.minute != undefined) MPVirtual.wnPopupDatePicker.popContent += MPVirtual.wnPopupDatePicker.minute+"분 ";
		MPVirtual.wnPopupDatePicker.popContent += "</p>";
		MPVirtual.wnPopupDatePicker.popContent += "<hr>";
			
		//year
		if(MPVirtual.wnPopupDatePicker.year != undefined){
			MPVirtual.wnPopupDatePicker.popContent += "<select id='year' onchange='MPVirtual.datePickerPopupSelect(\"year\", this.value);'>"; 
			MPVirtual.wnPopupDatePicker.popContent += "</select>년 ";
		}
		//month
		if(MPVirtual.wnPopupDatePicker.month != undefined){
			MPVirtual.wnPopupDatePicker.popContent += "<select id='month' onchange='MPVirtual.datePickerPopupSelect(\"month\", this.value);'>";
			MPVirtual.wnPopupDatePicker.popContent += "</select>월 ";
		}
		//day
		if(MPVirtual.wnPopupDatePicker.day != undefined){
			MPVirtual.wnPopupDatePicker.popContent += "<select id='day' onchange='MPVirtual.datePickerPopupSelect(\"day\", this.value);'>";
			MPVirtual.wnPopupDatePicker.popContent += "</select>일 <br>";
		}
		//part
		if(MPVirtual.wnPopupDatePicker.part != undefined){
			MPVirtual.wnPopupDatePicker.popContent += "<select id='part'>";
			
			if(MPVirtual.wnPopupDatePicker.part == "AM") var amSelected = "selected='selected'";
			else var amSelected = "";
			if(MPVirtual.wnPopupDatePicker.part == "PM") var pmSelected = "selected='selected'";
			else var pmSelected = "";
			MPVirtual.wnPopupDatePicker.popContent += "<option "+amSelected+" value='AM'>AM</option>";
			MPVirtual.wnPopupDatePicker.popContent += "<option "+pmSelected+" value='PM'>PM</option>";
			
			MPVirtual.wnPopupDatePicker.popContent += "</select>시 ";
		}
		//hour
		if(MPVirtual.wnPopupDatePicker.hour != undefined){
			MPVirtual.wnPopupDatePicker.popContent += "<select id='hour'>";
			for(var i=1; i<24; i++){
				if(MPVirtual.wnPopupDatePicker.hour == i) var _selected = "selected='selected'";
				else var _selected = "";
				MPVirtual.wnPopupDatePicker.popContent += "<option "+_selected+">"+i+"</option>";
			}
			MPVirtual.wnPopupDatePicker.popContent += "</select>시 ";
		}
		//minute
		if(MPVirtual.wnPopupDatePicker.minute != undefined){
			MPVirtual.wnPopupDatePicker.popContent += "<select id='minute'>";
			for(var i=1; i<60; i++){
				if(MPVirtual.wnPopupDatePicker.minute == i) var _selected = "selected='selected'";
				else var _selected = "";
				MPVirtual.wnPopupDatePicker.popContent += "<option "+_selected+">"+i+"</option>";
			}
			MPVirtual.wnPopupDatePicker.popContent += "</select>분 ";
		}
		MPVirtual.wnPopupDatePicker.popContent += "<p><button id='btnConfirm'>확인</button><button id='btnCancel'>취소</button></p>";
		MPVirtual.popWrap.innerHTML = MPVirtual.wnPopupDatePicker.popContent;
		// 날짜 컴포넌트에 값 세팅을 하기 위해 함수 호출 
		
		if( (_type == "YM") || (_type ==  "MMYYYY") || (_type ==  "YMD") ){
			var initDateValue = MPVirtual.setDateValue();
			MPVirtual.datePickerSetYear(MPVirtual.wnPopupDatePicker.lowYear, MPVirtual.wnPopupDatePicker.maxYear);
			MPVirtual.datePickerSetMonth(initDateValue.startMonth, initDateValue.endMonth);
			if(  _type == "YMD"  ){
				MPVirtual.datePickerSetDay(initDateValue.startDay, initDateValue.endDay);
			}
		}
		
		//confirm button
		document.querySelector("#btnConfirm").addEventListener("click", function(){
			var loadComponent = new LoadComponent();
			MPVirtual.wnPopupDatePicker.requestJoson = {}
			if(MPVirtual.wnPopupDatePicker.year != undefined) MPVirtual.wnPopupDatePicker.requestJoson.yyyy = document.querySelector("#year").value;
			if(MPVirtual.wnPopupDatePicker.month != undefined) MPVirtual.wnPopupDatePicker.requestJoson.MM = document.querySelector("#month").value;
			if(MPVirtual.wnPopupDatePicker.day != undefined) MPVirtual.wnPopupDatePicker.requestJoson.dd = document.querySelector("#day").value;
			if(MPVirtual.wnPopupDatePicker.part != undefined) MPVirtual.wnPopupDatePicker.requestJoson.part = document.querySelector("#part").value;
			if(MPVirtual.wnPopupDatePicker.hour != undefined) MPVirtual.wnPopupDatePicker.requestJoson.HH = document.querySelector("#hour").value;
			if(MPVirtual.wnPopupDatePicker.minute != undefined) MPVirtual.wnPopupDatePicker.requestJoson.mm = document.querySelector("#minute").value;
			
			MPVirtual.wnPopupDatePicker.year = undefined;
			MPVirtual.wnPopupDatePicker.month = undefined;
			MPVirtual.wnPopupDatePicker.day = undefined;
			MPVirtual.wnPopupDatePicker.part = undefined;
			MPVirtual.wnPopupDatePicker.hour = undefined;
			MPVirtual.wnPopupDatePicker.minute = undefined;

			MPVirtual.wnPopupDatePicker.lowYear = undefined;
			MPVirtual.wnPopupDatePicker.lowMonth = undefined;
			MPVirtual.wnPopupDatePicker.lowDay = undefined;
			MPVirtual.wnPopupDatePicker.maxYear = undefined;
			MPVirtual.wnPopupDatePicker.maxMonth = undefined;
			MPVirtual.wnPopupDatePicker.maxDay = undefined;

			loadComponent.removeComponent();
//			MPVirtual.removeComponent();
			
			if(typeof _callBackFuncName == "string"){
				eval("domIfrm" + MPVirtual.historyIdx + "." + _callBackFuncName +"("+JSON.stringify(MPVirtual.wnPopupDatePicker.requestJoson)+");");
			}else if(typeof _callBackFuncName == "function"){
				eval(_callBackFuncName)(MPVirtual.wnPopupDatePicker.requestJoson);
			}
		}, false);
		
		//cancel button
		document.querySelector("#btnCancel").addEventListener("click", function(){
			MPVirtual.wnPopupDatePicker.year = undefined;
			MPVirtual.wnPopupDatePicker.month = undefined;
			MPVirtual.wnPopupDatePicker.day = undefined;
			MPVirtual.wnPopupDatePicker.part = undefined;
			MPVirtual.wnPopupDatePicker.hour = undefined;
			MPVirtual.wnPopupDatePicker.minute = undefined;

			MPVirtual.wnPopupDatePicker.lowYear = undefined;
			MPVirtual.wnPopupDatePicker.lowMonth = undefined;
			MPVirtual.wnPopupDatePicker.lowDay = undefined;
			MPVirtual.wnPopupDatePicker.maxYear = undefined;
			MPVirtual.wnPopupDatePicker.maxMonth = undefined;
			MPVirtual.wnPopupDatePicker.maxDay = undefined;
			loadComponent.removeComponent();
//			MPVirtual.removeComponent();
		}, false); 
	},  
	 
	/**
	 * 사진 Request
	 */
	wnTakePhoto: function(_path, _callBackFuncName, _saveName){ 
		MPVirtual.showInfo('WNTakePhoto');
//		if(_path != "" && _path != undefined){
//			MPVirtual.wnTakePhoto.resultCode = "SUCCESS"; 
//			MPVirtual.wnTakePhoto.today = new Date();
//			MPVirtual.wnTakePhoto.responseJson = {};
//			MPVirtual.wnTakePhoto.responseJson.saveDate = MPVirtual.wnTakePhoto.today.getFullYear() + "년 " + MPVirtual.wnTakePhoto.today.getMonth()+1 + "월 " + MPVirtual.wnTakePhoto.today.getDate() + "일 " + MPVirtual.wnTakePhoto.today.getHours() + "시 " + MPVirtual.wnTakePhoto.today.getMinutes() + "분 " + MPVirtual.wnTakePhoto.today.getSeconds() + "초";
//			MPVirtual.wnTakePhoto.responseJson.path = _path;
//			eval("domIfrm" + MPVirtual.historyIdx + "." + _callBackFuncName +"('"+MPVirtual.wnTakePhoto.resultCode+"', " + JSON.stringify(MPVirtual.wnTakePhoto.responseJson) + ");");
//		}else{
//			eval("domIfrm" + MPVirtual.historyIdx + "." + _callBackFuncName +"();");
//		}
	},
	
	/**
	 * 동영상 Request
	 */
	wnTakeMovie: function(_path, _callBackFuncName, _saveName){
		MPVirtual.showInfo('WNTakeMovie'); 
		if(_path != "" && _path != undefined){
			MPVirtual.wnTakeMovie.resultCode = "FAIL"; 
			MPVirtual.wnTakeMovie.today = new Date();
			MPVirtual.wnTakeMovie.responseJson = {};
			MPVirtual.wnTakeMovie.responseJson.saveDate = MPVirtual.wnTakeMovie.today.getFullYear() + "년 " + MPVirtual.wnTakeMovie.today.getMonth()+1 + "월 " + MPVirtual.wnTakeMovie.today.getDate() + "일 " + MPVirtual.wnTakeMovie.today.getHours() + "시 " + MPVirtual.wnTakeMovie.today.getMinutes() + "분 " + MPVirtual.wnTakeMovie.today.getSeconds() + "초";
			MPVirtual.wnTakeMovie.responseJson.path = _path;
			eval("domIfrm" + MPVirtual.historyIdx + "." + _callBackFuncName +"('"+MPVirtual.wnTakeMovie.resultCode+"', " + JSON.stringify(MPVirtual.wnTakeMovie.responseJson) + ");");
		}else{
			eval("domIfrm" + MPVirtual.historyIdx + "." + _callBackFuncName +"();");
		}
	},
	
	/**
	 * 공통 사진 가져오기 요청 (네이티브 화면 제공)
	 */
	wnGetCommonMediaFiles: function(_choiceDivision, _mediaDivision, _callFunction){ 
		MPVirtual.showInfo('WNGetCommonMediaFiles');  
		var _resultCode = "FAIL";
		var _resultValue = new Array();
		var _resultObj = new Object();
		var choiceDivision = (_choiceDivision).toUpperCase();
		var mediaDivision = (_mediaDivision).toUpperCase();
		if( mediaDivision == "PHOTO" ){
			_resultObj.path = "";
			_resultObj.saveDate = "";
			_resultObj.size = 0;
			_resultObj.name = "";
			_resultValue.push(_resultObj);
			if( choiceDivision == "MULTI_CHOICE" ){  
				_resultValue.push(_resultObj);
			}
		}else if( mediaDivision == "MOVIE" ){
			_resultObj.path = "";
			_resultObj.startDate = "";
			_resultObj.endDate = "20120228055524";
			_resultObj.duration = "010341557";
			_resultObj.size = 1505317747;
			_resultObj.name = "ss.E17.120227.HDTV.H264.720p-Spider.mp4"	;
			_resultValue.push(_resultObj); 
		}
		if(typeof _callFunction == "string"){
			var _callBackFunc = eval("domIfrm" + MPVirtual.historyIdx + "." + _callFunction);
			_callBackFunc(_resultCode, _resultValue);
		}else if(typeof _callFunction == "function"){
			
		}
		
	},
	
	/**
	 * 비디오를 재생 한다.
	 */
	wnShowVideo: function(_url, _type){
		var videoType = (_type).toUpperCase();
		if( videoType == "NATIVE" ){
			MPVirtual.showInfo('WNShowVideo');   
		}else if( videoType == "WEB" ){ 
			window.open(_url);        
		}
	},
	
	/**
	 * 녹음 하기  Request.
	 */
	wnTakeVoice: function(_url, _path, _name){ 
		if( confirm("현재 모피어스 웹 플랫폼에서 'WNTakeVoice' 기능의 녹음 화면은 제공하지 않습니다. 다음 화면으로 이동하시겠습니까?") ){
			MPVirtual.wnMoveToHtmlPage(_url, "NEW_SCR", "DEFAULT", "DEFAULT");
		}
	},
	
	/**
	 * 프로그램 초기화 
	 */
	wnRequestInitProgram: function(_targetServer){
		MPVirtual.showInfo('WNRequestInitProgram');    
	},
	
	/**
	 * Http 파일 전송
	 */
	wnHttpFileUpload: function(_targetUrl, _parameters, _jsonFilesInfo, _willWaitResult, _willUseWebProgress, _headerParameters){
		MPVirtual.showInfo('WNHttpFileUpload');    
		_percentage = 0;
		MPVirtual.fileUploadProgressBarFunc('http'); 
		if( MPVirtual.funcFlag != false ){
			fileUploadSetIntervalID = setInterval( 
					MPVirtual.fileUploadProgressBarFunc, 30
			);
		}
	},
	
	/**
	 * ftp 파일 전송
	 */
	wnFtpFileUpload: function(_connectionInfo, _jsonFilesInfo, _willWaitResult){
		MPVirtual.showInfo('WNFtpFileUpload');    
		_percentage = 0;
		MPVirtual.fileUploadProgressBarFunc('ftp'); 
		if( MPVirtual.funcFlag != false ){
			fileUploadSetIntervalID = setInterval( 
					MPVirtual.fileUploadProgressBarFunc, 30
			);
		}
	},
	
	/**
	 * 인스턴스 메시지 팝업 보이기
	 */
	wnShowInstanceMessage: function(_message, _showtime){ 
		var showtime;
		if( (_showtime).toUpperCase() == "SHORT" ){
			showtime = 2;
		}else if( (_showtime).toUpperCase() == "LONG" ){
			showtime = 3.5;
		}
		var loadComponent = new LoadComponent('auto');
		loadComponent.loadInstanceMessage(_message, showtime);
	},

	/**
	 *  'wnShowInstanceMessage' 함수에 사용되는 시간 경과 후 hidden 처리하는 함수  
	 */
	instanceHiddenFunc: function(msg){ 
		instanceMsgBox.style.visibility = "hidden";
		var currIframe = eval("domIfrm" + MPVirtual.historyIdx);
		var instanceMsgObj = document.querySelector("#domIfrm" + MPVirtual.historyIdx).contentWindow.document.querySelector("#instanceMsgId");
		instanceMsgObj.parentNode.removeChild(instanceMsgObj);
	},
	 
	/**
	 * 내장된 Web Browser 를 호출한다.
	 */
	wnOpenWebBrowser: function(_url, _encoding){
		MPVirtual.showInfo('WNOpenWebBrowser');    
		window.open(_url);
	},
	
	/**
	 * 현재의 WebView의 url을 바꾼다.
	 */
//	wnReplaceHtmlPage: function(_url, _isSavingHistory){
	wnReplaceHtmlPage: function(_url, _param){
//		if(_url.split("?")[1] != undefined) document.querySelector("#domIfrm" + MPVirtual.historyIdx).setAttribute("data-parameter", _url.split("?")[1]);
		document.querySelector("#domIfrm" + MPVirtual.historyIdx).setAttribute("data-parameter", _param);
		
//		if (_isSavingHistory) document.querySelector("#domIfrm" + MPVirtual.historyIdx).src = _url;
//		else document.querySelector("#domIfrm" + MPVirtual.historyIdx).src = _url;
		document.querySelector("#domIfrm" + MPVirtual.historyIdx).src = _url;
		
		document.querySelector("#domIfrm" + MPVirtual.historyIdx).addEventListener("load", function(e){
			try{
				if(document.querySelector("#domIfrm" + MPVirtual.historyIdx).contentWindow.tp.baseURI.indexOf(MPVirtual.createView.url) == -1){
					document.querySelector("#domIfrm" + MPVirtual.historyIdx).src = MPVirtual.loadAppManifestXml.errorPage;
				}
			}catch(e){}
			try{
				document.querySelector("#domIfrm" + MPVirtual.historyIdx).contentWindow.onInitPage();
			}catch(e){
				console.log(e);
			}
		}, false);
	},
	
	/**
	 * 확인 팝업 윈도우
	 */
	wnPopupConfirm: function(_title, _message, _jsonButtonInfo){
//		MPVirtual.loadComponent(300, 200);
		var loadComponent = new LoadComponent(300, 200);
		
		MPVirtual.wnPopupConfirm.popContent  = "<p style='font-size:20px'>"+_title+"</p>";
		MPVirtual.wnPopupConfirm.popContent += "<hr>";
		MPVirtual.wnPopupConfirm.popContent += "<p>"+_message+"</p>";
		MPVirtual.wnPopupConfirm.popContent += "<p>";
		
		MPVirtual.wnPopupConfirm.jsonButtonInfo = _jsonButtonInfo.buttonInfo;
		for(var i=0; i<MPVirtual.wnPopupConfirm.jsonButtonInfo.length; i++) 
			MPVirtual.wnPopupConfirm.popContent += "<button id='btnConfirm"+i+"'>"+MPVirtual.wnPopupConfirm.jsonButtonInfo[i].title+"</button>";
		
		MPVirtual.wnPopupConfirm.popContent += "</p>";
		MPVirtual.popWrap.innerHTML = MPVirtual.wnPopupConfirm.popContent;
		
		//confirm button
		try{
			document.querySelector("#btnConfirm0").addEventListener("click", function(){
				loadComponent.removeComponent();
				if(typeof MPVirtual.wnPopupConfirm.jsonButtonInfo[0].cbFuncName == "string"){
					eval("domIfrm" + MPVirtual.historyIdx + "." + MPVirtual.wnPopupConfirm.jsonButtonInfo[0].cbFuncName +"(0);");
				}else if(typeof MPVirtual.wnPopupConfirm.jsonButtonInfo[0].cbFuncName == "function"){
					eval(MPVirtual.wnPopupConfirm.jsonButtonInfo[0].cbFuncName)(0)
				}
			}, false);
		}catch(e){}
		try{
			document.querySelector("#btnConfirm1").addEventListener("click", function(){
				loadComponent.removeComponent();
				if(typeof MPVirtual.wnPopupConfirm.jsonButtonInfo[0].cbFuncName == "string"){
					eval("domIfrm" + MPVirtual.historyIdx + "." + MPVirtual.wnPopupConfirm.jsonButtonInfo[0].cbFuncName +"(1);");
				}else if(typeof MPVirtual.wnPopupConfirm.jsonButtonInfo[0].cbFuncName == "function"){
					eval(MPVirtual.wnPopupConfirm.jsonButtonInfo[0].cbFuncName)(1)
				}
			}, false);
		}catch(e){}
		try{
			document.querySelector("#btnConfirm2").addEventListener("click", function(){
				loadComponent.removeComponent();
				if(typeof MPVirtual.wnPopupConfirm.jsonButtonInfo[0].cbFuncName == "string"){
					eval("domIfrm" + MPVirtual.historyIdx + "." + MPVirtual.wnPopupConfirm.jsonButtonInfo[0].cbFuncName +"(2);");
				}else if(typeof MPVirtual.wnPopupConfirm.jsonButtonInfo[0].cbFuncName == "function"){
					eval(MPVirtual.wnPopupConfirm.jsonButtonInfo[0].cbFuncName)(2)
				}
			}, false);
		}catch(e){}
	},
	
	/**
	 * 일반 싱글 선택 리스트 팝업 요청 (WNPopupNormalChoice)
	 */
	wnPopupNormalChoice: function(_title, _listInfo, _callBackFuncName){
		MPVirtual.wnCreateListPop(_title, _listInfo);
		MPVirtual.wnCreateListPop.popContent += "<button id='btnCancel'>취소</button>";
		MPVirtual.popWrap.innerHTML = MPVirtual.wnCreateListPop.popContent;
//		MPVirtual.loadJS("../js/mplibs/iscroll.js", function(){
//			MPVirtual.popupWrap = new iScroll("popwrap");
//		});
		for(var i=0; i<MPVirtual.wnCreateListPop.listInfo.length; i++) {
			document.querySelector("#btnLi"+i).addEventListener("click", function(e){
//				MPVirtual.popupWrap.destroy();
				var loadComponent = new LoadComponent();
				loadComponent.removeComponent();
//				MPVirtual.removeComponent();
				MPVirtual.wnPopupNormalChoice.responseJson = {};
				MPVirtual.wnPopupNormalChoice.responseJson.selectedIdx = e.target.id.substr(5);
				MPVirtual.wnPopupNormalChoice.responseJson.selectedTitle = e.target.innerHTML;
				MPVirtual.wnPopupNormalChoice.responseJson.selectedVal = e.target.getAttribute("value");
				
				if(typeof _callBackFuncName == "string"){
					eval("domIfrm" + MPVirtual.historyIdx + "." + _callBackFuncName +"("+JSON.stringify(MPVirtual.wnPopupNormalChoice.responseJson)+");");
				}else if(typeof _callBackFuncName == "function"){
					eval(_callBackFuncName)(MPVirtual.wnPopupNormalChoice.responseJson);
				}
			}, false);
		}
		document.querySelector("#btnCancel").addEventListener("click", function(){
			MPVirtual.popupWrap.destroy();
			var loadComponent = new LoadComponent();
			loadComponent.removeComponent();
//			MPVirtual.removeComponent();
		}, false);
	},
	
	/**
	 * 일반 싱글 선택 리스트 팝업 요청 (WNPopupSingleChoice)
	 */
	wnPopupSingleChoice: function(_title, _listInfo, _buttonInfo){
		MPVirtual.wnCreateListPop(_title, _listInfo);
		var clickFlag = false;
		MPVirtual.wnPopupSingleChoice.buttonInfo = _buttonInfo.buttonInfo;
		for(var i=0; i<MPVirtual.wnPopupSingleChoice.buttonInfo.length; i++) MPVirtual.wnCreateListPop.popContent += "<button id='btnSingle"+i+"'>"+MPVirtual.wnPopupSingleChoice.buttonInfo[i].title+"</button>";
		MPVirtual.popWrap.innerHTML = MPVirtual.wnCreateListPop.popContent;

//		MPVirtual.loadJS("../js/mplibs/iscroll.js", function(){
//			MPVirtual.popupWrap = new iScroll("popwrap");
//		});
		for(var i=0; i<MPVirtual.wnCreateListPop.listInfo.length; i++) {
			document.querySelector("#btnLi"+i).addEventListener("click", function(e){
				clickFlag = true;
				if(typeof MPVirtual.wnPopupSingleChoice.responseJson == "undefined") document.querySelector("#btnLi"+MPVirtual.wnCreateListPop.willSelectIdx).style.background = "none";
				else document.querySelector("#btnLi"+MPVirtual.wnPopupSingleChoice.responseJson.selectedIdx).style.background = "none";
				MPVirtual.wnPopupSingleChoice.responseJson = {};
				MPVirtual.wnPopupSingleChoice.responseJson.selectedIdx = e.target.id.substr(5);
				MPVirtual.wnPopupSingleChoice.responseJson.selectedTitle = e.target.innerHTML;
				MPVirtual.wnPopupSingleChoice.responseJson.selectedVal = e.target.getAttribute("value");
				e.target.style.background = "#bbb";
			}, false);
		}	
		//  리스트를 클릭하지 않고 바로 '확인' 버튼 클릭시 처리  
		if( clickFlag == false ){
			var listInfo = JSON.parse(_listInfo);
			MPVirtual.wnPopupSingleChoice.responseJson = {};
			MPVirtual.wnPopupSingleChoice.responseJson.selectedIdx = listInfo.willSelectIdx;
			MPVirtual.wnPopupSingleChoice.responseJson.selectedTitle = listInfo.listInfo[listInfo.willSelectIdx].title;
			MPVirtual.wnPopupSingleChoice.responseJson.selectedVal = listInfo.listInfo[listInfo.willSelectIdx].value;
		}
		
		for(var i=0; i<MPVirtual.wnPopupSingleChoice.buttonInfo.length; i++){
			document.querySelector("#btnSingle"+i).addEventListener("click", function(e){
//				MPVirtual.popupWrap.destroy();
				var loadComponent = new LoadComponent();
				loadComponent.removeComponent();
//				MPVirtual.removeComponent();
				var _thisId = e.target.id.substr(9);
				if(MPVirtual.wnPopupSingleChoice.responseJson == undefined){
					MPVirtual.wnPopupSingleChoice.responseJson = {};
					MPVirtual.wnPopupSingleChoice.responseJson.selectedIdx = MPVirtual.wnCreateListPop.willSelectIdx;
					MPVirtual.wnPopupSingleChoice.responseJson.selectedTitle = MPVirtual.wnCreateListPop.jsonButtonInfo[MPVirtual.wnPopupSingleChoice.responseJson.selectedIdx].title;
					MPVirtual.wnPopupSingleChoice.responseJson.selectedVal =MPVirtual.wnCreateListPop.jsonButtonInfo[MPVirtual.wnPopupSingleChoice.responseJson.selectedIdx].value;
				}
				
				if(typeof MPVirtual.wnPopupSingleChoice.buttonInfo[_thisId].cbFuncName == "string"){
					eval("domIfrm" + MPVirtual.historyIdx + "." + MPVirtual.wnPopupSingleChoice.buttonInfo[_thisId].cbFuncName +"("+JSON.stringify(MPVirtual.wnPopupSingleChoice.responseJson)+");");
				}else if(typeof MPVirtual.wnPopupSingleChoice.buttonInfo[_thisId].cbFuncName == "function"){
					eval(MPVirtual.wnPopupSingleChoice.buttonInfo[_thisId].cbFuncName)(MPVirtual.wnPopupSingleChoice.responseJson)
				}
				//eval("domIfrm" + MPVirtual.historyIdx + "." + MPVirtual.wnPopupSingleChoice.buttonInfo[_thisId].cbFuncName +"("+JSON.stringify(MPVirtual.wnPopupSingleChoice.responseJson)+");");
				
				MPVirtual.wnPopupSingleChoice.responseJson = undefined;
			}, false);
		}
	},
	
	/**
	 * 다중 선택 리스트 팝업 요청 {"selectedListInfo":[{"value":"value1", }, {  }]}
	 */
	wnPopupMultiChoice: function(_title, _listInfo, _buttonInfo){
		MPVirtual.wnCreateListPop(_title, _listInfo);
		MPVirtual.wnPopupMultiChoice.buttonInfo = _buttonInfo.buttonInfo;
		for(var i=0; i<MPVirtual.wnPopupMultiChoice.buttonInfo.length; i++) MPVirtual.wnCreateListPop.popContent += "<button id='btnMultiChoice"+i+"'>"+MPVirtual.wnPopupMultiChoice.buttonInfo[i].title+"</button>";
		MPVirtual.popWrap.innerHTML = MPVirtual.wnCreateListPop.popContent;
		//list event
		for(var i=0; i<MPVirtual.wnCreateListPop.listInfo.length; i++) {
			document.querySelector("#btnLi"+i).addEventListener("click", function(e){
				if(e.target.style.background == "none") e.target.style.background = "#bbb";
				else e.target.style.background = "none";
				MPVirtual.wnCreateListPop.willSelectIdx = new Array();
				for(var i=0; i<MPVirtual.wnCreateListPop.listInfo.length; i++) if(document.querySelector("#btnLi"+i).style.background != "none") MPVirtual.wnCreateListPop.willSelectIdx.push(i);
			}, false);
		}
		//button event
		for(var i=0; i<MPVirtual.wnPopupMultiChoice.buttonInfo.length; i++){
			document.querySelector("#btnMultiChoice"+i).addEventListener("click", function(e){
				if(MPVirtual.wnPopupMultiChoice.responseJson == undefined){
					MPVirtual.wnPopupMultiChoice.responseJsonArr = new Array();
					for(var j=0; j<MPVirtual.wnCreateListPop.listInfo.length; j++){
						MPVirtual.wnPopupMultiChoice.responseJson = {};
						if(document.querySelector("#btnLi"+j).style.background != "none"){
							MPVirtual.wnPopupMultiChoice.responseJson.value = document.querySelector("#btnLi"+j).getAttribute("value");
							MPVirtual.wnPopupMultiChoice.responseJson.index = j;
							MPVirtual.wnPopupMultiChoice.responseJson.title = document.querySelector("#btnLi"+j).innerHTML;
							MPVirtual.wnPopupMultiChoice.responseJsonArr.push(MPVirtual.wnPopupMultiChoice.responseJson);
						}
					}
				}
				
				var _thisId = e.target.id.substr(14);
				var jsonArrayData = new Object();
				jsonArrayData.selectedListInfo = MPVirtual.wnPopupMultiChoice.responseJsonArr;
				
				if(typeof MPVirtual.wnPopupMultiChoice.buttonInfo[_thisId].cbFuncName == "string"){
					eval("domIfrm" + MPVirtual.historyIdx + "." + MPVirtual.wnPopupMultiChoice.buttonInfo[_thisId].cbFuncName +"("+JSON.stringify(jsonArrayData)+");");
				}else if(typeof MPVirtual.wnPopupMultiChoice.buttonInfo[_thisId].cbFuncName == "function"){
					eval(MPVirtual.wnPopupMultiChoice.buttonInfo[_thisId].cbFuncName)(jsonArrayData)
				}
				MPVirtual.wnPopupMultiChoice.responseJson = undefined;
				var loadComponent = new LoadComponent();
				loadComponent.removeComponent();
			}, false);
		}
	},
	
	//popup 생성
	wnCreateListPop: function(_title, _listInfo){
//		MPVirtual.loadComponent(300, 250);
		var loadComponent = new LoadComponent(300, 250);
		
		MPVirtual.wnCreateListPop.popContent  = "<p style='font-size:20px; line-height:0px'>"+_title+"</p>";
		MPVirtual.wnCreateListPop.popContent += "<div id='popwrap' style='position:relative; width:300px; height:180px; overflow:scroll'><div style='width:100%; border:0'>";
		MPVirtual.wnCreateListPop.popContent += "<ul style='background:#fff; -webkit-border-radius:10px; width:100%; list-style:none; padding:0; margin:0'>";
		
		MPVirtual.wnCreateListPop.listInfo = JSON.parse(_listInfo).listInfo;
		MPVirtual.wnCreateListPop.willSelectIdx = JSON.parse(_listInfo).willSelectIdx;
		
		//초기 선택값
		for(var i=0; i<MPVirtual.wnCreateListPop.listInfo.length; i++){
			if(typeof JSON.parse(_listInfo).willSelectIdx == "number" && MPVirtual.wnCreateListPop.willSelectIdx == i) MPVirtual.wnCreateListPop.selected = "background:#bbb; ";
			else if(typeof JSON.parse(_listInfo).willSelectIdx == "object"){
				if(MPVirtual.wnCreateListPop.willSelectIdx.join().indexOf(i) != -1) MPVirtual.wnCreateListPop.selected = "background:#bbb; ";
				else MPVirtual.wnCreateListPop.selected = "background:none; ";
			}else MPVirtual.wnCreateListPop.selected = "background:none; ";
			MPVirtual.wnCreateListPop.popContent += "<li id='btnLi"+i+"' style='"+MPVirtual.wnCreateListPop.selected+"padding:10px; color:#000; border-bottom:1px solid #999' value="+MPVirtual.wnCreateListPop.listInfo[i].value+">"+MPVirtual.wnCreateListPop.listInfo[i].title+"</li>";
		}
		
		MPVirtual.wnCreateListPop.popContent += "</ul>";
		MPVirtual.wnCreateListPop.popContent += "</div></div>";
	},
	
	/**
	 * 미디어 파일 가져오기 요청(특정 폴더)
	 */
	wnGetMediaFilesInfo: function(_folderPath, _mediaDivision, _callFunction){
		var _resultCode = "SUCCESS";
		var _resultValue = new Object();
		var _resultObj = new Object();
		var resultArray = new Array();
		var mediaDivision = (_mediaDivision).toUpperCase();
		if( mediaDivision == "PHOTO" ){
			_resultObj.path = "/mnt/sdcard/Android/com.popera.mobile/photos/Apple/P20110909151035124.jpg";
			_resultObj.saveDate = "20110909171002";
			_resultObj.size = 13542456;
			_resultObj.name = "P20110909151035124.jpg"; 
		}else if( mediaDivision == "MOVIE" ){
			_resultObj.path = "/mnt/sdcard/Android/com.popera.mobile/photos/Apple/M20110909151035124.mp4";
			_resultObj.startDate = "20110909151035";
			_resultObj.endDate = "20110909152135";
			_resultObj.duration = "1100000";
			_resultObj.size = 345542456;
			_resultObj.name = "M20110909151035124.mp4"	;
		}else if( mediaDivision == "VOICE" ){
			_resultObj.path = "/mnt/sdcard/Android/com.popera.mobile/photos/Apple/V20110909151035124.amr";
			_resultObj.startDate = "20110909151035";
			_resultObj.endDate = "20110909152135";
			_resultObj.duration = "1100000";
			_resultObj.size = 13542456;
			_resultObj.name = "V20110909151035124.amr";
		}
		resultArray.push(_resultObj);
		_resultValue.mediaFileInfo = resultArray;
		
		
		if(typeof _callFunction == "string"){
			var _callBackFunc = eval("domIfrm" + MPVirtual.historyIdx + "." + _callFunction);
			_callBackFunc(_resultCode, _resultValue);
		}else if(typeof _callFunction == "function"){
			eval(_callFunction)(_resultCode, _resultValue)
		}
	},
	
	/**
	 * 미디어 폴더 정보 요청
	 */
	wnGetMediaFolderInfo: function(_folderPath, _mediaDivision, _callFunction){
		var _resultValue = new Object();
		var valueArray = new Array();
		var valueObj = new Object();
		valueObj.subFileCnt = "2";
		valueObj.name = "20120517";
		valueArray.push(valueObj);
		_resultValue.mediaFileInfo = valueArray;
		if(typeof _callFunction == "string"){
			var _callBackFunc = eval("domIfrm" + MPVirtual.historyIdx + "." + _callFunction); 
			_callBackFunc(_resultValue);
		}else if(typeof _callFunction == "function"){
			eval(_callFunction)(_resultValue)
		}
		//var _callBackFunc = eval("domIfrm" + MPVirtual.historyIdx + "." + _callFunction); 
		//_callBackFunc(_resultValue);
	},
	
	/**
	 * 미디어 폴더/파일 제거 요청
	 */
	wnRemoveMediaFilesInfo: function(_removepath, _mediaDivision, _callFunction){
		if(typeof _callFunction == "string"){
			var _callBackFunc = eval("domIfrm" + MPVirtual.historyIdx + "." + _callFunction); 
			_callBackFunc("SUCCESS");
		}else if(typeof _callFunction == "function"){
			eval(_callFunction)("SUCCESS");
		}
	},
	
	/**
	 * 메일을 전송한다.
	 */
	wnSendMail: function(_recipientsInfo, _subject, _contents){ 
		var recipientsInfo = JSON.parse(_recipientsInfo);
		if( recipientsInfo.to ){
			var mailToLength = '';
			for( var i=0; i<recipientsInfo.to.length; i++ ){
				mailToLength += recipientsInfo.to[i] + ","; 
			}  
		} 
		if( recipientsInfo.cc ){
			var mailCcLength = '';
			for( var i=0; i<recipientsInfo.cc.length; i++ ){
				mailCcLength += recipientsInfo.cc[i] + ","; 
			} 
		} 
		if( recipientsInfo.bcc ){
			var mailBccLength = '';
			for( var i=0; i<recipientsInfo.bcc.length; i++ ){
				mailBccLength += recipientsInfo.bcc[i] + ","; 
			} 
		} 
		if( _subject ){
			var subject = _subject;
		}else{
			var subject = "제목없음";
		}
		if( _contents ){
			var contents = _contents;
		}else{
			var contents = "내용없음";
		} 
		document.location.href = "mailto:" + mailToLength + "?subject=" + subject + "&cc=" + mailCcLength + "&bcc=" + mailBccLength + "&body=" + contents;
	},
	
	/**
	 * Google Map을 연동한다.
	 */
	wnConnetToMap: function(_query){
		MPVirtual.showInfo('WNConnetToMap');     
	},
	
	/**
	 * SMS를 전송 한다.
	 */
	wnSendSms: function(_phoneNumbers, _message){ 
		MPVirtual.showInfo('WNSendSms');     
	},
	
	/**
	 * app store/ android market을 링크 한다.
	 */
	wnOpenAppStore: function(_appId){ 
		MPVirtual.showInfo('WNOpenAppStore');     
	},
	
	/**
	 * 다른 어플을 구동 시킨다.
	 */
	wnOpenOtherApp: function(_scheme, _param){
		MPVirtual.showInfo('WNOpenOtherApp');     
	},
	
	/**
	 * PUSH 서비스 이용을 위한 등록 처리를 한다.
	 */
	wnSetPushService: function(_isTrue, _account){
		MPVirtual.showInfo('WNSetPushService');      
		var _callBackFunc = eval("domIfrm" + MPVirtual.historyIdx + ".CBRegisterPushNotification"); 
		_callBackFunc("FAIL", "");		
	},
	
	/**
	 * PUSH 서비스 이용을 위한 해지 처리를 한다.
	 */
	wnSetUnPushService: function(_isTrue){
		MPVirtual.showInfo('WNSetUnPushService');      
	},
	
	/**
	 * 가상 키보드를 보여준다.
	 */
	wnShowKeyboard: function(){
		MPVirtual.showInfo('WNShowKeyboard');      
	},
	
	/**
	 * 프로그램 종료
	 */
	wnExitProgram: function(){
		var answer = confirm("가상모듈에서는 앱 종료후 재실행합니다.");
		if(answer) parent.location.href = parent.location.href.split("#")[0];
		else return false;
	},
 
	/**
	 * 연락처 검색  Request.
	 */
	wnAddressBookList: function(name){
		MPVirtual.showInfo('WNAddressBookList');      
	},
 
	/**
	 * 연락처 수정하기  Request.
	 */
	wnAddressBookEdit: function(recordId, contacts){
		MPVirtual.showInfo('WNAddressBookEdit');      
	},
 
	/**
	 * 연락처 삭제 Request.
	 */
	wnAddressBookDelete: function(recordId){
		MPVirtual.showInfo('WNAddressBookDelete');      
	},
 
	/**
	 * Request device's hacking-state.
	 */
	wnCheckHacking: function(){
		return false;
	}, 
	
	/**
	 * file 및 directory 생성 API
	 */
	wnFileIoCreate: function(data){
		MPVirtual.showInfo('WNFileIoCreate');  
		var jsonData = { "status" : "FAIL" }; 
		return JSON.stringify(jsonData);
	},
 
	/**
	 *  file 및 directory 삭제 API
	 */
	wnFileIoDelete: function(data){
		MPVirtual.showInfo('WNFileIoDelete');  
		var jsonData = { "status" : "FAIL" }; 
		return JSON.stringify(jsonData);
	},
	
	/**
	 *  file Read API
	 */
	wnFileIoRead: function(_inputData){
		MPVirtual.showInfo('WNFileIoRead');  
		var inputData = JSON.parse(_inputData);
		var cbFunc = inputData.cb_func;
		var jsonData = {
									"status"       : "FAIL",
									"length"       : 0,
									"encode"     : "",
									"data"          : "",
									"name"        : ""
								};
		var _callBackFunc = eval("domIfrm" + MPVirtual.historyIdx + "." + cbFunc);
		_callBackFunc(jsonData); 
	},
	
	/**
	 *  file Write API
	 */
	 wnFileIoWrite: function(data){
			MPVirtual.showInfo('WNFileIoWrite');  
			var jsonData = {
					"status"       : "FAIL",
					"length"       : 0,
					"encode"     : "", 
					"name"        : ""
				};
			return JSON.stringify(jsonData)
	},
	
	/**
	 *  file Copy API
	 */
	wnFileIoCopy: function(data){
		MPVirtual.showInfo('WNFileIoCopy');  
		var jsonData = { "status" : "FAIL" }; 
		return JSON.stringify(jsonData);
	},
	
	/**
	 *  file Move API
	 */
	wnFileIoMove: function(data){
		MPVirtual.showInfo('WNFileIoMove');  
		var jsonData = { "status" : "FAIL" }; 
		return JSON.stringify(jsonData);
	},
	
	/**
	 *  file Info API
	 */
	wnFileIoInfo: function(data){
		MPVirtual.showInfo('WNFileIoInfo');  
		var jsonData = {};
		if( data ){
			var inputData = JSON.parse(data);
			if( (inputData.option).toUpperCase() == "FILE" ){
				jsonData = {
										"status"        :  "FAIL",
										"file_size"      : 0,
										"file_create"  : "",
										"file_update" : "",
										"file_path"    : "",
										"file_name"  : ""
									};
			}else if( (inputData.option).toUpperCase() == "DIR" ){
				jsonData = {
										"status"           : "FAIL",
										"subfile_count" : 0,
										"dir_create"      : "",
										"dir_update"     : "",
										"dir_path"        : "",
										"dir_name"      : ""
									};
			};
		}
		return JSON.stringify(jsonData);
	},
	
	/**
	 *  file List API
	 */
	wnFileIoList: function(data){
		MPVirtual.showInfo('WNFileIoList');  
		var jsonData = {};
		if( data ){
			var inputData = JSON.parse(data);
			if( (inputData.option).toUpperCase() == "FILE" ){
				jsonData = {
										"status"    :  "FAIL", 
										"file_count" : 0,
										"file_list"     : [ { "file_name" : "" },
											                   { "file_name" : "" },
											                   { "file_name" : "" } ]
									};
			}else if( (inputData.option).toUpperCase() == "DIR" ){
				jsonData = {
										"status"    : "FAIL", 
										"dir_count" : 0,
										"dir_list"     : [ { "dir_name" : "" },
											                  { "dir_name" : "" },
											                  { "dir_name" : "" }  ]
									};
			}else if( (inputData.option).toUpperCase() == "ALL" ){
				jsonData = {
										"status"     : "FAIL", 
										"file_count" : 0,
										"file_list"     : [ { "file_name" : "" },
											                   { "file_name" : "" },
											                   { "file_name" : "" } ],
										"dir_count" : 0,
										"dir_list"     : [ { "dir_name" : "" },
											                  { "dir_name" : "" },
											                  { "dir_name" : "" } ]
									};
			};
		}
		return JSON.stringify(jsonData);
	},
	
	/**
	 * FILE I/O 응답 함수
	 */
	wnCBFileIo: function(data){
		MPVirtual.showInfo('WNCBFileIo');   
	},
	
	/**
	 * Local DataBase Create API 
	 */
	wnLocalDbCreate: function(_dbNm, _callBackFunc){ 
        if(window.openDatabase){
    		localDb =  openDatabase(_dbNm, '1.0', 'YAYMusic Database', 100000);
// 		 				     openDatabase(shortName, version, displayName, maxSize); 
        }else{
        	alert('Your browser is not supporting databases.');
        }  
		var _callBackFunc = eval("domIfrm" + MPVirtual.historyIdx + "." + _callBackFunc);
		_callBackFunc(MPVirtual.jsonDataDb('', '', _dbNm));
	},

	/**
	 * Local DataBase Open API 
	 */
	wnLocalDbOpen: function(_dbNm, _callBackFunc){
		MPVirtual.showInfo('WNLocalDbOpen');  
		var _callBackFunc = eval("domIfrm" + MPVirtual.historyIdx + "." + _callBackFunc);
		_callBackFunc(MPVirtual.jsonDataDb('', '', _dbNm, 'N'));
	},

	/**
	 * Local DataBase Close API 
	 */
	wnLocalDbClose: function(_dbNm, _callBackFunc){
		MPVirtual.showInfo('WNLocalDbClose');  
		var _callBackFunc = eval("domIfrm" + MPVirtual.historyIdx + "." + _callBackFunc);
		_callBackFunc(MPVirtual.jsonDataDb('', '', _dbNm, 'N'));
	},
	
	/**
	 * Local DataBase Delete API 
	 */
	wnLocalDbDelete: function(_dbNm, _callBackFunc){
		MPVirtual.showInfo('WNLocalDbDelete');  
		var _callBackFunc = eval("domIfrm" + MPVirtual.historyIdx + "." + _callBackFunc);
		_callBackFunc(MPVirtual.jsonDataDb('', '', _dbNm, 'N'));
	},
	
	/**
	 * Local ExecuteSql API 
	 */
	wnLocalDbExecuteSql: function(_inputData, _callBackFunc){   
		var inputData = JSON.parse(_inputData); 
		var sql = inputData.sql; 
		var _callBackFunc = eval("domIfrm" + MPVirtual.historyIdx + "." + _callBackFunc);
 
		if( !((sql.substring(0,6)).toLowerCase() == "select") ){    
			localDb.transaction(
					 function (transaction) {  
						        transaction.executeSql(sql);  
					 }
			);  
			_callBackFunc(MPVirtual.jsonDataDb('', '', inputData.db_name)); 
		}else{ 
			var test1;
			var resultsData = false;
			localDb.transaction(
				function (transaction) { 
					transaction.executeSql(sql, [], 
						function(tx, result){   
							_callBackFunc(MPVirtual.jsonDataDb(tx, result, inputData.db_name)); 
						}
					);
				}
			);     
		} 
	}, 

	/**
	 *  return json Data of Local DataBase 
	 */ 
	jsonDataDb: function(tx, resultData, dbName, _statusFlag){    
		var statusFlag;
		if( _statusFlag == 'N' ){
			statusFlag = "FAIL";
		}else{
			statusFlag = "SUCCESS";
		}
		if( resultData == '' ){   //  'select'문이 아닐 경우  
			var jsonData = {
					"status"            : statusFlag ,
					"db_name"       : dbName
			};
		}else{				   //  'select'문일 경우 
			var jsonData;
			if( resultData != true ){ 
				var columnArray = new Array(); 
		        var data = resultData.rows.item(0); 
		        for( var colNm in data ){
		        	columnArray.push(colNm);
		        } 
				var dbResultData = resultData;
				var rowName = new Array();
			    for(var r=0; r<dbResultData.rows.length; r++) {
					for( var j = 0; j < columnArray.length; j++ ){
						var colNm = columnArray[j];
				    	rowName.push(dbResultData.rows.item(r)[colNm]); 
				    }
				} 
				jsonData = {
						"status"            : "SUCCESS",
						"db_name"       : dbName,
						"row_count"      : dbResultData.rows.length,
						"column_count" : columnArray.length,
						"column_list"     : columnArray,
						"row_list" : rowName
				};
			} 
		} 
		return jsonData;  
	},
	
	/**
	 * 암호화 된 html, js 파일을 복구하여 import 시킴
	 */
	wnImportEncryptedJS: function(path){
		MPVirtual.showInfo('WNImportEncryptedJS');   
	},
	
	/**
	 * 암호화 된  파일을 복구하여 String 형태로 return함.
	 */
	wnGetEncryptedFile: function(fileName){
		MPVirtual.httpRequest("../AppManifest.xml"); 
		return (new XMLSerializer()).serializeToString(xmlString);
	},
	
	/**
	 * Ftp의 파일을 다운로드.
	 */
	wnFtpFileDownload: function(){
		MPVirtual.showInfo('WNFtpFileDownload');   
	},
	
	/**
	 * Ftp 폴더 안의 목록을 다운로드.
	 */
	wnFtpListDownload: function(){
		MPVirtual.showInfo('WNFtpListDownload');   
	},
	
	/**
	 * APP이 사용중인 메모리/총메모리/남은 메모리 용량을 kilo byte단위로 출력함. 
	 */
	wnGetMemoryInfo: function(){ 
		MPVirtual.showInfo('WNGetMemoryInfo');  
		var returnObj = new Object();
		returnObj.mem_used = 0;
		returnObj.mem_free = 0;
		returnObj.mem_total = 0;
		return JSON.stringify(returnObj);
	},
	
	/**
	 * 모피어스의 라이브러리 버젼 및 build 연월일을 출력함. 
	 */
	wnGetMorpheusInfo: function(){
		MPVirtual.httpRequest("../AppManifest.xml"); 
		return MPVirtual.xmlConvertToObj();
	}, 
	 
	/** 
	 * QR Code Camera 화면으로 이동한다. 
	*/
	wnTakeQRCode: function(_callFunction, _option){ 
		var jsonData = { "status" : "CANCEL" , "result" : "QR_DATA" };
		setTimeout(function(){
			if(typeof _callFunction == "string"){
				var _callBackFunc = eval("domIfrm" + MPVirtual.historyIdx + "." + _callFunction);
				_callBackFunc(jsonData);
			}else if(typeof _callFunction == "function"){
				eval(_callFunction)(jsonData)
			}
		}, 200);
		return "NS";
	},

	/** 
	 * Flash Light를 설정한다.
	*/
	wnControlFlash: function(_option){
		MPVirtual.showInfo('WNControlFlash');   
	},

	/** 
	 * 현재의 Flash Light 상태를 return한다.
	*/
	wnGetFlashState: function(){
		return "NS";
	}, 
	
	/*
	 * Zip API
	 * file 정보들을 받아 압축한다.
	 */
	wnZip: function(_zipFile, _fileInfos, _cbfunc, _zipOption){
		MPVirtual.showInfo('WNZip');
	}, 

	/*
	 * Unzip API
	 * zip파일을 Unzip 한다.
	 */
	wnUnZip: function(_zipFile, _destination, _cbfunc, _unzipOption){
		MPVirtual.showInfo('WNUnZip');
	}, 
	
	/*
	 *  WNGetMorpheusInfo() 에서 사용하는 함수
	 *    : Ajax 통신
	 */
	httpRequest: function(url){  
		var xmlhttp;
		if(window.XMLHttpRequest) {
			xmlhttp = new XMLHttpRequest();
		}else{
			xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
		}
 
		xmlhttp.open("POST", url, false);
		xmlhttp.onreadystatechange = function (aEvt) {  
			if ( xmlhttp.readyState == 4 ) { 
				if( xmlhttp.status == 200 || xmlhttp.status == 0) {		
					xmlString = xmlhttp.responseXML;
					return xmlhttp.responseXML;
				}else{  
					return false;
				}
			}
		}
		xmlhttp.send();
	},
	

	/*
	 *  WNGetMorpheusInfo() 에서 사용하는 함수
	 *    : XML파일을 객체 형태로 변환 
	 */
	xmlConvertToObj: function(){ 
		var xmlNode = xmlString.childNodes[0];
		var nodeFirst = xmlNode.nodeName;    //   manifest
		var jsonData = new Object(); 
		var childNodeFlag = false; 
		for( var f = 0; f < xmlNode.childNodes.length; f++ ){
			var childNd = xmlNode.childNodes[f];
			if( childNd.nodeType != 3 ){      //  node가 '#text'일 경우 nodeType이 3이다. 엘리먼트가 아닌 text는 필요 없으므로 if문 처리.
				var childNodeNm = childNd.nodeName;
				if( (childNodeNm).toLowerCase() != "network-setting" ){
					jsonData[(childNodeNm).replace(/-/i, "_")] = childNd.childNodes[0].nodeValue;
				}else{  
					var networkDivi = new Object();
					var networkObj = new Object();
					var flagTest = false;
					for( var g = 0; g < childNd.childNodes.length; g++ ){    //  'network-setting' 하위 노드 
						var networkSetChilds = childNd.childNodes[g];
						if( networkSetChilds.nodeType != 3 ){  
							var networkChildObj = new Object(); 
							
							for( var h = 0; h < networkSetChilds.childNodes.length; h++ ){
								var lastChildNode = networkSetChilds.childNodes[h];
								if( lastChildNode.nodeType != 3 ){
									var nodeName = (lastChildNode.nodeName).replace(/-/gi, "_");  
									networkChildObj[nodeName] = lastChildNode.childNodes[0].nodeValue;       //  insert of network NAME 
								}
							}
	 
							for( var keyNm in networkDivi ){
								if( networkSetChilds.nodeName != keyNm ){
									if( flagTest == false ){
										if( childNd.childNodes[g+2] ){
											if( (childNd.childNodes[g+2].nodeName == networkSetChilds.nodeName) || networkSetChilds.nodeName == undefined){
												networkObj = {}; 
											}
										}
									}   
								} 
							}
							networkObj[networkSetChilds.getAttribute("name")] = networkChildObj;       //  network    NAME
							networkDivi[(networkSetChilds.nodeName).replace(/-/i, "_")] = networkObj;      //  network 종류 태그
						}
					}  
					jsonData[(childNodeNm).replace(/-/i, "_")] = networkDivi;
				}
			} 
		}  
		
		jsonData.current_version = MPVirtual.current_version;
		var appManifestObj = new Object();
		appManifestObj[nodeFirst] = jsonData; 
		appManifestObj.release_version = MPVirtual.release_version;
		appManifestObj.release_date = MPVirtual.release_date;
		
		return appManifestObj;
	},
	 	
	// 모피어스 에뮬레이터에서 제공하지 않는 기능은 Alert 처리 한다. 
	showInfo: function(_funcNm){
		if( _funcNm != "WNShowVideo" ){
			if( _funcNm == "WNOpenWebBrowser" ){
				alert("현재 '" + _funcNm + "' 기능의 'encoding' 옵션은 모피어스 웹 플랫폼에서 지원하지 않습니다.");
			}else{
				alert("현재 '" + _funcNm + "' 기능은 모피어스 웹 플랫폼에서 지원하지 않습니다.");
			}
		}else{
			alert("현재 '" + _funcNm + "' 기능의 'NATIVE' 옵션은 모피어스 웹 플랫폼에서 지원하지 않습니다.");
		}
	},
//	// 모든 WN 인터페이스 함수에서 리턴하는 json 형태를 공통 처리한다. 
//	showInfo: function(_status){
//		var jsonObj = {
//			"status" : _status
//		};
//		return jsonObj;
//	},
 	
	/*
	 *   wnPopupDatePicker 초기 값 계산 
	 */
	setDateValue: function(_obj){
		var initDateObj = new Object();
		initDateObj.startYear = '';
		initDateObj.startMonth = '';
		initDateObj.startDay = '';
		initDateObj.endYear = '';
		initDateObj.endMonth = '';
		initDateObj.endDay = '';
		
		// 해당 월에 따라 말일 숫자 지정 
		var thirtyoneMonth = [1, 3, 5, 7, 8, 10, 12];
		var lastDay;
		for( var m = 0; m < thirtyoneMonth.length; m++ ){ 
			if( Number(MPVirtual.wnPopupDatePicker.month) == thirtyoneMonth[m] ){
				lastDay = 31;
				break;
			}else{
				lastDay = 30;
			}
		}
		
		//  입력 초기 값에 따라 컴포넌트 값 변경 
		if( MPVirtual.wnPopupDatePicker.lowYear != MPVirtual.wnPopupDatePicker.year ){
			// Month
			initDateObj.startMonth = 1;
			if(MPVirtual.wnPopupDatePicker.maxYear != MPVirtual.wnPopupDatePicker.year ){
				initDateObj.endDay = lastDay;
				initDateObj.endMonth = 12;
			}else{
				initDateObj.endMonth = MPVirtual.wnPopupDatePicker.maxMonth;
				initDateObj.endDay = MPVirtual.wnPopupDatePicker.maxDay;
				if( MPVirtual.wnPopupDatePicker.maxMonth != MPVirtual.wnPopupDatePicker.month  ){
					initDateObj.endDay = lastDay;
				}
			}
			// Day
			initDateObj.startDay = 1;
		}else{
			// Month
			initDateObj.startMonth = MPVirtual.wnPopupDatePicker.lowMonth;
			if( MPVirtual.wnPopupDatePicker.maxYear != MPVirtual.wnPopupDatePicker.year ){
				initDateObj.endMonth = 12;
			}else{
				initDateObj.endMonth = MPVirtual.wnPopupDatePicker.maxMonth;
			}
			// Day
			if( MPVirtual.wnPopupDatePicker.lowMonth != MPVirtual.wnPopupDatePicker.month ){
				initDateObj.startDay = 1;
				initDateObj.endDay = lastDay;
			}else{
				console.log("year month =");
				initDateObj.startDay = MPVirtual.wnPopupDatePicker.lowDay;
				if( MPVirtual.wnPopupDatePicker.maxMonth != MPVirtual.wnPopupDatePicker.month  ){
					console.log("year month =2");
					initDateObj.endDay = lastDay;
				}else{
					initDateObj.endDay = MPVirtual.wnPopupDatePicker.maxDay;
				}
			}
		}
		return initDateObj;
	},
	
	/*
	 *   wnPopupDatePicker() 의 Year 값 범위 계산 
	 */
	datePickerSetYear: function(_startDate, _endDate){ 
		document.querySelector("#year").innerHTML = ""; 
		if( document.querySelector("#year") != null ){
			var startDateYear = Number(_startDate.substr(0,4));
			var endDateYear = Number(_endDate.substr(0,4));
			for(var i = startDateYear; i < endDateYear+1; i++){
				if(MPVirtual.wnPopupDatePicker.year == i) var _selected = "selected='selected'";
				else var _selected = "";
				document.querySelector("#year").innerHTML += "<option "+_selected+">"+i+"</option>";
			}
		}
	},
	
	/*
	 *   wnPopupDatePicker() 의 Month 값 범위 계산 
	 */
	datePickerSetMonth: function(_startDate, _endDate){
		document.querySelector("#month").innerHTML = "";
		if( document.querySelector("#month") != null ){ 
			for(var i = Number(_startDate); i < Number(_endDate)+1; i++){
				i<10 ? i="0"+i : i;                //  숫자가 한 자리 일경우 '0'을 붙여 2자리로 변경 
				if(MPVirtual.wnPopupDatePicker.month == i) var _selected = "selected='selected'";
				else var _selected = "";
				document.querySelector("#month").innerHTML += "<option "+_selected+">"+i+"</option>";
			}
		}
	},
	
	/*
	 *   wnPopupDatePicker() 의 Day 값 범위 계산 
	 */
	datePickerSetDay: function(_startDate, _endDate){
		document.querySelector("#day").innerHTML = "";
		if( document.querySelector("#day") != null ){ 
			for(var i = Number(_startDate); i < Number(_endDate)+1; i++){
				i<10 ? i="0"+i : i;                //  숫자가 한 자리 일경우 '0'을 붙여 2자리로 변경 
				if(MPVirtual.wnPopupDatePicker.day == i) var _selected = "selected='selected'";
				else var _selected = "";
				document.querySelector("#day").innerHTML += "<option "+_selected+">"+i+"</option>";
			}
		}
	},
	
	/*
	 *  wnPopupDatePicker() 호출시 팝업에서 년도,월,일 각 콤보박스의 값이 변경되었을 때 처리하는 함수  
	 */
	datePickerPopupSelect: function(_divi, _changedValue){
		if( _divi == "year" ){
			MPVirtual.wnPopupDatePicker.year = _changedValue;
		}else if( _divi == "month" ){
			MPVirtual.wnPopupDatePicker.month = _changedValue;
		}else if( _divi == "day" ){
			MPVirtual.wnPopupDatePicker.day = _changedValue;
		}
		var initDateValue = MPVirtual.setDateValue();
		MPVirtual.datePickerSetYear(MPVirtual.wnPopupDatePicker.lowYear, MPVirtual.wnPopupDatePicker.maxYear);
		MPVirtual.datePickerSetMonth(initDateValue.startMonth, initDateValue.endMonth);
		MPVirtual.datePickerSetDay(initDateValue.startDay, initDateValue.endDay);
	},
	
	//window resize event
	windowResize: function(){
		MPVirtual.windowWidth = (MPVirtual.devMode == true)?MPVirtual.windowWidth:parent.window.innerWidth;
		MPVirtual.windowHeight = (MPVirtual.devMode == true)?MPVirtual.windowHeight:parent.window.innerHeight;
		for(var i=1; i<document.querySelectorAll("[data-url]").length+1; i++){
			document.querySelector("#domIfrm" + i).style.width = MPVirtual.windowWidth + "px";
			document.querySelector("#domIfrm" + i).style.height = MPVirtual.windowHeight + "px";
			//if(i != document.querySelectorAll("[data-url]").length) document.getElementById("domIfrm" + i).style.left = -1 * MPVirtual.windowWidth + "px !important";
		}
	}
}


//Gloval Variable class
function GlobalVariable() {
	this.array = [];
}
GlobalVariable.prototype.put = function(key, value) {
	var index = this.getIndex(key);
	if(index > -1) this.array[index] = {key: key, value: value};
	else this.array.push({key: key, value: value});
};
GlobalVariable.prototype.get = function(key) {
    var index = this.getIndex(key);
    if(index > -1) return this.array[index].value;
    else return '';
};
GlobalVariable.prototype.getAtIndex = function(index) {
	return this.array[index].value;
};
GlobalVariable.prototype.remove = function(value) {
	var index = this.getIndexOfValue(value);
	this.removeByIndex(index);
};
GlobalVariable.prototype.removeByKey = function(key) {
	var index = this.getIndex(key);
	this.removeByIndex(index);
};
GlobalVariable.prototype.removeByIndex = function(index) {
	this.array.splice(index, 1);
};
GlobalVariable.prototype.clear = function() {
	this.array = new Array(0);
};
GlobalVariable.prototype.all = function() {
	return this.array;
};
GlobalVariable.prototype.getIndex = function(key) {
	var index = -1;
	for (var i=0; i<this.array.length; i++) {
		var item = this.array[i];
		if (item.key == key) index = i;
	}
	return index;
};
GlobalVariable.prototype.getIndexOfValue = function(value) {
	var index = -1;
	for (var i=0; i<this.array.length; i++) {
		var item = this.array[i];
		if (item.value == value) index = i;
	}
	return index;
};
GlobalVariable.prototype.getKeyOfValue = function(value) {

    var key = '';
    for (var i=0; i<this.array.length; i++) {
        var item = this.array[i];
        if (item.value == value) key = item.key;
    }
    return key;
};
GlobalVariable.prototype.contains = function(value) {
	var index = this.getIndexOfValue(value);
	return index > -1;
};
GlobalVariable.prototype.containsKey = function(key) {
	var index = this.getIndex(key);
	return index > -1;
};
GlobalVariable.prototype.size = function() {
	return this.array.length;
};


 
/*
 *   RequestAjax    CLASS
 *     Ajax 호출
 *      
 */
(function(){  
	RequestAjax = function(){  
		this.xmlhttp;
		this.cbName; 
		this.setAsync = true;
		if(window.XMLHttpRequest) {
			this.xmlhttp = new XMLHttpRequest();
		}else{
			this.xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
		}
	}  
	RequestAjax.prototype = {
		requestXmlHttp: function(_url, _cb, _tagId, _screenId, _parameter){
			this.xmlhttp.open("POST", _url, this.setAsync);
			(_tagId != undefined)?(this.xmlhttp.tagId = _tagId):'';
			this.xmlhttp.onreadystatechange = _cb;  
			this.xmlhttp.tagId = _tagId;
			this.xmlhttp.screenId = _screenId;
			this.xmlhttp.cbFunc = this.getCBFunc(); 
			this.xmlhttp.send(_parameter);
		},
		setCBFunc: function(_value){
			this.cbName = _value;
		},
		getCBFunc: function(){
			return this.cbName;
		} 
	}  
})();
  

/*
 *   LoadComponent    CLASS
 *      
 */ 
(function(){
	LoadComponent = function(_width, _height){ 
		//  'AppManifest.xml'의 show Indecator 노드 값이 'N'일 경우 인디게이터 제거 
		if( MPVirtual.loadAppManifestXml.showIndicator != undefined ){
			if( MPVirtual.loadAppManifestXml.showIndicator == "N" ){
				return;
			}
		}
		var loadIdx = 0;  
		document.querySelector("#component").style.display = "block";
		MPVirtual.wnPopupDatePicker.backLock = document.createElement("div");
		with(MPVirtual.wnPopupDatePicker.backLock){
			style.position = "absolute";
			style.background = "#000";
			style.width = "100%";
			style.height = "100%";
			style.top = "0px";
			style.left = "0px";
			style.opacity = 0;
		}
		document.querySelector("#component").appendChild(MPVirtual.wnPopupDatePicker.backLock);
		MPTween(MPVirtual.wnPopupDatePicker.backLock, {opacity:.5});
		//popWrap
		MPVirtual.popWrap = document.createElement("div");
		with(MPVirtual.popWrap){
			style.position = "absolute";
			style.border = "2px solid #b0bbbd";
			style.webkitBorderRadius = "8px";
			style.backgroundImage = "-webkit-gradient(linear, left bottom, left top, color-stop(0.2, rgb(22,41,59)), color-stop(0.8, rgb(34,71,106)))";
			style.webkitBoxShadow = "0 0 10px #000";
			style.width = _width+"px";
			style.height = _height+"px";
			style.top = window.innerHeight / 2 - _height/2 + "px";
			style.left = window.innerWidth / 2 - _width/2 + "px";
			style.opacity = 1;
			style.color = "#fff";
			style.padding = "10px";
		} 

		document.querySelector("#component").appendChild(MPVirtual.popWrap);
	}

	LoadComponent.prototype = {
			//   LoadComponent   CLASS
			loadIndicator: function(_indicatorId, _title, _msg, _width, _height){ 
				var msgWidth = _width - 65; 
				MPVirtual.loadHash.popContent = "<div id='" + _indicatorId + "' style='float:left; width:25px; height:25px; overflow:hidden; background:url(../js/mplibs/img/loading.png) no-repeat; margin:10px'></div>";
				MPVirtual.loadHash.popContent += "<div style='float:left; margin:10px; width:" + msgWidth + "px'><p style='margin:0; line-height:0'>";
				MPVirtual.loadHash.popContent += _title;
				MPVirtual.loadHash.popContent += "</p>";
				MPVirtual.loadHash.popContent += "<p>";
				MPVirtual.loadHash.popContent += _msg;
				MPVirtual.loadHash.popContent += "</p></div>";
				MPVirtual.popWrap.innerHTML = MPVirtual.loadHash.popContent;
				loadIdx = 0;
				indicatorID = setInterval(function(){
					if(loadIdx == 11) loadIdx = 0;
					else loadIdx++;
					document.getElementById(_indicatorId).style.backgroundPositionX = -1 * loadIdx * 25 + "px";
				}, 80);   
			}, 
			removeComponent: function(){ 
				document.querySelector("#component").style.display = "none";
				document.querySelector("#component").innerHTML = "";
			},
			removeIndicator: function(){
				clearInterval(indicatorID);
				indicatorID = "";
				this.removeComponent(); 
			},
			loadInstanceMessage: function(_msg, _time){
				MPVirtual.popWrap.style.textAlign = "center";
				MPVirtual.popWrap.innerHTML = _msg;
				MPVirtual.popWrap.style.top =  window.innerHeight / 2 - MPVirtual.popWrap.clientHeight/2 + "px"; 
				MPVirtual.popWrap.style.left =  window.innerWidth / 2 - MPVirtual.popWrap.clientWidth/2 + "px"; 
				setTimeout(
						this.instanceHiddenFunc, _time*1000
				);
			},
			instanceHiddenFunc: function(){
				MPVirtual.popWrap.style.visibility = "hidden";  
				document.querySelector("#component").style.display = "none";
				document.querySelector("#component").innerHTML = ""; 
			}
	}
})();
	
	