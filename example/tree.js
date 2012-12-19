
Ext.onReady(function() {
	Ext.Loader.setConfig({
		enabled: true,
		paths: {
			'Ext': 'extjs42'
		}
	});

	var store = Ext.create('Ext.data.TreeStore', {
		fields: [{
			name: 'name',
			type: 'string'
		}, {
			name: 'duration',
			type: 'string'
		}],
		proxy: {
			type: 'memory'
		}
	});

	function generateTaskData() {
		var arr = [],
			i, j, k,
			cn, cn2;

		for (var i = 1; i < 10; i++) {
			cn = [];
			for (j = 1; j < 10; j++) {
				cn2 = [];
				for (k = 1; k < 10; k++) {
					cn2.push({
						name: 'Child task ' + String(i) + String(j) + String(k),
						duration: i,
						leaf: true
					});
				}
				cn.push({
					name: 'Child task ' + String(i) + String(j),
					duration: i,
					expanded: false,
					children: cn2
				});
			}
			arr.push({
				name: 'Root task #' + i,
				duration: i,
				children: cn,
				expanded: false
			});
		}

		return arr;
	}

	Ext.create('Ext.tree.Panel', {
		title: 'Buffered Tree Example',
		width: 500,
		height: 300,
		renderTo: Ext.getBody(),
		rootVisible: false,
		store: store,
		id: 'tree',
		animate : false,
		width:'100%',
		height: 600,

		plugins: 'treebufferedrenderer',

		tbar: [{
			text: 'ExpandAll',
			handler: function() {
				Ext.getCmp('tree').expandAll();
			}
		}, {
			text: 'CollapseAll',
			handler: function() {
				Ext.getCmp('tree').collapseAll();
			}
		}],

		//the 'columns' property is now 'headers'
		columns: [{
			xtype: 'treecolumn', //this is so we know which column will show the tree
			text: 'Task',
			width: 200,
			sortable: true,
			dataIndex: 'name'
		}, {
			text: 'Duration',
			width: 150,
			dataIndex: 'duration',
			sortable: true
		}]
	});

	store.proxy.data = generateTaskData();
	store.load();
});