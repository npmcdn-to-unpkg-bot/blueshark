Events = new Mongo.Collection("events");
var isFBinit = false;

currentUserData = {
  name: null,
  userID: null,
  userAccessToken: null,
  loginStatus: false,
  proPicURL: null
}

var currentUserDep = new Tracker.Dependency();

if (Meteor.isClient) {
  window.fbAsyncInit = function() {
    console.log("fb initializing...");
    FB.init({
      appId : '478980925626054',
      status : true,
      xfbml : true,
      version : 'v2.4'
    });

    isFBinit = true;
    console.log("fb initialized");

    // triggered on fbLogin and fbLogout
    FB.Event.subscribe('auth.authResponseChange', function(response) {
      if (response.status === 'connected') {
        currentUserData.userID = response.authResponse.userID;
        currentUserData.userAccessToken = response.authResponse.accessToken;

        FB.api('/{name}',
            function (response) {
              if (response && !response.error) {

                currentUserData.proPicURL = "https://graph.facebook.com/" + currentUserData.userID + "/picture";
                currentUserData.name = JSON.parse(response[0].body).name;
                
                currentUserDep.changed();
              }
            }
        );

        currentUserData.loginStatus = true;
        currentUserDep.changed();

      }
    });
  };

  Template.login.helpers({
    currentUserName: function() {
      currentUserDep.depend();
      return currentUserData.name;
    },

    // returns src for user profile picture to <img>
    currentUserProPic: function() {
      currentUserDep.depend();
      return currentUserData.proPicURL;
    }
  });

  Template.hello.events({
    "submit .new-event": function (event) {
      // Prevent default browser form submit
      event.preventDefault();
 
      // Get value from form element
      var fbEventLink = event.target.link.value;
      var recommendedPrice = event.target.price.value;
      var cashName = event.target.cashtag.value;

      // Events.insert({
      //   recommendedPrice: recommendedPrice,
      //   cashName: cashName
      // })

      var urlSplit = fbEventLink.split("/");
      var eventId = urlSplit[4];
      console.log(eventId);
 
      // Clear form
      // event.target.fb-event-link.value = "";
      // event.target.recommended-price.value = "";
      // event.target.cash-name.value = "";
    }
  });

  Template.login.events({
    'click .login-button': function (e) {
      e.preventDefault();
      Meteor.call('fbLogin');
    },

    'click .logout-button': function (e) {
      e.preventDefault();
      Meteor.call('fbLogout');
    }
  });

  // Routing
  Router.route('/', function () {
    this.render('hello');
  });

  Router.route('/events/:_id', function () {
    this.layout('event', {
      data: function () {
        return Events.findOne({_id: this.params._id});
      }
    });
  });

  // FB pull
  window.fbAsyncInit = function() {
    console.log("Fb initi");
    FB.init({
      appId : '478980925626054',
      status : true,
      xfbml : true,
      version : 'v2.4'
    });
    isFBinit = true;


    FB.api(
      "/{event-id}/attending",
      function (response) {
        if (response && !response.error) {
          /* handle the result */
          console.log("ok");
        }
      }
    );
  };
 
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup

  });
}

Meteor.methods({
  // fbLogin: function() {
  //   console.log('test');
  // }

  fbLogin: function() {
    if (isFBinit){
      FB.login();
    }
  },

  fbLogout: function() {
    if (isFBinit){

      FB.logout();
      currentUserData.loginStatus = false;
      currentUserDep.changed();
      console.log('logged out');
    }
  }

});