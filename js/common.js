/**
 * 프로젝트에서 사용하는 common.js 
 */

// WN 인터페이스 라이브러리 import
document.write("<script type=\"text/javascript\" src=\"../js/morpheus.js\"><\/script>");

if(navigator.userAgent.indexOf('Morpheus/NT') <= -1){
	document.write("<script type=\"text/javascript\" src=\"../js/mplibs/MPWNInterface.js\"><\/script>");
}