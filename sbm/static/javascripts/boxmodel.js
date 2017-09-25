class BoxModel {
    constructor() {
        this._size = 20;
        this._geometry = new THREE.BoxGeometry(this._size,
            this._size,
            this._size);

        this._material = new THREE.MeshPhongMaterial({
            color: 0xFFFFFF
        });

        this._mesh = new THREE.Mesh(this._geometry, this._material);
    }

    rotation(x, y) {
        this._mesh.rotation.x += x;
        this._mesh.rotation.y += y;
    }

    setPosition(x, y, z) {
        this._mesh.position.x = x;
        this._mesh.position.y = y;
        this._mesh.position.z = z;
    }

    get size() {
        return this._size;
    }
    set size(size) {
        this._size = size;
        this._mesh.geometry.dispose();
        this._mesh.geometry = new THREE.BoxBufferGeometry(size, size, size);
    }

    get color() {
        return this._material.color.getHex();
    }
    set color(color) { this._material.color.set(color); }
    get mesh() {
        return this._mesh;
    }
}

class BoxStyle {
    constructor(session, model) {
        this._url = 'http://' + window.location.hostname + ':3000/api/ontology/boxstyle/';
        this._session = session;
        this._model = model;
        model.size = 15;
        model.color = 0xFFFFFF;
    }

    getBoxModel() {
        return this._model;
    }

    get session() {
        return this._session;
    }

    get size() {
        if (this._model === 'undefined') {
            return 0;
        } else {
            return this._model.size;
        }
    }

    set size(size) {
        if (this._model === 'undefined') {
            return;
        } else {
            this._model.size = size;
        }
    }

    get color() {
        if (this._model === 'undefined') {
            return 0x000000;
        } else {
            return this._model.color;
        }
    }

    set color(color) {
        if (this._model === 'undefined') {
            return;
        } else {
            this._model.color = color;
        }
    }

    load(callback) {
        $.ajax({
            url: this._url + this._session,
            type: 'get',
            success: (style) => {
                this.color = style.color;
                this.size = style.size;
                if (typeof callback !== 'undefined') {
                    callback(null, this);
                }
            }
        });
    }

    save(callback) {
        $.ajax({
            url: this._url + this._session,
            type: 'put',
            data: {
                style: {
                    size: this.size,
                    color: this.color
                }
            },
            success: (data) => {
                if (typeof callback !== 'undefined') {
                    callback(null, this);
                }
            }
        });
    }
}

class BoxViewer {
    constructor(elem) {
        let width = $(elem).width();
        let height = $(elem).height();

        this._style = null;
        this._scene = new THREE.Scene();
        this._camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 50);
        this._camera.position.z = 30;
        this._renderer = new THREE.WebGLRenderer({
            antialias: true
        });

        this._renderer.setPixelRatio(window.devicePixelRatio);
        this._renderer.setSize(width, height);
        this._renderer.setClearColor(0xffffff);
        elem.appendChild(this._renderer.domElement);

        this._ambientLight = new THREE.AmbientLight(0x000000);
        this._scene.add(this._ambientLight);

        this._lights = [];

        this._lights[0] = new THREE.PointLight(0xffffff, 1, 0);
        this._lights[1] = new THREE.PointLight(0xffffff, 1, 0);
        this._lights[2] = new THREE.PointLight(0xffffff, 1, 0);

        this._lights[0].position.set(0, 200, 0);
        this._lights[1].position.set(100, 200, 100);
        this._lights[2].position.set(-100, -200, -100);

        this._scene.add(this._lights[0]);
        this._scene.add(this._lights[1]);
        this._scene.add(this._lights[2]);

        elem.addEventListener('resize', function() {
            let width = $(elem).width();
            let height = $(elem).height();

            this._camera.aspect = width / height;
            this._camera.updateProjectionMatrix();
            this._renderer.setSize(width, height);
        }, false);

        this._renderer.render(this._scene, this._camera);
    }

    getBoxStyle() {
        return this._style;
    }

    load(style, topic) {
        let model;
        if (this._style !== null) {
            model = this._style.getBoxModel();
            this._scene.remove(model.mesh);
        }

        model = style.getBoxModel();
        model.setPosition(0, 0, 0);

        this._style = style;
        this._scene.add(model.mesh);

        this._renderer.render(this._scene, this._camera);
    }

    animate() {
        if (this._style !== null) {
            let model = this._style.getBoxModel();
            model.rotation(0.010, 0.010);
        }
        this._renderer.render(this._scene, this._camera);
    }
}
