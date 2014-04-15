(function() {

	// Cinema View
	// ===================
	var CinemaView = Backbone.View.extend({
		className: 'item cinema',
		render: function(voucherType) {
			var cinema = this.model;
			
			var hasDistance = cinema.get('kmDistance');
			
			this.$el.html(
				'<div class="cell distance">' +
					'<div class="number">' + (hasDistance ? Number(cinema.get('kmDistance')).toFixed() : 0) + '</div>' +
					'<div class="units">km</div>' +
				'</div>' +
				'<div class="cell">' +
					'<div class="title">' + cinema.get('name') + '</div>' +
					'<div class="summary">' + (cinema.get('partnerGroup') == 'event' ? 'Event Cinemas' : 'Independent Cinemas' ) + '</div>' +
				'</div>');
			
			if (!hasDistance) this.$el.addClass('no-distance');
			
			this.voucherType = voucherType;

			return this;
		},
		initialize: function() {
			this.$el.button();
			this.listenTo(this.model, 'change:selected', this.selectedChanged);
			this.listenTo(this.model, 'remove', this.remove);
		},
		events: {
			press: 'select'
		},
		select: function() {
			this.model.set('selected', true);
			app.view('reward-options').checkModel('cinemas', this.model, this.voucherType);
		},
		selectedChanged: function() {
			if (this.model.get('selected'))
				this.$el.addClass('selected');
			else
				this.$el.removeClass('selected');
		}
	});

	// Reward Partner Location View
	// ===================
	var RewardPartnerLocationView = Backbone.View.extend({
		className: 'item rewardPartnerLocation',
		render: function() {
			var location = this.model;
			
			var hasDistance = location.get('kmDistance');
			
			this.$el.html(
				'<div class="cell distance">' +
					'<div class="number">' + (hasDistance ? Number(location.get('kmDistance')).toFixed() : 0) + '</div>' +
					'<div class="units">km</div>' +
				'</div>' +
				'<div class="cell">' +
					'<div class="title">' + location.get('partner').offerName + '</div>' +
					'<div class="summary">' + (location.get('partner').partnerGroup == 'yogapass' ? location.get('venueName') : location.get('partner').partnerName) + '</div>' +
				'</div>');
			
			if (!hasDistance) this.$el.addClass('no-distance');

			return this;
		},
		initialize: function() {
			this.$el.button();
			this.listenTo(this.model, 'change:selected', this.selectedChanged);
			this.listenTo(this.model, 'remove', this.remove);
		},
		events: {
			press: 'select'
		},
		select: function() {
			this.model.set('selected', true);
			app.view('reward-options').checkModel(this.model.get('offerGroup'), this.model);
		},
		selectedChanged: function() {
			if (this.model.get('selected'))
				this.$el.addClass('selected');
			else
				this.$el.removeClass('selected');
		}
	});
	
	new View('reward-options', {
	
		on: {
			layout: function() {
			
				var $container = $('.reward-type.' + this._currentReward);
				
				var titleBarHeight = this.$('.titlebar').height(),
					toolBarHeight = this.$('.toolbar').height()
				
				var availableHeight = app.viewportSize.height
					- titleBarHeight
					- toolBarHeight
					- 15;
				
				if (/cinemas|days-out|sports/.test(this._currentReward)) {
					this.$('.toolbar').css({ top: titleBarHeight });
					this.$('.map-view').css({ height: availableHeight });
				}
				
				this.$('.container').css({
					height: availableHeight,
					top: toolBarHeight + titleBarHeight + 15
				});
				
			},
			visible: function() {
				
				this.populate();
				
				// Analytics
				// app.trackEvent( 'googleanalytics', 'Reward Options', { category: 'view', action: 'visible' } );
				// app.trackEvent( 'mixpanel', 'Viewing Reward Options', {} );
				
			},
			hidden: function() {
				
				this.cleanup();
				
			}
		},
		
		buttons: {
			'.btn-back': 'previous',
			
			'.view-map': 'viewMap',
			'.view-list': 'viewList',
			
			// Music & Food specific
			'.item.music': 'checkStatic',
			'.item.food': 'checkStatic',
			
			// Cinema, Days Out & Sports specific
			// (handled view model view)
			
			// Cinema specific
			'.tabs[data-tabs=cinemas] .tab': 'cinemaTabChanged'
		},
		
		cinemaTabChanged: function() {
			this.renderMap();
		},
		
		viewMap: function() {
			this.$('.view-map').hide();
			this.$('.view-list').show();
			
			this.$('.list-view').hide();
			this.$('.map-view').show();
			
			// Render map
			this.renderMap();
			
		},
		
		viewList: function() {
			this.$('.view-list').hide();
			this.$('.view-map').show();
			
			this.$('.map-view').hide();
			this.$('.list-view').show();
			
			// Perform cleanup
			this.cleanup();
		},
		
		cleanup: function() {
			this.$('.map-view').html('');
		},
		
		populate: function() {
			
			// Hide all reward types
			this.$('.reward-type').hide();
			
			// Reset map/list buttons
			this.$('.view-list').hide();
			this.$('.view-map').show();
			
			// Reset map/list views
			this.$('.map-view').hide();
			this.$('.list-view').show();
			
			// Define title and render data
			var title = '';
			
			switch(this._currentReward) {
				case 'cinemas':
					title = 'Select cinema';
					var $postal = this.$('.menu-cinemas[data-tab=postal] .cinema-list').html('');
					_.each(collections.cinemas.where({ postalVouchers: true }), function(c) {
						$postal.append(new CinemaView({ model: c }).render('postal').el);
					});
					var $evoucher = this.$('.menu-cinemas[data-tab=email] .cinema-list').html('');
					_.each(collections.cinemas.where({ evoucherVouchers: true }), function(c) {
						$evoucher.append(new CinemaView({ model: c }).render('email').el);
					});
				break;
				
				case 'food':
					title = 'Dining Reward';
					this.$('.view-map').hide();
				break;
				
				case 'music-downloads':
					title = 'Music Reward';
					this.$('.view-map').hide();
				break;
				
				case 'days-out':
					title = 'Select day out';
					var $container = this.$('.days-out.reward-type .container .list-view').html('');
					_.each(collections.rewardPartnerLocations.where({ offerGroup: 'days-out' }), function(l) {
						$container.append(new RewardPartnerLocationView({ model: l }).render().el);
					});
				break;
				
				case 'sports-sessions':
					title = 'Select sports session';
					var $container = this.$('.sports-sessions.reward-type .container .list-view').html('');
					_.each(collections.rewardPartnerLocations.where({ offerGroup: 'sports' }), function(l) {
						$container.append(new RewardPartnerLocationView({ model: l }).render().el);
					});
				break;
			}
			
			this.$('.titlebar').removeClass().addClass('titlebar ' + this._currentReward);
			this.$('.titlebar .title').text(title);
			
			// Show section
			this.$('.reward-type.' + this._currentReward).show();
			
		},
		
		renderMap: function() {
		
			var reward = this._currentReward,
				locations = [],
				type = false;
			
			// Get relevant element and location data
			switch(reward) {
				case 'cinemas':
					type = this.$('.cinemas.reward-type .tab.selected').data().tab;
					var $el = this.$('.map-view.cinema-map[data-tab=' + type + ']');
					if (type == 'postal') {
						locations = collections.cinemas.where({ postalVouchers: true });
					} else {
						locations = collections.cinemas.where({ evoucherVouchers: true });
					}
				break;
				
				case 'days-out':
					var $el = this.$('.days-out.reward-type .container .map-view'); // Hardcoded to nearest for now as tabs aren't visible
					locations = collections.rewardPartnerLocations.where({ offerGroup: 'days-out' });
				break;
				
				case 'sports-sessions':
					var $el = this.$('.sports-sessions.reward-type .container .map-view'); // Hardcoded to nearest for now as tabs aren't visible
					locations = collections.rewardPartnerLocations.where({ offerGroup: 'sports' });
				break;
			}
			
			var cache = {
				map: false,
				$map: $el,
				
				markers: [],
				
				lastInfoWindow: false
			}
			
			var renderMarkers = function(bounds) {
				
				// Clear all markers before rendering more
				_.each(cache.markers, function(m) { m.setMap(null) });
				cache.markers = [];
				
				// Plot markers & info windows
				var infoWindow = new google.maps.InfoWindow({ maxWidth: 250 });
				
				var markerHTML = function(location) {
					var html = '<div class="info-window">' +
						'<div class="media">' +
							'<div class="media-body">' +
								'<div class="info-window__heading">' +
									(reward == 'cinemas' ? '<a href="javascript:;">' + location.get('name') + '</a>' : '') +
									(reward == 'days-out' || reward == 'sports-sessions' ? '<a href="javascript:;">' + location.get('partner').offerName + '</a>' : '') +
								'</div>' +
								(reward == 'cinemas' ? '<div class="info-window__subheading">' + (location.get('partnerGroup') == 'event' ? 'Event Cinemas' : 'Independent Cinemas' ) + '</div>' : '') +
								(reward == 'days-out' || reward == 'sports-sessions' ? '<div class="info-window__subheading">' + (location.get('partner').partnerGroup == 'yogapass' ? location.get('venueName') : location.get('partner').partnerName) + '</div>' : '') +
							'</div>' +
						'</div>' +
					'</div>';
					
					return html;
				}
				
				_.each(locations, function(location) {
				
					// Don't render a marker if we don't have a geo locaiton
					if (!location.get('address').geo || !location.get('address').geo.length) return;
					
					var marker = new google.maps.Marker({
						position: new google.maps.LatLng(location.get('address').geo[1], location.get('address').geo[0]),
						map: cache.map,
						maxWidth: 200,
						title: location.get('name')
					});
					
					cache.markers.push(marker);
					
					google.maps.event.addListener(marker, 'click', function() {
						
						if (cache.lastInfoWindow) cache.lastInfoWindow.remove();
						
						cache.lastInfoWindow = $(markerHTML(location)).appendTo('body');
						
						infoWindow.setContent(cache.lastInfoWindow[0]);
						infoWindow.open(cache.map, marker);
						
						cache.lastInfoWindow.find('a').click(function() {
							switch(reward) {
								case 'cinemas':
									app.view('reward-options').checkModel('cinemas', location, type);
								break;
								case 'days-out':
									app.view('reward-options').checkModel('days-out', location);
								break;
								case 'sports-sessions':
									app.view('reward-options').checkModel('sports', location);
								break;
							}
						});
						
					});
				
				});
				
				// Set bounds based on markers
				if (bounds) {
					var bounds = new google.maps.LatLngBounds();
					for (var i=0; i < cache.markers.length; i++) {
						bounds.extend(cache.markers[i].getPosition());
					}
					cache.map.fitBounds(bounds);
				}
			}
			
			// Render map
			google.maps.visualRefresh = true;
			
			var mapOptions = {
				scrollwheel: false,
				disableDefaultUI: true,
				zoomControl: false,
				mapTypeControlOptions: {
					mapTypeIds: [google.maps.MapTypeId.ROADMAP, 'map_style']
				}
			};
			
			cache.map = new google.maps.Map(cache.$map[0], mapOptions);
			
			// Set center on customers location or if we don't have one use center of Australia
			if (app.data.session.customer.location.geo && app.data.session.customer.location.geo.length) {
				cache.map.setCenter(new google.maps.LatLng(app.data.session.customer.location.geo[1],app.data.session.customer.location.geo[0]));
				cache.map.setZoom(10);
				setTimeout(function() { renderMarkers(false) }, 1);
			} else {
				cache.map.setCenter(new google.maps.LatLng(-33.875518,151.2063757));
				setTimeout(function() { renderMarkers(true) }, 1);
			}
		
		},

		previous: function() {
			app.view('home').reveal('slide-down');
		},

		checkStatic: function(e, el) {

			var $el = $(el);

			if ($el.hasClass('food')) {
				if (app.data.session.claimedToday.food) return app.showNotification('Alert', 'You\'ve already claimed this reward today! Please try again tomorrow.');
				this.claim('food');
			}

			if ($el.hasClass('music')) {
				if ($el.hasClass('free')) {
					if (app.data.session.claimedToday.music['free']) return app.showNotification('Alert', 'You\'ve already claimed this reward today! Please try again tomorrow.');
					this.claim('music', 'free');
				}
				if ($el.hasClass('2for1')) {
					if (app.data.session.claimedToday.music['2for1']) return app.showNotification('Alert', 'You\'ve already claimed this reward today! Please try again tomorrow.');
					this.claim('music', '2for1');
				}
			}
		},
		
		checkModel: function(reward, model, type) {
		
			switch(reward) {
				case 'cinemas':
					if (app.data.session.claimedToday.cinema) {
						model.set('selected', false);
						return app.showNotification('Alert', 'You\'ve already claimed this reward today! Please try again tomorrow.');
					}
					app.view('reward-payment').populate(model, type);
					app.view('reward-payment').show('slide-up');
				break;
				
				case 'days-out':
				case 'sports':
					if (app.data.session.claimedToday[model.get('offerGroup')]) {
						model.set('selected', false);
						return app.showNotification('Alert', 'You\'ve already claimed this reward today! Please try again tomorrow.');
					}
					app.view('reward-options').claim(model.get('offerGroup'), false, model.get('_id'));
				break;
			}
		
		},

		claim: function(reward, type, location) {

			app.showLoadingSpinner();

			$.ajax({
				url: config.baseURL + '/api/claim-reward',
				type: 'POST',
				data: {
					customer: app.data.session.customer._id,
					reward: reward,
					type: type,
					location: location
				},
				dataType: 'json',
				cache: false,
				success: function(rtnData) {

					if (rtnData.success) {

						$log( "[claim] - Claim processed succesfully.", rtnData );

						// Add claim to collection
						collections.claims.add(rtnData.claim);

						// Mark it as selected
						// TODO: Clean this up
						collections.claims.last().set('selected', true);

						// Mark as claimed today
						switch(reward) {
							case 'cinema':
								// Handled in reward-payment
							break;
							case 'food':
								app.data.session.claimedToday.food = true;
							break;
							case 'days-out':
								app.data.session.claimedToday.daysOut = true;
							break;
							case 'sports':
								app.data.session.claimedToday.sports = true;
							break;
							case 'music':
								switch(type) {
									case 'free':
										app.data.session.claimedToday.music['free'] = true;
									break;
									case '2for1':
										app.data.session.claimedToday.music['2for1'] = true;
									break;
								}
							break;
						}

						// Save updated data into storage
						localStorage.setItem( 'session_claimedToday', JSON.stringify( app.data.session.claimedToday ) );

						// Hide loading spinner
						app.hideLoadingSpinner();

						// Populate voucher success details
						app.view('voucher-success').populate(reward);

						// Go to another view
						app.view('voucher-success').show('slide-up');

					} else {

						$log( "[claim] - Claim failed, advise user to retry details.", rtnData );

						// Hide loading spinner
						app.hideLoadingSpinner();

						// Show message
						app.showNotification('Alert', 'Sorry, your claim could not be processed. Please try again.');

					}

				},
				error: function(request, errType, err) {

					$log( "[claim] - Claim failed, advise user to retry details." );

					// Hide loading spinner
					app.hideLoadingSpinner();

					// Show message
					app.showNotification('Alert', 'Sorry, your claim could not be processed. Please try again.');

				}
			});

		}

	});

})();
