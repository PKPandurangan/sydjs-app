(function() {
	
	new View('enter-password', {
		
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
				// app.trackEvent( 'googleanalytics', 'Enter Password', { category: 'view', action: 'visible' } );
				// app.trackEvent( 'mixpanel', 'Viewing Enter Password', {} );
				
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
			'.btn-submit': 'validateInput',
			'.forgot-password': 'gotoForgotPassword'
		},
		
		previous: function() {
			app.view('welcome').reveal('slide-right');
		},
		
		clearFields: function() {
		
			var self = this;
			
			_.each([ 'password' ], function(key) {
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
				password: this.field('password').val()
			};
			
			// Log data
			$log("[validateInput] - Input data to be processed:", inputData);
			
			// Validate the form data
			if (!inputData.password.trim().length) {
				self._processingForm = false;
				app.showNotification('Alert', 'Please enter your password.');
				return;
			}
			
			$log("[validateInput] - Input data passed all validation checks, saving data...");
			
			// Show loading spinner
			app.showLoadingSpinner();
			
			// Check password
			this.checkPassword(inputData);
		
		},
		
		// process the customer password
		checkPassword: function(data) {
		
			var self = this;
			
			var customerData = {
				password: data.password
			};
			
			$log("[checkPassword] - User data to be processed:", customerData);
			
			$log("[checkPassword] - Processing data...");
			
			console.log(customerData);
			
			$.ajax({
				url: config.baseURL + '/api/validate-password/' + app.data.session.codeId,
				type: 'POST',
				data: customerData,
				dataType: 'json',
				cache: false,
				success: function(rtnData) {
					
					if (rtnData.success && rtnData.session) {
					
						$log( "[checkPassword] - Password check successful.", rtnData );
						
						// Put data in local storage
						app.storeSessionInfo(rtnData.data);
						
						// Hide loading spinner
						app.hideLoadingSpinner();
						
						// Set form to no longer processing
						self._processingForm = false;
						
						// Go to another view
						app.view('home').show('slide-up');
					
					} else {
						
						$log( "[checkPassword] - Password check failed, advise user to retry details.", rtnData );
						
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
					
				},
				error: function(request, errType, err) {
					
					$log( "[checkPassword] - Update failed, advise user to retry details." );
					
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
			});
			
		},
		
		gotoForgotPassword: function() {
			window.open('http://www.contirewards.com.au/reset-password', '_system', 'location=no');
		}
		
	});

})();
