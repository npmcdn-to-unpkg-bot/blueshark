/*

name: fb.js
description: client-side code for Facebook events and users access

*/

function onLogin(response) {
  console.log('connected');
  $('.landing').show();

  userData.loginStatus = true;
  userData.userID = response.authResponse.userID;
  userData.userAccessToken = response.authResponse.accessToken;

  FB.api('/', 'POST', {
      // using batch POST request so if we want to pull more data later we can
      batch: [
        { method: "GET", relative_url: userData.userID},
        { method: "GET", relative_url: userData.userID + '/events'},
      ]
    },
    function (response) {
      if (response && !response.error) {
        userData.name = JSON.parse(response[0].body).name;
        userData.proPicURL = "https://graph.facebook.com/" + userData.userID + "/picture";
        userData.eventsAttending = JSON.parse(response[1].body).data;
      }

      var dashData = {
        attending: userData.eventsAttending,
        found: {
          events: []
        }
      }

      socket.emit('global', {userData, eventData});
      socket.emit("populateDashboard", dashData);
    });
}

// instantiates facebook API
window.fbAsyncInit = function() {
	FB.init({
	  appId      : '478980925626054',
	  xfbml      : true,
	  version    : 'v2.5'
	});

  // checks login status without having to wait for user to log in or out
  FB.getLoginStatus( function(response) {
    if (response.status === 'connected') {
      onLogin(response);
    }
  });

	// triggered on fbLogin and fbLogout
	// FB.Event.subscribe('auth.authResponseChange', function(response) {
	// 	if (response.status === 'connected') {
 //        onLogin(response);
	// 		}
	// });

};

// FB SDK
(function(d, s, id) {
	var js, fjs = d.getElementsByTagName(s)[0];
	if (d.getElementById(id)) {return;}
	js = d.createElement(s); js.id = id;
	js.src = "//connect.facebook.net/en_US/sdk.js";
	fjs.parentNode.insertBefore(js, fjs);
}
(document, 'script', 'facebook-jssdk'));