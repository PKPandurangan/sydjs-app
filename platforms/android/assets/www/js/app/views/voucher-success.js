(function() {
	
	new View('voucher-success', {
	
		on: {
			layout: function() {
				
				var offsetFrom = this.$('.intro').offset(),
					offsetTop = offsetFrom.top + offsetFrom.height,
					availableHeight = app.viewportSize.height - offsetTop;
				
			},
			visible: function() {
				
				// Analytics
				// app.trackEvent( 'googleanalytics', 'Voucher Success', { category: 'view', action: 'visible' } );
				// app.trackEvent( 'mixpanel', 'Viewing Voucher Success', {} );
			
			},
			hidden: function() {
				
				this._currentReward = false;
				
			}
		},
		
		buttons: {
			'.view-voucher': 'next'
		},
		
		populate: function(reward) {
			
			this._currentReward = reward;
			
			var $title = this.$('.title'),
				$description = this.$('.description'),
				$button = this.$('.btn-center');
			
			$title.text('Success');
			$button.removeClass().addClass('btn-plain btn-center view-voucher btn-' + reward);
			$button.text('View Voucher');
			
			switch(reward) {
			
				case 'cinema':
					$description.text('Your movie voucher is ready');
				break;
				
				case 'food':
					$description.text('Your dining voucher is ready');
				break;
				
				case 'days-out':
					$description.text('Your days out voucher is ready');
				break;
				
				case 'sports':
					$description.text('Your sports session voucher is ready');
				break;
				
				case 'music':
					// CONDITIONAL: Music & iOS only, show different text and change button label
					if (app._device.system == 'ios') {
						$title.text('Claimed');
						$description.text('Please check your email for next steps on how to redeem.');
						$button.text('Done');
						return;
					}
					$description.text('Your music voucher is ready');
				break;
			
			}
			
		},
		
		next: function() {
		
			// CONDITIONAL: Music & iOS only, show home view instead of voucher details
			if (this._currentReward == 'music' && app._device.system == 'ios') {
				app.view('home').reveal('slide-down');
				return;
			}
			app.view('voucher-details').populate(collections.claims.last());
			app.view('voucher-details').show('slide-up');
		
		}
		
	});

})();
