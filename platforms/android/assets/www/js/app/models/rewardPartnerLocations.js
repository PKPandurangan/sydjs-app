(function() {
	
	// RewardPartnerLocation Model
	// ===========================
	models.RewardPartnerLocation = Backbone.Model.extend({
		idAttribute: '_id',
		defaults: {
			selected: false
		}
	});
	
	
	// Cinemas Collection
	// ==================
	// 
	// Is populated with all the loaded reward partner locations that can be chosen
	var RewardPartnerLocations = Backbone.Collection.extend({
		model: models.RewardPartnerLocation,
		initialize: function() {
			this.on('change:selected', this.rewardPartnerLocationSelected);
		},
		getSelected: function() {
			return this.where({ selected: true });
		},
		rewardPartnerLocationSelected: function(rewardPartnerLocation) {
			if (!rewardPartnerLocation.get('selected'))
				return;
			_.each(this.without(rewardPartnerLocation), function(m) {
				m.set('selected', false)
			});
		}
	});
	
	collections.rewardPartnerLocations = new RewardPartnerLocations();

})();
