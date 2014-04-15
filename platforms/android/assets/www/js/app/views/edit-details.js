//	Edit Details
//	============

(function() {
	
	new View('edit-details', {
		
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
				
				// Make sure the fields are populated
				this.populateFields();
				
				// Analytics
				// app.trackEvent( 'googleanalytics', 'Edit Details', { category: 'view', action: 'visible' } );
				// app.trackEvent( 'mixpanel', 'Viewing Edit Details', {} );
				
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
			'.switcher-isOptedIn': 'isOptedIn'
		},
		
		events: {
			'swipeLeft': 'isOptedIn',
			'swipeRight': 'isOptedIn'
		},
		
		previous: function() {
			app.view('home').reveal('slide-right');
		},
		
		populateFields: function() {
		
			var customer = app.data.session.customer;
			
			this.field('firstName').val(customer.name.first);
			this.field('lastName').val(customer.name.last);
			this.field('email').val(customer.email);
			this.field('phone').val(customer.phone);
			this.field('street1').val((customer.location && customer.location.street1 ? customer.location.street1 : ''));
			this.field('suburb').val((customer.location && customer.location.suburb ? customer.location.suburb : ''));
			this.field('state').val((customer.location && customer.location.state ? customer.location.state.toLowerCase() : ''));
			this.field('postcode').val((customer.location && customer.location.postcode ? customer.location.postcode : ''));
			
			this.field('birthdayDay').val(moment(customer.birthday).format('DD'));
			this.field('birthdayMonth').val(moment(customer.birthday).format('MMM'));
			this.field('birthdayYear').val(moment(customer.birthday).format('YYYY'));
			
			this.field('optedIn').val(customer.optedIn);
		
		},
		
		initState: function() {
			var $state = this.$('.state');
			$state.find('select').on('change', function() {
				$state.find('.label').html( $(this).val().toUpperCase() );
			});
			$state.find('.label').html(app.data.session.customer.location.state);
		},
		
		initDobDay: function() {
			var $dobDay = this.$('.dobDay');
			$dobDay.find('select').on('change', function() {
				$dobDay.find('.label').html( $(this).val() );
			});
			$dobDay.find('.label').html(moment(app.data.session.customer.birthday).format('DD'));
		},
		
		initDobMonth: function() {
			var $dobMonth = this.$('.dobMonth');
			$dobMonth.find('select').on('change', function() {
				$dobMonth.find('.label').html( $(this).val() );
			});
			$dobMonth.find('.label').html(moment(app.data.session.customer.birthday).format('MMM'));
		},
		
		initDobYear: function() {
			var $dobYear = this.$('.dobYear');
			$dobYear.find('select').on('change', function() {
				$dobYear.find('.label').html( $(this).val() );
			});
			$dobYear.find('.label').html(moment(app.data.session.customer.birthday).format('YYYY'));
		},
		
		clearFields: function() {
		
			var self = this;
			
			_.each([ 'firstName', 'lastName', 'email', 'phone', 'street1', 'suburb', 'state', 'postcode', 'birthdayYear', 'birthdayMonth', 'birthdayDay' ], function(key) {
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
				birthday: moment(this.field('birthdayYear').val() + '-' + this.field('birthdayMonth').val() + '-' + this.field('birthdayDay').val(), 'YYYY-MMM-DD').format('YYYY-MM-DD'),
				isOptedIn: this.field('isOptedIn').val() == 'yes' ? true : false
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
				customer: app.data.session.customer._id,
				
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
				isOptedIn: data.isOptedIn
			};
			
			$log("[saveDetails] - User data to be processed:", customerData);
			
			$log("[saveDetails] - Processing data...");
			
			console.log(customerData);
			
			$.ajax({
				url: config.baseURL + '/api/update-customer',
				type: 'POST',
				data: customerData,
				dataType: 'json',
				cache: false,
				success: function(rtnData) {
					
					if (rtnData.success) {
					
						$log( "[saveDetails] - Updated processed succesfully, showing message.", rtnData  );
						
						// Update local cached data
						_.extend(app.data.session.customer, _.pick(customerData, 'name', 'email', 'phone', 'location', 'birthday', 'isOptedIn'));
						localStorage.setItem( 'session_customer', JSON.stringify( app.data.session.customer ) );
						
						// Hide loading spinner
						app.hideLoadingSpinner();
						
						// Set form to no longer processing
						self._processingForm = false;
						
						// Show message
						app.showNotification('Alert', 'We\'ve updated your details.');
						
						// Go back home
						app.view('home').show('slide-up');
					
					} else {
						
						$log( "[saveDetails] - Update failed, advise user to retry details.", rtnData );
						
						// Hide loading spinner
						app.hideLoadingSpinner();
						
						// Set form to no longer processing
						self._processingForm = false;
						
						// Show message
						app.showNotification('Alert', 'Sorry, your details could not be updated. Please try again.');
					
					}
					
				},
				error: function(request, errType, err) {
					
					$log( "[saveDetails] - Update failed, advise user to retry details." );
					
					// Hide loading spinner
					app.hideLoadingSpinner();
					
					// Set form to no longer processing
					self._processingForm = false;
					
					// Show message
					app.showNotification('Alert', 'Sorry, your details could not be updated. Please try again.');
				
				}
			});
			
		},
		
		isOptedIn: function(e) {
		
			var $switcher = this.$('.switcher'),
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
		
		}
		
	});

})();
