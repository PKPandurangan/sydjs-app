//	Reward Payment
//	==============

(function() {
	
	new View('reward-payment', {
		
		on: {
			layout: function() {
				var availableHeight = app.viewportSize.height
					- this.$('.titlebar').height()
					- this.$('.toolbar').height();
				
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
				// app.trackEvent( 'googleanalytics', 'Reward Payment', { category: 'view', action: 'visible' } );
				// app.trackEvent( 'mixpanel', 'Viewing Reward Payment', {} );
				
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
			app.view('reward-options').reveal('slide-right');
		},
		
		// Takes a model and populates its view from it
		populate: function(location, voucherType) {
		
			var $type = this.$('.type'),
				$cinema = this.$('.cinema'),
				$method = this.$('.method'),
				$note = this.$('.note');
			
			this._voucherType = voucherType;
			this._cinemaChoice = location.get('_id');
			
			$type.text('2 for 1 Movie Voucher');
			$cinema.text(location.get('name'));
			$method.text(voucherType == 'email' ? 'e-Voucher' : 'Postal');
			
			$note.html('Your card will be charged <span class="cost">' + location.get('formattedTicketPrice') + '</span> for two movie vouchers, sent to your ' + (voucherType == 'email' ? 'email' : 'postal') + ' address.<br>Total includes $2.50 admin fee')
		
		},
		
		clearFields: function() {
		
			var self = this;
			
			_.each([ 'cinemaTicketPurchase', 'cardName', 'cardNumber', 'expiryMonth', 'expiryYear', 'cardCSV' ], function(key) {
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
				cinemaTicketPurchase: this.field('cinemaTicketPurchase').val(),
				
				cardName: this.field('cardName').val(),
				cardNumber: this.field('cardNumber').val().trim(),
				expiryMonth: this.field('expiryMonth').val(),
				expiryYear: this.field('expiryYear').val(),
				cardCSV: this.field('cardCSV').val()
			};
			
			// Make sure expiry date is prefixed if it's only 1 character
			// so it's process properly
			if ( inputData.expiryMonth.length == 1 ) {
				inputData.expiryMonth = '0' + inputData.expiryMonth;
			}
			
			if ( inputData.expiryYear.length == 1 ) {
				inputData.expiryYear = '0' + inputData.expiryYear;
			}
			
			// Log data
			$log("[validateInput] - Input data to be processed:", inputData);
			
			// Validate the form data
			if (!inputData.cardName.length) {
				self._processingForm = false;
				app.showNotification('Alert', 'Please enter your card name.');
				return;
			}
			
			if (!inputData.cardNumber.length) {
				self._processingForm = false;
				app.showNotification('Alert', 'Please enter your card number.');
				return;
			}
			
			if (!inputData.expiryMonth.length) {
				self._processingForm = false;
				app.showNotification('Alert', 'Please enter your card expiry month.');
				return;
			}
			
			if (!inputData.expiryYear.length) {
				self._processingForm = false;
				app.showNotification('Alert', 'Please enter your card expiry year.');
				return;
			}
			
			if (!inputData.cardCSV.length) {
				self._processingForm = false;
				app.showNotification('Alert', 'Please enter your card CSV.');
				return;
			}
			
			$log("[validateInput] - Input data passed all validation checks, saving data...");
			
			// Show loading spinner
			app.showLoadingSpinner();
			
			// Process claim
			this.processClaim(inputData);
		
		},
		
		// process the claim
		processClaim: function(data) {
		
			var self = this;
			
			var customerData = {
				customer: app.data.session.customer._id,
				
				reward: 'cinema',
				
				voucherType: this._voucherType,
				cinemaChoice: this._cinemaChoice,
				formData: {
					cinemaTicketPurchase: data.cinemaTicketPurchase,
					
					cardName: data.cardName,
					cardNumber: data.cardNumber,
					expiryMonth: data.expiryMonth,
					expiryYear: data.expiryYear,
					cardCSV: data.cardCSV
				}
			};
			
			$log("[processClaim] - User data to be processed:", customerData);
			
			$log("[processClaim] - Processing data...");
			
			console.log(customerData);
			
			$.ajax({
				url: config.baseURL + '/api/claim-reward',
				type: 'POST',
				data: customerData,
				dataType: 'json',
				cache: false,
				success: function(rtnData) {
					
					if (rtnData.success) {
					
						$log( "[processClaim] - Claim processed succesfully.", rtnData );
						
						// Add claim to collection
						collections.claims.add(rtnData.claim);
						
						// Mark it as selected
						// TODO: Clean this up
						collections.claims.last().set('selected', true);
						
						// Mark as claimed today
						app.data.session.claimedToday.cinema = true;
						
						// Save updated data into storage
						localStorage.setItem( 'session_claimedToday', JSON.stringify( app.data.session.claimedToday ) );
						
						// Hide loading spinner
						app.hideLoadingSpinner();
						
						// Populate voucher success details
						app.view('voucher-success').populate('cinema');
						
						// Go to another view
						app.view('voucher-success').show('slide-up');
					
					} else {
						
						$log( "[processClaim] - Claim failed, advise user to retry details.", rtnData );
						
						// Hide loading spinner
						app.hideLoadingSpinner();
						
						// Set form to no longer processing
						self._processingForm = false;
						
						// Set cinema ticket purchase (if we have one)
						if (rtnData.claim.cinemaTicketPurchase) {
							app.view('reward-payment').field('cinemaTicketPurchase').val(rtnData.claim.cinemaTicketPurchase._id);
						}
						
						// Show message
						app.showNotification('Alert', 'Sorry, your claim could not be processed. Please try again.');
					
					}
					
				},
				error: function(request, errType, err) {
					
					$log( "[processClaim] - Claim failed, advise user to retry details.", rtnData );
					
					// Hide loading spinner
					app.hideLoadingSpinner();
					
					// Set form to no longer processing
					self._processingForm = false;
					
					// Show message
					app.showNotification('Alert', 'Sorry, your claim could not be processed. Please try again.');
				
				}
			});
			
		}
		
	});

})();
