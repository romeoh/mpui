/**********************************************************************
 wnInterface.js
 웹 & 네이티브 인터페이스 스크립트
 Author : 류경민
 Copyright (c) 2001-2011 Uracle Co., Ltd. 
 166 Samseong-dong, Gangnam-gu, Seoul, 135-090, Korea All Rights Reserved.
 웹과 네이티브 인터페이스 스크립트 함수들을 정의한다. 
 ************************************************************************/
  
//Classes
var DT_PC = 0;
var DT_IPOD = 1;
var DT_IPHONE = 2;
var DT_IPAD = 3;
var DT_IOS = 4;
var DT_ANDROID = 5;
var wnIf = new function() 
{
	
//	this.device;
	// initalize method
	this.init = function() 
	{
		var agent = navigator.userAgent.toLowerCase();
		var plat  = navigator.platform.toLowerCase();
		if(plat.indexOf('macintel') != -1) {
			this.device = DT_PC;
		} else if (agent.indexOf('ipod') !=-1) {
			this.device = DT_IOS;
		} else if (agent.indexOf('iphone') !=-1) {
			this.device = DT_IOS;
		} else if (agent.indexOf('ipad') !=-1) {
			this.device = DT_IOS;
		} else if (agent.indexOf('android') !=-1) {
			this.device = DT_ANDROID;
		} else {
			this.device = DT_PC;
		}
	};
	// [only iOS] wnIf script가 로딩됨을 native에서 확인하는 function
	this.isLoading = function() 
	{
		return 'true'; 
	};
	
	this.callInitPage = false;
}
wnIf.init();
 

/////////////////////////////////////////////////////////////////////////
//유틸리티

/** 
 * string String::cutByte(int len)
 * 글자를 앞에서부터 원하는 바이트만큼 잘라 리턴합니다.
 * 한글의 경우 2바이트로 계산하며, 글자 중간에서 잘리지 않습니다.
 */
String.prototype.cutByte = function(len) {
	var str = this;
	var l = 0;
	for (var i=0; i<str.length; i++) {
	        l += (str.charCodeAt(i) > 128) ? 2 : 1;
	        if (l > len) return str.substring(0,i);
	}
	return str;
}

/** 
 * 해당스트링의 바이트단위 길이를 리턴합니다. (기존의 length 속성은 2바이트 문자를 한글자로 간주합니다)
 */
String.prototype.byteLen = function() {
	var str = this;
	var l = 0;
	for (var i=0; i<str.length; i++) l += (str.charCodeAt(i) > 128) ? 2 : 1;
	return l;
}

/**
 * String Trim() 구현
 * 문자열의 공백을 제거한다.
 */
String.prototype.trim = function() {  
	//var regExpTrim = "^\\s+|\\s+$/g";
    return this.replace(/^\s+|\s+$/g,"");  
}  

String.prototype.ltrim = function() {  
    return this.replace(/^\s+/,"");     
}  

String.prototype.rtrim = function() {  
    return this.replace(/\s+$/,"");     
}

/**
 * StringBuffer 클래스 제공
 * 문자열 연결 연산
 */
function StringBuffer() { 
    this.buffer = []; 
} 

StringBuffer.prototype.append = function append(string) { 
    this.buffer.push(string); 
    return this; 
}; 

StringBuffer.prototype.toString = function toString() { 
    return this.buffer.join(""); 
};


//-----------------------------------------------------------
//Map class
function Map() {
	this.array = [];
}
Map.prototype.put = function(key, value) {
	var index = this.getIndex(key);
	if (index > -1) {
		this.array[index] = {key: key, value: value};
	} else {
		this.array.push({key: key, value: value});
	}
};
Map.prototype.get = function(key) {
    var index = this.getIndex(key);
    if (index > -1) {
        return this.array[index].value;
    } else {
        return '';
    }
};
Map.prototype.getAtIndex = function(index) {
	return this.array[index].value;
};
Map.prototype.remove = function(value) {
	var index = this.getIndexOfValue(value);
	this.removeByIndex(index);
};
Map.prototype.removeByKey = function(key) {
	var index = this.getIndex(key);
	this.removeByIndex(index);
};
Map.prototype.removeByIndex = function(index) {
	this.array.splice(index, 1);
};
Map.prototype.clear = function() {
	this.array = new Array(0);
};
Map.prototype.all = function() {
	return this.array;
};
Map.prototype.getIndex = function(key) {
	var index = -1;
	for (var i=0; i<this.array.length; i++) {
		var item = this.array[i];
		if (item.key == key) index = i;
	}
	return index;
};
Map.prototype.getIndexOfValue = function(value) {
	var index = -1;
	for (var i=0; i<this.array.length; i++) {
		var item = this.array[i];
		if (item.value == value) index = i;
	}
	return index;
};
Map.prototype.getKeyOfValue = function(value) {

    var key = '';
    for (var i=0; i<this.array.length; i++) {
        var item = this.array[i];
        if (item.value == value) key = item.key;
    }
    return key;
};
Map.prototype.contains = function(value) {
	var index = this.getIndexOfValue(value);
	return index > -1;
};
Map.prototype.containsKey = function(key) {
	var index = this.getIndex(key);
	return index > -1;
};
Map.prototype.size = function() {
	return this.array.length;
};


//-----------------------------------------------------------
//Parameter class
function Parameter() {
	this.parameters = new Map();
    
	this.initParameters = function(paramStr) {
        
		if (paramStr == 'null')
			return;
	
		if(wnIf.device == DT_IOS) 
		{
			paramStr = decodeURIComponent(paramStr);    
		}
		
	    if (paramStr.trim() != '') {
			var params = paramStr.split('&');
			for (var i = 0; i < params.length; i++) {
				var key = params[i].split('=')[0];
				var value = params[i].split('=')[1];
				this.parameters.put(key, value);
			}
		}
	}
    
	this.initParametersFromHref = function(paramStr) {
		if (paramStr == 'null')
			return;
		var rtnval = '';
		if (paramStr.trim() != '') {
			var nowAddress = paramStr;
			var params = (nowAddress.slice(nowAddress.indexOf('?') + 1, nowAddress.length)).split('&');
			for (var i = 0; i < params.length; i++) {
				var key = params[i].split('=')[0];
				var value = params[i].split('=')[1];
				if( value != undefined ){
					if( value.indexOf("?screen_id") ){
						value = value.replace("?screen_id", "");
					}
				}
				this.parameters.put(key, value);
			}
		}
	}
    
	this.putParameter = function(key, value) {
		this.parameters.put(key, encodeURIComponent(value));
	}
    
	this.setParameter = function(key, value){
		this.parameters.put(key, encodeURIComponent(value));
	}
    
	this.getParameter = function(key) {
		return decodeURIComponent(this.parameters.get(key));
	}
    
	this.removeParameter = function(key) {
		this.parameters.removeByKey(key);
	}
    
	this.removeAll = function() {
		this.parameters.clear();
	}
    
	this.toParamString = function() {
		var myParam = this.parameters.all();
		var retStr = '';
		for(var i = 0; i < this.parameters.size(); i++) {
			ret = myParam[i];
			retStr += ret.key + '=' + ret.value;
			if (i < this.parameters.size() - 1)
				retStr += '&';
		}
		return retStr;
	}
	
//	this.toString = function() {
//		return this.toParamString();
//	}
}

//-----------------------------------------------------------

/**
 * 자바스크립트 파일 import
 * @param {Object} url
 */
function WNImportJavascript(url) {
	var tag = document.createElement("script");
	tag.type="text/javascript";
	tag.src = url;
    
	document.body.appendChild(tag);
}

// 페이지 전체에서 사용되는 파라메터 정의
var GlobalParameter = new Parameter();
GlobalParameter.initParametersFromHref(decodeURIComponent(location.href));

/**
 * 파라메터 값을 얻는다. 
 * @param {Object} key
 */
function WNGetParameter(key) {
	var _param  = this.frameElement.getAttribute("data-parameter");
	if(_param == null){
		return GlobalParameter.getParameter(key);
	}else{
		_paramArr = _param.split("&");
		for(var i=0; i<_paramArr.length; i++){
			paramKey = _paramArr[i].split("=")[0];
			paramValue = _paramArr[i].split("=")[1];
			GlobalParameter.putParameter(paramKey, paramValue);
			resultParam = GlobalParameter.getParameter(key);
		}
		return decodeURIComponent(resultParam);
	}
}

/**
 * 파라메터를 설정한다. 
 * @param {Object} key
 * @param {Object} value
 */
function WNSetParameter(key, value) {
	GlobalParameter.setParameter(key, value);
}

/**
 * 파라메터를 추가한다. 
 * @param {Object} key
 * @param {Object} value
 */
function WNPutParameter(key, value) {
	GlobalParameter.putParameter(key, value);
}

/**
 * 키에 해당하는 파라메터를 제거한다. 
 * @param {Object} key
 */
function WNRemoveParameter(key) {
	GlobalParameter.removeParameter(key);
}

/**
 * 모든 파라메터 값을 제거한다. 
 */
function WNRemoveAllParameter() {
	GlobalParameter.removeAll();
}

/**
 * 파라메터 처리 클래스
 * 이전 페이지에서 넘어온 파라메터의 정보를 얻는다.  
 * (하위 호환을 위해서 제거 하지 않음.) 
 * @sample 
 * 	request.getParameter('aaa');
 */
var Request = function()
{
//	var paramString = decodeURIComponent(location.href);
//	this.setParameters = function ( paramStr )
//	{
//		paramString = decodeURIComponent(paramStr);
//	}
	this.getParameters = function () 
	{
		return decodeURIComponent(paramString);
	}
    this.getParameter = function( name )
    {
        return WNGetParameter(name);
    }
}
var request = new Request();

/**
 * 함수의 존재 유무를 확인한다.
 * @param 함수 이름
 */
function WNCheckFunc(funcName) {
	try {
		if (eval("typeof " + funcName + " == 'function'")) {
			return true;
		}
	} catch (e) {
		alert(e);
	}
	return false;
}

/**
 * URL 정보를 얻는다.
 * @return JSON 형식
 * 		fileName : 파일이름
 * 		parameters : 파라메터들
 */
function getUrlInfo(url) {
    
	//var nowAddress = encodeURI(url);
	var nowAddress = url;
	var file = url; 
	var parameters = '';
    
	if (nowAddress.indexOf('?') > -1) {
		file = nowAddress.slice(0,nowAddress.indexOf('?'));
		parameters = nowAddress.slice(nowAddress.indexOf('?') + 1, nowAddress.length);
	}
	return {"fileName":file, "parameters":parameters};
}
 

/////////////////////////////////////////////////////////////////////////
//네이티브 디버깅 관련 
/**
 * 로그 출력
 * @param {Object} tag
 * @param {Object} message
 * @param {Object} level [E(ERROR),W(WARN),I(INFO),D(DEBUG),V(VERBOSE) / 대소문자 구분 없음]
 */
function WNLog(tag, message, level) {
    parent.MPVirtual.wnLog(tag, message, level);
}

/////////////////////////////////////////////////////////////////////////
//변수 처리 관련

/**
 * 사용자 공유변수(웹&네이티브) 변수를 설정한다.
 * @param varName 변수 이름 
 * @param varValue 변수 값 
 */ 
function WNSetVariable(name, value) { 
	parent.MPVirtual.wnSetVariable(name, value);
}

/**
 * 사용자 공유변수(웹&네이티브) 변수를 얻어온다.
 * @param varName 변수 이름
 * @return 변수의 값  
 */
function WNGetVariable(name) { 
	return parent.MPVirtual.wnGetVariable(name);
}

/**
 * 공통 설정 정보를 네이티브 저장소에 저장한다.
 * @param name 정보 이름(키)
 * @param value 정보 데이터
 */
function WNSetVariableToStorage(name, value) { 
	parent.MPVirtual.wnSetVariableToStorage(name, value);
}
/**
 * 공통 설정 정보를 네이티브 저장소에서 읽어온다. 
 * @param name 가져올 데이터의 이름(키)
 * @return JSON 형식의 환경 설정 정보 
 */
function WNGetVariableFromStorage(name) { 
	return parent.MPVirtual.wnGetVariableFromStorage(name) + '';
}

/**
 * 장치 정보를 얻어온다. 
 * @return json 형식의 장치 정보
 *  DEVINFO_DEVICE_ID : 장치 아이디
 *  DEVINFO_SOFTWARE_VERSION : 소프트웨어 버전 
 *  DEVINFO_DISP_WIDTH : 화면 넓이
 *  DEVINFO_DISP_HEIGHT : 화면 높이 
 *  DEVINFO_MODEL : 모델명
 *  DEVINFO_COMM_BRAND : 통신사 정보
 */
function WNGetDeviceInfo() { 
	return parent.MPVirtual.wnGetDeviceInfo();
} 


/////////////////////////////////////////////////////////////////////////
//네트워크 처리 관련

/**
 * 네트워크 연결 초기화
 * @param url 접속 서버 URL
 * @param timeout 연결 대기 타임 아웃 설정 
 * @param encoding 데이터 인코딩
 */
function WNInitializeHttpNetwork(url, agent, timeout, encoding) {
	Native.wnInitializeHttpNetwork(url, agent, timeout, encoding);
}

function WNRequestHttpDataToServer(targetServerName, trCode, callBackFuncName, reqJSONData, reqNetOptions, tagId){
	return WNHttpSendData(targetServerName, trCode, callBackFuncName, reqJSONData, reqNetOptions, tagId);
} 

/**
 * JSON 형식의 요청 전문을 서버에 요청한다.
 * @param targetServerName 타켓 서버
 * @param trCode 전문번호
 * @param callBackFunc 응답받을 함수명
 * @param reqJSONData 요청 데이터(JSON)
 * @param reqNetOptions 요청 옵션 
 * @param tagId 화면 객체 아이디 
 */ 
function WNHttpSendData(targetServerName, trCode, callBackFuncName, reqJSONData, reqNetOptions, tagId) {
 	//if(typeof(isIndicator) == 'undefined') isIndicator = 'TRUE';
	var isEncrypt = 'N';
	var isIndicator = 'Y';
	var indicatorMsg = '';
	var isDummy = 'N';
	var retargetUrl = '';
	var cancelable = 'Y';
	
	// 옵션이 null 일경우 기본 정보 Setting
	if (reqNetOptions != null) {
		isEncrypt = (reqNetOptions.encrypt) ? "Y" : "N";
		isIndicator = (reqNetOptions.indicator) ? "Y" : "N";
		indicatorMsg = reqNetOptions.indicatorMsg;
		isDummy = (reqNetOptions.dummy) ? "Y" : "N";
		retargetUrl = reqNetOptions.retargetUrl;
		if(reqNetOptions.cancelable == undefined){
			cancelable = 'Y';
		}else{
			cancelable = (reqNetOptions.cancelable) ? "Y" : "N";
		}
	}
	tagId = (tagId == undefined) ? '' : tagId;
    
	var screenId = document.getElementById("mpScreenId").value;
	parent.MPVirtual.wnHttpSendData(
									targetServerName,
									trCode, 
									callBackFuncName, 
									JSON.stringify(reqJSONData), 
									reqNetOptions,
									screenId,
									tagId
									);
}
/**
 * Binary 형식의 요청 전문을 서버에 요청한다.
 * @param targetServerName 타켓 서버
 * @param trCode 전문번호
 * @param callBackFunc 응답받을 함수명
 * @param reqJSONData 요청 데이터(JSON)
 * @param resTempleteData 수신 템플리트 데이터(JSON)
 * @param reqNetOptions 요청 옵션 
 */ 
function WNSocketSendData(targetServerName, trCode, callBackFuncName, reqPacketData, resTempleteData, reqNetOptions, tagId) {
	//if(typeof(isIndicator) == 'undefined') isIndicator = 'TRUE';
	var isEncrypt = 'N';
	var isIndicator = 'Y';
	var indicatorMsg = '';
	var isDummy = 'N';
	var retargetUrl = '';
	var cancelable = 'Y';
	// 옵션이 null 일경우 기본 정보 Setting
	if (reqNetOptions != null) {
		isEncrypt = (reqNetOptions.encrypt) ? "Y" : "N";
		isIndicator = (reqNetOptions.indicator) ? "Y" : "N";
		indicatorMsg = reqNetOptions.indicatorMsg;
		isDummy = (reqNetOptions.dummy) ? "Y" : "N";
		retargetUrl = reqNetOptions.retargetUrl;
		if(reqNetOptions.cancelable == undefined){
			cancelable = 'Y';
		}else{
			cancelable = (reqNetOptions.cancelable) ? "Y" : "N";
		}
	}
	
	tagId = (tagId == undefined) ? '' : tagId;
     
	parent.MPVirtual.wnSocketSendData(
                                     targetServerName,
                                     trCode, 
                                     callBackFuncName, 
                                     JSON.stringify(reqPacketData), 
                                     JSON.stringify(resTempleteData), 
                                     isEncrypt,
                                     isIndicator,
                                     indicatorMsg,
                                     isDummy,
                                     retargetUrl
                                     );
}

function WNRequestSocketDataToServer(targetServerName, trCode, callBackFuncName, reqPacketData, resTempleteData, reqNetOptions, tagId){
    return WNSocketSendData(targetServerName, trCode, callBackFuncName, reqPacketData, resTempleteData, reqNetOptions, tagId);
}

/**
 * Server로부터 JSON 형식의 데이터를 받아 처리한다.
 * @param trCode 전문 코드 
 * @param callBackFunc 응답받을 함수명
 * @param recvData 응답 데이터(JSON)
 * @param tagId 화면 태그 객체 이름
 */ 
function WNResponseJsonDataFromServer(trCode, callBackFuncName, recvData, tagId) {
	try { 
		eval(callBackFuncName)(trCode, JSON.parse(recvData));
	} catch (e)  {
		alert(e);
	}
}


/**
 * Server로부터 JSON 형식의 데이터를 받아 처리한다.
 * @param trCode 전문 코드 
 * @param callBackFunc 응답받을 함수명
 * @param recvData 응답 데이터(JSON)
 * @param tagId 화면 태그 객체 이름
 */ 
function WNResponseSocketDataFromServer(trCode, callBackFuncName, recvData, tagId) {
	try { 
		eval(callBackFuncName)(trCode, JSON.parse(recvData));
	} catch (e)  {
		alert(e);
	}
}

/////////////////////////////////////////////////////////////////////////
//프로그램 & 리소스 업데이트 

/**
 * 프로그램(리소스) 업데이트를 요청한다. 
 * @param {Object} version 업데이트 리소스 버전
 * @param {Object} md5key 파일의 MD5 키
 * @param {Object} downUrl 다운로드 URL
 */
function WNRequestAppUpdating(version, md5key, downUrl) { 
    parent.MPVirtual.wnRequestAppUpdating(version, md5key, downUrl);
} 
/////////////////////////////////////////////////////////////////////////
//네이티브 API 연동

/**
 * 진동 
 * @param strMilliseconds 1000분의 1초 
 */
function WNVibration(strMilliseconds) { 
	parent.MPVirtual.wnMakeVibration(strMilliseconds);
}

function WNMakeVibration(strMilliseconds){
    return WNVibration(strMilliseconds);
}

/**
 * 프로그램 종료
 */
function WNExitProgram() { 
	parent.MPVirtual.wnExitProgram();
}

/////////////////////////////////////////////////////////////////////////
//화면 네비게이션


/**
 * 화면 이동 (To Web View on now activity)
 * 현재 액티비티의 웹뷰에 새로운 페이지를 로딩한다.
 * @param {Object} url 이동할 URL
 * @param {Object} isReplacing 페이지 대체 여부
 */
function WNMoveToWeb(url, isReplacing) { 
	parent.MPVirtual.wnReplaceHtmlPage(url, isReplacing);
}

function WNReplaceHtmlPage(url, isReplacing) { 
	return WNMoveToWeb(url, isReplacing);
}

/**
 * 화면 이동 (To new webview on new native activity or new native activity)
 * 새로운 액티비티 위에 웹뷰를 생성하고 새로운 페이지를 로딩한다.
 * @param {Object} url
 * 	- 이동할 HTML 파일 경로 (파일명, 파라메터 포함)
 * @param actionType 화면 이동시 Activity의 히스토리 스택 저장 처리 정의
 *  - NEW_SCR : 새로운 Activity(ViewController)를 생성한다. 
 *  			호출한 Activity는 히스토리 스택에 저장된다. 
 *  - NO_HISTORY : 새로운 Activity를 히스토리 스택에 남기지 않는다.
 *  			호출하는 Activity는 히스토리 스택에 저장되고 호출되는 Activity는 히스토리 스택에 저장되지 않는다.
 *  - CLEAR_TOP : 기존의 히스토리 스택에 새로 생성할 Activity가 있다면 그 위 스택의 Activity들을 전부 제거하고 호출한다.
 *    ex) Activity3에서 Activity1을 호출 하는 경우
 *        히스토리 스택은 0->1->2->3 에서 0->1로 변경
 * @param {Object} animationType
 *  - 네이티브 액티비티 이동시 애니메이션 효과
 * - DEFAULT
 * - NONE
 * - SLIDE_LEFT
 * - SLIDE_RIGHT
 * - SLIDE_TOP
 * - SLIDE_BOTTOM
 * - ZOOM_IN 
 * - ZOOM_OUT 
 * - FADE 
 * - MODAL_UP 
 * - MODAL_DOWN 
 * - MODAL_LEFT
 * - MODAL_RIGHT
 * 
 * @param {Object} orientation
 *  - 화면 가로, 세로 전환 가능 옵션
 *  - DEFALUT : 기본
 *  - PORT : 세로
 *  - LAND : 가로
 *  - ALL : 가로, 세로 가능
 *  
 * @param {Object} paddingOption
 * - 이동할 Activity의 padding을 설정한다.
 * - animation type 이 "NONE", "MODAL_UP", "MODAL_DOWN", "MODAL_LEFT", 
 * "MODAL_RIGHT", "FADE","ZOOM_IN","ZOOM_OUT","FADE"인 경우에만 유효 하다.
 * 
 */
function WNMoveToWebOnNewAct(url, actionType, animationType, orientation) {
	// 페이지 이동 전에 if(WNCheckFunc('onHidePage')) onHidePage()를 호출한다. 
	if(WNCheckFunc('onHidePage')) onHidePage();
	var urlInfo = getUrlInfo(url); 
	parent.MPVirtual.wnMoveToHtmlPage(url, actionType, animationType, orientation);
}

function WNMoveToHtmlPage(url, param, actionType, animationType, orientation) {
	var _url = (param == '')?url:url + "?" + param; 
	return WNMoveToWebOnNewAct(_url, actionType, animationType, orientation);
}

/**
 * 화면 이동 (To new native activity)
 * 네이티브 액티비티로 이동한다. 
 * @param {Object} className
 *  - 이동할 클래스 아이디
 * @param {Object} param
 *  - 파라메터(키=값&키=값 형식의 파라메터 문자열)
 * @param actionType 화면 이동시 Activity의 히스토리 스택 저장 처리 정의
 *  - NEW_SCR : 새로운 Activity(ViewController)를 생성한다. 
 *  			호출한 Activity는 히스토리 스택에 저장된다. 
 *  - NO_HISTORY : 새로운 Activity를 히스토리 스택에 남기지 않는다.
 *  			호출하는 Activity는 히스토리 스택에 저장되고 호출되는 Activity는 히스토리 스택에 저장되지 않는다.
 *  - CLEAR_TOP : 기존의 히스토리 스택에 새로 생성할 Activity가 있다면 그 위 스택의 Activity들을 전부 제거하고 호출한다.
 *    ex) Activity3에서 Activity1을 호출 하는 경우
 *        히스토리 스택은 0->1->2->3 에서 0->1로 변경
 * @param {Object} animationType
 *  - 네이티브 액티비티 이동시 애니메이션 효과
 * - DEFAULT
 * - NONE
 * - SLIDE_LEFT
 * - SLIDE_RIGHT
 * - SLIDE_TOP
 * - SLIDE_BOTTOM
 * - ZOOM_IN 
 * - ZOOM_OUT 
 * - FADE 
 * - FLIP_LEFT // TODO: 현재 아이폰 가능 / 안드로이드는 추후 개발 필요
 * - FLIP_RIGHT // TODO: 현재 아이폰 가능 / 안드로이드는 추후 개발 필요
 * - CURL_UP // TODO: 현재 아이폰 가능 / 안드로이드는 추후 개발 필요
 * - CURL_DOWN // TODO: 현재 아이폰 가능 / 안드로이드는 추후 개발 필요
 * - MODAL_UP 
 * - MODAL_DOWN 
 *  
 * @param {Object} orientation
 *  - 화면 가로, 세로 전환 가능 옵션
 *  - DEFALUT : 기본
 *  - PORT : 세로
 *  - LAND : 가로
 *  - ALL : 가로, 세로 가능
 */
function WNMoveToNativeAct(className, params, actionType, animationType, orientation) {
	
	if (!params) params = "";
	
	// 페이지 이동 전에 if(WNCheckFunc('onHidePage')) onHidePage()를 호출한다. 
	if(WNCheckFunc('onHidePage')) onHidePage(); 
	parent.MPVirtual.wnMoveToNativePage(className, params, actionType, animationType, orientation);
}

function WNMoveToNativePage(className, params, actionType, animationType, orientation)
{
    return WNMoveToNativeAct(className, params, actionType, animationType, orientation);
}
/**
 * 화면 이동 (To new native web modal activity)
 * 새로운 네이티브 웹 모달 액티비티로 이동한다. 
 * @param {Object} url
 * @param {Object} className
 *  - 이동할 클래스 아이디
 * @param {Object} param
 *  - 파라메터(키=값&키=값 형식의 파라메터 문자열)
 * @param {Object} animationType
 *  - 네이티브 액티비티 이동시 애니메이션 효과
 * - DEFAULT
 * - NONE
 * - SLIDE_LEFT
 * - SLIDE_RIGHT
 * - SLIDE_TOP
 * - SLIDE_BOTTOM
 * - ZOOM_IN 
 * - ZOOM_OUT 
 * - FADE 
 * - FLIP_LEFT // TODO: 현재 아이폰 가능 / 안드로이드는 추후 개발 필요
 * - FLIP_RIGHT // TODO: 현재 아이폰 가능 / 안드로이드는 추후 개발 필요
 * - CURL_UP // TODO: 현재 아이폰 가능 / 안드로이드는 추후 개발 필요
 * - CURL_DOWN // TODO: 현재 아이폰 가능 / 안드로이드는 추후 개발 필요
 * - MODAL_UP 
 * - MODAL_DOWN 
 *  
 * @param {Object} orientation
 *  - 화면 가로, 세로 전환 가능 옵션
 *  - DEFALUT : 기본
 *  - PORT : 세로
 *  - LAND : 가로
 *  - ALL : 가로, 세로 가능
 */
function WNMoveToNativeWebModal(url, className, animationType, orientation) {
	// 페이지 이동 전에 if(WNCheckFunc('onHidePage')) onHidePage()를 호출한다. 
	if(WNCheckFunc('onHidePage')) onHidePage();
	var urlInfo = getUrlInfo(url);
}

/**
 * 화면 이동 (To new native modal activity)
 * 새로운 네이티브 모달 액티비티로 이동한다. 
 * @param {Object} className
 * @param {Object} param
 * @param {Object} animationType
 * @param {Object} orientation
 */
function WNActionMoveToNativeModal(className, param, animationType, orientation){
	// 페이지 이동 전에 if(WNCheckFunc('onHidePage')) onHidePage()를 호출한다. 
	if(WNCheckFunc('onHidePage')) onHidePage();
}

/**
 * 이전 화면으로 이동한다.
 * @param {Object} param 이전 화면에 전달할 파라메터
 * @param {Object} animationType 애니메이션 타입
 * 
 * - DEFAULT
 * - NONE
 * - SLIDE_LEFT
 * - SLIDE_RIGHT
 * - SLIDE_TOP
 * - SLIDE_BOTTOM
 * - ZOOM_IN 
 * - ZOOM_OUT 
 * - FADE 
 * - FLIP_LEFT // TODO: 현재 아이폰 가능 / 안드로이드는 추후 개발 필요
 * - FLIP_RIGHT // TODO: 현재 아이폰 가능 / 안드로이드는 추후 개발 필요
 * - CURL_UP // TODO: 현재 아이폰 가능 / 안드로이드는 추후 개발 필요
 * - CURL_DOWN // TODO: 현재 아이폰 가능 / 안드로이드는 추후 개발 필요
 * - MODAL_UP 
 * - MODAL_DOWN 
 */
function WNHistoryBack(param, animationType) {
	// 페이지 이동 전에 if(WNCheckFunc('onHidePage')) onHidePage()를 호출한다. 
	if(WNCheckFunc('onHidePage')) onHidePage();
	parent.MPVirtual.wnBackPage(param, animationType);
}

function WNBackPage(param, animationType)
{
    return WNHistoryBack(param, animationType);
}

function WNWebHistoryBack(position) {
	if (position)
		history.back(position);
	else
		history.back();
}

function WNDirectCall(phoneNo) { 
	parent.MPVirtual.wnMakeCall(phoneNo);
}

function WNMakeCall(phoneNo){
    return WNDirectCall(phoneNo);
}

/**
 * DatePicker을 호출 한다.
 * CallBsck받을 메소드를 지정해주면 해당 메소드로 Date가 Json형식으로 리턴 된다.
 * 
 * @param {Object} callBackFuncName
 * 
 * @param {Object} type
 * - HM12
 * - HM24
 * - YMD
 * - YM
 * 
 * @param {Object} initDate
 * - HM12   : => HHmm (ex> 2210)
 * - HM24   : => HHmm (ex> 2310)
 * - YMD    : => yyyyMMdd (ex> 20110102) 
 * - YM     : => yyyyMM (ex> 201101)
 * => format이 맞지 않거나, 입력이 없는경우 현재 시간으로 셋팅한다.
 */
function WNRequestDatePicker(callBackFuncName, type, initDate, lowdate, maxdate) {
	//  시작일자와 현재 일자의 조건 처리 
	if( (lowdate != undefined) || (maxdate != undefined) ){
		if((initDate < lowdate) || (initDate > maxdate)){
			alert('init date setting Error');
			return;
		} 
	}
 
	var low_date = "";
	var max_date = "";
	if(type == 'HM12'){
		if(initDate.length != 6){
			alert('init date format Error');
			return;
		}else{
			if(initDate.substring(4, 6) != 'AM' && initDate.substring(4, 6) != 'PM'){
                alert('init date format Error');
                return;
			}
		}
	}else if(type == 'HM24'){
		if(initDate.length != 4){
			alert('init date format Error');
			return;
		}
	}else if(type == 'YMD' || type == 'YM' || type == 'MMYYYY')
    {
        var CHECK_LEN  = 6;
        if(type == 'YMD')
            CHECK_LEN = 8;
        
		if(initDate.length != CHECK_LEN){
			alert('init date format Error');
			return;
		}
		if(lowdate != undefined)
        {
            if((lowdate.length != 0) && (lowdate.length != CHECK_LEN))
            {
                alert('low date format Error');
                return;
            }
            low_date = lowdate;
		}
        
		if(maxdate != undefined)
        {
            if((maxdate.length != 0) && (maxdate.length != CHECK_LEN) )
            {
                alert('max date format Error');
                return;
            }
            max_date = maxdate;
		}
	}else{
		alert('type constant Error');
		return;
	}
	 
	parent.MPVirtual.wnPopupDatePicker(callBackFuncName, type, initDate, low_date, max_date);
}

function WNPopupDatePicker(callBackFuncName, type, initDate, lowdate, maxdate)
{
    return WNRequestDatePicker(callBackFuncName, type, initDate, lowdate, maxdate);
}

/**
 * DatePicker의 response 함수
 * 
 * @param {Object} value
 * - HM12  	: {"HH":"20","mm":"40"}
 * - HM24  	: {"HH":"20","mm":"40"}
 * - YMD   	: {"yyyy":"2010","MM":"01","dd":"01","week":"0"}
 * - YM    	: {"yyyy":"2010","MM":"01"}
 * - MMYYYY	: {"yyyy":"2010","MM":"01"}
 */
function WNResponseDatePicker(callBackFuncName, value) {
	try { 
		eval(callBackFuncName)(value);
	} catch (e) {
		alert(e);
	}
}

/**
 * 사진 Request
 * 
 * @param saveFolder : COMMON일 경우 기본 Library에 저장하고 가져온다.
 * @param callBackFunc
 * @param save_name : 파일이름(확장자 없이) 
 * @returns
 */
function WNTakePhoto(saveFolder, callBackFunc, save_name) {
    var f_save_path;
    if(save_name == undefined || save_name == null){
        f_save_path = '';
    }else{
        f_save_path = save_name;
    } 
	parent.MPVirtual.wnTakePhoto(saveFolder, callBackFunc, save_name);
}

function WNMoveToTakePhoto(title, message, jsonButtonInfo){
	return WNTakePhoto(title, message, jsonButtonInfo);
}

/**
 * 사진찍기 Response
 * 
 * @param callBackFunc
 * -> call back func format xxxxxx((string)resultcode , (json)resultvalue)
 * @param resultCode : SUCCESS, FAIL
 * @param resultValue 
 *  ex) jsons string { "name" : "파일명", "path" : "파일 패스", "savedDate" : "생성 날짜", "size" : "사이즈"}
 * @returns
 */
function WNResponseTakePhoto(callBackFunc, resultCode, resultValue) { 
	eval(callBackFunc)(resultCode, JSON.parse(resultValue));
}
/**
 * 동영상 찍기 Request
 * 
 * @param saveFolder : COMMON일 경우 기본 Library에 저장하고 가져온다.
 * @param callBackFunc
 * @param save_name  : 파일이름(확장자 없이) 
 * @param resultCode : SUCCESS, FAIL
 * @param resultValue : JSON형태로 name,path,savedDate 가 나온다
 * ex)  {"savedDate":"20110906180931429","name":"P20110906180931429.jpg","path":"/var/mobile/Applications/31019A17-3EE5-45F9-9322-AB45D710206D/Documents/tempImage/P20110906180931429.jpg"}
 * @returns
 */
function WNTakeMovie(saveFolder, callBackFunc, save_name) {
    var f_save_path;
    if(save_name == undefined || save_name == null){
        f_save_path = '';
    }else{
        f_save_path = save_name;
    }
	parent.MPVirtual.wnTakeMovie(saveFolder, callBackFunc, save_name); 
}

/**
 * 동영상 녹화 Response
 * 
 * @param callBackFunc
 * @param resultCode : SUCCESS, FAIL
 * @param resultValue : JSON형태로 name,path,savedDate 가 나온다
 * ex)  {"savedDate":"20110906180931429","name":"P20110906180931429.jpg","path":"/var/mobile/Applications/31019A17-3EE5-45F9-9322-AB45D710206D/Documents/tempImage/P20110906180931429.jpg"}
 * @returns
 * @returns
 */
function WNResponseTakeMovie(callBackFunc, resultCode, resultValue) { 
	eval(callBackFunc)(resultCode, JSON.parse(resultValue));
}

/**
 * 공통 사진 가져오기 요청 (네이티브 화면 제공)
 * 단말기의 모든 사진 폴더를 검색 할 수 있다. 
 * 싱글/멀티 선택의 옵션을 지정할 수 있다. 
 * @param choiceDivision 싱글선택, 멀티 선택 구분
 * 		"SINGLE_CHOICE" : 하나의 미디어 파일만 선택할 수 있다.
 * 		"MULTI_CHOICE" : 여러장의 미디어 파일들을 선택할 수 있다. 
 * @param mediaDivision 미디어 구분
 *  - "PHOTO" : 사진
 *  - "MOVIE" : 동영상
 *  - "VOICE" : 녹음  
 * @param callFunction 콜백함수명
 */
function WNGetCommonMediaFiles(choiceDivision, mediaDivision, callFunction) { 
	parent.MPVirtual.wnGetCommonMediaFiles(choiceDivision, mediaDivision, callFunction);
}
/**
 * 사진/동영상 가져오기 response
 * 
 * @param callBackFunc
 * @param resultCode : SUCCESS, FAIL
 * @param resultValue
 */
function WNResponseGetCommonMediaFiles(callBackFunc, resultCode, resultValue) { 
	eval(callBackFunc)(resultCode, JSON.parse(resultValue));
}

/**
 * 비디오를 재생 한다. 
 * @param {Object} video url
 * @param {Object} type "NATIVE" / "WEB"
 */
function WNShowVideo(url, type) { 
	parent.MPVirtual.wnShowVideo(url, type);
}

/**
 * 녹음 하기  Request.
 * @param url : 재생목록 페이지 주소
 * @param path_name : 저장경로 
 * @param save_name : 파일이름(확장자 없이) 
 */
function WNTakeVoice(url, path_name, save_name) {
    var f_save_path;
    if(save_name == undefined || save_name == null){
        f_save_path = '';
    }else{
        f_save_path = save_name;
    } 
	parent.MPVirtual.wnTakeVoice(url, path_name, save_name);
} 

/**
 * 프로그램 초기화 
 */
function WNRequestInitProgram(targetServer) { 
	parent.MPVirtual.wnRequestInitProgram(targetServer);
}

/**
 * Http 파일 전송
 * @param targeturl 전송될 서버 Url
 * @param paramters 파라메터
 * @param jsonFilesInfo 전송할 파일 정보 리스트(JSON)
 * @param willWaitResult 응답 결과를 받을 것인지 여부 (동기 or 비동기식) 
 * 		- true or false
 * @param willUseWebProgress 웹 프로그래스바 사용 여부
 * 		- true or false
 * @param headerParameters http request header에 들어갈 데이터.(형식은 paramters와 동일).
 */
function WNHttpFileUpload(targetUrl, parameters, jsonFilesInfo, willWaitResult, willUseWebProgress, headerParameters) {
    var headerData;
    if (headerParameters == undefined || headerParameters == null)
        headerData = '';
    else
        headerData = headerParameters;
	parent.MPVirtual.wnHttpFileUpload(targetUrl, parameters, JSON.stringify(jsonFilesInfo), (willWaitResult)?"TRUE":"FALSE", (willUseWebProgress)?"TRUE":"FALSE", headerParameters);
}
function WNFtpFileUpload(connectionInfo, jsonFilesInfo, willWaitResult) { 
	parent.MPVirtual.wnFtpFileUpload(JSON.stringify(connectionInfo), JSON.stringify(jsonFilesInfo), (willWaitResult)?"TRUE":"FALSE");
}

/**
 * 인스턴스 메시지 팝업 보이기
 * @param message 메시지
 * @param showtime 표시 길이
 * - SHORT  : 2 second
 * - LONG  : 3.5 second
 */
function WNShowInstanceMessage(message, showtime) { 
	parent.MPVirtual.wnShowInstanceMessage(message, showtime);
}

/**
 * 내장된 Web Browser 를 호출한다.
 * 
 * @param url
 */
function WNInternalWebBrowserCall(url, encoding) { 
	parent.MPVirtual.wnOpenWebBrowser(url, encoding);
}

function WNOpenWebBrowser(url, encoding) {
    return WNInternalWebBrowserCall(url, encoding);
}

/**
 * 확인 팝업 윈도우
 * @param title 타이틀
 * @param message 메시지
 * @param jsonButtonInfo 버튼정보(JSON)
 */
function WNConfirmPopup(title, message, jsonButtonInfo) { 
	parent.MPVirtual.wnPopupConfirm(title, message, jsonButtonInfo);
}

function WNPopupConfirm(title, message, jsonButtonInfo) {
    return WNConfirmPopup(title, message, jsonButtonInfo);
}

/**
 * 일반 싱글 선택 리스트 팝업 요청
 * @param title 타이틀
 * @param listInfo 리스트(JSON)
 * @param callBackFuncName 콜백함수명
 */
function WNNormalChoiceListPopup(title, listInfo, callBackFuncName) { 
	parent.MPVirtual.wnPopupNormalChoice(title, JSON.stringify(listInfo), callBackFuncName) ;
}

function WNPopupNormalChoice(title, listInfo, callBackFuncName){
    return WNNormalChoiceListPopup(title, listInfo, callBackFuncName);
}

/**
 * 일반 싱글 선택 리스트 팝업 응답
 * @param jsonSelectedListInfo 선택된 리스트(JSON)
 * @param callBackFuncName 콜백함수명
 */
function WNCBNormalChoiceListPopup(jsonSelectedListInfo, callBackFuncName) {
	try { 
		eval(callBackFuncName)(JSON.parse(jsonSelectedListInfo));
	} catch (e)  {
		alert(e);
	}
}

/**
 * 일반 싱글 선택 리스트 팝업 요청
 * @param title 타이틀
 * @param listInfo 리스트 정보(JSON)
 * @param buttonInfo 버튼 정보(JSON)
 * @param callBackFuncName 콜백함수명
 */
function WNSingleChoicePopup(title, listInfo, buttonInfo) { 
	parent.MPVirtual.wnPopupSingleChoice(title, JSON.stringify(listInfo), buttonInfo);
}

function WNPopupSingleChoice(title, listInfo, buttonInfo) {
    return WNSingleChoicePopup(title, listInfo, buttonInfo);
}

/**
 * 일반 싱글 선택 리스트 팝업 응답
 * @param jsonSelectedListInfo 선택된 리스트(JSON)
 * @param callBackFuncName 콜백함수명
 */
function WNCBSingleChoicePopup(jsonSelectedListInfo, callBackFuncName) {
	try { 
		eval(callBackFuncName)(JSON.parse(jsonSelectedListInfo));
	} catch (e)  {
		alert(e);
	}
}

/**
 * 다중 선택 리스트 팝업 요청
 * @param title 타이틀
 * @param listInfo 리스트 정보(JSON)
 * @param buttonInfo 버튼 정보(JSON)
 */
function WNMultiChoicePopup(title, listInfo, buttonInfo) { 
	parent.MPVirtual.wnPopupMultiChoice(title, JSON.stringify(listInfo), buttonInfo);
}

function WNPopupMultiChoice(title, listInfo, buttonInfo) {
    return WNMultiChoicePopup(title, listInfo, buttonInfo);
}

/**
 * 다중 선택 리스트 팝업 응답
 * @param jsonSelectedListInfo 선택된 리스트(JSON)
 * @param callBackFuncName 콜백함수명
 */
function WNCBMultiChoicePopup(jsonSelectedListInfo, callBackFuncName) {
	try { 
		eval(callBackFuncName)(JSON.parse(jsonSelectedListInfo));
	} catch (e)  {
		alert(e);
	}
}

/**
 * 미디어 파일 가져오기 요청(특정 폴더)  
 * 사용자 정의 폴더의 미디어 파일들을 검색할 수 있다.
 * 미디어 폴더의 기본 저장소는 아래와 같다. 
 * - 사진 : "/photos"
 *  - 동영상 : "/videos"
 *  - 녹음파일 : "/voices"  
 * @param folderPath 폴더 경로
 * "/2011가1345" : 특정 폴더의 경우 (실제 저장 위치 예제 : 아이폰 - "/photos/" or 안드로이드(외장) - "/mnt/sdcard/Android/com.heungkuk.mobile/photos" ) 
 * @param mediaDivision 미디어 구분
 *  - "PHOTO" : 사진
 *  - "VIDEO" : 동영상
 *  - "VOICE" : 녹음 
 * @param callFunction 콜백함수명
 */
function WNGetMediaFilesInfo(folderPath, mediaDivision, callFunction) { 
	parent.MPVirtual.wnGetMediaFilesInfo(folderPath, mediaDivision, callFunction);
}

/**
 * 미디어 파일 가져오기 요청(특정 폴더) 응답
 * 미디어 파일 가져오기 응답 함수
 * @param resultValue 사진 리스트(JSON) 
 */
function WNCBGetMediaFilesInfo(callFunction, resultCode, resultValue) {
	try { 
		eval(callFunction)(resultCode, JSON.parse(resultValue));
	} catch (e)  {
		alert(e);
	}
}

/**
 * 미디어 폴더 정보 요청 
 * 미디어 폴더의 기본 저장소는 아래와 같다. 
 * - 사진 : "/photos"
 *  - 동영상 : "/videos"
 *  - 녹음파일 : "/voices" 
 * 사용자 정의 미디어 폴더 정보를 가져 올 수 있다. 
 * @param folderPath 저장폴더 (실제 저장 위치 예제 : 아이폰 - "/photos/" or 안드로이드(외장) - "/mnt/sdcard/Android/com.heungkuk.mobile/photos" ) 
 * @param mediaDivision 미디어 구분
 *  - "PHOTO" : 사진
 *  - "VIDEO" : 동영상
 *  - "VOICE" : 녹음
 * @param callFunction 콜백함수명
 */
function WNGetMediaFolderInfo(folderPath, mediaDivision, callFunction) {
	parent.MPVirtual.wnGetMediaFolderInfo(folderPath, mediaDivision, callFunction);
}
/**
 * 미디어 폴더 정보 응답 함수
 * @param resultValue 사진 리스트(JSON) 
 */
function WNCBGetMediaFolderInfo(callFunction, resultValue){
	try {
		eval(callFunction)(JSON.parse(resultValue));
	} catch (e)  {
		alert(e);
	}
}

/**
 * 미디어 폴더/파일 제거 요청
 * 미디어 폴더의 기본 저장소는 아래와 같다. 
 * - 사진 : "/photos"
 *  - 동영상 : "/videos"
 *  - 녹음파일 : "/voices"  
 * @param removepath 저장 폴더 또는 파일 (실제 저장 위치 예제 : 아이폰 - "/photos/" or 안드로이드(외장) - "/mnt/sdcard/Android/com.heungkuk.mobile/photos" ) 
 * @param mediaDivision 미디어 구분
 *  - "PHOTO" : 사진
 *  - "VIDEO" : 동영상
 *  - "VOICE" : 녹음
 * @param callFunction 콜백함수명
 */
function WNRemoveMediaFiles(removepath, mediaDivision, callFunction) {
	parent.MPVirtual.wnRemoveMediaFilesInfo(JSON.stringify(removepath), mediaDivision, callFunction);
}

/**
 * 미디어 폴더/파일 제거 응답 함수
 * @param {Object} resultCode 응답 결과
 */
function WNCBRemoveMediaFiles(callFunction, resultCode) {
	try { 
		eval(callFunction)(resultCode);
	} catch (e)  {
		alert(e);
	}
}


/**
 * 메일을 전송한다.
 *
 * @param recipientsInfo JSON(array) 수신자 주소
 * => format
 {
    "to":[toRecipient(string) array(수신)],
    "cc":[ccRecipient(string) array(참조)],
    "bcc":[bccRecipient(string) array(숨은참조)]
 };
 * @param subject  제목
 * @param contents 내용
 */
function WNMailTo(recipientsInfo, subject, contents) {
	parent.MPVirtual.wnSendMail(JSON.stringify(recipientsInfo), subject, contents);
}

function WNSendMail(recipientsInfo, subject, contents)
{
    return WNMailTo(recipientsInfo, subject, contents);
}

/**
 * Google Map을 연동한다.
 * 
 * @param query (NOTICE: 쿼리 자체는 인코딩이 필요한 부분에서 정확히 해서 보내야함.)
 * - 주소 검색 : q=주소(ex> "q="+ encodeURIComponent("서울시 강동구 상일동 298-1");)
 * - 좌표 검색 : ll=위도,경도(ex> "ll="+encodeURIComponent("37.566535,126.977969");)
 * 
 * 자세한 쿼리 작성 요령은 밑을 참고 한다.
 * @see http://developer.apple.com/library/ios/#featuredarticles/iPhoneURLScheme_Reference/Articles/MapLinks.html
 * @see http://mapki.com/wiki/Google_Map_Parameters
 */
function WNConnetToMap(query){
	parent.MPVirtual.wnConnetToMap(query);
}

/**
 * SMS를 전송 한다.
 *
 * @param phoneNumbers : 수신번호 JSON object
 *  ex> {"phoneNumbers":[수신번호 string array]}
 * @param message : 내용
 */
function WNSendSms(phoneNumbers, message){
	parent.MPVirtual.wnSendSms(phoneNumbers, message)
}

/**
 * app store/ android market을 링크 한다.
 * 
 * @param appId (iOS 경우) 어플 아이디 (Android는 어플의 패키지명)
 */
function WNConnetToAppStore(appId) {
	parent.MPVirtual.wnOpenAppStore(appId);
}

function WNOpenAppStore(appId){
    return  WNConnetToAppStore(appId);
}

/**
 * 다른 어플을 구동 시킨다.
 * 
 * @param scheme ios/android 에서 다른 어플을 구동하는 scheme
 *        ex> ios : myapp://
 * @param param  parameter로 넘길 data(JSON string)
 *        ex> {"foo":"aaaaa" , "voo":"부"}
 *        
 * NOTICE: ios 경우 myapp://?foo=aaaaa&voo=%EB%B6%80 형식으로 호출된다.
 * 
 * @return 성공 여부
 */
function WNExcuteOtherApp(scheme , param) {
	if (param == undefined || param == null) {
		param = "";
	}
	parent.MPVirtual.wnOpenOtherApp(scheme, param);
}

function WNOpenOtherApp(scheme , param){
    return WNExcuteOtherApp(scheme , param);
}
/**
 * PUSH 서비스 이용을 위한 등록 처리를 한다.
 * @param account PUSH 계정(Android)
 * @callback CBRegisterPushNotification(code(SUCCESS / FAIL), token);
 */
function WNRegisterPushNotification(account){
	parent.MPVirtual.wnSetPushService(true, account);
}

/**
 * PUSH 서비스 이용을 위한 해지 처리를 한다.
 * 
 * @callback CBUnRegisterPushNotification(code(SUCCESS / FAIL));
 * 
 */
function WNUnRegisterPushNotification() {
	parent.MPVirtual.wnSetUnPushService(false);
}

/**
 * 가상 키보드를 보여준다.
 */
function WNShowKeyboard() {
	parent.MPVirtual.wnShowKeyboard();
}



//연락처기능 미완성

/**
 * 연락처 검색  Request.
 * @param name : 검색명 
 */
function WNAddressBookList(name) {
	return parent.MPVirtual.wnAddressBookList(name);
}

/**
 * 연락처 수정하기  Request.
 * @param recordId : 연락처 고유번호
 * @param contacts : 수정항목들 
 */
function WNAddressBookEdit(recordId,contacts) {
	return parent.MPVirtual.wnAddressBookEdit(recordId, JSON.stringify(contacts));
}
/**
 * 연락처 삭제 Request.
 * @param recordId : 연락처 고유번호
 */
function WNAddressBookDelete(recordId) {
	return parent.MPVirtual.wnAddressBookDelete(recordId);
}

/**
 * Request device's hacking-state.
 * @param : none
 * 
 * @return : bool yes/no
 * @see : http://demo.initech.com/index.php?document_srl=11005
 */
function WNCheckHacking() { 
	return Boolean(parent.MPVirtual.wnCheckHacking());
}


/**
 * file IO API 
 * file 및 directory 생성 API
 * @param name file 및 directory full_fathname
 * @param option FILE/DIR 구분자
 */
function WNFileIoCreate(input_data) {
	if(input_data.name == undefined
		|| input_data.option == undefined){
		var return_obj = new Object();
		return_obj.status = "FILEIO INPUT PARAM ERROR";
		return return_obj;
	} 
	return JSON.parse(parent.MPVirtual.wnFileIoCreate(JSON.stringify(input_data)));
}

/**
 * file IO API 
 * file 및 directory 삭제 API
 * @param name file 및 directory full_fathname
 * @param option FILE/DIR 구분자
 */
function WNFileIoDelete(input_data) {
	if(input_data.name == undefined
		|| input_data.option == undefined){
		var return_obj = new Object();
		return_obj.status = "FILEIO INPUT PARAM ERROR";
		return return_obj;
	} 
	return JSON.parse(parent.MPVirtual.wnFileIoDelete(JSON.stringify(input_data)));
}


/**
 * file IO API 
 * file Read API
 * @param name file 및 directory full_fathname
 * @param pos 포지션
 * @param bytes_len Read 할 길이, bytes_len 이  "0"일경우 full_read
 */
function WNFileIoRead(input_data) {
	if(input_data.name == undefined
		|| input_data.encode == undefined
		|| input_data.cb_func == undefined){
		var return_obj = new Object();
		return_obj.status = "FILEIO INPUT PARAM ERROR";
		return return_obj;
	} 
	parent.MPVirtual.wnFileIoRead(JSON.stringify(input_data));
}

/**
 * file IO API 
 * file Read API
 * @param name file 및 directory full_fathname
 * @param pos 포지션
 * @param bytes_array_content Write 할  컨텐츠
 * @param write_bytes_len Write 할 길이
 */

function WNFileIoWrite(input_data) {
	if(input_data.name == undefined
		|| input_data.encode == undefined
		|| input_data.data == undefined){
		var return_obj = new Object();
		return_obj.status = "FILEIO INPUT PARAM ERROR";
		return return_obj;
	} 
	return JSON.parse(parent.MPVirtual.wnFileIoWrite(JSON.stringify(input_data)));
}

/**
 * file IO API 
 * file Copy API
 * @param source_file file 및 directory full_fath
 * @param destination_file 및 directory full_fath 
 * @param overwrite 덮어쓰기 Option "YES/NO", NO 일경우  기존파일이 있으면 FAIL Return.
 * @param option FILE/DIR 구분자
 */
function WNFileIoCopy(input_data) {
	if(input_data.source == undefined
		|| input_data.destination == undefined
		|| input_data.overwrite == undefined
		|| input_data.option == undefined){
		var return_obj = new Object();
		return_obj.status = "FILEIO INPUT PARAM ERROR";
		return return_obj;
	} 
	return JSON.parse(parent.MPVirtual.wnFileIoCopy(JSON.stringify(input_data)));
}

/**
 * file IO API 
 * file Move API
 * @param source_file file 및 directory full_fath
 * @param destination_file 및 directory full_fath 
 * @param overwrite 덮어쓰기 Option "YES/NO", NO 일경우  기존파일이 있으면 FAIL Return.
 * @param option FILE/DIR 구분자
 */
function WNFileIoMove(input_data) {
	if(input_data.source == undefined
		|| input_data.destination == undefined
		|| input_data.overwrite == undefined
		|| input_data.option == undefined){
		var return_obj = new Object();
		return_obj.status = "FILEIO INPUT PARAM ERROR";
		return return_obj;
	} 
	return JSON.parse(parent.MPVirtual.wnFileIoMove(JSON.stringify(input_data)));
}

/**
 * file IO API 
 * file Info API
 * @param name file 및 directory full_fathname
 * @param option FILE/DIR 구분자
 */
function WNFileIoInfo(input_data) {
	if(input_data.name == undefined
		|| input_data.option == undefined){
		var return_obj = new Object();
		return_obj.status = "FILEIO INPUT PARAM ERROR";
		return return_obj;
	} 
	return JSON.parse(parent.MPVirtual.wnFileIoInfo( JSON.stringify(input_data)));
}

/**
 * file IO API 
 * file List API
 * @param name file 및 directory full_fathname
 * @param option FILE/DIR 구분자
 */
function WNFileIoList(input_data) {
	if(input_data.name == undefined
		|| input_data.option == undefined){
		var return_obj = new Object();
		return_obj.status = "FILEIO INPUT PARAM ERROR";
		return return_obj;
	} 
	return JSON.parse(parent.MPVirtual.wnFileIoList(JSON.stringify(input_data)));
}

/**
 * FILE IIO 응답 함수
 * @param {Object} resultCode 응답 결과
 */

function WNCBFileIo(callFunction, jsonObj, resultString) {
	try { 
		parent.MPVirtual.wnCBFileIo();   
	} catch (e)  {
		alert(e);
	}
}


/**
 * Local DataBase API 
 * Create API
 * @param db_name 생성할 DB 파일 name
 */
function WNLocalDbCreate(db_name, cb_func) {
	parent.MPVirtual.wnLocalDbCreate(db_name, cb_func);
}

/**
 * Local DataBase API 
 * Delete API
 * @param db_name 삭제 할  DB 파일 name
 */
function WNLocalDbDelete(db_name, cb_func) {
	return parent.MPVirtual.wnLocalDbDelete(db_name, cb_func);
}

/**
 * Local DataBase API 
 * Db Open API
 * @param db_name Open 할 DB 파일 name
 */
function WNLocalDbOpen(db_name, cb_func) {
	return parent.MPVirtual.wnLocalDbOpen(db_name, cb_func);
}

/**
 * Local DataBase API 
 * Db Close API
 * @param db_name Close 할 DB 파일 name
 */
function WNLocalDbClose(db_name, cb_func) {
	return parent.MPVirtual.wnLocalDbClose(db_name, cb_func);
}

/**
 * Local ExecuteSql API 
 * ExecuteSql API
 * @param input_data 객체
 */
function WNLocalDbExecuteSql(input_data, cb_func) { 
	parent.MPVirtual.wnLocalDbExecuteSql(JSON.stringify(input_data), cb_func);
}

/**
 * Update resource files
 * @param targetServerName 타겟 서버 이름
 * @param mode 개발, 운영모드 
 * 			"DEV" : 개발모드
 * 			"REAL" : 운영모드
 */
function WNUpdateResourceFiles(targetServerName, mode) { 
	parent.MPVirtual.wnHttpUpdateResources(targetServerName, mode);
}

function WNHttpUpdateResources(targetServerName, mode) {
    return WNUpdateResourceFiles(targetServerName, mode);
}

/**
 * 암호화 된 html, js 파일을 복구하여 inport 시킴
 * @param targetPath 타겟파일 Path
 */
function WNImportEncryptedJS(targetPath){
	parent.MPVirtual.wnImportEncryptedJS();
}

/**
 * 암호화 된  파일을 복구하여 String 형태로 return함.
 * @param targetPath 타겟파일 Path
 */
function WNGetEncryptedFileString(targetPath){ 
	return parent.MPVirtual.wnGetEncryptedFile(targetPath);
}

function WNGetEncryptedFile(targetPath) {
    return WNGetEncryptedFileString(targetPath);
}

/**
 * Ftp의 파일을 다운로드.
 * @param connectionInfo 접속할 서버 정보.
 * @param jsonObject     다운로드할 파일 정보 리스트(JSON)
 * @param willWaitResult 응답 결과를 받을 것인지 여부 (동기 or 비동기식) 
 * 		- true or false	
 */
function WNFtpFileDownload(connectionInfo, jsonObject, willWaitResult) { 
	parent.MPVirtual.wnFtpFileDownload();
}

/**
 * Ftp 폴더 안의 목록을 다운로드.
 * @param connectionInfo 접속할 서버 정보.
 * @param jsonObject     다운로드할 서버 폴더 정보(JSON)
 * @param willWaitResult 응답 결과를 받을 것인지 여부 (동기 or 비동기식) 
 * 		- true or false	
 */
function WNFtpListDownload(connectionInfo, jsonObject, willWaitResult) { 
	parent.MPVirtual.wnFtpListDownload();
}
/** 
 * APP이 사용중인 메모리/총메모리/남은 메모리 용량을 kilo byte단위로 출력함. 
 * * { "mem_total" : "xxxx" , * "mem_used" : "xxxx" , * "mem_free : xxxx }
 * 
*/
function WNMemoryInfo() { 
	return JSON.parse(parent.MPVirtual.wnGetMemoryInfo());
}

function WNGetMemoryInfo(){
    return WNMemoryInfo();
}

/** 
 * 모피어스의 라이브러리 버젼 및 build 연월일을 출력함. 
 * * {"release_version" : "1.1.4.1" , "release_date : "2012.03.12"}
 * 
*/
function WNMorpheusInfo() { 
	return parent.MPVirtual.wnGetMorpheusInfo();
}

function WNGetMorpheusInfo(){
    return WNMorpheusInfo();
}
 
/*
    파라미터 : 없음
    리턴값 : ON/OFF/NONE/NS
      -> ON : flash On 상태
      -> OFF : flash Off 상태
      -> NONE : flash 상태 알수 없음.
      -> NS : 장치에서 지원 않함.
*/
function WNGetFlashState() { 
	return parent.MPVirtual.wnGetFlashState();
}

/*
    파라미터   : state : ON/OFF/AUTO
    리턴값     : SUCCESS/ERROR or Error의 원인
*/
function WNControlFlash( onoff ) { 
	parent.MPVirtual.wnControlFlash();
}

/*
    파라미터 : 없음.
    리턴값(CB) : json object
           - status : SUCCESS / CANCEL / ERROR or ERROR의 원인
           - result : QR Code String
*/
function WNTakeQRCode(returnCB, option) { 
	return parent.MPVirtual.wnTakeQRCode(returnCB, option);
}
 

/**
 * Zip API
 * file 정보들을 받아 압축한다.
 * 
 * @param {String} zipFile   생성할 zip file path
 * @param {Array}  fileInfos fileInfos 압축할 파일들 ["path1", "path2",...]
 * @param {String} cbfunc    callback function name
 *        - function cbfunctionName({Object}result);
 * @param {Object} zipOption zip option 
 *  => {"compLevel":"default", "password":"password", "indicator":"true", "indicatorMsg":"파일 압축중입니다."}
 *        - compLevel    : [default], [best], [fastest] // 대소문자 구분 없음 (default value : default)
 *        - password     : 넣지 않거나 공백일경우 암호처리 제외함.
 *        - indicator    : [true] / [false] 인디케이터를 보여줄지 말지 여부 판단.(default value : true)
 *        - indicatorMsg : 인디케이터 메세지. 없으면 Default 메세지를 출력함. 
 */
function WNZip(zipFile, fileInfos, cbfunc, zipOption) { 
	parent.MPVirtual.wnZip(zipFile, fileInfos, cbfunc, zipOption);
}

/**
 * Unzip API
 * zip파일을 Unzip 한다.
 * 
 * @param {String} zipFile zip file path
 * @param {String} destination destination path
 * @param {String} cbfunc    callback function name
 *        - function xxxxxxx({Object}result);
 * @param {Object} unzipOption {"overwrite":"true", "password":"password.","indicator":"true", "indicatorMsg":"파일 압축해제 중입니다."};
 *        - overwrite 	 : [true] / [false] 파일이 존재할시 덮어쓸것인지 flag(default value : false)
 *        - password     : 넣지 않거나 공백일경우 암호처리 제외함.
 *        - indicator    : [true] / [false] 인디케이터를 보여줄지 말지 여부(default value : true)
 *        - indicatorMsg : 인디케이터 메세지. 없으면 Default 메세지를 출력함.
 */
function WNUnzip(zipFile, destination, cbfunc, unzipOption) { 
	parent.MPVirtual.wnUnZip(zipFile, destination, cbfunc, unzipOption);
}
 