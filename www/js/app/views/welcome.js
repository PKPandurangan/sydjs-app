//	Enter Code
//	==========

(function() {
	
	new View('welcome', {
	
		on: {
			layout: function() {
				
				var availableHeight = app.viewportSize.height
					- this.$('.titlebar').height();
				
				this.$('.entry').css({
					'margin-top': ( availableHeight / 2 ) - ( this.$('.entry').height() / 2 )
				});
				
			},
			
			visible: function() {
				
				var self = this;
				
				this._code = [];
				
				this.field('code').on('keyup', function() {
					self.updateCode();
				});
				
				this.field('code').val('');
				
				/*
				setTimeout(function() {
					self.field('code').focus();
				}, 100);
				*/
				
				// Analytics
				app.trackEvent( 'googleanalytics', 'Welcome', { category: 'view', action: 'visible' } );
				app.trackEvent( 'mixpanel', 'Viewing Welcome', {} );
				
			},
			
			hidden: function() {
			
				this.field('code').off('keyup');
			
			}
		},
		
		buttons: {},
		
		updateCode: function() {
			this._code = this.field('code').val().toUpperCase();
			this.checkCode();
		},
		
		checkCode: function() {
			
			if (this._code.length < 6 || this._code.length > 6) return;
			
			var self = this;
			
			if ( self._processingForm ) {
				$log('[validateInput] - User tried to submit form but is already in a processing state.');
				return;
			}
			
			self._processingForm = true;
			
			app.hideKeyboard();
			
			app.showLoadingSpinner(false, function() {
				$.ajax({
					url: config.baseURL + '/api/validate-code/' + self._code + '?app=true',
					type: 'get',
					dataType: 'json',
					cache: false,
					success: function(rtnData) {
						
						if (rtnData.success && rtnData.valid) {
							
							$log( "[checkCode] - Updated processed succesfully, showing message.", rtnData );
							
							// Hide loading spinner
							app.hideLoadingSpinner();
							
							// Set form to no longer processing
							self._processingForm = false;
							
							// Set app data if we've got a valid code
							app.data.session.code = self._code;
							app.data.session.codeId = rtnData.code;
							
							// Show enter password or set password view
							if (rtnData.customer) {
								app.view('enter-password').show('slide-right');
							} else {
								app.view('set-password').show('slide-right');
							}
							
						} else {
							
							// Reset code
							self._code = [];
							self.field('code').val('');
							
							$log( "[checkCode] - Code validation failed, advise user to retry details.", rtnData );
							
							// Hide loading spinner
							app.hideLoadingSpinner();
							
							// Set form to no longer processing
							self._processingForm = false;
							
							// Show message
							app.showNotification('Alert', 'Sorry, there was a problem validating your code. Please try again.');
						
						}
					
					},
					error: function(request, errType, err) {
					
						// Reset code
						self._code = [];
						self.field('code').val('');
						
						$log( "[checkCode] - Code validation failed, advise user to retry details." );
						
						// Hide loading spinner
						app.hideLoadingSpinner();
						
						// Set form to no longer processing
						self._processingForm = false;
						
						// Show message
						app.showNotification('Alert', 'Sorry, there was a problem validating your code. Please try again.');
						
					}
				});
			});
		}
		
	});

})();
