// App
// -------------

// This is the main class for managing the application. It contains logic to
// do with managing views, events, and loading.
// 
// It is instantiated as `app`, and can be extended with logic specific to the
// application (state, models, events, etc.)

var App = function() {
	_.extend(this, {
		data: {},
		
		_views: {}, // all views that have been registered
		_viewZ: 10, // the highest z-index for any view
		_currentView: null,
		_previousView: null,
		
		_inTransition: false,
		
		_preloaded: {},
		_transitions: {},
		_local: false,
		_device: false
	});
};

_.extend(App.prototype, Backbone.Events, {
	
	touchSupport: 'ontouchstart' in document.documentElement,
	touchEventEquivalents: {
		'touchstart': 'mousedown',
		'touchend': 'mouseup',
		'touchmove': 'mousemove',
		'tap': 'click'
	},
	
	init: function() {
		
		this.initDevice();
		this.initResize();
		this.initScrolling();
		
		this.trigger('init');
		
	},
	
	_transitionTimeout: null,
	
	inTransition: function() {
		if (this._inTransition) {
			return true;
		}
		// console.log('app:inTransition() setting _inTransition = true');
		this._inTransition = true;
		var app = this;
		this._transitionTimeout = setTimeout(function() {
			// console.log('app:inTransition() timed out in 1250ms... ending transition state.');
			app.doneTransition();
		}, 1250);
		return false;
	},
	
	doneTransition: function() {
		clearTimeout(this._transitionTimeout);
		// console.log('app:doneTransition() setting _inTransition = false');
		this._inTransition = false;
	},
	
	initResize: function() {
		// handle resize events
		var resize = function() {
			app.viewportSize = {
				width: $(window).width(),
				height: $(window).height()
			};
			if (app._device.system == 'ios') {
				app.viewportSize.height -= 20;
			}
			// assume we're on a desktop if we have no system
			if (!app._device.system) {
				app.viewportSize = {
					width: $('#viewport').width(),
					height: $('#viewport').height()
				};
			}
			if (app._currentView) {
				app._currentView.trigger('layout');
			}
		}
		resize();
		$(window).on('resize', resize);
	},
	
	initScrolling: function() {
		
		// prevent native scrolling on the document - means that tap-dragging won't reveal
		// the 'linen' texture on iOS.
		
		var start = null;
		
		// capture touchstart so we can detect scroll direction
		$(window).on('touchstart', function(e) {
			start = e;
			$log( '[initScrolling] - Touch Start event called.' );
		});
		
		// reset on touchend
		$(window).on('touchend', function(e) {
			start = null;
			$log( '[initScrolling] - Touch End event called.' );
		});
		
		// prevent touchmove events on the window to block document scrolling
		$(window).on('touchmove', function(e) {
			e.preventDefault();
			$log( '[initScrolling] - Touch Move event called.' );
		});
		
		// stop any events inside a scrollable area from bubbling, or the event will be
		// cancelled by the window and the scrollable area won't scroll.
		$(document).on('touchmove', '.scrollable', function(e) {
			
			$log( '[initScrolling] - Touch Move event called within scrollable container.' );
			
			// if the element won't scroll, default behaviour applies
			if (e.currentTarget.scrollHeight <= e.currentTarget.offsetHeight)
				return;
			
			// if the element is scrolled to the top and the user is scrolling up,
			// or the element is scrolled to the bottom and the user is scrolling down,
			// offset the scrollTop by 1 to trick the browser into over-scrolling the
			// container (otherwise the whole window will be scrolled).
			// 
			// the effect is a bit jumpy but seems to be the best we can do in this case.
			if (start) {
				if (start.pageY > e.pageY && e.currentTarget.scrollTop == e.currentTarget.scrollHeight - e.currentTarget.offsetHeight){
					// down
					console.log('app:initScrolling() on document.touchmove: modifying scrollTop to handle scroll: down')
					e.currentTarget.scrollTop--;
				}
					
				else if (start.pageY < e.pageY && e.currentTarget.scrollTop == 0) {
					// up
					console.log('app:initScrolling() on document.touchmove: modifying scrollTop to handle scroll: up')
					e.currentTarget.scrollTop = 1;
				}
				// only do this once!
				if (start.pageY != e.pageY) {
					console.log('app:initScrolling() on document.touchmove: resetting start = null')
					start = null;
				}
			}
			
			// allow the scroll
			e.stopPropagation();
			
		});
		
	},

	currentViewZ: function() {
		return app._viewZ * 100;
	},

	lastViewZ: function() {
		app._viewZ--;
		return app._viewZ * 100;
	},

	nextViewZ: function() {
		app._viewZ++;
		return app._viewZ * 100;
	},
	
	view: function(key) {
		var view = this._views[key];
		if (view)
			return view;
		else
			app.showNotification('Alert', 'Invalid view (' + key + ') requested.');
	},
	
	currentView: function(view, hidePrevious) {
		if (view) {
			// console.log('app:currentView() Setting current view to ' + view.id);
			var previousView = (hidePrevious) ? this.currentView() : false;
			this._previousView = previousView;
			this._currentView = view;
			// hide the previous view if there was one
			if (previousView) {
				// console.log('app:currentView() hiding previous view: ' + previousView.id);
				previousView.hide();
			}
			this.doneTransition();
		}
		return this._currentView;
	},
	
	showNotification: function(title, message, label, callback) {
	
		callback = callback || function() {};
		
		// Use native Cordova alert dialogs
		if (navigator.notification && navigator.notification.alert) {
			navigator.notification.alert(message, callback, title || 'Alert', label || 'OK');
		// Fallback to browser alerts
		} else {
			alert(message);
		}
	
	},
	
	showConfirm: function(title, message, labels, callback) {
	
		callback = callback || function() {};
		
		// Use native Cordova confirm dialogs
		if (navigator.notification && navigator.notification.confirm) {
			navigator.notification.confirm(message, callback, title || 'Confirm', labels || 'OK,Cancel');
		// Fallback to browser confirms (1 = OK, 2 = Cancel)
		} else {
			if (!confirm(message)) {
				return callback(1);
			} else {
				return callback(2);
			}
		}
	
	},
	
	showLoadingSpinner: function(label, then) {
		
		if (this._spinnerVisible) {
			app.hideLoadingSpinner();
			this._spinnerVisible = false;
			app.showLoadingSpinner(label, then);
			// app.showNotification('Alert',  "[showLoadingSpinner] - Tried to show spinner but it's already visible." );
			return;
		}
		
		$log( "[showLoadingSpinner] - Showing loading spinner." );
		
		this._spinnerVisible = true;
		
		$('#app-loading').css({
			'z-index': this.currentViewZ() + 99,
			'opacity': 0,
			'display': 'block'
		}).animate({ opacity: 1 }, 400, 'ease', function() {
			
			if (then) {
				$log( "[showLoadingSpinner] - Has then() callback." );
				then();
			}
			
		});
		
		if (label) {
			$('#app-loading').addClass( 'with-label' ).find( '.label' ).text(label);
		} else {
			$('#app-loading').removeClass( 'with-label' );
		}
		
		$('#app-loading .spinner').spinner('start');
		
	},
	
	hideLoadingSpinner: function(then) {
		
		if (!this._spinnerVisible) {
			// app.showNotification('Alert',  "[hideLoadingSpinner] - Tried to hide spinner but it's not visible." );
			return;
		}
		
		$log( "[hideLoadingSpinner] - Hiding loading spinner." );
		
		this._spinnerVisible = false;
		
		$('#app-loading').animate({ opacity: 0 }, 400, 'ease', function() {
			
			$('#app-loading').hide();
			$('#app-loading .spinner').spinner('stop');
			
			if (then) {
				$log( "[hideLoadingSpinner] - Has then() callback." );
				then();
			}
			
		});
	},
	
	hideKeyboard: function() {
		// hide the keyboard when hiding a screen (blur active element)
		if ( document.activeElement.tagName.toLowerCase().match( /input|textarea|select/ ) )
			document.activeElement.blur();
	},
	
	scrollContainer: function(view) {
		if ( view.disableAutoScroll )
			return;
		var scrollingContainer = view.$el.find( '.container' );
		if ( scrollingContainer.length )
			_.first(scrollingContainer).scrollTop = 0;
	},
	
	initDevice: function() {
	
		var userAgent = navigator.userAgent.toLowerCase();
		
		app._device = {
			mobile: (/iphone|ipad|ipod|android/i.test(userAgent)),
			standalone: window.navigator.standalone,
			
			system: false,
			tablet: false,
			
			browser: false,
			webkit: $.browser.webkit,
			
			model: false, // iOS specific
			size: false // iOS specific
		};
		
		// Detect system and tablet
		if (userAgent.match(/iphone|ipad|ipod/)) {
			app._device.system = 'ios';
			if (userAgent.match('iphone')) {
				app._device.model = 'iphone';
			} else if (userAgent.match('ipad')) {
				app._device.model = 'ipad';
			} else if (userAgent.match('ipad')) {
				app._device.model = 'ipad';
				app._device.tablet = true;
			}
		}
		
		if (userAgent.match('android')) {
			app._device.system = 'android';
			if (!userAgent.match('mobile')) {
				app._device.tablet = true;
			}
		}
		
		if (userAgent.match('windows phone')) {
			app._device.system = 'windows phone';
		}
		
		if (userAgent.match('blackberry')) {
			app._device.system = 'blackberry';
		}
		
		// Detect iOS browser (Opera is unique, while Chrome and Safari useragents are identical except for CriOS included for Chrome only)
		if ( app._device.system == 'ios' ) {
			if ( userAgent.match('opera mini')) {
				app._device.browser = 'opera';
			} else if (userAgent.match('crios')) {
				app._device.browser = 'chrome';
			} else {
				app._device.browser = 'safari'
			}
		}
		
		// Detect Android browser (seperated from above browser detection for clarity)
		if ( app._device.system == 'android' ) {
			if ( userAgent.match('opera mini')) {
				app._device.browser = 'opera';
			} else {
				app._device.browser = 'safari'
			}
		}
		
		// Detect iOS model
		if ( app._device.system == 'ios' && ( app._device.model == 'iphone' || app._device.model == 'ipod' ) ) {
			if ( app._device.standalone ) {
				if ( $(window).height() <= 460 ) {
					app._device.size = 'short';
				} else {
					app._device.size = 'tall';
				}
			} else {
				if ( $(window).height() <= 356 ) {
					app._device.size = 'short';
				} else {
					app._device.size = 'tall';
				}
			}
			
		}
		
		/* Device Specific Code */
		
		// Android: In some cases, Android doesn't include the Roboto font, add it via Google Web Fonts,
		// it would be better if we detected if it didn't exist but this looks a bit tricky
		if ( app._device.system == 'android' ) {
			WebFontConfig = {
				google: {
					families: ['Roboto']
				}
			};
			(function() {
				var wf = document.createElement('script');
				wf.src = ('https:' == document.location.protocol ? 'https' : 'http') +
					'://ajax.googleapis.com/ajax/libs/webfont/1.4.7/webfont.js';
				wf.type = 'text/javascript';
				wf.async = 'true';
				var s = document.getElementsByTagName('script')[0];
				s.parentNode.insertBefore(wf, s);
			})();
		}
		
		// Add mobile class so orientation detection is only used on mobile devices and standalone apps
		if ( app._device.mobile || app._device.standalone ) {
			$('#viewport').addClass( 'device-mobile' );
		}
		
		// Assume we're on a desktop if we have no system
		if ( !app._device.system ) {
			$('#viewport').addClass( 'device-desktop' );
		}
	
	}
	
});

app = new App();
