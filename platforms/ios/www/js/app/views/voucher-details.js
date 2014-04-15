(function() {

	new View('voucher-details', {

		on: {
			layout: function() {

				//

			},
			visible: function() {

				var availableHeight = app.viewportSize.height
					- this.$('.titlebar').height()
					- this.$('.button').height();

				var titlebarHeight = this.$('.titlebar').height();

				this.$('.container').css({
					height: availableHeight,
					top: titlebarHeight
				});

				this.$('.details .wrap').css({
					top: (availableHeight - this.$('.details .wrap').height()) / 2
				});

				// Analytics
				// app.trackEvent( 'googleanalytics', 'Voucher Details', { category: 'view', action: 'visible' } );
				// app.trackEvent( 'mixpanel', 'Viewing Voucher Details', {} );

			}
		},

		buttons: {
			'.btn-back': 'previous',
			'.action': 'action'
		},

		previous: function() {
			app.view('home').reveal('slide-down');
		},

		// Takes a model and populates its view from it
		populate: function(model) {

			var reward = model.get('rewardType');

			var $container = this.$('.container'),
				$logo = this.$('.details .logo'),
				$title = this.$('.details .title'),
				$source = this.$('.details .source'),
				$code = this.$('.details .code'),
				$description = this.$('.details .description'),
				$button = this.$('.button .action');

			this.$('.voucher').removeClass().addClass('voucher ' + reward);

			$logo.hide();
			$title.removeClass('text-only');
			$source.removeClass('text-only');
			$code.show().html('');
			$description.show().removeClass('text-only');
			$button.show();

			switch(reward) {

				case 'cinema':
					$container.addClass('scrollable');
					
					$logo.show();
					$logo.html("<img src='img/app/ui/partners/event-cinemas-logos.png' alt='Event Cinemas logos' title='Event Cinemas logos'>");
					
					if (model.get('cinemaTicketPurchase').voucherType == 'postal') {
						$title.addClass('text-only').text('2 for 1 Adult Movie Voucher');
						$source.html('<small><strong>Your movie voucher will arrive by post</strong><br>' +
							'Vouchers purchased before 2.30pm on a weekday will be dispatched on the same day by standard post (from Sydney). ' +
							'Vouchers purchased after 2.30pm on a weekday or at any time on a weekend will be dispatched on the next business day by standard post (from Sydney).</small>');
						$code.hide();
						$description.html('<small><strong>Important Information</strong><br>' +
							'This voucher is valid for single use only and must be used in conjunction with the terms & conditions. One voucher per person, per day.</small>');
						$source.addClass('text-only');
						$description.addClass('text-only');
					} else {
						$title.text('Movie eSaver');
						$source.html('2 x Adult Standard Admisson<small>*not valid for use from 5pm Saturday</small>');
						$description.hide();
						$button.hide();
						
						var barcodes = model.get('eventCinemasBarcodes'),
							barcodesHTML = '';
						
						_.each(barcodes, function(bc) {
							barcodesHTML += '<div class="barcode">' +
								'<img src="' + bc.image.url + '" height="42" />' +
								'<div class="barcode-details">' +
									'<div class="barcode-block">' +
										'<div class="label">ESAVER CODE</div>' +
										'<div class="value">' + bc.barcode + '</div>' +
									'</div>' +
									'<div class="barcode-block">' +
										'<div class="label">PIN</div>' +
										'<div class="value">' + bc.pin + '</div>' +
									'</div>' +
									'<div class="barcode-block">' +
										'<div class="label">EXPIRES</div>' +
										'<div class="value">' + moment(bc.claimedAt).add('months', 3).format('DD/MM/YYYY') + '</div>' +
									'</div>' +
								'</div>' +
							'</div>'
						});
						
						$code.html(barcodesHTML);
					}
					
					$button.hide();
					
				break;

				case 'food':
					$title.text('Free Large Traditional, Value or Chef’s Best Pizza (pick up only)');
					$source.text('at Domino\'s Pizza');
					$code.text(model.get('claimCode'));
					$description.html('This is your unique redemption code. Open the Domino\'s website and enter this code at checkout.');
					$button.html("<span class='icon ion-ios7-redo-outline'></span>Open Domino\'s Site");
				break;

				case 'days-out':
					$title.text(model.get('rewardPartner').offerName);
					$source.text(model.get('rewardPartnerLocation').venueName);
					$code.text(model.get('claimCode'));
					$description.html('This is your unique redemption code. Quote this code when booking, and please note that bookings are essential');
					$button.html("<span class='icon ion-ios7-telephone-outline'></span>Call " + model.get('rewardPartnerLocation').phoneNumber + " to book");
				break;

				case 'sports':
					if (model.get('rewardPartnerGroup') && model.get('rewardPartnerGroup') == 'yogapass') {
						$title.text(model.get('rewardPartner').offerName);
						$source.text(model.get('rewardPartnerLocation').venueName);
						$code.text(model.get('claimCode'));
						$description.html('This is your unique redemption code. You\'ll need it when you order online');
						$button.html("<span class='icon ion-ios7-redo-outline'></span>Go to YogaPass");
					} else {
						$title.text(model.get('rewardPartner').offerName);
						$source.text(model.get('rewardPartnerLocation').venueName);
						$code.text(model.get('claimCode'));
						$description.html('This is your unique redemption code. Quote this code when booking, and please note that bookings are essential');
						$button.html("<span class='icon ion-ios7-telephone-outline'></span>Call " + model.get('rewardPartnerLocation').phoneNumber + " to book");
					}
				break;

				case 'music':
					$title.text(model.get('musicCode').typeLabel + ' Voucher');
					$source.text('at TheInSong');
					$code.text(model.get('claimCode'));
					$description.html('This is your unique redemption code. Write down or copy this code then follow the instructions in your confirmation email');
					$button.html("<span class='icon ion-ios7-redo-outline'></span>Open TheInSong Site");
				break;

			}
		},

		action: function() {

			var model = _.first(collections.claims.getSelected()),
				reward = model.get('rewardType');

			switch(reward) {

				case 'cinema':
					//
				break;

				case 'food':
					window.open('http://www.dominos.com.au', '_system', 'location=no');
				break;

				case 'days-out':
					window.open('tel:' + model.get('rewardPartnerLocation').phoneNumber, '_system');
				break;

				case 'sports':
					if (model.get('rewardPartnerGroup') && model.get('rewardPartnerGroup') == 'yogapass') {
						window.open('http://www.yogapass.com.au/conti-rewards-two4one', '_system', 'location=no');
					} else {
						window.open('tel:' + model.get('rewardPartnerLocation').phoneNumber, '_system');
					}
				break;

				case 'music':
					window.open('http://www.theinsong.com', '_system', 'location=no');
				break;

			}

		}

	});

})();
