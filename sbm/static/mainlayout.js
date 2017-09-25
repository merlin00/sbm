// Main Layout
Layout.Main = {};

Layout.Main.Outline =
    "<div id='top-menu' style='position:absolute; top:5px;left:5px;z-index:1;padding: 4px; border: 1px solid silver; border-radius: 3px;width:40rem'></div>" +
    "<div id='WebGL-BoxNet' style='width:100%;height:100%'>" +
    "<div style='position:absolute; top:0; right:0rem; width:15.3rem;display:inline-block; margin:0.5rem'>" +
    "<div id='WebGL-Box' class='layout-border-style' style='height:13.0rem'></div>" +
    "<div id='BoxGUI'></div>" +
    "</div>" +
    "</div>";

SBMUI.Layout.Outline.content('main', Layout.Main.Outline);

ToolbarUI.Top = {
    name: 'toolbar_top',
    items: [
        { type: 'break', id: 'break0' },
        { type: 'html', id: 'item5', html: "<div'><input id='iot-services' type='list' placeholder='Select a service'></div>" },
        { type: 'button', id: 'apply', caption: 'Apply', icon: 'fa fa-upload', disabled: true },
        { type: 'spacer' },
        { type: 'button', id: 'remove', caption: 'Remove', icon: 'fa fa-trash', disabled: true },
        { type: 'break', id: 'break1' },
        { type: 'html', id: 'item5', html: "<div'><input id='service-name' type='text' placeholder='Service name'></div>" },
        { type: 'button', id: 'new', caption: 'New', icon: 'fa fa-plus', disabled: true },
    ],
    listener: new EventListener(),
    services: null,
    serviceName: "",
    onRender: function(event) {
        if (this.services === null) {
            event.onComplete = function() {
                this.services = $('#iot-services').w2field('list', {
                    icon: 'fa fa-wrench',
                    items: [
                        { id: 'fire', text: 'Fire Service', icon: 'fa fa-cogs' },
                        { id: 'security', text: 'Security Service', icon: 'fa fa-cogs' }
                    ]
                });

                this.services.change((event) => {
                    let obj = this.services.data().selected;
                    if (typeof obj.id === 'undefined') {
                        this.disable('apply');
                        this.disable('remove');
                    } else {
                        this.enable('apply');
                        this.enable('remove');
                    }

                    event.data = obj;
                    this.listener.notify('service-change', event);
                });

                this.services.addService = function(id, name) {
                    let items = this.data().w2field.options.items;
                    items.push({ id: id, text: name, icon: 'fa fa-cogs' });

                };

                this.services.removeService = function(id) {
                    let data = this.data();
                    let items = data.w2field.options.items;
                    for (let i = 0; i < items.length; i++) {
                        if (id === items[i].id) {
                            items.splice(i, 1);
                            data.w2field.refresh();
                            return true;
                        }
                    }

                    return false;
                };

                this.services.removeAllServices = function() {
                    let data = this.data();
                    let items = data.w2field.options.items;
                    items.splice(0, items.length);
                    data.selected = {};
                    data.w2field.refresh();
                };

                this.services.selectService = function(id) {
                    let data = this.data();
                    let items = this.data().w2field.options.items;
                    for (let item of items) {
                        if (item.id === id) {
                            data.selected = item;
                            this.change();
                            data.w2field.refresh();
                        }
                    }
                };

                this.services.unselectService = function() {
                    let data = this.data();
                    data.selected = {};
                    data.w2field.refresh();
                };

                this.services.getSelection = function() {
                    let data = this.data();
                    return data.selected.id;
                };

                $('#service-name').keyup(() => {
                    let name = $('#service-name').val();
                    if (name.length > 0) {
                        this.enable('new');
                        this.serviceName = name;
                    } else this.disable('new');
                });
            };
        }
    },
    onClick: function(event) {
        this.listener.notify(event.target, event);
    }
};

SBMUI.Toolbar.Top = $('#top-menu').w2toolbar(ToolbarUI.Top);

SBMUI.BoxViewer = new BoxViewer(document.getElementById('WebGL-Box'));
SBMUI.NetViewer = new NetViewer(document.getElementById('WebGL-BoxNet'));
SBMUI.BoxGUI = new BoxGUI(document.getElementById('BoxGUI'));

SBMUI.Layout.Outline.on('resize', function(event) {
    event.onComplete = function() {
        SBMUI.NetViewer.resize();
    };
});
