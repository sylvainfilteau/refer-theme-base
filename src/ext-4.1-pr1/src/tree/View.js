/**
 * Used as a view by {@link Ext.tree.Panel TreePanel}.
 */
Ext.define('Ext.tree.View', {
    extend: 'Ext.view.Table',
    alias: 'widget.treeview',

    loadingCls: Ext.baseCSSPrefix + 'grid-tree-loading',
    expandedCls: Ext.baseCSSPrefix + 'grid-tree-node-expanded',

    expanderSelector: '.' + Ext.baseCSSPrefix + 'tree-expander',
    checkboxSelector: '.' + Ext.baseCSSPrefix + 'tree-checkbox',
    expanderIconOverCls: Ext.baseCSSPrefix + 'tree-expander-over',

    // Class to add to the node wrap element used to hold nodes when a parent is being
    // collapsed or expanded. During the animation, UI interaction is forbidden by testing
    // for an ancestor node with this class.
    nodeAnimWrapCls: Ext.baseCSSPrefix + 'tree-animator-wrap',

    blockRefresh: true,

    /** 
     * @cfg {Boolean} rootVisible
     * False to hide the root node.
     */
    rootVisible: true,

    /**
     * @cfg {Boolean} deferInitialRefresh
     * Must be false for Tree Views because the root node must be rendered in order to be updated with its child nodes.
     */
    deferInitialRefresh: false,

    /** 
     * @cfg {Boolean} animate
     * True to enable animated expand/collapse (defaults to the value of {@link Ext#enableFx Ext.enableFx})
     */

    expandDuration: 250,
    collapseDuration: 250,
    
    toggleOnDblClick: true,

    stripeRows: false,

    initComponent: function() {
        var me = this;
        
        if (me.initialConfig.animate === undefined) {
            me.animate = Ext.enableFx;
        }
        
        me.store = new Ext.data.NodeStore({
            recursive: true,
            rootVisible: me.rootVisible,
            listeners: {
                beforeexpand: me.onBeforeExpand,
                expand: me.onExpand,
                beforecollapse: me.onBeforeCollapse,
                collapse: me.onCollapse,
                write: me.onStoreWrite,
                datachanged: me.onStoreDataChanged,
                scope: me
            }
        });
        
        if (me.node) {
            me.setRootNode(me.node);
        }
        me.animQueue = {};
        me.animWraps = {};
        me.addEvents(
            /**
             * @event afteritemexpand
             * Fires after an item has been visually expanded and is visible in the tree. 
             * @param {Ext.data.NodeInterface} node         The node that was expanded
             * @param {Number} index                        The index of the node
             * @param {HTMLElement} item                    The HTML element for the node that was expanded
             */
            'afteritemexpand',
            /**
             * @event afteritemcollapse
             * Fires after an item has been visually collapsed and is no longer visible in the tree. 
             * @param {Ext.data.NodeInterface} node         The node that was collapsed
             * @param {Number} index                        The index of the node
             * @param {HTMLElement} item                    The HTML element for the node that was collapsed
             */
            'afteritemcollapse'
        );
        me.callParent(arguments);
        me.on({
            element: 'el',
            scope: me,
            delegate: me.expanderSelector,
            mouseover: me.onExpanderMouseOver,
            mouseout: me.onExpanderMouseOut
        });
        me.on({
            element: 'el',
            scope: me,
            delegate: me.checkboxSelector,
            click: me.onCheckboxChange
        });
    },

    processUIEvent: function(e) {
        // If the clicked node is part of an animation, ignore the click.
        // This is because during a collapse animation, the associated Records
        // will already have been removed from the Store, and the event is not processable.
        if (e.getTarget('.' + this.nodeAnimWrapCls, this.el)) {
            return false;
        }
        return this.callParent(arguments);
    },

    onClear: function(){
        this.store.removeAll();    
    },

    setRootNode: function(node) {
        var me = this;        
        me.store.setNode(node);
        me.node = node;
        if (!me.rootVisible) {
            node.expand();
        }
    },

    onCheckboxChange: function(e, t) {
        var me = this,
            item = e.getTarget(me.getItemSelector(), me.getTargetEl());
            
        if (item) {
            me.onCheckChange(me.getRecord(item));
        }
    },
    
    onCheckChange: function(record){
        var checked = record.get('checked');
        if (Ext.isBoolean(checked)) {
            checked = !checked;
            record.set('checked', checked);
            this.fireEvent('checkchange', record, checked);
        }
    },

    getChecked: function() {
        var checked = [];
        this.node.cascadeBy(function(rec){
            if (rec.get('checked')) {
                checked.push(rec);
            }
        });
        return checked;
    },
    
    isItemChecked: function(rec){
        return rec.get('checked');
    },

    createAnimWrap: function(record, index) {
        var thHtml = '',
            headerCt = this.panel.headerCt,
            headers = headerCt.getGridColumns(),
            i = 0, len = headers.length, item,
            node = this.getNode(record),
            tmpEl, nodeEl;

        for (; i < len; i++) {
            item = headers[i];
            thHtml += '<th style="width: ' + (item.hidden ? 0 : item.getDesiredWidth()) + 'px; height: 0px;"></th>';
        }

        nodeEl = Ext.get(node);        
        tmpEl = nodeEl.insertSibling({
            tag: 'tr',
            html: [
                '<td colspan="' + headerCt.getColumnCount() + '">',
                    '<div class="' + this.nodeAnimWrapCls + '">',
                        '<table class="' + Ext.baseCSSPrefix + 'grid-table" style="width: ' + headerCt.getFullWidth() + 'px;"><tbody>',
                            thHtml,
                        '</tbody></table>',
                    '</div>',
                '</td>'
            ].join('')
        }, 'after');

        return {
            record: record,
            node: node,
            el: tmpEl,
            expanding: false,
            collapsing: false,
            animating: false,
            animateEl: tmpEl.down('div'),
            targetEl: tmpEl.down('tbody')
        };
    },

    getAnimWrap: function(parent) {
        if (!this.animate) {
            return null;
        }

        var wraps = this.animWraps,
            wrap;
        // We are checking to see which parent is having the animation wrap
        while (parent) {
            wrap = wraps[parent.getId()];
            if (wrap) {
                return wrap;
            }
            parent = parent.parentNode;
        }
        return null;
    },

    doAdd: function(nodes, records, index) {
        // If we are adding records which have a parent that is currently expanding
        // lets add them to the animation wrap
        var me = this,
            record = records[0],
            parent = record.parentNode,
            a = me.all.elements,
            relativeIndex = 0,
            animWrap = me.getAnimWrap(parent),
            targetEl, children, len;

        if (!animWrap || !animWrap.expanding) {
            return me.callParent(arguments);
        }

        // We need the parent that has the animWrap, not the nodes parent
        parent = animWrap.record;
        
        // If there is an anim wrap we do our special magic logic
        targetEl = animWrap.targetEl;
        children = targetEl.dom.childNodes;
        
        // We subtract 1 from the childrens length because we have a tr in there with the th'es
        len = children.length - 1;
        
        // The relative index is the index in the full flat collection minus the index of the wraps parent
        relativeIndex = index - me.indexOf(parent) - 1;
        
        // If we are adding records to the wrap that have a higher relative index then there are currently children
        // it means we have to append the nodes to the wrap
        if (!len || relativeIndex >= len) {
            targetEl.appendChild(nodes);
        }
        // If there are already more children then the relative index it means we are adding child nodes of
        // some expanded node in the anim wrap. In this case we have to insert the nodes in the right location
        else {
            // +1 because of the tr with th'es that is already there
            Ext.fly(children[relativeIndex + 1]).insertSibling(nodes, 'before', true);
        }

        // We also have to update the CompositeElementLite collection of the DataView
        Ext.Array.insert(a, index, nodes);
        
        // If we were in an animation we need to now change the animation
        // because the targetEl just got higher.
        if (animWrap.isAnimating) {
            me.onExpand(parent);
        }
    },
    
    beginBulkUpdate: function(){
        this.bulkUpdate = true;
        this.ownerCt.changingScrollbars = true;  
    },
    
    endBulkUpdate: function(){
        this.bulkUpdate = false;
        this.ownerCt.changingScrollbars = true;  
    },
    
    onRemove : function(ds, record, index) {
        var me = this,
            bulk = me.bulkUpdate;

        me.doRemove(record, index);
        if (!bulk) {
            me.updateIndexes(index);
        }
        if (me.store.getCount() === 0){
            me.refresh();
        }
        if (!bulk) {
            me.fireEvent('itemremove', record, index);
        }
    },
    
    doRemove: function(record, index) {
        // If we are adding records which have a parent that is currently expanding
        // lets add them to the animation wrap
        var me = this,
            all = me.all,
            animWrap = me.getAnimWrap(record),
            node = all.item(index).dom;

        if (!animWrap || !animWrap.collapsing) {
            return me.callParent(arguments);
        }

        animWrap.targetEl.appendChild(node);
        all.removeElement(index);
    },

    onBeforeExpand: function(parent, records, index) {
        var me = this,
            animWrap;
            
        if (!me.rendered || !me.animate) {
            return;
        }

        if (me.getNode(parent)) {
            animWrap = me.getAnimWrap(parent);
            if (!animWrap) {
                animWrap = me.animWraps[parent.getId()] = me.createAnimWrap(parent);
                animWrap.animateEl.setHeight(0);
            }
            else if (animWrap.collapsing) {
                // If we expand this node while it is still expanding then we
                // have to remove the nodes from the animWrap.
                animWrap.targetEl.select(me.itemSelector).remove();
            } 
            animWrap.expanding = true;
            animWrap.collapsing = false;
        }
    },

    onExpand: function(parent) {
        var me = this,
            queue = me.animQueue,
            id = parent.getId(),
            node = me.getNode(parent),
            index = me.indexOf(node),
            animWrap,
            animateEl, 
            targetEl;        
        
        if (me.singleExpand) {
            me.ensureSingleExpand(parent);
        }
        
        animWrap = me.getAnimWrap(parent);

        if (!animWrap) {
            me.fireEvent('afteritemexpand', parent, index, node);
            return;
        }
        
        animateEl = animWrap.animateEl;
        targetEl = animWrap.targetEl;

        animateEl.stopAnimation();
        // @TODO: we are setting it to 1 because quirks mode on IE seems to have issues with 0
        queue[id] = true;
        animateEl.slideIn('t', {
            duration: me.expandDuration,
            listeners: {
                scope: me,
                lastframe: function() {
                    // Move all the nodes out of the anim wrap to their proper location
                    animWrap.el.insertSibling(targetEl.query(me.itemSelector), 'before');
                    animWrap.el.remove();
                    delete me.animWraps[animWrap.record.getId()];
                    delete queue[id];
                }
            },
            callback: function() {
                me.fireEvent('afteritemexpand', parent, index, node);
            }
        });
        
        animWrap.isAnimating = true;
    },

    onBeforeCollapse: function(parent, records, index) {
        var me = this,
            animWrap;
            
        if (!me.rendered || !me.animate) {
            return;
        }

        if (me.getNode(parent)) {
            animWrap = me.getAnimWrap(parent);
            if (!animWrap) {
                animWrap = me.animWraps[parent.getId()] = me.createAnimWrap(parent, index);
            }
            else if (animWrap.expanding) {
                // If we collapse this node while it is still expanding then we
                // have to remove the nodes from the animWrap.
                animWrap.targetEl.select(this.itemSelector).remove();
            }
            animWrap.expanding = false;
            animWrap.collapsing = true;
        }
    },
    
    onCollapse: function(parent) {
        var me = this,
            queue = me.animQueue,
            id = parent.getId(),
            node = me.getNode(parent),
            index = node ? me.indexOf(node) : -1,
            animWrap = me.getAnimWrap(parent),
            animateEl, targetEl;
            
        // The item has already been removed by a parent node
        if (index === -1) {
            return;
        }

        if (!animWrap) {
            me.fireEvent('afteritemcollapse', parent, index, node);
            return;
        }
        
        animateEl = animWrap.animateEl;
        targetEl = animWrap.targetEl;

        queue[id] = true;
        
        // @TODO: we are setting it to 1 because quirks mode on IE seems to have issues with 0
        animateEl.stopAnimation();
        animateEl.slideOut('t', {
            duration: me.collapseDuration,
            listeners: {
                scope: me,
                lastframe: function() {
                    animWrap.el.remove();
                    delete me.animWraps[animWrap.record.getId()];
                    delete queue[id];
                }             
            },
            callback: function() {
                me.fireEvent('afteritemcollapse', parent, index, node);
            }
        });
        animWrap.isAnimating = true;
    },
    
    /**
     * Checks if a node is currently undergoing animation
     * @private
     * @param {Ext.data.Model} node The node
     * @return {Boolean} True if the node is animating
     */
    isAnimating: function(node) {
        return !!this.animQueue[node.getId()];    
    },
    
    collectData: function(records) {
        var data = this.callParent(arguments),
            rows = data.rows,
            len = rows.length,
            i = 0,
            row, record;
            
        for (; i < len; i++) {
            row = rows[i];
            record = records[i];
            if (record.get('qtip')) {
                row.rowAttr = 'data-qtip="' + record.get('qtip') + '"';
                if (record.get('qtitle')) {
                    row.rowAttr += ' ' + 'data-qtitle="' + record.get('qtitle') + '"';
                }
            }
            if (record.isExpanded()) {
                row.rowCls = (row.rowCls || '') + ' ' + this.expandedCls;
            }
            if (record.isLoading()) {
                row.rowCls = (row.rowCls || '') + ' ' + this.loadingCls;
            }
        }
        
        return data;
    },
    
    /**
     * Expands a record that is loaded in the view.
     * @param {Ext.data.Model} record The record to expand
     * @param {Boolean} deep (optional) True to expand nodes all the way down the tree hierarchy.
     * @param {Function} callback (optional) The function to run after the expand is completed
     * @param {Object} scope (optional) The scope of the callback function.
     */
    expand: function(record, deep, callback, scope) {
        return record.expand(deep, callback, scope);
    },
    
    /**
     * Collapses a record that is loaded in the view.
     * @param {Ext.data.Model} record The record to collapse
     * @param {Boolean} deep (optional) True to collapse nodes all the way up the tree hierarchy.
     * @param {Function} callback (optional) The function to run after the collapse is completed
     * @param {Object} scope (optional) The scope of the callback function.
     */
    collapse: function(record, deep, callback, scope) {
        return record.collapse(deep, callback, scope);
    },
    
    /**
     * Toggles a record between expanded and collapsed.
     * @param {Ext.data.Model} recordInstance
     */
    toggle: function(record) {
        this[record.isExpanded() ? 'collapse' : 'expand'](record);
    },
    
    onItemDblClick: function(record, item, index) {
        var editingPlugin = this.editingPlugin;
        this.callParent(arguments);
        if (this.toggleOnDblClick && !(editingPlugin && editingPlugin.clicksToEdit === 2)) {
            this.toggle(record);
        }
    },
    
    onBeforeItemMouseDown: function(record, item, index, e) {
        if (e.getTarget(this.expanderSelector, item)) {
            return false;
        }
        return this.callParent(arguments);
    },
    
    onItemClick: function(record, item, index, e) {
        if (e.getTarget(this.expanderSelector, item)) {
            this.toggle(record);
            return false;
        }
        return this.callParent(arguments);
    },
    
    onExpanderMouseOver: function(e, t) {
        e.getTarget(this.cellSelector, 10, true).addCls(this.expanderIconOverCls);
    },
    
    onExpanderMouseOut: function(e, t) {
        e.getTarget(this.cellSelector, 10, true).removeCls(this.expanderIconOverCls);
    },
    
    /**
     * Gets the base TreeStore from the bound TreePanel.
     */
    getTreeStore: function() {
        return this.panel.store;
    },    
    
    ensureSingleExpand: function(node) {
        var parent = node.parentNode;
        if (parent) {
            parent.eachChild(function(child) {
                if (child !== node && child.isExpanded()) {
                    child.collapse();
                }
            });
        }
    },

    /**
     * Re-fires the NodeStore's "write" event as a TreeStore event
     * @private
     * @param {Ext.data.NodeStore} store
     * @param {Ext.data.Operation} operation
     */
    onStoreWrite: function(store, operation) {
        var treeStore = this.panel.store;
        treeStore.fireEvent('write', treeStore, operation);
    },

    /**
     * Re-fires the NodeStore's "datachanged" event as a TreeStore event
     * @private
     * @param {Ext.data.NodeStore} store
     * @param {Ext.data.Operation} operation
     */
    onStoreDataChanged: function(store, operation) {
        var treeStore = this.panel.store;
        treeStore.fireEvent('datachanged', treeStore);
    }
});
