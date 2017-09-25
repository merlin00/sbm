const API_URL = 'http://' + window.location.hostname + ':3000/api/ontology';

const URL_ENTITIES = API_URL + '/entities/';
const URL_ENTITY = API_URL + '/entity/';

class SBMTool {
    constructor() {
        this._entity = new Map();
        this._styles = new Map();
    }

    get entity() {
        return this._entity;
    }

    get styles() {
        return this._styles;
    }

    deploy(session, pos) {
        this.loadStyle(session, (style) => {
            console.log(style);
            SBMUI.NetViewer.addBox(session, style.getBoxModel(), pos);
            SBMUI.Table.Deploy.addEntity(SBM.entity.get(session));
        });
    }

    link(s1, s2) {
        if (SBMUI.NetViewer.addLink(s1, s2)) {
            SBMUI.Table.Link.addLink(this.entity.get(s1), this.entity.get(s2));
            return true;
        }
        return false;
    }

    load() {
        $.ajax({
            url: URL_ENTITIES,
            type: 'get',
            success: (entities) => {
                SBMUI.Table.Entity.clear();

                for (let entity of entities) {
                    this.entity.set(Number(entity.session), entity);
                    SBMUI.Table.Entity.addEntity(entity);
                }
            }
        });

        $.ajax({
            url: 'http://' + window.location.hostname + ':3000/api/services',
            type: 'get',
            success: (val) => {
                let sidebar = SBMUI.Sidebar.Service;
                let top = SBMUI.Toolbar.Top.services;

                sidebar.removeAllServices();
                top.removeAllServices();
                for (let service of val) {
                    top.addService(service._id, service.name);
                    sidebar.addService(service._id, service.name);
                }
            }
        });
    }

    loadStyle(session, callback) {
        let style = this.styles.get(session);

        if (typeof style === 'undefined') {
            style = new BoxStyle(session, new BoxModel());
            style.load((err, style) => {
                this.styles.set(session, style);
                if (typeof callback !== 'undefined') {
                    callback(style);
                }
            });
        } else {
            if (typeof callback !== 'undefined') {
                callback(style);
            }
        }
    }

    loadBoxGUI(session, topic) {
        this.loadStyle(session, (style) => {
            if (style !== null) {
                SBMUI.BoxViewer.load(style, topic);
                SBMUI.BoxGUI.load(style, topic);
            }
        });
    }

    loadService(id) {
        SBMUI.Table.Deploy.clear();
        SBMUI.Table.Link.clear();
        SBMUI.NetViewer.clearNet();

        let url = 'http://' + window.location.hostname + ':3000/api/service/get/' + id;

        $.ajax({
            url: url,
            type: 'get',
            success: (service) => {
                if (service.entities !== null) {
                    for (let entity of service.entities) {
                        this.deploy(entity.session, {
                            x: entity.x,
                            y: entity.y,
                            z: entity.z
                        });
                    }
                }

                if (service.links !== null) {
                    w2popup.open({
                        width: 210,
                        height: 100,
                        color: '#fff',
                        speed: '0.3',
                        opacity: '0.4',
                    });
                    w2popup.lock('Loading...', true);
                    setTimeout(this.delayLinks, 0, service.entities, service.links, 50, this);
                }
            }
        });
    }

    delayLinks(entities, links, count, obj) {
        if (count < 0) {
            w2popup.unlock();
            w2popup.close();
            return;
        }

        for (let entity of entities) {
            let t = obj.styles.get(entity.session);
            if (typeof t === 'undefined') {
                setTimeout(obj.delayLinks, 100, entities, links, count--, obj);
                return;
            }
        }

        for (let link of links) {
            obj.link(link.s1, link.s2);
        }
        w2popup.unlock();
        w2popup.close();
    }

    applyService(id) {
        let service = {};

        service.entities = [];
        service.links = [];

        for (let item of SBMUI.NetViewer.net) {
            service.entities.push({
                session: Number(item[0]),
                x: Number(item[1].position.x),
                y: Number(item[1].position.y),
                z: Number(item[1].position.z)
            });
        }

        for (let line of SBMUI.NetViewer.lines) {
            service.links.push({
                s1: line.session[0],
                s2: line.session[1]
            });
        }

        let url = 'http://' + window.location.hostname + ':3000/api/service/' + id;
        $.ajax({
            url: url,
            type: 'post',
            data: service,
            success: (val) => {}
        });
    }
}

const SBM = new SBMTool();

function animate() {
    requestAnimationFrame(animate);
    SBMUI.BoxViewer.animate();
    SBMUI.NetViewer.animate();
}

function showPopupMessage(width, height, msg, time) {
    w2popup.open({
        body: '<div class="w2ui-centered">' + msg + '</div>',
        width: width,
        height: height,
        color: '#fff',
        speed: '0.3',
        opacity: '0.4',
    });

    setTimeout(function() {
        w2popup.close();
    }, time);
}

SBMUI.NetViewer.on('selected-box', function(obj) {
    let entity = SBM.entity.get(Number(obj.session));
    SBM.loadBoxGUI(entity.session, entity.topic);

    let index = SBMUI.Table.Deploy.find({ session: obj.session });

    let selections = SBMUI.Table.Deploy.getSelection();
    for (let i of selections) {
        SBMUI.Table.Deploy.unselect(i);
    }
    SBMUI.Table.Deploy.select(index[0]);
});

SBMUI.Table.Entity.on('edit', (event) => {
    openPopup();
});

SBMUI.Table.Entity.on('remove', (event) => {
    let data = SBMUI.Table.Entity.getSelection();
    var session = [];
    for (let i of data) {
        session.push(SBMUI.Table.Entity.get(i).session);
        SBMUI.Table.Entity.remove(i);
    }

    session.forEach((item, index) => {
        $.ajax({
            url: URL_ENTITY + item,
            type: 'delete',
            success: (val) => {}
        });
    });
});

SBMUI.Table.Entity.on('selected-record', (record) => {
    let entity = SBM.entity.get(Number(record.session));
    SBM.loadBoxGUI(entity.session, entity.topic);
    SBMUI.NetViewer.select(entity.session);
    SBMUI.Table.Deploy.selectNone();
});

SBMUI.Table.Entity.on('selected-sub-record', (event) => {
    let tag = [];
    let item = SBM.entity.get(Number(event.session));

    SBMUI.Table.Tag.clearTag();

    if (event.recid === "1") {
        tag = item.inputs.tag;
        SBMUI.Table.Tag.header = event.session + ":iTags";
    } else if (event.recid === "2") {
        tag = item.outputs.tag;
        SBMUI.Table.Tag.header = event.session + ":oTags";
    } else {
        SBMUI.Table.Tag.header = "Tag";
    }

    for (let item of tag) {
        SBMUI.Table.Tag.addTag(item.name);
    }
});

SBMUI.Table.Entity.on('deploy', (event) => {
    let data = SBMUI.Table.Entity.getSelection();
    let count = 0;
    let msg = "";
    let pos = { x: 0, y: 0, z: 0 };

    for (let i of data) {
        let session = SBMUI.Table.Entity.get(i).session;
        SBM.deploy(session, pos);
        count++;
    }

    if (count === 0) {
        msg = "Select any entities to deploy.";
    } else {
        msg = "Deployed " + count;
        if (count === 1) {
            msg += " entity";
        } else {
            msg += " entities";
        }
    }

    event.onComplete = function() {
        $('#tb_table_entity_toolbar_item_deploy').w2overlay({
            html: '<div style="padding: 10px; line-height: 150%">' + msg + '</div>'
        });
        setTimeout(function() {
            $('#tb_table_entity_toolbar_item_deploy').w2overlay();
        }, 2500);
    };

    SBMUI.Table.Entity.selectNone();
});

SBMUI.Table.Deploy.on('selected-record', (record) => {
    let entity = SBM.entity.get(Number(record.session));
    SBM.loadBoxGUI(entity.session, entity.topic);
    SBMUI.NetViewer.select(entity.session);
    SBMUI.Table.Entity.selectNone();
});

SBMUI.Table.Deploy.on('link', (event) => {
    let selections = SBMUI.Table.Deploy.getSelection();
    let s = [];
    let msg = null;

    if (selections.length < 2) {
        msg = 'Select two entities to link.';
    } else {
        for (let i of selections) {
            s.push(SBMUI.Table.Deploy.get(i).session);
        }

        if (SBM.link(s[0], s[1])) {
            msg = 'Completed to link entities.';
        } else {
            msg = 'Already Linked the entities.';
        }
        SBMUI.Table.Deploy.selectNone();
    }

    event.onComplete = function() {
        $('#tb_table_deploy_toolbar_item_link').w2overlay({
            html: '<div style="padding: 10px; line-height: 150%">' + msg + '</div>'
        });
        setTimeout(function() {
            $('#tb_table_deploy_toolbar_item_link').w2overlay();
        }, 2500);
    };
});

SBMUI.Table.Deploy.on('remove', (event) => {
    let selections = SBMUI.Table.Deploy.getSelection();
    let msg = "";
    let links = 0;

    for (let i of selections) {
        let record = SBMUI.Table.Deploy.get(i);
        SBMUI.Table.Deploy.remove(record.recid);
        SBMUI.NetViewer.removeBox(record.session);

        let nums = SBMUI.Table.Link.find({ session1: record.session });
        for (let i of nums) {
            let item = SBMUI.Table.Link.get(i);
            SBMUI.NetViewer.removeLink(item.session1, item.session2);
            SBMUI.Table.Link.remove(i);
            links++;
        }

        nums = SBMUI.Table.Link.find({ session2: record.session });
        for (let i of nums) {
            let item = SBMUI.Table.Link.get(i);
            SBMUI.NetViewer.removeLink(item.session1, item.session2);
            SBMUI.Table.Link.remove(i);
            links++;
        }
    }

    if (selections.length === 0) {
        msg = "Select any entities to remove.";
    } else {
        msg = "Removed " + selections.length;
        if (selections.length === 1) { msg += " entity"; } else { msg += " entities"; }
    }

    if (links > 0) {
        msg += "<br>Removed " + links;
        if (links === 1) {
            msg += " link.";
        } else {
            msg += " links.";
        }
    }

    SBMUI.Table.Deploy.selectNone();

    event.onComplete = function() {
        $('#tb_table_deploy_toolbar_item_remove').w2overlay({
            html: '<div style="padding: 10px; line-height: 150%">' + msg + '</div>'
        });
        setTimeout(function() {
            $('#tb_table_deploy_toolbar_item_remove').w2overlay();
        }, 2500);
    };
});

SBMUI.Table.Link.on('remove', (event) => {
    let selections = SBMUI.Table.Link.getSelection();
    let msg = "";

    for (let i of selections) {
        let record = SBMUI.Table.Link.get(i);
        SBMUI.NetViewer.removeLink(record.session1, record.session2);
        SBMUI.Table.Link.remove(record.recid);
    }

    if (selections.length === 0) {
        msg = "Select any links to remove.";
    } else {
        msg = "Removed " + selections.length;
        if (selections.length === 1) { msg += " link"; } else { msg += " links"; }
    }

    SBMUI.Table.Link.selectNone();

    event.onComplete = function() {
        $('#tb_table_link_toolbar_item_remove').w2overlay({
            html: '<div style="padding: 10px; line-height: 150%">' + msg + '</div>'
        });
        setTimeout(function() {
            $('#tb_table_link_toolbar_item_remove').w2overlay();
        }, 2500);
    };
});



SBMUI.Toolbar.Top.listener.on('apply', (event) => {
    let services = SBMUI.Toolbar.Top.services;
    let id = services.getSelection();
    SBM.applyService(id);
    showPopupMessage(200, 50, 'Applying this service.', 1000);
});

SBMUI.Toolbar.Top.listener.on('new', (event) => {
    let services = SBMUI.Toolbar.Top.services;
    let name = SBMUI.Toolbar.Top.serviceName;

    let url = 'http://' + window.location.hostname + ':3000/api/service/' + name;
    $.ajax({
        url: url,
        type: 'get',
        success: (val) => {
            services.addService(val.uuid, name);
            services.selectService(val.uuid);
            SBMUI.Sidebar.Service.addService(val.uuid, name);
        }
    });
});

SBMUI.Toolbar.Top.listener.on('remove', (event) => {
    let services = SBMUI.Toolbar.Top.services;
    let id = services.getSelection();

    let url = 'http://' + window.location.hostname + ':3000/api/service/remove/' + id;
    $.ajax({
        url: url,
        type: 'get',
        success: (val) => {
            SBMUI.Sidebar.Service.removeService(id);
            services.removeService(id);
            services.unselectService();
            showPopupMessage(200, 50, 'Removed a service.', 1000);
        }
    });
});

SBMUI.Toolbar.Top.listener.on('service-change', (event) => {
    SBM.loadService(event.data.id);
});

$(function() {
    SBM.load();
    animate();
});
