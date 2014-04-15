//	Register Details
//	================

(function() {
	
	new View('register-details', {
		
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
				
				// Initalise select fields
				this.initState();
				this.initDobDay();
				this.initDobMonth();
				this.initDobYear();
				
				// Analytics
				// app.trackEvent( 'googleanalytics', 'Edit Details', { category: 'view', action: 'visible' } );
				// app.trackEvent( 'mixpanel', 'Viewing Edit Details', {} );
				
			},
			hidden: function() {
				
				// We don't clear field here, only if registration is successful, otherwise if we view the terms & conditions, the fields are cleared
				// this.clearFields();
				
				// Android: Disable orientation detection temporarily to prevent keyboard from triggering it
				if ( app._device.system == 'android' ) {
					$('#viewport').removeClass( 'ignore-orientation' );
				}
				
			}
		},
		
		buttons: {
			'.btn-back': 'previous',
			'.btn-submit': 'validateInput',
			'.switcher-isOptedIn': 'isOptedIn',
			'.switcher-doesAgreeToTermsAndConditions': 'doesAgreeToTermsAndConditions',
			'.terms-and-conditions': 'viewTermsAndConditions'
		},
		
		events: {
			'swipeLeft': 'isOptedIn',
			'swipeRight': 'isOptedIn'
		},
		
		previous: function() {
			app.view('welcome').reveal('slide-right');
		},
		
		initState: function() {
			var $state = this.$('.state');
			$state.find('select').on('change', function() {
				$state.find('.label').html( $(this).val().toUpperCase() );
			});
		},
		
		initDobDay: function() {
			var $dobDay = this.$('.dobDay');
			$dobDay.find('select').on('change', function() {
				$dobDay.find('.label').html( $(this).val() );
			});
		},
		
		initDobMonth: function() {
			var $dobMonth = this.$('.dobMonth');
			$dobMonth.find('select').on('change', function() {
				$dobMonth.find('.label').html( $(this).val() );
			});
		},
		
		initDobYear: function() {
			var $dobYear = this.$('.dobYear');
			$dobYear.find('select').on('change', function() {
				$dobYear.find('.label').html( $(this).val() );
			});
		},
		
		clearFields: function() {
		
			var self = this;
			
			_.each([ 'firstName', 'lastName', 'email', 'phone', 'street1', 'suburb', 'state', 'postcode', 'birthdayYear', 'birthdayMonth', 'birthdayDay' ], function(key) {
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
				password: app.view('set-password').field('password').val(),
				code: app.data.session.codeId,
				
				name: {
					first: this.field('firstName').val(),
					last: this.field('lastName').val()
				},
				email: this.field('email').val(),
				phone: this.field('phone').val(),
				location: {
					street1: this.field('street1').val(),
					suburb: this.field('suburb').val(),
					state: this.field('state').val().toUpperCase(),
					postcode: this.field('postcode').val()
				},
				birthday: moment(this.field('birthdayYear').val() + '-' + this.field('birthdayMonth').val() + '-' + this.field('birthdayDay').val(), 'YYYY-MMM-DD').toDate(),
				isOptedIn: this.field('isOptedIn').val() == 'yes' ? true : false,
				doesAgreeToTermsAndConditions: this.field('doesAgreeToTermsAndConditions').val() == 'yes' ? true : false
			};
			
			// Log data
			$log("[validateInput] - Input data to be processed:", inputData);
			
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
			
			if (!inputData.phone.trim().length) {
				self._processingForm = false;
				app.showNotification('Alert', 'Please enter your phone number.');
				return;
			}
			
			if (!inputData.location.street1.trim().length || !inputData.location.suburb.trim().length || !inputData.location.state.trim().length || !inputData.location.postcode.trim().length) {
				self._processingForm = false;
				app.showNotification('Alert', 'Please enter your address (street, suburb, state, postcode)');
				return;
			}
			
			if (!inputData.doesAgreeToTermsAndConditions) {
				self._processingForm = false;
				app.showNotification('Alert', 'Please agree to the terms & conditions');
				return;
			}
			
			$log("[validateInput] - Input data passed all validation checks, saving data...");
			
			// Show loading spinner
			app.showLoadingSpinner();
			
			// Save details
			this.saveDetails(inputData);
		
		},
		
		// process the customers details
		saveDetails: function(data) {
		
			var self = this;
			
			var customerData = {
				password: data.password,
				code: data.code,
				
				name: data.name,
				email: data.email,
				phone: data.phone,
				location: {
					street1: data.location.street1,
					suburb: data.location.suburb,
					state: data.location.state,
					postcode: data.location.postcode
				},
				birthday: data.birthday,
				isOptedIn: data.isOptedIn,
				doesAgreeToTermsAndConditions: data.doesAgreeToTermsAndConditions
			};
			
			$log("[saveDetails] - User data to be processed:", customerData);
			
			$log("[saveDetails] - Processing data...");
			
			console.log(customerData);
			
			$.ajax({
				url: config.baseURL + '/api/create-customer',
				type: 'POST',
				data: customerData,
				dataType: 'json',
				cache: false,
				success: function(rtnData) {
					
					if (rtnData.success) {
					
						$log( "[saveDetails] - Updated processed succesfully, showing message.", rtnData  );
						
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
					
					} else {
						
						$log( "[saveDetails] - Update failed, advise user to retry details.", rtnData );
						
						// Hide loading spinner
						app.hideLoadingSpinner();
						
						// Set form to no longer processing
						self._processingForm = false;
						
						// Show message
						app.showNotification('Alert', 'Sorry, your account could not be created. Please try again.\n\n' + rtnData.message);
					
					}
					
				},
				error: function(request, errType, err) {
					
					$log( "[saveDetails] - Update failed, advise user to retry details." );
					
					// Hide loading spinner
					app.hideLoadingSpinner();
					
					// Set form to no longer processing
					self._processingForm = false;
					
					// Show message
					app.showNotification('Alert', 'Sorry, your account could not be created. Please try again.\n\n' + rtnData.message);
				
				}
			});
			
		},
		
		isOptedIn: function(e) {
		
			var $switcher = this.$('.switcher-isOptedIn.switcher'),
				$handle = $switcher.find( '.handle' ),
				$state = $switcher.find( '.state' );
			
			var on = $switcher.hasClass( 'on' );
			
			if ( e && e.type && e.type == 'swipeRight' && on )
				return;
			
			if ( e && e.type && e.type == 'swipeLeft' && !on )
				return;
			
			$state.text( on ? 'Off' : 'On' );
			
			$state.css( 'opacity', 0 );
			$state.animate({ opacity: 1 });
			
			$switcher.removeClass( 'on off' );
			$switcher.addClass( on ? 'off' : 'on' );
			
			this.field('isOptedIn').val( on ? 'no' : 'yes' );
		
		},
		
		doesAgreeToTermsAndConditions: function(e) {
		
			var $switcher = this.$('.switcher-doesAgreeToTermsAndConditions.switcher'),
				$handle = $switcher.find( '.handle' ),
				$state = $switcher.find( '.state' );
			
			var on = $switcher.hasClass( 'on' );
			
			if ( e && e.type && e.type == 'swipeRight' && on )
				return;
			
			if ( e && e.type && e.type == 'swipeLeft' && !on )
				return;
			
			$state.text( on ? 'Off' : 'On' );
			
			$state.css( 'opacity', 0 );
			$state.animate({ opacity: 1 });
			
			$switcher.removeClass( 'on off' );
			$switcher.addClass( on ? 'off' : 'on' );
			
			this.field('doesAgreeToTermsAndConditions').val( on ? 'no' : 'yes' );
		
		},
		
		viewTermsAndConditions: function(e) {
			app.view('terms-and-conditions').show('slide-up');
		}
		
	});

})();
