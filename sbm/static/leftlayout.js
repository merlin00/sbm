// Left Layout
Layout.Left = {};

Layout.Main.Outline = "";

SidebarUI.Service = {
    name: 'sidebar_service',
    nodes: [{
        id: 'services',
        text: 'IoT Services',
        group: true,
        expanded: true,
        nodes: [
            { id: 'fire', text: 'Fire Service', icon: 'fa fa-cogs' },
            { id: 'security', text: 'Security Service', icon: 'fa fa-cogs' }
        ]
    }, {
        id: 'routers',
        text: 'IoT Routers',
        group: true,
        expanded: true,
        nodes: [
            { id: 'blue', text: 'Bluetooth Router', icon: 'fa fa-bluetooth' },
            { id: 'tcpblue', text: 'TCP Router', icon: 'fa fa-arrows-h' },
            { id: 'udp', text: 'UDP Router', icon: 'fa fa-exchange' }
        ]
    }],
    onClick: function(event) {
        switch (event.target) {
            case 'grid1':
                //w2ui.layout.content('main', w2ui.grid1);
                break;
            case 'grid2':
                //w2ui.layout.content('main', w2ui.grid2);
                break;
        }
    },
    addService(id, name) {
        this.add('services', { id: id, text: name, icon: 'fa fa-cogs' });
    },
    removeService(id) {
        this.remove(id);
    },
    removeAllServices() {
        let nodes = this.get('services').nodes;
        while (nodes.length !== 0) {
            this.remove(nodes[0].id);
        }
    }
};

SBMUI.Sidebar.Service = $().w2sidebar(SidebarUI.Service);
SBMUI.Layout.Outline.content('left', SBMUI.Sidebar.Service);
