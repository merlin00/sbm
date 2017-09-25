// Bottom Layout
Layout.Bottom = {};

Layout.Bottom.Outline =
    "<div id='leftbottom' style='display:inline-block; width: 50%; height: 99%;'></div>" +
    "<div id='rightbottom' style='display:inline-block; width: 50%; height: 99%;'></div>";

Layout.Bottom.Left = {
    name: 'layout_bottom_left',
    panels: [
        { type: 'main', resizable: true },
        { type: 'right', resizable: true, size: 160 }
    ]
};

Layout.Bottom.Right = {
    name: 'layout_bottom_deploy',
    panels: [
        { type: 'left', resizable: true, content: 'left', size: '250px' },
        { type: 'main', resizable: true, content: 'main' }
    ]
};

SBMUI.Layout.Bottom = {};
SBMUI.Layout.Bottom.Outline = SBMUI.Layout.Outline.content('bottom', Layout.Bottom.Outline);
SBMUI.Layout.Bottom.Left = $('#leftbottom').w2layout(Layout.Bottom.Left);
SBMUI.Layout.Bottom.Right = $('#rightbottom').w2layout(Layout.Bottom.Right);

// The tables and the toolbars used in the Bottom Layout.
TableUI.Entity = {
    name: 'table_entity',
    header: 'Virtual Entities',
    show: { header: true, toolbar: true, footer: true, selectColumn: true },
    toolbar: {
        items: [
            { id: 'deploy', type: 'button', caption: 'Deploy', icon: 'w2ui-icon-plus' },
            { type: 'break', id: 'break0' },
            { type: 'spacer' },
            { id: 'show', type: 'check', icon: 'fa fa-eye', checked: true },
            { type: 'break', id: 'break1' },
            { id: 'edit', type: 'button', icon: 'fa fa-pencil-square-o' },
            { id: 'remove', type: 'button', icon: 'fa fa-trash' }
        ],
        onClick: function(event) {
            let owner = this.owner;

            switch (event.target) {
                case 'deploy':
                    owner.eventListener.notify('deploy', event);
                    break;
                case 'edit':
                    owner.eventListener.notify('edit', event);
                    break;
                case 'remove':
                    owner.eventListener.notify('remove', event);
                    break;
            }
        }
    },
    columns: [
        { field: 'isConnected', caption: 'C', resizable: false, size: '40px', attr: "align=center" },
        { field: 'session', caption: 'Session', resizable: false, size: '60px', attr: "align=right" },
        { field: 'topic', caption: 'Topic', resizable: true, size: '100%' },
        { field: 'router', caption: 'Router', resizable: false, size: '90px', attr: "align=center" },
        { field: 'address', caption: 'Address', resizable: false, size: '100px', attr: "align=right" }
    ],
    onClick: function(event) {
        let record = this.get(event.recid);
        this.eventListener.notify('selected-record', record);
    },
    eventListener: new EventListener(),
    on: function(event, handler) {
        this.eventListener.on(event, handler);
    },
    addEntity: function(entity) {
        var length = this.records.length;
        this.add({
            recid: length + 1,
            isConnected: entity.connected,
            topic: entity.topic,
            session: entity.session,
            router: entity.network.router,
            address: entity.network.address,
            inputs: entity.inputs.tag.length,
            outputs: entity.outputs.tag.length
        });
    }
};

TableUI.Entity.onExpand = function(event) {
    if (w2ui.hasOwnProperty('subgrid-' + event.recid)) w2ui['subgrid-' + event.recid].destroy();

    $('#' + event.box_id).css({ margin: '0px', padding: '0px', width: '100%' })
        .animate({ height: '60px' }, 100);

    let selection = event.recid;
    setTimeout(() => {
        let record = this.get(event.recid);

        $('#' + event.box_id).w2grid({
            name: 'subgrid-' + event.recid,
            show: { columnHeaders: false },
            fixedBody: true,
            columns: [
                { field: 'name', caption: 'Name', size: '100px', style: 'background-color: #efefef; border-bottom: 1px solid white; padding-right: 5px;', attr: "align=right" },
                { field: 'value', caption: 'Value', size: '100%' }
            ],
            records: [
                { recid: 1, name: 'Inputs', value: record.inputs, },
                { recid: 2, name: 'Outputs', value: record.outputs, }
            ],
            onClick: (event) => {
                event.session = this.get(selection).session;
                this.eventListener.notify('selected-sub-record', event);
            }
        });
        w2ui['subgrid-' + event.recid].resize();
    }, 300);
};

// The tags of the entity
TableUI.Tag = {
    name: 'table_tag',
    header: 'Tags',
    show: { header: true, footer: true, toolbar: true },
    columns: [
        { field: 'name', caption: 'Name', size: '100%', attr: 'align=center' }
    ],
    onClick: function(event) {
        var grid = this;
    },
    clearTag: function() {
        this.clear();
    },
    addTag: function(tag) {
        var length = this.records.length;
        this.add({
            recid: length + 1,
            name: tag
        });
    },
};

// The deployed entities
TableUI.Deploy = {
    name: 'table_deploy',
    header: 'Deployed Entities',
    show: { header: true, footer: true, toolbar: true, selectColumn: true },
    toolbar: {
        items: [
            { type: 'break', id: 'break0' },
            { type: 'check', id: 'show-link', icon: 'fa fa-link', checked: true },
            { type: 'button', id: 'link', caption: 'Link', icon: 'w2ui-icon-plus', disabled: false },
            { type: 'break', id: 'break0' },
            { type: 'spacer' },
            { type: 'button', id: 'remove', caption: 'Remove', icon: 'fa fa-trash', disabled: true }
        ],
        onClick: function(event) {
            let owner = this.owner;

            switch (event.target) {
                case 'show-link':
                    if (!event.item.checked) {
                        this.enable('link');
                        this.disable('remove');
                    } else {
                        this.disable('link');
                        this.enable('remove');
                    }
                    SBMUI.Table.Deploy.selectNone();
                    break;

                case 'link':
                    owner.eventListener.notify('link', event);
                    break;

                case 'remove':
                    owner.eventListener.notify('remove', event);
                    break;
            }
        }
    },
    columns: [
        { field: 'session', caption: 'Session', resizable: false, size: '60px', attr: "align=right" },
        { field: 'topic', caption: 'Topic', resizable: true, size: '100%' }
    ],
    eventListener: new EventListener(),
    onClick: function(event) {
        let record = this.get(event.recid);
        this.eventListener.notify('selected-record', record);
    },
    onSelect: function(event) {
        let selections = this.getSelection();

        if (selections.length > 1 && this.toolbar.items[2].checked) {
            event.onComplete = function() {
                this.unselect(event.recid);
            };
        }
    },
    on: function(event, handler) {
        this.eventListener.on(event, handler);
    },
    clearEntity: function() {
        this.clear();
    },
    addEntity: function(entity) {
        var length = this.records.length;

        for (let i = 0; i < length; i++) {
            if (this.get(i + 1).session === entity.session) return false;
        }

        this.add({
            recid: length + 1,
            topic: entity.topic,
            session: entity.session,
        });

        return true;
    }
};

TableUI.Link = {
    name: 'table_link',
    header: 'Links',
    show: { header: true, footer: true, toolbar: true, selectColumn: true },
    toolbar: {
        items: [
            { type: 'break', id: 'break0' },
            { type: 'spacer' },
            { type: 'button', id: 'remove', caption: 'Remove', icon: 'fa fa-trash' }
        ],
        onClick: function(event) {
            let owner = this.owner;

            switch (event.target) {
                case 'remove':
                    owner.eventListener.notify('remove', event);
                    break;
            }
        }
    },
    columns: [
        { field: 'session1', caption: 'Session', resizable: false, size: '60px', attr: "align=right" },
        { field: 'topic1', caption: 'Topic', resizable: true, size: '50%' },
        { field: 'session2', caption: 'Session', resizable: false, size: '60px', attr: "align=right" },
        { field: 'topic2', caption: 'Topic', resizable: true, size: '50%' }
    ],
    eventListener: new EventListener(),
    on: function(event, handler) {
        this.eventListener.on(event, handler);
    },
    onRender: (event) => {},
    addLink: function(e1, e2) {
        let length = this.records.length;
        this.add({
            recid: length + 1,
            session1: e1.session,
            topic1: e1.topic,
            session2: e2.session,
            topic2: e2.topic
        });
    },
};

SBMUI.Table.Entity = $().w2grid(TableUI.Entity);

SBMUI.Table.Tag = $().w2grid(TableUI.Tag);
SBMUI.Table.Tag.toolbar.items.splice(0, 4);

SBMUI.Table.Deploy = $().w2grid(TableUI.Deploy);
SBMUI.Table.Deploy.toolbar.items.splice(1, 3);

SBMUI.Table.Link = $().w2grid(TableUI.Link);
SBMUI.Table.Link.toolbar.items.splice(1, 3);

SBMUI.Layout.Bottom.Left.content('main', SBMUI.Table.Entity);
SBMUI.Layout.Bottom.Left.content('right', SBMUI.Table.Tag);

SBMUI.Layout.Bottom.Right.content('left', SBMUI.Table.Deploy);
SBMUI.Layout.Bottom.Right.content('main', SBMUI.Table.Link);
