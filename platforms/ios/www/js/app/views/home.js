(function() {

	// Claim View
	// ==========
	var ClaimView = Backbone.View.extend({
		className: 'item claim',
		render: function() {
			var claim = this.model;

			var title = '',
				summary = '',
				time = '';
			
			switch(claim.get('rewardType')) {
				case 'cinema':
					title = '2 for 1 Movie Voucher - ' + (claim.get('cinemaTicketPurchase') ? claim.get('cinemaTicketPurchase').voucherTypeLabel : '');
					summary = (claim.get('cinemaTicketPurchase') ? claim.get('cinemaTicketPurchase').cinema.name : '');
				break;

				case 'food':
					title = 'Free Large Traditional, Value or Chef’s Best Pizza (pick up only)';
					summary = 'Domino\'s Pizza';
				break;

				case 'music':
					title = claim.get('musicCode').typeLabel + ' Download';
					summary = 'InSong Website';
				break;

				case 'days-out':
				case 'sports':
					if (claim.get('rewardPartnerGroup')== 'yogapass' && claim.get('rewardPartnerLocation').venueName) {
						title = claim.get('rewardPartnerLocation').venueName;
					} else if (claim.get('rewardPartner').partnerName) {
						title = claim.get('rewardPartner').partnerName;
					}
					summary = claim.get('rewardPartner').offerName;
				break;
			}
			
			time = 'Claimed ' + moment(claim.get('claimedAt')).format('HH:mm MMM DD');

			this.$el.html(
				'<div class="shadow"><div class="cell">' +
					'<div class="selected"></div>' +
					'<div class="title">' + title + '</div>' +
					'<div class="summary">' + summary + '</div>' +
					'<div class="time">' + time  + '</div>' +
				'</div></div>');

			this.$el.addClass(claim.get('rewardType'));

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
			// CONDITIONAL: Music & iOS only, show voucher success view instead
			if (this.model.get('rewardType') == 'music' && app._device.system == 'ios') {
				app.view('voucher-success').populate('music');
				app.view('voucher-success').show('slide-up');
				return;
			}
			this.model.set('selected', true);
			app.view('voucher-details').populate(this.model);
			app.view('voucher-details').show('slide-up');
		},
		selectedChanged: function() {
			if (this.model.get('selected'))
				this.$el.addClass('selected');
			else
				this.$el.removeClass('selected');
		}
	});

	new View('home', {

		initialize: function() {
			var self = this;
			collections.claims.on('add', _.bind(this.addClaim, this));
			collections.claims.on('reset', function() {
				self.$('.menu.menu-claimed.tab-content .claimed-list').html('');
			})
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

				this.$('.titlebar .title').text('Hi ' + app.data.session.customer.name.first + ', welcome back');
				this.$('.btn-edit-details .btn-plain-subtitle').text(app.data.session.customer.name.first + ' ' + app.data.session.customer.name.last);

				this.getClaims();
				this.checkClaimed();

				this.$('.menu.menu-rewards .item').button();

				if ( !app.view('home').$el.find('.selected').length ) {
					app.view('home').$el.find('[data-item=rewards]').addClass( 'selected' );
				}

				// Analytics
				// app.trackEvent( 'googleanalytics', 'Rewards', { category: 'view', action: 'visible' } );
				// app.trackEvent( 'mixpanel', 'Viewing Rewards', {} );

			}
		},

		buttons: {
			'.btn-back': 'previous',

			'.menu.menu-rewards.tab-content .item .info': 'gotoRewardInfo',
			'.menu.menu-rewards.tab-content .item': 'gotoRewardOptions',

			'.menu.menu-more.tab-content .btn-edit-details': 'gotoEditDetails',
			'.menu.menu-more.tab-content .btn-change-password': 'gotoChangePassword',
			'.menu.menu-more.tab-content .btn-terms-and-conditions': 'gotoTermsAndConditions',
			'.menu.menu-more.tab-content .btn-contact': 'gotoContact',
			'.menu.menu-more.tab-content .btn-sign-out': 'gotoSignOut'
		},

		addClaim: function(claim) {
			var view = new ClaimView({ model: claim });
			this.$('.menu.menu-claimed.tab-content .claimed-list').append(view.render().el);
		},

		previous: function() {
			app.view('welcome').show('slide-left');
		},

		getClaims: function() {
			app.getClaims(function(err) {
				if (err) app.showNotification('Alert', 'Sorry, there was a problem retrieving your claims. Please try again.');
			});
		},
		
		checkClaimed: function() {
		
			this.$('.item.reward').removeClass('locked');
			
			var claimedToday = app.data.session.claimedToday;
			
			if (claimedToday.cinema) {
				this.$('.item.reward.cinemas').addClass('locked');
			}
			
			if (claimedToday.food) {
				this.$('.item.reward.food').addClass('locked');
			}
			
			if (claimedToday.daysOut) {
				this.$('.item.reward.days-out').addClass('locked');
			}
			
			if (claimedToday.sports) {
				this.$('.item.reward.sports-sessions').addClass('locked');
			}
			
			if (claimedToday.music['free'] && claimedToday.music['2for1']) {
				this.$('.item.reward.music-downloads').addClass('locked');
			}
		
		},

		// Rewards
		gotoRewardInfo: function(e, el) {
			var data = $(el).data(),
				reward = data.reward;
			
			app.view('reward-info')._currentReward = reward;
			app.view('reward-info').show('slide-up');
		},

		gotoRewardOptions: function(e, el) {
			var data = $(el).data(),
				reward = data.reward;
			
			// Check if locked
			if ($(el).hasClass('locked')) return;
			
			app.view('reward-options')._currentReward = reward;
			app.view('reward-options').show('slide-up');
		},

		// Claimed
		// (handled with collection)

		// More
		gotoEditDetails: function() {
			app.view('edit-details').show('slide-right');
		},

		gotoChangePassword: function() {
			app.view('change-password').show('slide-right');
		},

		gotoTermsAndConditions: function() {
			app.view('terms-and-conditions').show('slide-right');
		},

		gotoContact: function() {
			app.view('contact').show('slide-right');
		},

		gotoSignOut: function() {
			app.signOut();
		}

	});

})();
