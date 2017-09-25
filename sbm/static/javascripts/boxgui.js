class BoxGUI {
    constructor(elem) {
        this._style = null;
        this._gui = new dat.GUI({
            auto: true,
            autoPlace: false
        });

        this._gui.close();

        elem.appendChild(this._gui.domElement);

        this._items = {
            session: "Session",
            topic: "Topci Name",
            size: 15,
            color: 0xFFFFFF,
            state: "",
        };

        this._items.apply = () => {
            if (this._style === null) {
                this._items.state = "Haven't loaded box style";
                this.updateBoxStyle();
                return;
            }
            this._style.save();
        };

        this._infoFolder = this._buildInfoGUI("Entity Infomation", this._items);
        this._styleFolder = this._buildStyleGUI('Box Style', this._items);
        this.updateBoxStyle();
    }

    get boxStyle() {
        return this._style;
    }

    load(style, topic) {
        let items = this._items;

        this._style = style;

        items.topic = topic;
        items.session = style.session;
        items.size = style.size;
        items.color = style.color;
        items.state = 'Loaded the box';

        this.updateBoxInfo();
        this.updateBoxStyle();

        this._gui.open();
    }

    _buildInfoGUI(name, items) {
        let folder = this._gui.addFolder(name);
        let controller = folder.add(items, 'session');
        controller.domElement.firstChild.disabled = true;

        controller = folder.add(items, 'topic');
        controller.domElement.firstChild.disabled = true;
        folder.open();

        return folder;
    }

    _buildStyleGUI(name, items) {
        let folder = this._gui.addFolder(name);

        let controller = folder.add(items, 'state');
        controller.domElement.firstChild.disabled = true;
        folder.add(items, 'apply', 'apply');

        folder.add(items, 'size', 5, 20).onChange((val) => {
            if (this._style !== null) {
                items.state = 'Changed box style.';
                this._style.size = val;
            } else {
                items.state = "Haven't Loaded box style";
            }
            this.updateBoxStyle();
        });

        folder.addColor(items, 'color').onChange((val) => {
            if (this._style !== null) {
                items.state = "Changed box style.";

                if (typeof this._items.color === 'string') {
                    val = parseInt(val.replace(/^#/, ''), 16);
                }

                this._style.color = val;
            } else {
                items.state = "Haven't Loaded box style";
            }
            this.updateBoxStyle();
        });
        folder.open();

        return folder;
    }

    updateBoxInfo() {
        for (let i in this._infoFolder.__controllers) {
            this._infoFolder.__controllers[i].updateDisplay();
        }
    }
    updateBoxStyle() {
        for (let i in this._styleFolder.__controllers) {
            this._styleFolder.__controllers[i].updateDisplay();
        }
    }
}
