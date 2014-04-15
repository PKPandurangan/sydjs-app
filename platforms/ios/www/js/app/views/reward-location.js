(function() {

	new View('reward-location', {

		on: {
			layout: function() {

				var availableHeight = app.viewportSize.height
					- this.$('.titlebar').height()
					- this.$('.button').height();

				this.$('.container').css({
					height: availableHeight,
					top: this.$('.titlebar').height()
				});

				this.$('.reward-details').css({
					height: availableHeight - this.$('.location').height() - 10
				});

			},
			visible: function() {

				this.populate();

				// Analytics
				// app.trackEvent( 'googleanalytics', 'Reward Info', { category: 'view', action: 'visible' } );
				// app.trackEvent( 'mixpanel', 'Viewing Reward Info', {} );

			}
		},

		buttons: {
			'.btn-back': 'previous'
		},

		previous: function() {
			app.view('home').reveal('slide-down');
		},

		// Takes a model and populates its view from it
		populate: function(reward) {

		  //

		}

	});

})();
