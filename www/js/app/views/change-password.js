(function() {
	
	new View('change-password', {
		
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
				// app.trackEvent( 'googleanalytics', 'Change Password', { category: 'view', action: 'visible' } );
				// app.trackEvent( 'mixpanel', 'Viewing Change Password', {} );
				
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
			app.view('home').reveal('slide-right');
		},
		
		clearFields: function() {
		
			var self = this;
			
			_.each([ 'newPassword', 'passwordConfirm' ], function(key) {
				self.field(key).val('');
			});
		
		},
		
		// Validate input and tokenise the card
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
				newPassword: this.field('new-password').val(),
				passwordConfirm: this.field('password-confirm').val()
			};
			
			// Log data
			$log("[validateInput] - Input data to be processed:", inputData);
			
			// Validate the form data
			if (!inputData.newPassword.trim().length || !inputData.passwordConfirm.trim().length) {
				self._processingForm = false;
				app.showNotification('Alert', 'Please enter your current and new password.');
				return;
			}
			
			if (inputData.newPassword.trim() != inputData.passwordConfirm.trim()) {
				self._processingForm = false;
				app.showNotification('Alert', 'Your new password must match! Please try again.');
				return;
			}
			
			if (inputData.newPassword.trim().length < 6) {
				self._processingForm = false;
				app.showNotification('Alert', 'Your new password must be at least 6 characters.');
				return;
			}
			
			$log("[validateInput] - Input data passed all validation checks, saving data...");
			
			// Show loading spinner
			app.showLoadingSpinner();
			
			// Update password
			this.updatePassword(inputData);
		
		},
		
		// process the customer password
		updatePassword: function(data) {
		
			var self = this;
			
			var customerData = {
				customer: app.data.session.customer._id,
				
				newPassword: data.newPassword,
				passwordConfirm: data.passwordConfirm
			};
			
			$log("[updatePassword] - User data to be processed:", customerData);
			
			$log("[updatePassword] - Processing data...");
			
			console.log(customerData);
			
			$.ajax({
				url: config.baseURL + '/api/update-password',
				type: 'POST',
				data: customerData,
				dataType: 'json',
				cache: false,
				success: function(rtnData) {
					
					if (rtnData.success) {
					
						$log( "[updatePassword] - Password update successful.", rtnData );
						
						// Hide loading spinner
						app.hideLoadingSpinner();
						
						// Set form to no longer processing
						self._processingForm = false;
						
						// Show message
						app.showNotification('Alert', 'We\'ve updated your password.');
						
						// Go to back home
						app.view('home').show('slide-up');
					
					} else {
						
						$log( "[updatePassword] - Password update failed, advise user to retry details.", rtnData );
						
						// Hide loading spinner
						app.hideLoadingSpinner();
						
						// Set form to no longer processing
						self._processingForm = false;
						
						// Show message
						app.showNotification('Alert', 'Sorry, we couldn\'t update your password, please try again.');
					
					}
					
				},
				error: function(request, errType, err) {
					
					$log( "[updatePassword] - Update failed, advise user to retry details." );
					
					// Hide loading spinner
					app.hideLoadingSpinner();
					
					// Set form to no longer processing
					self._processingForm = false;
					
					// Show message
					app.showNotification('Alert', 'Sorry, we couldn\'t update your password, please try again.');
				
				}
			});
			
		}
		
	});

})();
