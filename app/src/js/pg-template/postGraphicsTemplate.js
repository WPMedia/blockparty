var iframe = require('./iframe.js');
var twitterFollowButtonModules = require('./twitter-follow.js');
var pbHeaderModule = require('./pbHeader.js');
var pbSocialTools = require('./pbSocialTools.js');

//Adds the return url to the subscribe action
var setupSubscribeBtn = function(){
	var $subscribe = $('#nav-subscribe'),
		href =  $subscribe.attr('href'),
		pageLocation = window.encodeURI(window.location.href);
	 $subscribe.attr('href', href + pageLocation);
};
//Drop in your init file
setupSubscribeBtn();
