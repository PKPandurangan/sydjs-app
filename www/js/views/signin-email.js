(function() {
	
	new View('signin-email', {
		
		on: {
			layout: function() {
				
				// iOS/Desktop cater for statusbar height
				if (!app._device.system || app._device.system == 'ios') {
					this.$('.titlebar').css('height', parseInt(this.$('.titlebar .wrap').css('height'), 10) + 21);
				}
				
				// iOS: fixes the scrolling & rendering issue when previous/nexting through fields
				if (app._device.system == 'ios' && document.activeElement.tagName.toLowerCase().match(/input|textarea|select/)) {
					return;
				}
				
				// calculate available height
				var availableHeight = app.viewportSize.height
					- this.$('.titlebar').height();
				
				// set height and position of main container to availabe height
				this.$('.container').css({
					height: availableHeight,
					top: this.$('.titlebar').height()
				});
				
			},
			visible: function() {
				
				// make sure the signin flow is shown
				this._flow = 'signin';
				this.$('.signin.container').css('opacity', 1).show();
				this.$('.signup.container').hide();
				this.$('.recover.container').hide();
				
				// iOS: prevent auto focusing the last field
				app.disableFields();
				
				// Ensure form state is not set to processing when view is visible (shouldn't ever happen but left for safety)
				this._processingForm = false;
				
				// iOS: Change status bar style to match view style
				app.changeStatusBarStyle('black');
				
				// analytics
				app.trackEvent({ label: 'Signin Email', category: 'view', action: 'visible' });
				
				
			},
			hidden: function() {
				
				this.clearFields();
				
			}
		},
		
		buttons: {
			'.btn-right': 'previous',
			
			'.signin .action-submit': 'validateSignin',
			'.signin .action-recover': 'showRecover',
			'.signin .action-signup': 'showSignup',
			
			'.signup .action-submit': 'validateSignup',
			'.signup .action-signin': 'showSignin',
			'.signup .switcher-alertsNotifications': 'alertsNotifications',
			
			'.recover .action-signin': 'showSignin'
		},
		
		events: {
			'swipeLeft': 'alertsNotifications',
			'swipeRight': 'alertsNotifications'
		},
		
		previous: function() {
			app.view('signin').reveal('slide-down');
		},
		
		clearFields: function() {
		
			var self = this;
			
			_.each([ 'password' ], function(key) {
				self.field(key).val('');
			});
		
		},
		
		switchFlow: function(flow) {
			
			var self = this;
			
			// iOS: prevent auto focusing the last field
			app.disableFields();
			
			// alert('hiding:' + this._flow + '.container');
			
			this.$('.' + this._flow + '.container').velocity({
				opacity: 0
			}, {
				duration: 300,
				easing: 'easeOutSine',
				complete: function() {
					
					// alert('showing:' + flow + '.container');
					
					self.$('.' + flow + '.container').css('opacity', 0).show();
					self.$('.' + flow + '.container').velocity({
						opacity: 1
					}, {
						duration: 300,
						easing: 'easeOutSine',
						complete: function() {
							self.$('.' + self._flow + '.container').hide();
							self._flow = flow;
						}
					});
					
				}
			});
			
		},
		
		showSignup: function() {
			this.switchFlow('signup');
		},
		
		showSignin: function() {
			this.switchFlow('signin');
		},
		
		showRecover: function() {
			this.switchFlow('recover');
		},
		
		// Validate input and tokenise the card
		validateSignin: function() {
		
			var self = this;
			
			if ( self._processingForm ) {
				console.log('[validateInput] - User tried to submit form but is already in a processing state.');
				return;
			}
			
			self._processingForm = true;
			
			app.hideKeyboard();
			
			// Collect the form data
			var inputData = {
				username: this.field('username').val(),
				password: this.field('password').val()
			};
			
			// Log data
			console.log("[validateInput] - Input data to be processed:", inputData);
			
			// Validate the form data
			if (!inputData.username.trim().length) {
				self._processingForm = false;
				app.showNotification('Alert', 'Please enter your username.');
				return;
			}
			 
			if (!inputData.password.trim().length) {
				self._processingForm = false;
				app.showNotification('Alert', 'Please enter your password.');
				return;
			}
			
			console.log("[validateInput] - Input data passed all validation checks, saving data...");
			
			// Show loading spinner
			app.showLoadingSpinner();
			
			// Sign user in
			this.actionSignin(inputData);
		
		},
		
		// Process the yser
		actionSignin: function(data) {
		
			var self = this;
			
			var customerData = {
				username: data.username,
				password: data.password
			};
			
			console.log("[signinUser] - User data to be processed:", customerData);
			
			console.log("[signinUser] - Processing data...");
			
			var success = function(data) {
				
				console.log("[signinUser] - Password check successful.", data);
				
				// Put data in local storage
				app.storeSessionInfo(data);
				
				// Hide loading spinner
				app.hideLoadingSpinner();
				
				// Set form to no longer processing
				self._processingForm = false;
				
				// Go to another view
				app.getStatus(function() {
					app.view('home').show('slide-up');
				});
			
			}
			
			var error = function() {
				
				console.log("[signinUser] - Password check failed, advise user to retry details.");
				
				// Hide loading spinner
				app.hideLoadingSpinner();
				
				// Set form to no longer processing
				self._processingForm = false;
				
				// Reset and focus field
				self.field('password').val('');
				setTimeout(function() {
					self.field('password').focus();
				}, 100);
				
				// Show message
				app.showNotification('Alert', 'Sorry, we couldn\'t validate your password, please try again.');
				
			}
			
			$.ajax({
				url: app.getAPIEndpoint('signin'),
				type: 'post',
				data: customerData,
				dataType: 'json',
				cache: false,
				success: function(data) {
					data && data.success && data.session ? success(data) : error();
				},
				error: function() {
					return error();
				}
			});
			
		},
		
		validateSignup: function() {
		
			var self = this;
			
			if ( self._processingForm ) {
				console.log('[validateInput] - User tried to submit form but is already in a processing state.');
				return;
			}
			
			self._processingForm = true;
			
			app.hideKeyboard();
			
			// Collect the form data
			var inputData = {
				'name.first': this.field('firstName').val(),
				'name.last': this.field('lastName').val(),
				email: this.field('email').val(),
				password: this.field('password').val(),
				website: this.field('website').val(),
				alertsNotifications: this.field('alertsNotifications').val() == 'yes' ? true : false
			};
			
			// Log data
			console.log("[validateInput] - Input data to be processed:", inputData);
			
			// Validate the form data
			if (!inputData.name.first.trim().length || !inputData.name.last.trim().length) {
				self._processingForm = false;
				app.showNotification('Alert', 'Please enter your full name.');
				return;
			}
			
			if (!inputData.email.trim().length) {
				self._processingForm = false;
				app.showNotification('Alert', 'Please enter your email address.');
				return;
			}
			
			if (!inputData.password.trim().length) {
				self._processingForm = false;
				app.showNotification('Alert', 'Please enter a password.');
				return;
			}
			
			console.log("[validateInput] - Input data passed all validation checks, saving data...");
			
			// Show loading spinner
			app.showLoadingSpinner();
			
			// Save details
			this.actionSignup(inputData);
		
		},
		
		actionSignup: function(userData) {
		
			var self = this;
			
			console.log("[saveDetails] - User data to be processed:", userData);
			console.log("[saveDetails] - Processing data...");
			
			var success = function(data) {
				
				console.log("[saveDetails] - Updated processed succesfully, showing message.", rtnData);
				
				// Put data in local storage
				app.storeSessionInfo(rtnData.data);
				
				// Hide loading spinner
				app.hideLoadingSpinner();
				
				// Set form to no longer processing
				self._processingForm = false;
				
				// Clear fields
				self.clearFields();
				
				// Go to another view
				app.view('home').show('slide-up');
				
			}
			
			var error = function() {
				
				console.log( "[saveDetails] - Update failed, advise user to retry details.", rtnData );
				
				// Hide loading spinner
				app.hideLoadingSpinner();
				
				// Set form to no longer processing
				self._processingForm = false;
				
				// Show message
				app.showNotification('Alert', 'Sorry, your account could not be created. Please try again.\n\n' + rtnData.message);
				
			}
			
			$.ajax({
				url: app.getAPIEndpoint('create-customer'),
				type: 'post',
				data: customerData,
				dataType: 'json',
				cache: false,
				success: function(data) {
					return data.success ? success(data) : error();
				},
				error: function() {
					return error();
				}
			});
			
		},
		
		alertsNotifications: function(e) {
		
			var $switcher = this.$('.switcher-alertsNotifications.switcher'),
				$handle = $switcher.find('.handle'),
				$state = $switcher.find('.state');
			
			var on = $switcher.hasClass('on');
			
			if (e && e.type && e.type == 'swipeRight' && on) return;
			if (e && e.type && e.type == 'swipeLeft' && !on) return;
			
			$state.text(on ? 'Off' : 'On');
			
			$state.css('opacity', 0);
			$state.animate({ opacity: 1 });
			
			$switcher.removeClass('on off');
			$switcher.addClass(on ? 'off' : 'on');
			
			this.field('alertsNotifications').val(on ? 'no' : 'yes');
		
		}
		
	});

})();
