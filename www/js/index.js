//	Index
//	=====
//
//	This is the main init script, which configures the application.
//	It should be the last script included.

_.extend(app.data, {
	
	versions: {
		build: '1.0.0' // The users current local build version
	},
	
	user: {}, // Stores a user key we generate on startup that allows consistant analytics tracking
	
	session: {}, // Session related data (code used etc)
	
	status: {}, // Status data (rsvp's etc)
	
	config: {}, // Stores the config settings we get back from every ping request
	
	pushNotifications: {}
	
});

_.extend(app, {
	
	/* Performance Conditions */
	
	setPerformanceConditions: function() {
	
		//
	
	},
	
	/* Pinging & Config */
	
	pingServer: function( callback ) {
		
		if ( app._disablePing ) {
			console.log( '[pingServer] - Pinging is disabled, aborting.' );
			return;
		}
		
		// DEVELOPMENT: Disable after initial ping so we only hit one request
		if ( config.environment == 'development' ) {
			app._disablePing = true;
		}
		
		console.log( '[pingServer] - Pinging...' );
		
		var success = function(data) {
		
			console.log( "[pingServer] - Successfully pinged server." );
			
			// Set config
			if ( data.config ) {
				console.log( "[pingServer] - Setting config with:", data.config );
				app.data.config = data.config;
			}
			
			// Check the config
			app.checkConfig();
			
			// Ping server again in 10 seconds
			setTimeout( function() { return app.pingServer() }, 10000 );
		
		}
		
		var fail = function() {
		
			console.log( "[pingServer] - Received unexpected ping response, connection may be offline, displaying notification (if not displayed)." );
			
			// Show network notification
			app.showPingNotification('noResponse');
			
			// Ping server again in 5 seconds (hastened)
			setTimeout( function() { return app.pingServer() }, 5000 );
		
		}
		
		$.ajax({
			url: app.getAPIEndpoint('ping'),
			type: 'get',
			dataType: 'json',
			cache: false,
			success: function(data) {
				
				// Hide any current ping notifications
				app.hidePingNotification();
				
				// We currently have a callback when we start up the app, only in success function right now
				// We probably shouldn't let the user use the app if we don't get a ping response
				if (callback) callback(data.success);
				
				// Check for successful response
				return data && data.success ? success(data) : error();
			
			},
			error: function() {
				return error();
			}
		});
		
	},
	
	checkConfig: function() {
	
		var config = app.data.config;
		
		// Check kill switch
		if (config.killSwitch) return app.showPingNotification('killSwitch');
		
		var versions = {
			build: app.data.versions.build.split('.'),
			compatibility: config.versions.compatibility.split('.'),
			production: config.versions.production.split('.')
		}
		
		// Check if major build version is behind major compatibility version
		if ( Number(versions.build[0]) < Number(versions.compatibility[0]) ) {
			console.log('[checkConfig] - Users build major version is behind compatibility major version.');
			return app.showPingNotification('versionIncompatibility');
		}
		
		// Check if major build version is behind major production version
		if ( Number(versions.build[0]) < Number(versions.production[0]) ) {
			console.log('[checkConfig] - Users build major version is behind production major version.');
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
						'<div>SydJS is currently unavailable.</div>' +
						'<div>Please check back soon!</div>' +
					'</div>';
			break;
			
			case 'versionIncompatibility':
				html = '<div class="i">&#59141;</div>' +
					'<div class="text">' +
						'<div>A new version of SydJS is now available.</div>' +
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
		
		if (!html) return;
		
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
		
		console.log( '[pingServer] - Disabled pinging.' );
	
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
		
		console.log( "[populateUser] - Set user key as [" + app.data.user.key + "]." );
	
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
		
		console.log( "[storeSessionInfo] - Storing session info into local storage." );
		
		// populate local storage with date and user date
		localStorage.setItem( 'session_date', data.date );
		localStorage.setItem( 'session_userId', JSON.stringify( data.userId ) );
		
		this.populateSessionInfo(data);
		
	},
	
	populateSessionInfo: function(data) {
		
		console.log( "[populateSessionInfo] - Populating session info into app." );
		
		_.extend(app.data.session, _.pick(data, 'date', 'userId'));
		
	},
	
	resumeSession: function() {
		
		console.log( "[resumeSession] - Resuming session..." );
		
		// Make sure we have a user set
		app.populateUser();
		
		// Check local storage for session data
		console.log( "[resumeSession] - Checking local storage..." );
		
		var date = localStorage.getItem( 'session_date' ),
			user = localStorage.getItem( 'session_userId' );
		
		// Check for timestamp and valid code
		if ( date && user)
		{
			console.log( "[resumeSession] - Existing data found, populating data from local storage..." );
			
			app.populateSessionInfo({
				date: localStorage.getItem( 'session_date' ),
				userId: JSON.parse( localStorage.getItem( 'session_userId' ) )
			});
			
			console.log( "[resumeSession] - Session info retrieved from [" + moment( parseInt( date ) ).format('DD/MM/YYYY h:mm:ssa') + "]..." );
			
			app.getStatus(function() {
				// $( '#preloader' ).velocity({ opacity: 0 }, { duration: 250 });
				app.view('home').show();
			});
		}
		// If we don't have any data, just show the home screen (default behaviour)
		else
		{
			console.log( "[resumeSession] - No existing data found..." );
			console.log( "[resumeSession] - Showing [signin] screen." );
			
			app.getStatus(function() {
				// $( '#preloader' ).velocity({ opacity: 0 }, { duration: 250 });
				app.view('home').show();
			});
		}
		
	},
	
	/* Status Data */
	
	getStatus: function(callback) {
	
		console.log( "[getStatus] - Status data doesn't exist, retrieving from server..." );
		
		var data = {};
		
		if (app.data.session.userId) data.user = app.data.session.userId;
		
		var success = function(data) {
			
			console.log( "[getStatus] - Successfully retrieved status." );
			
			// Set meetup status
			if (data.meetup) app.data.meetup = data.meetup;
			
			// Set user data
			if (data.user) app.data.session = data.user;
			
			return callback(false);
			
		}
		
		var fail = function() {
			
			console.log( "[getStatus] - Failed getting status, assuming success anyway." );
			
			return callback(true);
			
		}
		
		$.ajax({
			url: app.getAPIEndpoint('status'),
			type: 'post',
			data: data,
			dataType: 'json',
			cache: false,
			success: function(data) {
				return success(data);
			},
			error: function() {
				return error();
			}
		});
	
	},
	
	/* Sign Out */
	
	signOut: function() {
	
		app.data.session = {};
		
		localStorage.clear();
		
		app.view('welcome').show('slide-up');
	
	},
	
	/* Notifications */
	
	enableNotifications: function(callback) {
		
		// app.showNotification('Alert', '[enableNotifications] - Enabling notifications...');
		
		var user = app.data.session;
		
		Notificare.enableNotifications();
		
		Notificare.once('registration', function(deviceId) {
			
			console.log('[enableNotifications] - Notification response...');
			
			var userId = (user && user.userId ? user.userId : app.data.user.key),
				userName = (user && user.name && user.name.full ? user.name.full : 'Unknown');
			
			Notificare.registerDevice(deviceId, userId, userName, function() {
				
				// app.showNotification('Alert', 'Registered for notifications with device id: [' + deviceId + '], user id: [' + userId + '], name: [' + userName + '].');
				
				app.setNotifications(true, callback);
			
			}, function(err) {
			
				console.log( "[enableNotifications] - Failed enabling notifications.", err );
				
				app.showNotification('Alert', 'Sorry, there was an issue registering you for notifications. Please try again.');
				
				if (callback) return callback(true);
			
			});
			
		});
	
	},
	
	disableNotifications: function(callback) {
	
		// app.showNotification('Alert', '[disableNotifications] - Disabling notifications...');
		
		Notificare.disableNotifications(function() {
			app.setNotifications(false, callback);
		});
	
	},
	
	setNotifications: function(enable, callback) {
	
		// app.showNotification('Alert', '[setNotifications] - enable: [' + enable + '].');
		
		app.data.pushNotifications.enabled = enable;
		
		return callback && callback();
	
	},
	
	/* Analytics */
	
	setIdentity: function(key) {
	
		if (!window.mixpanel) return;
		
		try {
			mixpanel.identify(key);
		} catch(e) {}
	
	},
	
	trackIdentity: function(options) {
		
		// TODO: Decide what to do with this
		if (app.checkTestCode()) return;
		
		if (!window.mixpanel) return;
		
		try {
			mixpanel.people.set(options);
			mixpanel.name_tag(app.data.session.name.full + ( app.data.session.email ? ' (' + app.data.session.email + ')' : '' ) );
		} catch(e) {}
		
	},
	
	trackEvent: function(options) {
		
		// TODO: Decide on what to do with this
		// if (app.checkTestCode()) return;
		
		if (window.mixpanel) {
			
			console.log('[trackEvent] - Logging event to Mixpanel with the following data:', options.label, options.properties);
			
			try {
				mixpanel.track('Viewing ' + options.label, options.properties);
			} catch(e) {
				console.log( '[trackEvent] - Encountered an issue while logging an event to Mixpanel...', e );
			}
			
		}
		
		if (window.ga) {
			
			if (!options.category || !options.action) return;
			
			var data = {
				category: options.category, // required
				action: options.action, // required
				label: options.label || '',
				value: options.value || 0
			}
			
			console.log('[trackEvent] - Logging event to Google Analytics with the following data:', data);
			
			try {
				ga('send', 'event', data.category, data.action, data.label, data.value);
			} catch(e) {
				console.log('[trackEvent] - Encountered an issue while logging an event to Google Analytics...', e);
			}
			
		}
		
	}
	
});

app.on('init', function() {
	
	// Logging
	console.log('==================================================');
	console.log('[init] - App init started...');
	console.log('--------------------------------------------------');
	
	// Show the loading view immeidately, which is a clone of the home view with the SydJS logo
	// in the starting position
	app.view('loading').show();
	
	// Immediately ping server to get config and check if we're online then resume the session
	app.pingServer(function(success) {
		
		// Set specific flags based on what device we're using, which will enable/disable certain
		// effects around the app to improve performance, this must happen before any views are shown
		app.setPerformanceConditions();
		
		// Logging
		console.log('--------------------------------------------------');
		console.log('[init] - App init finished, resuming session.');
		console.log('==================================================');
		
		// Then resume the session
		app.resumeSession();
		
	});
	
});
