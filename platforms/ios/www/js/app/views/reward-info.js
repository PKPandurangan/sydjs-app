(function() {
	
	new View('reward-info', {
	
		on: {
			layout: function() {
				
				var offsetFrom = this.$('.intro').offset(),
					offsetTop = offsetFrom.top + offsetFrom.height,
					availableHeight = app.viewportSize.height - offsetTop;
				
			},
			visible: function() {
				
				this.populate();
				
				// Analytics
				// app.trackEvent( 'googleanalytics', 'Reward Info', { category: 'view', action: 'visible' } );
				// app.trackEvent( 'mixpanel', 'Viewing Reward Info', {} );
			
			},
			hidden: function() {
			
				this._currentReward = false;
			
			}
		},
		
		buttons: {
			'.cross': 'previous',
			'.action': 'action'
		},
		
		previous: function() {
			app.view('home').reveal('slide-down');
		},
		
		// Takes a model and populates its view from it
		populate: function(reward) {
			
			var $title = this.$('.title'),
				$description = this.$('.description'),
				$button = this.$('.btn-center');
			
			$button.removeClass().addClass('btn-plain btn-center btn-' + this._currentReward + ' action');
			
			switch(this._currentReward) {
			
				case 'cinemas':
					$title.text('2 for 1 Movie Vouchers');
					$description.text('Purchase one full priced adult movie voucher at participating cinemas to receive two movie vouchers. Exclusions for Event Cinemas include screenings after 5pm on Saturdays. Vouchers purchased for Independent cinemas can be used anytime.');
					$button.text('Browse Cinemas');
				break;
				
				case 'food':
					$title.text('Free Pizza');
					$description.text('Hungry? Get a free pizza from Domino’s. Simply grab your pizza voucher below, visit the Domino’s website and pick up from your nearest location. There’s almost certainly one near you.');
					$button.text('Browse Dining Rewards');
				break;
				
				case 'days-out':
					$title.text('Days Out');
					$description.text('Get a Free Days Out experience or take a friend along to the experience with our two for the price of one Days Out offer. Browse available Days Out and click preferred venue to receive eVoucher. Present eVoucher to claim.');
					$button.text('Browse Days Out');
				break;
				
				case 'sports-sessions':
					$title.text('Sports Sessions');
					$description.text('Enjoy getting fit or challenging yourself with a new sports venture. Browse the wide range of Free Sport Sessions available, click on preferred venue to receive eVoucher. Present eVoucher to claim your Free Sports Session.');
					$button.text('Browse Sports Sessions');
				break;
				
				case 'music-downloads':
					$title.text('Music Vouchers');
					$description.text('In addition to a free track voucher on us, you can redeem a 2 for 1 album voucher every day for the duration of this promotion. Simply grab your voucher below, visit the In Song website, and enjoy 2 for 1 tunes.');
					$button.text('Browse Music Rewards');
				break;
			
			}
			
		},
		
		action: function() {
			
			app.view('reward-options')._currentReward = this._currentReward;
			app.view('reward-options').show('slide-up');
			
		}
		
	});

})();
