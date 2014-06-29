var PhotoTilt = function(options) {

	'use strict';
	
	var imgUrl = options.url,
		container = options.container,
		latestTilt = 0,
		disableTilt,
		viewport,
		imgData,
		img,
		imgLoader,
		delta,
		centerOffset;
	
	var config = {
		maxTilt: options.maxTilt || 20
	};
	
	window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
	
	var init = function() {
		
		generateViewPort();
		
		preloadImg(imgUrl, function() {
			
			img = imgLoader.cloneNode(false);
			
			generateImgData();
			
			imgLoader = null;
			
			render();
			
			addEventListeners();
			
		});
		
	};
	
	var updatePosition = function() {
		
		var tilt = latestTilt;
		
		if (tilt > 0) {
			tilt = Math.min(tilt, config.maxTilt);
		} else {
			tilt = Math.max(tilt, config.maxTilt * -1);
		}
		
		var pxToMove = (tilt * centerOffset) / config.maxTilt;
		
		setTranslateX(img, (centerOffset + pxToMove) * -1);
		
		window.requestAnimationFrame(updatePosition);
		
	};
	
	var addEventListeners = function() {
		
		if (window.DeviceOrientationEvent) {
			
			var averageGamma = [];
			
			window.addEventListener('deviceorientation', function(eventData) {
				
				if (disableTilt) return;
				
				if (averageGamma.length > 8) {
					averageGamma.shift();
				}
				
				averageGamma.push(eventData.gamma);
				
				latestTilt = averageGamma.reduce(function(a, b) { return a+b; }) / averageGamma.length;
				
			}, false);
			
			window.requestAnimationFrame(updatePosition);
			
		}
		
	};
	
	var setTranslateX = function(node, amount) {
		node.style.webkitTransform =
		node.style.MozTransform =
		node.style.msTransform =
		node.style.transform = "translateX(" + Math.round(amount) + "px)";
	};
	
	var render = function() {
		
		var resizedImgWidth;
		
		var mask = document.createElement('div');
			mask.classList.add('mask');
		
		img.height = viewport.height;
		
		resizedImgWidth = (imgData.aspectRatio * img.height);
		
		delta = resizedImgWidth - viewport.width;
		centerOffset = delta / 2;
		
		var tiltBarWidth = viewport.width,
			tiltBarIndicatorWidth = (viewport.width * tiltBarWidth) / resizedImgWidth,
			tiltCenterOffset = ((tiltBarWidth / 2) - (tiltBarIndicatorWidth / 2));
		
		updatePosition();
		
		if (tiltCenterOffset > 0) {
			disableTilt = false;
			container.classList.remove('disabled');
		} else {
			disableTilt = true;
			latestTilt = 0;
			container.classList.add('disabled');
		}
		
		mask.appendChild(img);
		container.appendChild(mask);
		
	};
	
	var generateViewPort = function() {
		
		var containerStyle = window.getComputedStyle(container, null);
		
		viewport = {
			width: parseInt(containerStyle.width, 10),
			height: parseInt(containerStyle.height, 10)
		};
		
	};
	
	var generateImgData = function() {
		
		imgData = {
			width: imgLoader.width,
			height: imgLoader.height,
			aspectRatio: imgLoader.width / imgLoader.height,
			src: imgLoader.src
		};
		
	};
	
	var preloadImg = function(url, done) {
		
		imgLoader = new Image();
		imgLoader.addEventListener('load', done, false);
		imgLoader.src = url;
		
	};
	
	init();
	
	return {
		getContainer: function(){
			return container;
		}
	}

};