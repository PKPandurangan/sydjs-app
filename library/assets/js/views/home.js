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
				
				this.$('.corners').css({
					top: this.$('.statusbar').height()
				});
				
				this.$('.menu').css({
					height: app.viewportSize.height
				});
				
			},
			visible: function() {
				
				var self = this;
				
				this.setBackground();
				this.showBackground();
				
				this.animateView();
				
				this.setNotifications();
				this.setMeetup();
				this.setState(true);
				this.setSession();
				
				// preload green notifications icon
				var $image = $(new Image());
					$image.prop('src', 'img/ui/icon-alarm-green.svg');
				
				// check for a pending action (if a user clicked attend/not attend and
				// they come back from signup)
				if (this._action) {
					if (_.isEmpty(app.data.session)) return this._action = undefined;
					setTimeout(function() {
						switch(self._action) {
							case 'attending': self.rsvpAttending(); break;
							case 'notAttending': self.rsvpNotAttending(); break;
						}
						self._action = undefined;
					}, 750);
				}
				
				// add shake event for easter egg
				this._shakes = 0;
				if (window.shake) {
					window.shake.startWatch(function() {
						self._shakes++;
						if (self._shakes == 3) {
							setTimeout(function() { self.easterEgg(); }, 500);
							if (navigator.notification && navigator.notification.vibrate) navigator.notification.vibrate(1000);
							self._shakes = 0;
						}
					});
				}
				
				// iOS: Change status bar style to match view style
				app.changeStatusBarStyle('white');
				
				// analytics
				app.trackEvent({ label: 'Home', category: 'view', action: 'visible' });
				
			},
			
			hidden: function() {
			
				// make sure menu is hidden
				this.toggleMenu(true);
				
				// disable parallaxify background
				this._parallaxify && this._parallaxify.data('plugin_parallaxify').destroy();
				
				// stop watching for shake event
				if (window.shake) window.shake.stopWatch();
				
				// hide any squid
				this.$('.squid').hide();
			
			}
		},
		
		buttons: {
			'.corners .btn-menu': 'toggleMenu',
			'.corners .btn-logo': 'viewTalks',
			'.corners .btn-notifications': 'toggleNotifications',
			
			'.container .btn-meetup': 'viewTalks',
			'.container .actions .btn-talks': 'viewTalks',
			'.container .actions .btn-calendar': 'addToCalendar',
			
			'.container .rsvp .btn-left': 'leftRSVP',
			'.container .rsvp .btn-right': 'rightRSVP',
			
			'.container .rsvp-not-attending .btn-cancel': 'rsvpCancel',
			'.container .rsvp-attending .btn-cancel': 'rsvpCancel',
			
			'.menu .btn-join': 'menuJoin',
			'.menu .btn-signout': 'menuSignout',
			'.menu .btn-about': 'menuAbout',
			'.menu .btn-credits': 'menuCredits',
		},
		
		setBackground: function() {
			
			var $background = this.$('.background');
			
			$background.css('margin-left', -(410 - (app.viewportSize.width / 2)));
			$background.css('margin-top', -(361 - (app.viewportSize.height / 2))); // 400
			
			this._parallaxify = this.$el.parallaxify({
				positionProperty: 'transform',
				motionType: 'gaussian',
				useMouseMove: false,
				alphaFilter: 0.9,
				adjustBasePosition: false
			});
			
		},
		
		showBackground: function() {
			
			// velocity causes visual artifacts if it's used for opacity
			// using a standard css transition here
			this.$('.background').addClass('show');
			
		},
		
		animateView: function() {
		
			var self = this;
			
			if (this._animated) return;
			
			var meetup = app.data.meetups.next;
			
			var $logo = this.$('.logo');
			
			var availableHeight = app.viewportSize.height - this.$('.statusbar').height();
			
			// If it's the first time this view is visible, animate the elements in
			var logoHeight = $logo.height(),
				meetupHeight = this.$('.meetup').height();
			
			var logoPosition = (availableHeight / 2) - ($logo.height() / 2) - this.$('.statusbar').height();
			
			$logo.css('marginTop', logoPosition);
			
			$logo.velocity({
				opacity: 0
			}, {
				duration: 300, easing: 'easeOut', complete: function() {
				
				self.$('.meetup').css({
					marginTop: ((availableHeight / 2) - (self.$('.meetup').height() / 2) - self.$('.statusbar').height()) + 10
				});
				
				self.$('.btn-menu').css('top', -15);
				self.$('.btn-logo').css('top', -15);
				self.$('.btn-notifications').css('top', -15);
				
				setTimeout(function() {
					self.$('.btn-menu').velocity({ top: 0, opacity: 1 }, { duration: 500, easing: 'easeOutSine' });
					self.$('.btn-logo').velocity({ top: 0, opacity: 1 }, { duration: 500, easing: 'easeOutSine' });
					self.$('.btn-notifications').velocity({ top: 0, opacity: 1 }, { duration: 500, easing: 'easeOutSine' });
				}, 400);
				
				setTimeout(function() {
					self.$('.meetup').velocity({ opacity: 1 }, { duration: 500, easing: 'easeOutSine' });
				}, 0);
				
				setTimeout(function() {
					self.$('.states').velocity({ bottom: 0 }, { duration: 500, easing: 'easeOutSine' });
				}, 300);
				
				setTimeout(function() {
					meetup && meetup.rsvped && meetup.attending && self.animateCalendar('up');
				}, 750);
				
			}});
			
			this._animated = true;
		
		},
		
		animateCalendar: function(direction) {
			
			return;
			
			var self = this;
			
			var $calendar = this.$('.btn-calendar'),
				$meetup = this.$('.meetup');
			
			var duration = 500,
				easing = 'easeOutSine';
			
			var meetupPosition = function() {
				return parseInt(self.$('.meetup').css('margin-top'));
			}
			
			switch(direction) {
				case 'up':
				
					if ($calendar.is(':visible')) return;
					
					$meetup.velocity({
						marginTop: meetupPosition() - 40
					}, { duration: duration, easing: easing });
					
					$calendar.show();
					$calendar.css({
						opacity: 0,
						marginTop: meetupPosition() + 140,
						marginLeft: app.viewportSize.width / 2 - $calendar.width() / 2
					});
					
					$calendar.velocity({
						marginTop: meetupPosition() + 100,
						opacity: 1
					}, { duration: duration, easing: easing });
				
				break;
				
				case 'down':
				
					if (!$calendar.is(':visible')) return;
					
					$meetup.velocity({
						marginTop: meetupPosition() + 40
					}, { duration: duration, easing: easing });
					
					$calendar.velocity({
						marginTop: meetupPosition() + 180,
						opacity: 0
					}, { duration: duration, easing: easing, complete: function() {
						$calendar.hide();
					}});
				
				break;
			}
		
		},
		
		toggleMenu: function(hideOnly) {
			
			var self = this;
			
			if (this._menuOpen) {
				this.$('.btn-menu .cross').removeClass('open');
				this.$('.menu').velocity({
					opacity: 0
				}, { duration: 150, easing: 'easeOutSine', complete: function() {
					self.$('.menu').hide();
				}});
				this._menuOpen = false;
				return;
			}
			
			if (typeof hideOnly == 'boolean') return;
			
			this._menuOpen = true;
			
			var availableHeight = app.viewportSize.height -
				this.$('.statusbar').height();
			
			this.$('.menu').css('opacity', 0).show();
			
			this.$('.buttons').css({
				marginTop: (availableHeight / 2) - (this.$('.buttons').height() / 2) + this.$('.statusbar').height()
			});
			
			this.$('.btn-menu .cross').addClass('open');
			
			this.$('.menu').velocity({
				opacity: 1
			}, { duration: 150, easing: 'easeOutSine' });
			
		},
		
		toggleNotifications: function() {
		
			if (!app._device.system || !app._device.system.match(/ios|android/)) {
				app.hideLoadingSpinner();
				return app.showNotification('Alert', 'Sorry, notification functionality can only be configured on actual devices.');
			}
			
			var self = this;
			
			var pushNotifications = app.data.user.pushNotifications;
			
			if (pushNotifications) {
				app.showLoadingSpinner();
				app.disableNotifications(function() {
					self.setNotifications();
					app.hideLoadingSpinner();
				});
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
		
		viewTalks: function() {
			app.view('talks').show('slide-up');
		},
		
		setNotifications: function() {
			
			var pushNotifications = app.data.user.pushNotifications;
			
			var $notifications = this.$('.btn-notifications');
			
			$notifications.html('<img src="img/ui/icon-alarm-white.svg" />');
			
			if (pushNotifications) {
				$notifications.html('<img src="img/ui/icon-alarm-green.svg" />');
			}
		
		},
		
		setMeetup: function() {
		
			var meetup = app.data.meetups.next;
			
			var $talks = this.$('.btn-talks');
			
			var $name = this.$('.meetup-name'),
				$days = this.$('.meetup-days'),
				$date = this.$('.meetup-date'),
				$place = this.$('.meetup-place');
			
			var $calendar = this.$('.btn-calendar');
			
			var meetupInProgress = meetup && meetup.starts && meetup.ends ? moment().isAfter(moment(meetup.starts)) && moment().isBefore(moment(meetup.ends)) : false;
			
			var startDate = meetup && meetup.starts ? moment(meetup.starts) : false,
				endDate = meetup && meetup.ends ? moment(meetup.ends) : false;
			
			$name.html(meetup.name);
			$days.html(meetupInProgress || startDate ? (meetupInProgress ? 'Now' : startDate.fromNow(true)) : 'Standby');
			$date.html(startDate ? startDate.format('ddd, DD MMM') + ' &#8212; ' + startDate.format('h:mma') + '-' + endDate.format('h:mma') : 'Sharkie\'s on it...');
			$place.html(meetup.map);
			
			meetup && meetup.starts && $calendar.find('.number').html(startDate.format('DD'));
		
		},
		
		addToCalendar: function() {
			
			if (!app._device.system || !app._device.system.match(/ios|android/)) {
				return app.showNotification('Alert', 'Sorry, calendar functionality can only be configured on actual devices.');
				return;
			}
			
			var meetup = app.data.meetups.next;
			
			if (!meetup) return;
			
			var starts = moment(meetup.starts).toDate(),
				ends = moment(meetup.ends).toDate();
			
			var title = 'SydJS' + (meetup.name ? ' - ' + meetup.name : ''),
				location = meetup.place,
				notes = meetup.description;
			
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
			
			window.plugins.calendar.createEventWithOptions(title, location, notes, starts, ends, reminders, success, error);
			
		},
		
		moveButtons: function(direction) {
		
			var $left = $('.rsvp .btn-left'),
				$right = $('.rsvp .btn-right');
			
			var left = '0%',
				right = '0%',
				color = [255, 255, 255],
				leftText = '',
				rightText = '';
			
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
			}, { duration: 400, easing: 'easeOutSine' });
			
			$right.velocity({
				width: right,
				backgroundColorRed: color[0],
				backgroundColorGreen: color[1],
				backgroundColorBlue: color[2]
			}, { duration: 400, easing: 'easeOutSine' });
			
			var duration = 175,
				easing = 'linear';
			
			switch(direction) {
				case 'left':
					$left.data('button').disable();
					$left.find('.text').text(leftText).velocity({ opacity: 1 }, { duration: duration, easing: easing });
					$left.find('.icon').velocity({ opacity: 0, rotateZ: '135deg' }, { duration: duration, easing: 'easeOutSine' });
					$right.find('.text').velocity({ opacity: 0 }, { duration: duration, easing: easing });
					$right.find('.icon').velocity({ opacity: 1, rotateZ: '-90deg' }, { delay: duration, duration: duration, easing: 'easeOutSine' });
				break;
				case 'middle':
					$left.data('button').enable();
					$right.data('button').enable();
					$left.find('.text').text(leftText).velocity({ opacity: 1 }, { delay: duration, duration: duration, easing: easing });
					$left.find('.icon').velocity({ opacity: 0, rotateZ: '135deg' }, { duration: duration, easing: 'easeOutSine' });
					$right.find('.text').text(rightText).velocity({ opacity: 1 }, { delay: duration, duration: duration, easing: easing });
					$right.find('.icon').velocity({ opacity: 0, rotateZ: '-135deg' }, { duration: duration, easing: 'easeOutSine' });
				break;
				case 'right':
					$right.data('button').disable();
					$left.find('.text').velocity({ opacity: 0 }, { duration: duration, easing: 'linear' });
					$left.find('.icon').velocity({ opacity: 1, rotateZ: '90deg' }, { delay: duration, duration: duration, easing: 'easeOutSine' });
					$right.find('.text').text(rightText).velocity({ opacity: 1 }, { duration: duration, easing: easing });
					$right.find('.icon').velocity({ opacity: 0, rotateZ: '-135deg' }, { duration: duration, easing: 'easeOutSine' });
				break;
			}
			
		},
		
		setState: function(initial) {
			
			var self = this;
			
			var meetup = app.data.meetups.next;
			
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
				if (!initial) this.animateCalendar('up');
			} else if (meetup && meetup.rsvped && !meetup.attending) {
				$rsvp.show();
				this.moveButtons('right');
				if (!initial) this.animateCalendar('down');
			} else if (meetup && meetup.ticketsAvailable && meetup.ticketsRemaining) {
				$rsvp.show();
				this.moveButtons('middle');
				if (!initial) this.animateCalendar('down');
			} else if (meetup && meetup.ticketsAvailable && meetup.ticketsAvailable == 0) {
				$soldOut.show();
			} else {
				$ticketsSoon.show();
			}
		},
		
		toggleAttending: function(options) {
			
			var self = this;
			
			if (self._processingForm) {
				console.log('[toggleAttending] - User tried to submit form but is already in a processing state.');
				return;
			}
			
			self._processingForm = true;
			
			var user = app.data.session;
			
			var rsvpData = {
				user: user.userId,
				meetup: app.data.meetups.next.id,
				attending: options.attending,
				cancel: options.cancel
			};
			
			var success = function(data) {
				
				console.log("[toggleAttending] - RSVP successful.", data);
				
				// Set form to no longer processing (after 500 milliseconds of animations)
				setTimeout(function() {
					self._processingForm = false;
				}, 500);
				
			}
			
			var error = function(data) {
				
				console.log("[toggleAttending] - RSVP failed, advise user to retry.", data);
				
				// Reset RSVP state
				app.showLoadingSpinner();
				
				// Delay reseting the state so the animations take time to take effect gracefully
				setTimeout(function() {
				
					// Show message
					app.showNotification('Alert', 'Sorry, we couldn\'t mark your attendance, please try again.' + (data && data.message && data.message.length ? '\n\n' + data.message : ''));
					
					// Reset local cached data
					app.data.meetups.next.attending = !app.data.meetups.next.attending;
					app.data.meetups.next.rsvped = !app.data.meetups.next.rsvped;
					
					// Update status
					self.setState();
					
					// Hide spinner
					app.hideLoadingSpinner();
					
					// Set form to no longer processing (after 500 milliseconds of animations)
					setTimeout(function() {
						self._processingForm = false;
					}, 500);
				
				}, 500);
				
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
			
			// Update local cached data
			app.data.meetups.next.attending = rsvpData.attending;
			app.data.meetups.next.rsvped = !options.cancel ? true : false;
			
			// Update status
			self.setState();
		
		},
		
		leftRSVP: function() {
			this.toggleRSVP('left');
		},
		
		rightRSVP: function() {
			this.toggleRSVP('right');
		},
		
		toggleRSVP: function(button) {
			
			if (_.isEmpty(app.data.session)) {
				var action = false;
				switch(button) {
					case 'left': if (!app.data.meetups.next.rsvped) action = 'attending'; break;
					case 'right': if (!app.data.meetups.next.rsvped) action = 'notAttending'; break;
				}
				app.view('home')._action = action;
				app.view('signin').show('slide-up', true);
				return;
				/*
				var action = false;
				switch(button) {
					case 'left': if (!app.data.meetups.next.rsvped) action = 'attending'; break;
					case 'right': if (!app.data.meetups.next.rsvped) action = 'notAttending'; break;
				}
				app.showConfirm('Attendance', 'You must sign in to mark your attendance.', 'No‚ thanks,Sign in', function(pressed) {
					if (pressed == 2) {
						app.view('home')._action = action;
						app.view('signin').show('slide-up', true);
					}
				});
				return;
				*/
			}
			
			switch(button) {
				case 'left':
					if (app.data.meetups.next.rsvped && !app.data.meetups.next.attending) {
						this.rsvpCancel();
					} else if (!app.data.meetups.next.rsvped) {
						this.rsvpAttending();
					}
				break;
				
				case 'right':
					if (app.data.meetups.next.rsvped && app.data.meetups.next.attending) {
						this.rsvpCancel();
					} else if (!app.data.meetups.next.rsvped) {
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
		},
		
		setSession: function() {
			this.$('.menu .btn-signout').hide();
			this.$('.menu .btn-join').hide();
			if (app.data.session.userId) {
				this.$('.menu .btn-signout').show();
			} else {
				this.$('.menu .btn-join').show();
			}
		},
		
		menuJoin: function() {
			app.view('signin').show('slide-up', true);
		},
		
		menuSignout: function() {
			app.signOut();
		},
		
		menuAbout: function() {
			app.view('about').show('slide-down');
		},
		
		menuCredits: function() {
			// app.view('credits').show('slide-down');
		},
		
		easterEgg: function() {
			
			var $squid = this.$('.squid'),
				$logo = this.$('.logo');
			
			if ($squid.is(':visible')) return;
			
			$squid.show();
			
			var logoPosition = $logo.offset(),
				logoParentPosition = $logo.parent().offset();
			
			var topOffset = logoPosition.top - logoParentPosition.top,
				leftOffset = logoPosition.left - logoParentPosition.left;
			
			var squidTopPosition = topOffset - $logo.height() + $squid.height(),
				squidLeftPosition = leftOffset + $logo.width() - $squid.width() + 1;
			
			$squid.css({
				top: squidTopPosition,
				left: squidLeftPosition
			});
			
			$squid.css('marginTop', -(topOffset) - $squid.height());
			
			$squid.velocity({
				marginTop: 0
			}, { easing: 'easeOutBounce', duration: 1000 });
			
		}
		
	});
	
})();
