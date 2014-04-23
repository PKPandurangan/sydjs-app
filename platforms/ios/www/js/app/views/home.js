(function() {
	
	new View('home', {
		
		initialize: function() {
		
			//
		
		},
		
		on: {
			layout: function() {
				
				var availableHeight = app.viewportSize.height
					- this.$('.titlebar').height()
					- this.$('.toolbar').height();
					
				this.$('.container').css({
					height: availableHeight,
					top: this.$('.titlebar').height()
				});
				
			},
			visible: function() {
				
				this.setState();
				
				// Analytics
				// app.trackEvent( 'googleanalytics', 'Rewards', { category: 'view', action: 'visible' } );
				// app.trackEvent( 'mixpanel', 'Viewing Rewards', {} );
				
			}
		},
		
		buttons: {
			'.btn-notifications': 'toggleNotifications',
			'.btn-talks': 'toggleTalks',
			
			'.rsvp .btn-attending': 'rsvpAttending',
			'.rsvp .btn-not-attending': 'rsvpNotAttending',
			
			'.rsvp-not-attending .btn-cancel': 'rsvpCancel',
			
			'.rsvp-attending .btn-cancel': 'rsvpCancel'
		},
		
		toggleNotifications: function() {
			console.log('toggle notifications');
		},
		
		toggleTalks: function() {
			console.log('toggle menu');
		},
		
		setState: function() {
		
			var status = app.data.status.meetup;
			
			var $states = this.$('.states');
			
			var $rsvp = $states.find('.rsvp'),
				$rsvpNotAttending = $states.find('.rsvp-not-attending'),
				$rsvpAttending = $states.find('.rsvp-attending'),
				$soldOut = $states.find('.sold-out'),
				$ticketsSoon = $states.find('.tickets-soon');
			
			$rsvp.hide();
			$rsvpNotAttending.hide();
			$rsvpAttending.hide();
			$soldOut.hide();
			$ticketsSoon.hide();
			
			if (status.rsvped && status.attending) {
				$rsvpAttending.show();
			} else if (status.rsvped && !status.attending) {
				$rsvpNotAttending.show();
			} else if (status.ticketsAvailable && status.ticketsRemaining) {
				$rsvp.show();
			} else if (status.ticketsAvailable && status.ticketsAvailable == 0) {
				$soldOut.show();
			} else {
				$ticketsSoon.show();
			}
			
			// Animate in state
			$states.css('transform', 'translate3d(0,0,0)');
			
			setTimeout(function() {
				$states.animate({
					translate3d: '0,-75px,0'
				}, 250, 'ease-out');
			}, 300);
			
		},
		
		toggleAttending: function(options) {
		
			var self = this;
			
			var rsvpData = {
				user: app.data.session.user.id,
				meetup: app.data.status.meetup.id,
				attending: options.attending,
				cancel: options.cancel
			};
			
			$.ajax({
				url: config.baseURL + '/api/app/rsvp',
				type: 'post',
				data: rsvpData,
				dataType: 'json',
				cache: false,
				success: function(rtnData) {
					
					if (rtnData.success) {
					
						$log( "[toggleAttending] - RSVP successful.", rtnData );
						
						// Update local cached data
						app.data.status.meetup.attending = rsvpData.attending;
						app.data.status.meetup.rsvped = !options.cancel ? true : false;
						
						// Hide loading spinner
						app.hideLoadingSpinner();
						
						// Set form to no longer processing
						self._processingForm = false;
						
						// Update status
						self.$('.states').animate({
							translate3d: '0,0,0'
						}, 250, 'ease-out', function() {
							self.setState();
						});
					
					} else {
						
						$log( "[toggleAttending] - Password check failed, advise user to retry details.", rtnData );
						
						// Hide loading spinner
						app.hideLoadingSpinner();
						
						// Set form to no longer processing
						self._processingForm = false;
						
						// Show message
						app.showNotification('Alert', 'Sorry, we couldn\'t validate your password, please try again.');
					
					}
					
				},
				error: function(request, errType, err) {
					
					$log( "[toggleAttending] - Update failed, advise user to retry details." );
					
					// Hide loading spinner
					app.hideLoadingSpinner();
					
					// Set form to no longer processing
					self._processingForm = false;
					
					// Show message
					app.showNotification('Alert', 'Sorry, we couldn\'t validate your password, please try again.');
				
				}
			});
		
		},
		
		rsvpAttending: function() {
			this.toggleAttending({ attending: true });
		},
		
		rsvpNotAttending: function() {
			this.toggleAttending({ attending: false });
		},
		
		rsvpCancel: function() {
			this.toggleAttending({ attending: false, cancel: true });
		}
		
	});
	
})();
