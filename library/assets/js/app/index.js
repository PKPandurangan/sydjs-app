//	Index
//	=====
//
//	This is the main init script, which configures the application.
//	It should be the last script included.

var $log = function(){for(var a=0;a<arguments.length;a++){console.log(arguments[a])}}

_.extend(app.data, {
	
	versions: {
		build: '1.0.0' // The users current local build version, only really relevant to app store builds
	},
	
	user: {}, // Stores a user key we generate on startup that allows consistant analytics tracking
	
	session: {}, // Session related data (code used etc)
	
	status: {}, // Status data (rsvp's etc)
	
	config: {} // Stores the config settings we get back from every ping request
	
});

_.extend(app, {
	
	/* Performance Conditions */
	
	setPerformanceConditions: function() {
	
		app._performanceConditions = {
			startBackgroundMoving: true
		}
		
		// Non-WebKit browsers, Android devices and any tablets don't get moving background images (just fading)
		if ( !app._device.webkit || app._device.system == 'android' || app._device.tablet ) {
			app._performanceConditions.startBackgroundMoving = false;
		}
	
	},
	
	/* Pinging & Config */
	
	pingServer: function( callback ) {
		
		if ( app._disablePing ) {
			$log( '[pingServer] - Pinging is disabled, aborting.' );
			return;
		}
		
		// DEVELOPMENT: Disable after initial ping so we only hit one request
		if ( config.environment == 'development' ) {
			app._disablePing = true;
		}
		
		$log( '[pingServer] - Pinging...' );
		
		$.ajax({
			url: config.baseURL + '/api/app/ping',
			type: 'get',
			dataType: 'json',
			cache: false,
			success: function(data) {
				
				// Hide any current ping notifications
				app.hidePingNotification();
				
				// We currently have a callback when we start up the app, only in success function right now
				// We probably shouldn't let the user use the app if we don't get a ping response
				if ( callback )
					callback( data.success );
				
				// Check for successful response
				if (data && data.success) {
					
					$log( "[pingServer] - Successfully pinged server." );
					
					// Set config
					if ( data.config ) {
						$log( "[pingServer] - Setting config with:", data.config );
						app.data.config = data.config;
					}
					
					// Check the config
					app.checkConfig();
					
					// Ping server again in 10 seconds
					setTimeout( function() { return app.pingServer() }, 10000 );
					
				} else {
					
					$log( "[pingServer] - Received unexpected ping response, connection may be offline, displaying notification (if not displayed)." );
					
					// Show network notification
					app.showPingNotification('noResponse');
					
					// Ping server again in 5 seconds (hastened)
					setTimeout( function() { return app.pingServer() }, 5000 );
					
				}
			
			},
			error: function() {
			
				$log( "[pingServer] - Failed pinging server, network connection may be offline, displaying notification (if not displayed)." );
				
				// Show network notification
				app.showPingNotification('noResponse');
				
				// Ping server again in 5 seconds (hastened)
				setTimeout( function() { return app.pingServer() }, 5000 );
			
			}
		});
		
	},
	
	checkConfig: function() {
	
		var config = app.data.config;
		
		// Check kill switch
		if ( config.killSwitch ) {
			return app.showPingNotification('killSwitch');
		}
		
		// Check version numbers
		var build = new Version().parse( app.data.versions.build );
			compatibility = new Version().parse( config.versions.compatibility ),
			production = new Version().parse( config.versions.production );
		
		// Check if major build version is behind major compatibility version
		if ( build.major < compatibility.major ) {
			$log("[checkConfig] - Users build major version is behind compatibility major version.");
			return app.showPingNotification('versionIncompatibility');
		}
		
		// Check if major build version is behind major production version
		if ( build.major < production.major ) {
			$log("[checkConfig] - Users build major version is behind production major version.");
			return app.showPingNotification('versionIncompatibility');
		}
	
	},
	
	showPingNotification: function(type) {
	
		var $pingNotice = $('#ping-notice');
		
		var html = false;
		
		switch(type) {
		
			case 'killSwitch':
				html = '<div class="i">&#128340;</div>' +
					'<div class="text">' +
						'<div>Gold Class Butler is currently unavailable.</div>' +
						'<div>Please check back soon!</div>' +
					'</div>';
			break;
			
			case 'versionIncompatibility':
				html = '<div class="i">&#59141;</div>' +
					'<div class="text">' +
						'<div>A new version of Gold Class Butler is now available.</div>' +
						'<div>Please update the app via the ' + ( app._device.system == 'ios' ? 'App Store' : 'Google Play Store' ) + '.</div>' +
					'</div>';
			break;
			
			case 'noResponse':
				html = '<div class="i">&#9888;</div>' +
					'<div class="text">' +
						'<div>Please check your internet connection.</div>' +
					'</div>'
			break;
		
		}
		
		if (!html)
			return;
		
		$pingNotice.find('.box').html(html);
		
		$pingNotice.addClass('show');
		
		$pingNotice.find('.box').css( 'margin-top', -( $pingNotice.find('.box').height() / 2 ) );
	
	},
	
	hidePingNotification: function() {
	
		var $pingNotice = $('#ping-notice');
		
		$pingNotice.removeClass('show');
		
		$pingNotice.find('.box').html('').css( 'margin-top', 0 );
		
	},
	
	disablePing: function() {
	
		app._disablePing = true;
		
		$log( '[pingServer] - Disabled pinging.' );
	
	},
	
	/* User Data */
	
	storeUser: function() {
	
		var userKey = app.generateUser();
	
		localStorage.setItem( 'user_key', userKey );
		
		return userKey;
	
	},
	
	populateUser: function() {
	
		var userKey = localStorage.getItem( 'user_key' );
		
		app.data.user.key = userKey || app.storeUser();
		
		app.setIdentity( app.data.user.key );
		
		$log( "[populateUser] - Set user key as [" + app.data.user.key + "]." );
	
	},
	
	generateUser: function() {
	
		var key = '',
			possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
		
		for( var i = 0; i < 24; i++ ) {
			key += possible.charAt(Math.floor(Math.random() * possible.length));
		}
		
		return key;
	
	},
	
	/* Session Data */
	
	storeSessionInfo: function(data) {
		
		$log( "[storeSessionInfo] - Storing session info into local storage." );
		
		// populate local storage with date and user date
		localStorage.setItem( 'session_date', data.date );
		localStorage.setItem( 'session_user', JSON.stringify( data.user ) );
		
		this.populateSessionInfo(data);
		
	},
	
	populateSessionInfo: function(data) {
		
		$log( "[populateSessionInfo] - Populating session info into app." );
		
		_.extend(this.data.session, _.pick(data, 'date', 'user'));
		
	},
	
	resumeSession: function() {
		
		$log( "[resumeSession] - Resuming session..." );
		
		// Make sure we have a user set
		app.populateUser();
		
		// Check local storage for session data
		$log( "[resumeSession] - Checking local storage..." );
		
		var date = localStorage.getItem( 'session_date' ),
			user = localStorage.getItem( 'session_user' );
		
		// Check for timestamp and valid code
		if ( date && user)
		{
			$log( "[resumeSession] - Existing data found, populating data from local storage..." );
			
			app.populateSessionInfo({
				date: localStorage.getItem( 'session_date' ),
				user: JSON.parse( localStorage.getItem( 'session_user' ) )
			});
			
			$log( "[resumeSession] - Session info was retrieved at [" + moment( parseInt( date ) ).format('h:mm:ss a') + "]..." );
			
			app.getStatus(function() {
				$( '#preloader' ).animate({ opacity: 0 }, 250 );
				app.view('home').show('slide-up');
			});
		}
		// If we don't have any data, just show the start screen (default behaviour)
		else
		{
			$log( "[resumeSession] - No existing data found..." );
			$log( "[resumeSession] - Showing [signin] screen." );
			
			$( '#preloader' ).animate({ opacity: 0 }, 250 );
			app.view('signin').show('slide-up');
		}
		
	},
	
	/* Status Data */
	
	getStatus: function(callback) {
	
		$log( "[getStatus] - Status data doesn't exist, retrieving from server..." );
		
		$.ajax({
			url: config.baseURL + '/api/app/status',
			type: 'post',
			data: {
				user: app.data.session.user.id
			},
			dataType: 'json',
			cache: false,
			success: function(data) {
			
				$log( "[getStatus] - Successfully retrieved status." );
				
				app.data.status = data;
				
				return callback(false);
			
			},
			error: function() {
			
				$log( "[getStatus] - Failed getting status, assuming success anyway." );
				
				return callback(true);
			
			}
		});
	
	},
	
	/* Sign Out */
	
	signOut: function() {
	
		app.data.session = {};
		
		collections.claims.reset();
		collections.cinemas.reset();
		collections.rewardPartnerLocations.reset();
		
		localStorage.clear();
		
		app.view('welcome').show('slide-up');
	
	},
	
	/* Notifications */
	
	enableNotifications: function(callback) {
	
		if (app._device.system != 'ios' || app._device.system != 'android') {
			app.showNotification('Sorry, notifications can only be configured on actual devices.');
			return callback(true);
		}
		
		console.log('Enabling notifications...');
		
		var user = app.data.session.user;
		
		Notificare.enableNotifications();
		
		Notificare.on('registration', function(deviceId) {
			
			console.log('Notification response...');
			
			Notificare.registerDevice(deviceId, user.email, (user.name.full ? user.name.full : 'Unknown'), function() {
				app.showNotification('Alert', 'Registered for notifications with device id: [' + deviceId + '], email: [' + user.email + '], name: [' + (user.name.full ? user.name.full : 'Unknown') + '].');
				if (callback) return callback();
			}, function(err) {
				app.showNotification('Alert', 'Error registering for notifications');
				console.log(err);
				if (callback) return callback(true);
			});
			
		});
	
	},
	
	disableNotifications: function(callback) {
	
		Notificare.disableNotifications();
	
	},
	
	/* Analytics */
	
	setIdentity: function(key) {
	
		if (!window.mixpanel)
			return;
		
		try {
			mixpanel.identify(key);
		} catch(e) {}
	
	},
	
	trackIdentity: function(properties, revenue) {
		
		if (app.checkTestCode())
			return;
		
		if (!window.mixpanel)
			return;
		
		try {
			mixpanel.people.set(properties);
			mixpanel.people.track_charge(revenue);
			mixpanel.name_tag(app.data.payment.name + ( app.data.payment.email ? ' (' + app.data.payment.email + ')' : '' ) );
		} catch(e) {}
		
	},
	
	trackEvent: function(service, label, properties) {
		
		if (app.checkTestCode())
			return;
		
		switch( service )
		{
			case 'mixpanel':
			
				if (!window.mixpanel)
					return;
				
				$log( '[trackEvent] - Logging event to Mixpanel with the following data:', label, properties );
				
				try {
					mixpanel.track(label, properties);
				} catch(e) {
					$log( '[trackEvent] - Encountered an issue while logging an event to Mixpanel...', e );
				}
			
			break;
			
			case 'googleanalytics':
			
				if (!window.ga)
					return;
				
				if ( !properties.category || !properties.action )
					return;
				
				var data = {
					category: properties.category,
					action: properties.action,
					label: properties.label || label || '',
					value: properties.value || 0
				}
				
				$log( '[trackEvent] - Logging event to Google Analytics with the following data:', data );
				
				try {
					ga('send', 'event', data.category, data.action, data.label, data.value);
				} catch(e) {
					$log( '[trackEvent] - Encountered an issue while logging an event to Google Analytics...', e );
				}
			
			break;
		}
		
	}
	
});

app.on('init', function() {
	
	// Log start of events
	$log( "==================================================" );
	$log( "[init] - App init started..." );
	$log( "--------------------------------------------------" );
	
	// Show the loading spinner
	// app.showLoadingSpinner();
	
	// Immediately ping server to get config and check if we're online then resume the session
	app.pingServer( function( success ) {
		
		async.series([
		
			function(cb) {
			
				// Set specific flags based on what device we're using, which will enable/disable certain
				// effects around the app to improve performance, this must happen before any views are shown
				app.setPerformanceConditions();
				
				$log( "[init] - Set performance conditions, continuing..." );
				
				return cb();
			
			},
			
			/*
			function(cb) {
			
				// If we haven't got the claims data yet...
				if ( !app.data.preload.claims ) {
				
					// Load it, then continue along the queue
					$log( "[init] - Claims data isn't loaded, loading..." );
					
					app.getStatus(function() {
						return cb();
					});
				
				} else {
					
					// Otherwise continue along the queue
					$log( "[init] - Claim data loaded, continuing..." );
					
					return cb();
				
				}
			
			}
			*/
		
		], function(err) {
		
			// Log end of events
			$log( "--------------------------------------------------" );
			$log( "[init] - App init finished, resuming session." );
			$log( "==================================================" );
			
			// Hide the loading spinner
			// app.hideLoadingSpinner();
			
			// Then resume the session
			setTimeout(function() {
				app.resumeSession();
			}, 250);
		
		});
		
	});
	
});
