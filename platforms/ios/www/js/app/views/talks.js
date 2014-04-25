(function() {
	
	new View('talks', {
		
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
				
				this.renderTalks();
				
				// Analytics
				// app.trackEvent( 'googleanalytics', 'Rewards', { category: 'view', action: 'visible' } );
				// app.trackEvent( 'mixpanel', 'Viewing Rewards', {} );
				
			}
		},
		
		buttons: {
			'.close': 'back'
		},
		
		back: function() {
			app.view('home').reveal('slide-up');
		},
		
		renderTalks: function() {
		
			var $list = this.$('.list');
			
			var talks = app.data.status.meetup.talks;
			
			_.each(talks, function(talk) {
			
				var html = '<li>' +
					'<span class="title">' + talk.name + '</span>' +
					'<span class="people">';
				
				_.each(talk.who, function(who) {
					
					html += '<span class="person">' +
						(who.name ? '<span class="author">' + who.name.first + ' ' + who.name.last + '</span>' : '') +
						(who.twitter ? '<a class="twitter" href="http://twitter.com/' + who.twitter + '">' + who.twitter + '</a>' : '') +
					'</span>';
					
				});
				
				html += '</span>' +
					'</li>';
				
				$(html).appendTo($list);
			
			});
		
		}
		
	});
	
})();
