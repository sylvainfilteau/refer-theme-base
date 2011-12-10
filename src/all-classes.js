/*
Copyright(c) 2011 Sylvain Filteau
*/
Ext.define('Refer.proxy.Page', {
	extend: 'Ext.data.proxy.Memory',

	read: function(operation, callback, scope) {
		var me = this;
		var reader = me.getReader();

		Ext.Ajax.request({
			url: 'pages.json',
			success: function(response) {
				var node = Ext.JSON.decode(response.responseText);
				var data = me._processNode(node);
				data.text = data.text || "Home";
				data.expanded = true;

				var result = reader.read(data);

				Ext.apply(operation, {
					resultSet: result
				});

				operation.setCompleted();
				operation.setSuccessful();

				Ext.callback(callback, scope || me, [operation]);
			}
		});
	},

	_processNode: function(node) {
		var children = [];

		for (var i = 0; i < node.child_nodes.length; i++) {
			children.push(this._processNode(node.child_nodes[i]));
		}

		for (var i = 0; i < node.pages.length; i++) {
			var page = node.pages[i];
			children.push({
				id: page.id,
				text: page.title,
				leaf: true,
			});
		}

		var data = {
			text: node.name,
			children: children
		};

		return data;
	}
});

Ext.define('Refer.store.PageStore', {
	extend: 'Ext.data.TreeStore',
	requires: ['Refer.proxy.Page'],

	proxy: Ext.create('Refer.proxy.Page', {
		reader: {
			type: 'json',
			root: 'children'
		}
	})
});

Ext.define('Refer.view.PageTree', {
	extend: 'Ext.tree.Panel',
	requires: ['Refer.store.PageStore'],
	
	alias: 'widget.pagetree',

	store: Ext.create('Refer.store.PageStore'),

	rootVisible: false
});

Ext.define('Refer.view.Page', {
	extend: 'Ext.panel.Panel',

	alias: 'widget.page',

	pagesPath: 'pages',

	ui: 'page',

	autoScroll: true,

	loadPage: function(page) {
		var me = this;

		this.setLoading(true);

		Ext.Ajax.request({
			url: this.pagesPath + '/' + page,
			success: function(response) {
				me.update(response.responseText);

				me.highlightCodeBloc(me.getEl().dom);

				me.setLoading(false);
			}
		});
	},

	highlightCodeBloc: function(parentDom) {
		SyntaxHighlighter.config.useScriptTags = false;
		SyntaxHighlighter.defaults.toolbar = false;

		var elems = Ext.DomQuery.select('pre code', parentDom);
		for (var i = 0; i < elems.length; i++) {
			var code = elems[i];
			var brush = this.detectCodeType(code);
			SyntaxHighlighter.highlight({
				brush: brush
			}, code);
		}

	},

	detectCodeType: function(code) {
		var text = Ext.String.htmlDecode(code.innerHTML);
		if (Ext.String.trim(text).substr(0, 2) == "<?") {
			return "php";
		}

		// Check if there is the line type=brushname
		// If there is, then isolate brushname and then remove the line
		var lines = text.split("\n");
		if (lines.length && lines[0].indexOf("type=") == 0) {
			var brush = lines[0].substr(5);
			lines.shift();
			code.innerHTML = Ext.String.htmlEncode(lines.join("\n"));
			return brush;
		}

		return "html";
	}
});

Ext.define('Refer.controller.Pages', {
	extend: 'Ext.app.Controller',
	views: ['PageTree', 'Page'],

	refs: [{
		ref: 'page',
		selector: 'page'
	}],

	init: function() {
		this.control({
			'pagetree': {
				itemclick: function(pagetree, record) {
					if (record.get('leaf')) {
						var path_elems = [record.get('id')];

						node = record.parentNode;

						while (node && node.parentNode) {
							if (node.get('text') != '') {
								path_elems.unshift(node.get('text'));
							}
							node = node.parentNode;
						}

						var path = path_elems.join('/') + ".html";

						this.getPage().loadPage(path);
					}
				}
			}
		});
	}
});



