/**
 * The plugin extend the grid buffered functionalities and add buffered support for the tree panel
 */
Ext.define('Ext.ux.plugin.TreeBufferedRenderer', {
	extend: 'Ext.grid.plugin.BufferedRenderer',
	alias: 'plugin.treebufferedrenderer',

	/**
	 * @cfg {Ext.tree.Panel} tree
	 * @private
	 */
	tree : null,

	init : function(tree){
		var me = this;

		me.tree = tree;

		me.callParent(arguments);

		me.bindTree();
	},

	bindTree : function() {
		var me = this;

		me.tree.expandAll = function() { me.onExpandAll(); };
		me.tree.collapseAll = function() { me.onCollapseAll(); };
		me.tree.on("beforeitemexpand", me.onBeforeItemExpand, me);
		me.tree.on("beforeitemcollapse", me.onBeforeItemCollapse, me);
	},

	onExpandAll : function() {
		var recordsArr = [],
			me = this,
			root = me.tree.getRootNode();

		root.cascadeBy(function(childRecord){
			if(!childRecord.isRoot() || me.tree.rootVisible === true){
				if(!childRecord.isLeaf())
					childRecord.data.expanded = true;
				recordsArr.push(childRecord);
			}
		});

		root.data.expanded = true;

		me.store.suspendEvents(false);
		me.store.removeAll(true);
		me.store.add(recordsArr);
		me.store.resumeEvents();
		me.view.refresh();

		me.view.el.dom.scrollTop = 0;
	},

	onCollapseAll : function() {
		var me = this,
			root = me.tree.getRootNode(),
			itemCount = 0;

		if(me.tree.rootVisible === true){
			me.store.suspendEvents(false);
			me.store.removeAll(true);

			root.data.expanded = false;

			me.store.add(root);
			me.store.resumeEvents();
			me.view.refresh();

			me.view.el.dom.scrollTop = 0;
		} else {
			me.store.suspendEvents(false);

			root.eachChild(function(rootChildRecord) {
				itemCount = 0;
				rootChildRecord.cascadeBy(function(childRecord){
					if(childRecord.isVisible()){
						itemCount++;
					}
				});

				rootChildRecord.data.expanded = false;

				if(itemCount > 0)
					me.store.removeAt(me.store.indexOf(rootChildRecord)+1, itemCount-1);
			});

			me.tree.getRootNode().cascadeBy(function(childRecord) {
				if(!childRecord.isLeaf())
					childRecord.data.expanded = false;
			});

			me.store.resumeEvents();
			me.view.refresh();

			me.scrollTo(0);
		}
	},

	onBeforeItemExpand : function(record) {
		var recordsArr = [],
			me = this,
			scrollTop = me.scrollTop;

		record.eachChild(function(childRecord) {
			recordsArr.push(childRecord);
		});

		record.data.expanded = true;

		me.store.suspendEvents(false);
		me.store.insert(me.store.indexOf(record)+1, recordsArr);
		me.store.resumeEvents();
		me.view.refresh();

		me.view.el.dom.scrollTop = scrollTop;
		return false;
	},

	onBeforeItemCollapse : function(record){
		var itemCount = 0,
			me = this,
			scrollTop = me.scrollTop;

		record.cascadeBy(function(childRecord){
			if(childRecord != record){
				if(childRecord.parentNode.data.expanded)
					itemCount++;
			}
		});

		record.data.expanded = false;

		me.store.suspendEvents(false);
		me.store.removeAt(me.store.indexOf(record)+1, itemCount);

		record.cascadeBy(function(childRecord) {
			if(!childRecord.isLeaf())
				childRecord.data.expanded = false;
		});

		me.store.resumeEvents();
		me.view.refresh();

		me.view.el.dom.scrollTop = scrollTop;
		return false;
	},


	bindStore : function(store) {
		var me = this;

		this.callParent(arguments);

		store.getTotalCount = function() {
			return this.data.items.length;
		}
	}
});
