(function() {
	
	new View('talks', {
		
		initialize: function() {
		
			//
		
		},
		
		on: {
			layout: function() {
				
				var availableHeight = app.viewportSize.height
					- this.$('.statusbar').height()
					- this.$('.titlebar').height();
					
				this.$('.container').css({
					height: availableHeight,
					top: this.$('.titlebar').height()
				});
				
			},
			visible: function() {
				
				this.renderTalks();
				
				this.animateView();
				
				// iOS: Change status bar style to match view style
				app.changeStatusBarStyle('black');
				
				// analytics
				app.trackEvent({ label: 'Talks', category: 'view', action: 'visible' });
				
			}
		},
		
		buttons: {
			'.close': 'back'
		},
		
		back: function() {
			app.view('home').reveal('slide-down');
		},
		
		renderTalks: function() {
		
			var $list = this.$('.list');
				$list.html('');
			
			var talks = app.parseMeetup().data.talks;
			
			$list.css('padding-bottom', 25);
			
			_.each(talks, function(talk) {
			
				var html = '<li>' +
					'<span class="images"></span>' +
					'<span class="title">' + talk.name + '</span>' +
					'<span class="people">';
				
				var names = [],
					twitters = [],
					images = [];
				
				_.each(talk.who, function(who) {
					if (who.name) names.push(who.name.first + ' ' + who.name.last);
					if (who.twitter) twitters.push(who.twitter);
					if (who.avatarUrl) images.push(who.avatarUrl);
				});
				
				// img(src=speaker.photo.exists ? speaker._.photo.thumbnail(320,320) : speaker.avatarUrl || '/images/avatar.png', width=160, height=160, alt=speaker.name.full, class=talk.who.length > 1 ? 'talk__photo--mini' : null).talk__photo
				
				if (names.length) {
					html += '<span class="authors">';
					_.each(names, function(name, index) {
						if (names.length > 1 && names.length == index + 1) {
							html += ' & ';
						} else if (names.length > 1 && index != 0) {
							html += ', ';
						}
						html += '<span class="author">' + name + '</span>';
					});
					html += '</span>';
				}
				
				if (twitters.length) {
					html += '<span class="twitters">';
					_.each(twitters, function(twitter, index) {
						if (twitters.length > 1 && twitters.length == index + 1) {
							html += ' & ';
						} else if (twitters.length > 1 && index != 0) {
							html += ', ';
						}
						if (twitter.slice(0,1) != '@') twitter = '@' + twitter;
						html += '<a href="http://twitter.com/' + twitter.slice(1) + '" class="twitter" target="_blank">' + twitter + '</a>';
					});
					html += '</span>';
				}
				
				if (talk.description) {
					html += '<span class="description">';
						html += talk.description;
					html += '</span>';
				}
				
				html += '</span>' +
					'</li>';
				
				var $html = $(html)
				
				if (images.length) {
					var $images = $html.find('.images');
					$images.addClass(images.length == 4 ? 'shift' : '');
					_.each(images, function(image, index) {
						var $img = $('<img src="' + image + '">');
						if (images.length > 1) $img.addClass('mini');
						$img.appendTo($images)
					});
				}
				
				$html.appendTo($list);
			
			});
			
			$list.find('a').each(function() {
				var $link = $(this);
				$link.click(function(e) {
					e.preventDefault();
					window.open($link.prop('href'), '_system');
				});
			});
		
		},
		
		animateView: function() {
			var self = this;
			this.$('.footer').css('transform', 'translateY(' + app.viewportSize.height + 'px)');
			this.$('.footer').velocity({ translateY: [app.viewportSize.height - 95, app.viewportSize.height] }, { delay: 250, duration: 500, easing: 'easeOutSine', complete: function() {
				self.$('.container').css('height', self.$('.container').height() - 75);
				self.$('.list').css('padding-bottom', 25);
			}});
		}
		
	});
	
})();
