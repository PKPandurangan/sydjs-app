var PhotoTilt = function(options) {

	'use strict';

	var imgUrl = options.url,
		lowResUrl = options.lowResUrl,
		container = options.container || document.body,
		latestTilt = 0,
		timeoutID = 0,
		disableTilt,
		viewport,
		imgData,
		img,
		imgLoader,
		delta,
		centerOffset,
		tiltBarWidth,
		tiltCenterOffset,
		tiltBarIndicatorWidth,
		tiltBarIndicator,
		config;

	config = {
		maxTilt: options.maxTilt || 20
	};

	var updatePosition = function() {

		var tilt = latestTilt,
			pxToMove;

		if (tilt > 0) {
			tilt = Math.min(tilt, config.maxTilt);
		} else {
			tilt = Math.max(tilt, config.maxTilt * -1);
		}

		pxToMove = (tilt * centerOffset) / config.maxTilt;
		
		setTranslateX((centerOffset + pxToMove) * -1);
		
		this.$('.background').css('transform', 'translateX(" + Math.round(amount) + "px)');

	};

	var addEventListeners = function() {

		var averageGamma = [];

		navigator.gyroscope.watchGyroscope(function(orientation) {

			if (!disableTilt) {

				if (averageGamma.length > 8) {
					averageGamma.shift();
				}

				averageGamma.push(orientation.gamma);

				latestTilt = averageGamma.reduce(function(a, b) { return a+b; }) / averageGamma.length;

			}

		});
	
	}

	var render = function() {

		img.height = viewport.height;
		resizedImgWidth = (imgData.aspectRatio * img.height);
		
		var delta = 1280 - app.viewportSize.width,
			centerOffset = delta / 2;
		
		var tiltCenterOffset = 0;
		// tiltCenterOffset = ((tiltBarWidth / 2) - (tiltBarIndicatorWidth / 2));
		
		updatePosition();
		
		if (tiltCenterOffset > 0) {
			disableTilt = false;
			container.classList.remove('disable-transitions');
		} else {
			disableTilt = true;
			latestTilt = 0;
			container.classList.add('disable-transitions');
		}
		
	};

};