(function() {
	
	new View('set-password', {
		
		on: {
			layout: function() {
				var availableHeight = app.viewportSize.height
					- this.$('.titlebar').height();
				
				// iOS: fixes the scrolling & rendering issue when previous/nexting through fields
				if (app._device.system == 'ios' && document.activeElement.tagName.toLowerCase().match(/input|textarea|select/))
					return;
				
				this.$('.container').css({
					height: availableHeight,
					top: this.$('.titlebar').height()
				});
			},
			visible: function() {
				
				// iOS: prevent auto focusing the last field
				if ( app._device.system == 'ios' ) {
					var fields = this.$('input,textarea,select');
						fields.prop( 'disabled', true );
						setTimeout( function() { fields.prop( 'disabled', false ); }, 1000 );
				}
				
				// Android: Disable orientation detection temporarily to prevent keyboard from triggering it
				if ( app._device.system == 'android' ) {
					$('#viewport').addClass( 'ignore-orientation' );
				}
				
				// Ensure form state is not set to processing when view is visible (shouldn't ever happen but left for safety)
				this._processingForm = false;
				
				// Analytics
				// app.trackEvent( 'googleanalytics', 'Set Password', { category: 'view', action: 'visible' } );
				// app.trackEvent( 'mixpanel', 'Viewing Set Password', {} );
				
			},
			hidden: function() {
				
				this.clearFields();
				
				// Android: Disable orientation detection temporarily to prevent keyboard from triggering it
				if ( app._device.system == 'android' ) {
					$('#viewport').removeClass( 'ignore-orientation' );
				}
				
			}
		},
		
		buttons: {
			'.btn-back': 'previous',
			'.btn-submit': 'validateInput'
		},
		
		previous: function() {
			app.view('welcome').reveal('slide-right');
		},
		
		clearFields: function() {
		
			var self = this;
			
			_.each([ 'password', 'password-confirm' ], function(key) {
				self.field(key).val('');
			});
		
		},
		
		// Validate input
		validateInput: function() {
		
			var self = this;
			
			if ( self._processingForm ) {
				$log('[validateInput] - User tried to submit form but is already in a processing state.');
				return;
			}
			
			self._processingForm = true;
			
			app.hideKeyboard();
			
			// Collect the form data
			var inputData = {
				password: this.field('password').val(),
				passwordConfirm: this.field('password-confirm').val()
			};
			
			// Log data
			$log("[validateInput] - Input data to be processed:", inputData);
			
			// Validate the form data
			if (!inputData.password.trim().length || !inputData.passwordConfirm.trim().length) {
				self._processingForm = false;
				app.showNotification('Alert', 'Please enter your password.');
				return;
			}
			
			if (inputData.password.trim() != inputData.passwordConfirm.trim()) {
				self._processingForm = false;
				app.showNotification('Alert', 'Your password must match! Please try again.');
				return;
			}
			
			if (inputData.password.trim().length < 6) {
				self._processingForm = false;
				app.showNotification('Alert', 'Your password must be at least 6 characters.');
				return;
			}
			
			$log("[validateInput] - Input data passed all validation checks, saving data...");
			
			// Show loading spinner
			app.showLoadingSpinner();
			
			// Check password
			this.setPassword(inputData);
		
		},
		
		// process the customer password
		setPassword: function(data) {
		
			var self = this;
			
			// NOTE: We set an artifical timeout here so the keyboard has time to disappear, this
			// is primarily an Android issue, doesn't seem to occur in iOS
			setTimeout(function() {
			
				$log( "[setPassword] - Password check successful." );
				
				// Hide loading spinner
				app.hideLoadingSpinner();
				
				// Set form to no longer processing
				self._processingForm = false;
				
				// Go to another view
				app.view('register-details').show('slide-up');
			
			}, 1000);
		
		}
		
	});

})();
