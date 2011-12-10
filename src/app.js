Ext.Loader.setConfig({
	enabled: true
});

Ext.application({
	name: 'Refer',

	appFolder: 'app',

	controllers: ['Pages'],

	launch: function() {
		Ext.create('Ext.container.Viewport', {
			layout: 'fit',
			items: [{
				layout: 'border',
				items: [{
					region: 'west',
					width: 250,
					xtype: 'pagetree'
				}, {
					region: 'center',
					xtype: 'page'
				}]
			}]
		});
	}
});
