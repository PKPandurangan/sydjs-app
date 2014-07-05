//	Index
//	=====
//
//	This is the main init script, which configures the application.
//	It should be the last script included.

_.extend(app.data, {
	
	version: '1.0.0', // Current local version
	
	config: {}, // Stores the config settings we get back from every status request
	
	user: {}, // Stores a user key we generate on startup that allows consistant analytics tracking
	
	session: {}, // Session related data (code used etc)
	
	meetups: {}, // Meetup related data
	
	pushNotifications: {}
	
});

_.extend(app, {
	
	/* Performance Conditions */
	
	setPerformanceConditions: function() {
	
		//
	
	},
	
	/* Config */
	
	checkConfig: function() {
	
		var config = app.data.config;
		
		// Check kill switch
		if (config.killSwitch) return app.showConfigNotification('killSwitch');
		
		var versions = {
			current: app.data.version.split('.'),
			compatibility: config.versions.compatibility.split('.'),
			production: config.versions.production.split('.')
		}
		
		// Check if major current version is behind major compatibility version
		if ( Number(versions.current[0]) < Number(versions.compatibility[0]) ) {
			console.log('[checkConfig] - Users current major version is behind compatibility major version.');
			return app.showConfigNotification('versionIncompatibility');
		}
		
		// Check if major current version is behind major production version
		if ( Number(versions.current[0]) < Number(versions.production[0]) ) {
			console.log('[checkConfig] - Users current major version is behind production major version.');
			return app.showConfigNotification('versionIncompatibility');
		}
	
	},
	
	showConfigNotification: function(type) {
	
		var $configNotice = $('#config-notice');
		
		var html = false;
		
		switch(type) {
		
			case 'killSwitch':
				html = '<div class="text">' +
					'<div>SydJS is currently unavailable.</div>' +
					'<div>Please check back soon!</div>' +
				'</div>';
			break;
			
			case 'versionIncompatibility':
				var via = 'GitHub';
				switch(app._device.system) {
					case 'ios':
						via = 'the App Store';
					break;
					case 'android':
						via = 'the Google Play Store';
					break;
				}
				html = '<div class="text">' +
					'<div>A new version of the SydJS app is now available.</div>' +
					'<div>Please update the app via ' + via + '.</div>' +
				'</div>';
			break;
			
			case 'noResponse':
				html = '<div class="text">' +
					'<div>Please check your internet connection.</div>' +
				'</div>';
			break;
		
		}
		
		if (!html) return;
		
		$configNotice.find('.box').html(html);
		
		$configNotice.addClass('show');
		
		$configNotice.find('.box').css( 'margin-top', -( $configNotice.find('.box').height() / 2 ) );
	
	},
	
	hidePingNotification: function() {
	
		var $configNotice = $('#config-notice');
		
		$configNotice.removeClass('show');
		
		$configNotice.find('.box').html('').css( 'margin-top', 0 );
		
	},
	
	/* User Data */
	
	storeUser: function() {
	
		var userKey = app.generateUser();
		
		localStorage.setItem( 'user_key', userKey );
		
		return userKey;
	
	},
	
	populateUser: function() {
	
		var userKey = localStorage.getItem( 'user_key' ),
			userPushNotifications = localStorage.getItem( 'user_pushNotifications' ) == 'true' ? true : false;
		
		app.data.user.key = userKey || app.storeUser();
		app.data.user.pushNotifications = userPushNotifications;
		
		app.setIdentity(app.data.user.key);
		
		console.log('[populateUser] - Set user key as [' + app.data.user.key + '], push notifications as [' + app.data.user.pushNotifications + '].');
	
	},
	
	preloadUser: function(callback) {
		
		var $image = $(new Image());
		
		$image.on({
			load: function() { callback() },
			error: function() { callback() }
		});
		
		$image.prop('src', app.data.session.avatar);
		
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
		
		console.log('[storeSessionInfo] - Storing session info into local storage.');
		
		// populate local storage with date and user date
		localStorage.setItem( 'session_date', data.date );
		localStorage.setItem( 'session_userId', JSON.stringify( data.userId ) );
		
		this.populateSessionInfo(data);
		
	},
	
	populateSessionInfo: function(data) {
		
		console.log('[populateSessionInfo] - Populating session info into app.');
		
		_.extend(app.data.session, _.pick(data, 'date', 'userId'));
		
	},
	
	resumeSession: function() {
		
		console.log('[resumeSession] - Resuming session...');
		
		// Check local storage for session data
		console.log('[resumeSession] - Checking local storage...');
		
		var date = localStorage.getItem( 'session_date' ),
			user = localStorage.getItem( 'session_userId' );
		
		// Function to handle retries
		var retry = function() {
			app.showNotification('Oops!', 'There was an error communicating with SydJS, please wait while we attempt to re-connect in 5 seconds.');
			app.showLoadingSpinner('Retrying');
			setTimeout(function() {
				app.resumeSession();
			}, 5000);
			return;
		}
		
		// Check for timestamp and valid code
		if ( date && user)
		{
			console.log('[resumeSession] - Existing data found, populating data from local storage...');
			
			app.populateSessionInfo({
				date: localStorage.getItem( 'session_date' ),
				userId: JSON.parse( localStorage.getItem( 'session_userId' ) )
			});
			
			console.log('[resumeSession] - Session info retrieved from [' + moment( parseInt( date ) ).format('DD/MM/YYYY h:mm:ssa') + ']...');
			
			app.getStatus(function(err) {
				if (err) return retry();
				app.view('home').show();
			});
		}
		// If we don't have any data, just show the home screen (default behaviour)
		else
		{
			console.log('[resumeSession] - No existing data found...');
			console.log('[resumeSession] - Showing [signin] screen.');
			
			app.getStatus(function(err) {
				if (err) return retry();
				app.view('home').show();
			});
		}
		
	},
	
	/* Status Data */
	
	getStatus: function(callback) {
	
		console.log('[getStatus] - Retrieving status data from server...');
		
		var data = {};
		
		if (app.data.session.userId) data.user = app.data.session.userId;
		
		var success = function(data) {
			
			console.log('[getStatus] - Successfully retrieved status.');
			
			// Set config data
			if (data.config) app.data.config = data.config;
			app.checkConfig();
			
			// Set meetup status
			if (data.meetups) app.data.meetups = data.meetups;
			
			// Set user data
			if (data.user) app.data.session = data.user;
			
			return callback(false);
			
		}
		
		var error = function() {
			
			console.log('[getStatus] - Failed getting status, aborting');
			
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
	
	parseMeetup: function() {
	
		return {
			next: app.data.meetups.next ? true : false,
			data: app.data.meetups.next || app.data.meetups.last,
			inProgress: app.data.meetups.next && app.data.meetups.next.starts && app.data.meetups.next.ends ? moment().isAfter(moment(app.data.meetups.next.starts)) && moment().isBefore(moment(app.data.meetups.next.ends)) : false
		}
	
	},
	
	/* Sign Out */
	
	signOut: function() {
	
		app.data.session = {};
		
		if (app.data.meetups.next) {
			app.data.meetups.next.rsvped = false;
			app.data.meetups.next.attending = false;
		}
		
		localStorage.clear();
		
		app.view('signout').show('slide-up');
	
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
			
				console.log('[enableNotifications] - Failed enabling notifications.', err );
				
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
		
		app.data.user.pushNotifications = enable;
		
		localStorage.setItem( 'user_pushNotifications', enable );
		
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
		// if (app.checkTestCode()) return;
		
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
				console.log('[trackEvent] - Encountered an issue while logging an event to Mixpanel...', e);
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
	console.log('[init] - App init started...');
	
	// Set specific flags based on what device we're using, which will enable/disable certain
	// effects around the app to improve performance, this must happen before any views are shown
	app.setPerformanceConditions();
	
	// Make sure we have a user set for analytics tracking
	app.populateUser();
	
	// Show the loading view immeidately, which is a clone of the home view with the SydJS logo
	// in the starting position
	app.view('loading').show();
	
	// set the home background so it's inited before we reach the view
	app.view('home').setBackground();
	
	// Logging
	console.log('[init] - App init finished, resuming session...');
	
	// Resume the session
	app.resumeSession();
	
});
