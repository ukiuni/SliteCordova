/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var host = "https://slite.ukiuni.com";
var registedCompleteHandlers = [];
var STORAGE_KEY_PUSH_REGISTED = "STORAGE_KEY_PUSH_REGISTED";
$(function() {
	var iframe = document.getElementById("contentView");
	window.addEventListener('message', function(event) {
		var data = JSON.parse(event.data);
		if ("registPush" == data.action) {
			registPush(function(result) {
				iframe.contentWindow.postMessage(JSON.stringify({
					action : "registPushResult",
					result : "success",
					regid : result.regid
				}), host);
			}, function(error) {
				iframe.contentWindow.postMessage(JSON.stringify({
					action : "registPushResult",
					result : "fail",
					error : error
				}), host);
			});
		} else if ("unRegistPush" == data.action) {
			localStorage.removeItem(STORAGE_KEY_PUSH_REGISTED);
		} else if ("save" == data.action) {
			localStorage.setItem(data.key, data.value);
			iframe.contentWindow.postMessage(JSON.stringify({
				action : "saveResponse",
				result : data.value,
			}), host);
		} else if ("load" == data.action) {
			iframe.contentWindow.postMessage(JSON.stringify({
				action : "loadResponse",
				value : localStorage.getItem(data.key),
				key : data.key
			}), host);
		}
	});
})
var registPush = function(onSuccess, onFail) {
	var pushNotification = window.plugins.pushNotification;
	var successHandler = function successHandler(result) {
		if (onSuccess) {
			registedCompleteHandlers.push({
				onSuccess : onSuccess,
				onFail : onFail
			});
		}
	}
	function tokenHandler(result) {
		if (onSuccess) {
			registedCompleteHandlers.push({
				onSuccess : onSuccess,
				onFail : onFail
			});
		}
	}
	var errorHandler = function(error) {
		onFail(error);
	}
	if (device.platform == 'android' || device.platform == 'Android' || device.platform == "amazon-fireos") {
		pushNotification.unregister();
		pushNotification.register(successHandler, errorHandler, {
			"senderID" : "913587589937",
			"ecb" : "onNotification"
		});
	} else {
		pushNotification.register(tokenHandler, errorHandler, {
			"badge" : "true",
			"sound" : "true",
			"alert" : "true",
			"ecb" : "onNotificationAPN"
		});
	}
}
function onNotification(e) {
	if ('registered' == e.event) {
		if (e.regid.length > 0) {
			while (0 != registedCompleteHandlers.length) {
				registedCompleteHandlers.shift().onSuccess(e);
			}
		}
		localStorage.setItem(STORAGE_KEY_PUSH_REGISTED, "true");
	} else if ('message' == e.event) {
		var rizeOpenChannelEvent = function() {
			document.getElementById("contentView").contentWindow.postMessage(JSON.stringify({
				action : "notificationPushed",
				value : e.payload.info
			}), host);
		}
		if (e.foreground) {
			cordova.plugins.notification.local.schedule({
				id : 100,
				title : e.payload.title,
				text : e.payload.message,
				sound : null,
				data : e.payload.info
			});
			cordova.plugins.notification.local.on("click", function(notification) {
				rizeOpenChannelEvent();
			});
		} else {
			rizeOpenChannelEvent();
		}
	} else if ('error' == e.event) {
		while (0 != registedCompleteHandlers.length) {
			registedCompleteHandlers.shift().onFail(e);
		}
	} else {
		alert("recieve - default : " + JSON.stringify(e));
	}
}
function onNotificationAPN(event) {
	if (event.alert) {
		navigator.notification.alert(event.alert);
	}
	if (event.sound) {
		var snd = new Media(event.sound);
		snd.play();
	}
	if (event.badge) {
		pushNotification.setApplicationIconBadgeNumber(successHandler, errorHandler, event.badge);
	}
}
if (localStorage.getItem(STORAGE_KEY_PUSH_REGISTED)) {
	document.addEventListener("deviceready", function() {
		registPush();
	});
}