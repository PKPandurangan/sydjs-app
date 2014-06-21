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
			
			'.rsvp .btn-left': 'leftRSVP',
			'.rsvp .btn-right': 'rightRSVP',
			
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
		
		moveButtons: function(direction) {
		
			var $left = $('.rsvp .btn-left'),
				$right = $('.rsvp .btn-right');
			
			var left = '0%',
				right = '0%',
				color = [255, 255, 255],
				leftText = '',
				rightText = '';
			
			var easing = { duration: 250, easing: 'easeOutSine' };
			
			switch(direction) {
				case 'left':
					left = '75%';
					right = '25%';
					color = [114, 240, 132];
					leftText = 'Attending';
				break;
				case 'middle':
					left = '50%';
					right = '50%';
					color = [96, 216, 255];
					leftText = 'Attending';
					rightText = 'Nope';
				break;
				case 'right':
					left = '25%';
					right = '75%';
					color = [241, 119, 99];
					rightText = 'I\'m not attending';
				break;
			}
			
			$left.velocity({
				width: left,
				backgroundColorRed: color[0],
				backgroundColorGreen: color[1],
				backgroundColorBlue: color[2]
			}, easing);
			
			$right.velocity({
				width: right,
				backgroundColorRed: color[0],
				backgroundColorGreen: color[1],
				backgroundColorBlue: color[2]
			}, easing);
			
			switch(direction) {
				case 'left':
					$left.find('.icon').velocity({ opacity: 0, rotateZ: '90deg' }, easing);
					$right.find('.icon').velocity({ opacity: 1, rotateZ: '270deg' }, easing);
					$left.find('.text').text(leftText).velocity({ opacity: 1 }, easing);
					$right.find('.text').velocity({ opacity: 0 }, easing);
				break;
				case 'middle':
					$left.find('.icon').velocity({ opacity: 0, rotateZ: '90deg' }, easing);
					$right.find('.icon').velocity({ opacity: 0, rotateZ: '90deg' }, easing);
					$left.find('.text').text(leftText).velocity({ opacity: 1 }, easing);
					$right.find('.text').text(rightText).velocity({ opacity: 1 }, easing);
				break;
				case 'right':
					$left.find('.icon').velocity({ opacity: 1, rotateZ: '270deg' }, easing);
					$right.find('.icon').velocity({ opacity: 0, rotateZ: '90deg' }, easing);
					$left.find('.text').velocity({ opacity: 0 }, easing);
					$right.find('.text').text(rightText).velocity({ opacity: 1 }, easing);
				break;
			}
			
		},
		
		setState: function() {
			
			var meetup = app.data.meetup,
				user = app.data.session;
			
			// RSVP States
			var $states = this.$('.states');
			
			var $rsvp = $states.find('.rsvp'),
				$soldOut = $states.find('.sold-out'),
				$ticketsSoon = $states.find('.tickets-soon');
			
			$rsvp.hide();
			$soldOut.hide();
			$ticketsSoon.hide();
			
			if (meetup && meetup.rsvped && meetup.attending) {
				$rsvp.show();
				this.moveButtons('left');
			} else if (meetup && meetup.rsvped && !meetup.attending) {
				$rsvp.show();
				this.moveButtons('right');
			} else if (meetup && meetup.ticketsAvailable && meetup.ticketsRemaining) {
				$rsvp.show();
				this.moveButtons('middle');
			} else if (meetup && meetup.ticketsAvailable && meetup.ticketsAvailable == 0) {
				$soldOut.show();
			} else {
				$ticketsSoon.show();
			}
			
		},
		
		toggleAttending: function(options) {
			
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
				self.setState();
				
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
		
		leftRSVP: function() {
			this.toggleRSVP('left');
		},
		
		rightRSVP: function() {
			this.toggleRSVP('right');
		},
		
		toggleRSVP: function(button) {
			
			if (_.isEmpty(app.data.session)) {
				app.showConfirm('Attendance', 'You must sign in to mark your attendance.', 'No‚ thanks,Sign in', function(pressed) {
					if (pressed == 2) app.view('signin').show('slide-up');
				});
				return;
			}
			
			switch(button) {
				case 'left':
					if (app.data.meetup.rsvped && !app.data.meetup.attending) {
						this.rsvpCancel();
					} else if (!app.data.meetup.rsvped) {
						this.rsvpAttending();
					}
				break;
				
				case 'right':
					if (app.data.meetup.rsvped && app.data.meetup.attending) {
						this.rsvpCancel();
					} else if (!app.data.meetup.rsvped) {
						this.rsvpNotAttending();
					}
				break;
			}
			
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
