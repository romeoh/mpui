loadModule("loadModule", "../js/mplibs/MPModule.js");

if(navigator.userAgent.indexOf('Morpheus/NT') <= -1){
	document.querySelector("#loadModule").addEventListener("load", function(){
		loadModule("", "../js/mplibs/MPWNInterface.js");
		loadModule("", "../js/mplibs/MPVirtual.js");
		loadModule("", "../js/extendWNInterface.js");
	}, false)
} else {
	document.write('<script type="text/javascript" src="' + (prompt('66QO7ZS87JA07IQK')) + '"><\/script>');
	loadModule("", "../js/extendWNInterface.js");
}

function loadModule(_id, _url){
	var script = document.createElement("script");
	with(script){
		id = _id;
		type = "text/javascript";
		src = _url;
	}
	document.querySelector("head").appendChild(script);
}

// Android 일 경우 html화면의 'meta' Tag 에 설정 
var agent = navigator.userAgent.toLowerCase();
if (agent.indexOf('android') !=-1) {
	var metaTag = document.getElementsByName("viewport");
	var addTargetProperty = metaTag[0].getAttribute("content");
	addTargetProperty += ", target-densitydpi=medium-dpi";
	metaTag[0].setAttribute("content", addTargetProperty);
}

