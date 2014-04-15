(function() {
	
	// Claim Model
	// ===========
	models.Claim = Backbone.Model.extend({
		idAttribute: '_id',
		defaults: {
			selected: false
		}
	});
	
	
	// Claims Collection
	// =================
	// 
	// Is populated with all the loaded claims that can be chosen
	var Claims = Backbone.Collection.extend({
		model: models.Claim,
		initialize: function() {
			this.on('change:selected', this.claimSelected);
		},
		getSelected: function() {
			return this.where({ selected: true });
		},
		claimSelected: function(claim) {
			if (!claim.get('selected'))
				return;
			_.each(this.without(claim), function(m) {
				m.set('selected', false)
			});
		}
	});
	
	collections.claims = new Claims();

})();
