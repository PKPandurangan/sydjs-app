(function() {
	
	new View('home', {
		
		initialize: function() {
		
			//
		
		},
		
		on: {
			layout: function() {
				
				var availableHeight = app.viewportSize.height -
					this.$('.statusbar').height();
				
				this.$('.container').css({
					height: availableHeight,
					top: this.$('.statusbar').height()
				});
				
			},
			visible: function() {
				
				this.setNotifications();
				this.setMeetup();
				this.setState();
				
				// iOS: Change status bar style to match view style
				app.changeStatusBarStyle('white');
				
				// analytics
				app.trackEvent({ label: 'Home', category: 'view', action: 'visible' });
				
			}
		},
		
		buttons: {
			'.btn-notifications': 'toggleNotifications',
			'.btn-talks': 'toggleTalks',
			
			'.btn-about': 'viewAbout',
			
			'.btn-calendar': 'addToCalendar',
			
			'.rsvp .btn-attending': 'rsvpAttending',
			'.rsvp .btn-not-attending': 'rsvpNotAttending',
			
			'.rsvp-not-attending .btn-cancel': 'rsvpCancel',
			
			'.rsvp-attending .btn-cancel': 'rsvpCancel'
		},
		
		toggleNotifications: function() {
		
			if (!app._device.system || !app._device.system.match(/ios|android/)) {
				app.hideLoadingSpinner();
				return app.showNotification('Alert', 'Sorry, notification functionality can only be configured on actual devices.');
			}
			
			var self = this;
			
			var pushNotifications = app.data.pushNotifications;
			
			if (pushNotifications.isConfigured) {
				if (pushNotifications.enabled) {
					app.showLoadingSpinner();
					app.disableNotifications(function() {
						self.setNotifications();
						app.hideLoadingSpinner();
					});
				} else {
					app.showLoadingSpinner();
					app.enableNotifications(function() {
						self.setNotifications();
						app.hideLoadingSpinner();
					});
				}
			} else {
				app.showConfirm('New Meetups', 'Would you like a notification when a new meetup is announced?', 'No‚ thanks,Notify Me', function(pressed) {
					switch(pressed) {
						case 1: // No
							// app.showNotification('Alert', 'User declined enable notifications.');
						break;
						case 2: // Yes
							app.showLoadingSpinner();
							app.enableNotifications(function() {
								self.setNotifications();
								app.hideLoadingSpinner();
							});
						break;
					}
				});
			}
		
		},
		
		toggleTalks: function() {
			
			this.$('.states').velocity({
				translateX: 0,
				translateY: 0
			}, {
				duration: 300,
				easing: 'easeOutSine'
			});
			
			app.view('talks').show('slide-up');
			
		},
		
		viewAbout: function() {
			app.view('about').show('slide-down');
		},
		
		setNotifications: function() {
		
			if (_.isEmpty(app.data.session)) return;
			
			var pushNotifications = app.data.pushNotifications;
			
			var $notifications = this.$('.btn-notifications');
			
			$notifications.html('<img src="img/ui/icon-alarm-white.svg" />');
			
			if (pushNotifications.isConfigured && pushNotifications.enabled) {
				$notifications.html('<img src="img/ui/icon-alarm-green.svg" />');
			}
		
		},
		
		setMeetup: function() {
		
			var meetup = app.data.meetup;
			
			var $talks = this.$('.btn-talks');
			
			var $days = this.$('.meetup-days'),
				$date = this.$('.meetup-date');
			
			var $calendar = this.$('.btn-calendar');
			
			var from = meetup ? _.first(meetup.time.split('-')).trim() : false,
				date = meetup ? moment(meetup.date + (from ? ' ' + from : ''), 'YYYY-MM-DD' + (from ? ' ha' : '')) : false;
			
			$days.html(meetup ? date.fromNow(true) : 'Standby');
			$date.html(meetup ? date.format('ddd, DD MMMM YYYY') : 'Sharkie\'s on it...');
			
			$calendar[meetup ? 'show' : 'hide']();
			$talks[meetup ? 'show' : 'hide']();
			
			meetup && $calendar.find('.number').html(date.format('DD'));
		
		},
		
		addToCalendar: function() {
			
			if (!app._device.system || !app._device.system.match(/ios|android/)) {
				return app.showNotification('Alert', 'Sorry, calendar functionality can only be configured on actual devices.');
				return;
			}
			
			var meetup = app.data.meetup;
			
			if (!meetup) return;
			
			var startDate = moment(meetup.date).add('hours', 18).toDate(),
				endDate = moment(meetup.date).add('hours', 21).toDate();
			
			var title = 'SydJS',
				location = 'Level 6, 341 George St',
				notes = meetup.name;
			
			var success = function() {
				app.showNotification('Added', 'The next meetup has been added to your calendar.');
			}
			
			var error = function() {
				app.showNotification('Not Added', 'The next meetup couldn\'t be added to your calendar.');
			}
			
			var reminders = {
				firstReminderMinutes: 60,
				secondReminderMinutes: null
			}
			
			window.plugins.calendar.createEventWithOptions(title, location, notes, startDate, endDate, reminders, success, error);
			
		},
		
		setState: function() {
		
			var meetup = app.data.meetup,
				user = app.data.session;
			
			// RSVP States
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
			
			if (meetup && meetup.rsvped && meetup.attending) {
				$rsvpAttending.show();
			} else if (meetup && meetup.rsvped && !meetup.attending) {
				$rsvpNotAttending.show();
			} else if (meetup && meetup.ticketsAvailable && meetup.ticketsRemaining) {
				$rsvp.show();
			} else if (meetup && meetup.ticketsAvailable && meetup.ticketsAvailable == 0) {
				$soldOut.show();
			} else {
				$ticketsSoon.show();
			}
			
			// Animate in state
			/*
			$states.css({
				transform: 'translateX(0px) translateY(0px)',
				'-webkit-transform': 'translateX(0px) translateY(0px)'
			});
			*/
			
			setTimeout(function() {
				$states.velocity({
					translateX: 0,
					translateY: -75
				}, {
					duration: 250,
					easing: 'easeOutSine'
				});
			}, 500);
			
		},
		
		toggleAttending: function(options) {
		
			if (_.isEmpty(app.data.session)) {
				app.showConfirm('Attendance', 'You must sign in to mark your attendance.', 'No‚ thanks,Sign in', function(pressed) {
					if (pressed == 2) app.view('signin').show('slide-up');
				});
				return;
			}
			
			var self = this;
			
			var user = app.data.session;
			
			var rsvpData = {
				user: user.userId,
				meetup: app.data.meetup.id,
				attending: options.attending,
				cancel: options.cancel
			};
			
			var success = function(data) {
				
				console.log("[toggleAttending] - RSVP successful.", data);
				
				// Update local cached data
				app.data.meetup.attending = rsvpData.attending;
				app.data.meetup.rsvped = !options.cancel ? true : false;
				
				// Hide loading spinner
				app.hideLoadingSpinner();
				
				// Set form to no longer processing
				self._processingForm = false;
				
				// Update status
				self.$('.states').velocity({
					translateX: 0,
					translateY: 0
				}, {
					duration: 250,
					easing: 'easeOutSine',
					complete: function() {
						self.setState();
					}
				});
				
			}
			
			var error = function(data) {
				
				console.log("[toggleAttending] - RSVP failed, advise user to retry.", data);
				
				// Hide loading spinner
				app.hideLoadingSpinner();
				
				// Set form to no longer processing
				self._processingForm = false;
				
				// Show message
				app.showNotification('Alert', 'Sorry, we couldn\'t mark your attendance, please try again.' + data ? '\n\n' + data.message : '');
				
			}
			
			$.ajax({
				url: app.getAPIEndpoint('rsvp'),
				type: 'post',
				data: rsvpData,
				dataType: 'json',
				cache: false,
				success: function(data) {
					return data.success ? success(data) : error(data);
				},
				error: function() {
					return error();
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
