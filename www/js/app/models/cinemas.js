(function() {
	
	// Cinema Model
	// ============
	models.Cinema = Backbone.Model.extend({
		idAttribute: '_id',
		defaults: {
			selected: false
		}
	});
	
	
	// Cinemas Collection
	// ==================
	// 
	// Is populated with all the loaded cinemas that can be chosen
	var Cinemas = Backbone.Collection.extend({
		model: models.Cinema,
		initialize: function() {
			this.on('change:selected', this.cinemaSelected);
		},
		getSelected: function() {
			return this.where({ selected: true });
		},
		cinemaSelected: function(cinema) {
			if (!cinema.get('selected'))
				return;
			_.each(this.without(cinema), function(m) {
				m.set('selected', false)
			});
		}
	});
	
	collections.cinemas = new Cinemas();

})();
