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
var host = "https://slite.ukiuni.com"
var app = {
	// Application Constructor
	initialize : function() {
		this.bindEvents();
	},
	// Bind Event Listeners
	//
	// Bind any events that are required on startup. Common events are:
	// 'load', 'deviceready', 'offline', and 'online'.
	bindEvents : function() {
		document.addEventListener('deviceready', this.onDeviceReady, false);
	},
	// deviceready Event Handler
	//
	// The scope of 'this' is the event. In order to call the 'receivedEvent'
	// function, we must explicitly call 'app.receivedEvent(...);'
	onDeviceReady : function() {
		var pushNotification = window.plugins.pushNotification;
		// Android 通知の登録が成功した場合
		var successHandler = function successHandler(result) {
			console.log("result ------------ " + result);
			$.post(host + "/api/accounts/devices", {
				sessionKey : "g10kP46kWb9QGCAo3sps-2BsSR35Fxl6rMgEVRVmUPlLYmSAARnYoBYM_Zix5Ruo",
				platform : 1,
				endpoint : result
			})
		};
		// iOS 通知の登録が成功した場合
		function tokenHandler(result) {
			alert('device token = ' + result);
		}
		// 通知の登録が失敗した場合
		var errorHandler = function(error) {
			$("#app-status-ul").append('<li>error = ' + error + '</li>');
		};
		$("#app-status-ul").append('<li>registering ' + device.platform + '</li>');
		if (device.platform == 'android' || device.platform == 'Android' || device.platform == "amazon-fireos") {
			pushNotification.register(successHandler, errorHandler, {
				// ここをSender ID(プロジェクト番号)に変更
				"senderID" : "913587589937",
				"ecb" : "onNotification"
			});
		} else {
			pushNotification.register(tokenHandler, errorHandler, {
				"badge" : "true",
				"sound" : "true",
				"alert" : "true",
				"ecb" : "onNotificationAPN" // iOSは試せないので一旦保留
			});
		}
	}
};
function onNotification(e) {
	$("#app-status-ul").append('<li>EVENT -> RECEIVED:' + e.event + '</li>');
	switch (e.event) {
	case 'registered':
		if (e.regid.length > 0) {
			$("#app-status-ul").append('<li>REGISTERED -> REGID:' + e.regid + "</li>");
			// Your GCM push server needs to know the regID before it can push
			// to this device
			// here is where you might want to send it the regID for later use.
			console.log("regID = " + e.regid);
		}
		break;
	case 'message':
		cordova.plugins.notification.local.schedule({
			id : 1,
			title : "Message Title",
			message : "Message Text",
			at : new Date(),
			icon : "http://domain.com/icon.png"
		});
		break;
	case 'error':
		$("#app-status-ul").append('<li>ERROR -> MSG:' + e.msg + '</li>');
		break;
	default:
		$("#app-status-ul").append('<li>EVENT -> Unknown, an event was received and we do not know what it is</li>');
		break;
	}
}
// iOSの通知
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
app.initialize();
