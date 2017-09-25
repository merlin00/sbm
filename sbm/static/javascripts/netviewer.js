class NetControls {
    constructor(camera, meshs, netRender) {
        let orbit = new THREE.OrbitControls(camera, netRender.domElement);
        let transform = new THREE.TransformControls(camera, netRender.domElement);
        let drag = new THREE.DragControls(camera, meshs, netRender.domElement);

        this._hide = null;

        orbit.damping = 0.2;

        orbit.addEventListener('change', () => { netRender.render(); });

        transform.addEventListener('change', () => { netRender.render(); });

        // Hiding transform situation is a little in a mess :()
        transform.addEventListener('change', (e) => { this.cancelHideTransorm(); });
        transform.addEventListener('mouseDown', (e) => { this.cancelHideTransorm(); });
        transform.addEventListener('mouseUp', (e) => { this.delayHideTransform(); });

        drag.on('hoveron', (e) => {
            transform.attach(e.object);
            this.cancelHideTransorm();
        });

        drag.on('hoveroff', (e) => {
            if (e) this.delayHideTransform();
        });

        orbit.addEventListener('start', () => { this.cancelHideTransorm(); });
        orbit.addEventListener('end', () => { this.delayHideTransform(); });

        this._orbit = orbit;
        this._transform = transform;
        this._drag = drag;
    }

    get orbit() {
        return this._orbit;
    }
    get transform() {
        return this._transform;
    }
    get drag() {
        return this._drag;
    }

    delayHideTransform() {
        this.cancelHideTransorm();
        this.hideTransform();
    }

    hideTransform(ms) {
        let time = ms;
        if (typeof ms === "undefined") {
            time = 2500;
        }

        this._hide = setTimeout(() => {
            this._transform.detach(this._transform.object);
        }, time);
    }

    cancelHideTransorm() {
        if (this._hide) clearTimeout(this._hide);
    }
}

function NetLights(scene) {
    let light = new THREE.SpotLight(0xffffff, 1.5);

    light.position.set(0, 1500, 200);
    light.castShadow = true;
    light.shadow = new THREE.LightShadow(new THREE.PerspectiveCamera(70, 1, 200, 2000));
    light.shadow.bias = -0.000222;
    light.shadow.mapSize.width = 1024;
    light.shadow.mapSize.height = 1024;

    scene.add(new THREE.AmbientLight(0xf0f0f0));
    scene.add(light);
}

function NetPlaneGeo(scene) {
    let planeGeometry = new THREE.PlaneGeometry(2000, 2000);
    let planeMaterial = new THREE.ShadowMaterial();

    planeGeometry.rotateX(-Math.PI / 2);
    planeMaterial.opacity = 0.2;

    let plane = new THREE.Mesh(planeGeometry, planeMaterial);
    let helper = new THREE.GridHelper(1000, 100);

    plane.position.y = -200;
    plane.receiveShadow = true;

    helper.position.y = -199;
    helper.material.opacity = 0.25;
    helper.material.transparent = true;

    scene.add(plane);
    scene.add(helper);
}

class NetRender {
    constructor(width, height) {
        this._scene = new THREE.Scene();
        this._camera = new THREE.PerspectiveCamera(70, width / height, 1, 10000);
        this._camera.position.z = 500;
        this._scene.add(this._camera);

        NetLights(this._scene);
        NetPlaneGeo(this._scene);

        var axis = new THREE.AxisHelper();
        axis.position.set(-500, -500, -500);
        this._scene.add(axis);

        this._renderer = new THREE.WebGLRenderer({
            antialias: true
        });

        this._renderer.setClearColor(0xf0f0f0);
        this._renderer.setPixelRatio(window.devicePixelRatio);
        this._renderer.setSize(width, height);
        this._renderer.shadowMap.enabled = true;

        this.render();
    }

    get scene() {
        return this._scene;
    }
    get camera() {
        return this._camera;
    }
    get renderer() {
        return this._renderer;
    }
    get domElement() {
        return this._renderer.domElement;
    }

    render() { this._renderer.render(this._scene, this._camera); }
}

const ARC_SEGMENTS = 2;

function createNetLine(p1, p2) {
    let geometry = new THREE.Geometry();

    for (let i = 0; i < ARC_SEGMENTS; i++) {
        geometry.vertices.push(new THREE.Vector3());
    }

    let line;

    line = new THREE.CatmullRomCurve3([p1, p2]);
    line.type = 'catmullrom';
    line.mesh = new THREE.Line(geometry.clone(), new THREE.LineBasicMaterial({
        color: 0xff0000,
        opacity: 0.35,
        linewidth: 0.5
    }));

    line.mesh.material.ambient = line.mesh.material.color;
    line.mesh.castShadow = true;

    updateNetLine(line);

    return line;
}

function updateNetLine(line) {
    let p;

    for (let i = 0; i < ARC_SEGMENTS; i++) {
        p = line.mesh.geometry.vertices[i];
        p.copy(line.getPoint(i / (ARC_SEGMENTS - 1)));
    }

    line.mesh.geometry.verticesNeedUpdate = true;
}

class NetViewer extends EventListener {
    constructor(elem) {
        super();
        this._elem = elem;

        this._net = new Map();
        this._lines = new Set();
        this._meshs = [];

        this._hoveronBoxMesh = null;
        this._selectedBoxMesh = null;

        let width = $(elem).width(),
            height = $(elem).height();

        let netRender = new NetRender(width, height);
        let renderer = netRender.renderer;
        let scene = netRender.scene;
        elem.appendChild(netRender.domElement);

        let controls = new NetControls(netRender.camera, this._meshs, netRender);
        scene.add(controls.transform);

        controls.drag.on('hoveron', (e) => {
            this.hoveronBoxMesh = e.object;
            this.notify('hoveron-box', this.hoveronBoxMesh);
        });

        controls.drag.on('hoveroff', (e) => {
            this.hoveronBoxMesh = null;
            this.notify('hoveroff-box', null);
        });

        controls.transform.addEventListener('objectChange', (e) => {
            let lines = this._lines;
            for (let line of lines) {
                updateNetLine(line);
            }
        });

        netRender.domElement.addEventListener('click', () => {
            if (this.hoveronBoxMesh !== null) {
                this.selectedBoxMesh = this.hoveronBoxMesh;
                this.notify("selected-box", this.selectedBoxMesh);
            }
        });

        this._netRender = netRender;
        this._controls = controls;
    }

    get selectedBoxMesh() {
        return this._selectedBoxMesh;
    }
    set selectedBoxMesh(boxMesh) { this._selectedBoxMesh = boxMesh; }

    get hoveronBoxMesh() {
        return this._hoveronBoxMesh;
    }
    set hoveronBoxMesh(boxMesh) { this._hoveronBoxMesh = boxMesh; }

    get controls() {
        return this._controls;
    }
    get lines() {
        return this._lines;
    }

    get net() {
        return this._net;
    }

    addBox(session, box, pos) {
        let net = this._net,
            mesh = box.mesh.clone();

        console.log(box);
        let obj = net.get(session);
        if (typeof obj !== 'undefined') return;

        net.set(session, mesh);

        mesh.castShadow = true;
        mesh.receiveShadow = true;

        mesh.position.x = pos.x;
        mesh.position.y = pos.y;
        mesh.position.z = pos.z;

        mesh.session = session;

        let scene = this._netRender.scene;

        scene.add(mesh);
        this._meshs.push(mesh);
        this._netRender.render();
    }

    removeBox(session) {
        let mesh = this._net.get(session);

        this._net.delete(session);
        this._meshs.splice(this._meshs.indexOf(mesh), 1);

        let list = [];
        for (let line of this._lines) {
            if (line.session[0] === session || line.session[1] === session) {
                list.push(line);
                this._lines.delete(line);
            }
        }

        for (let line of list) {
            this._netRender.scene.remove(line.mesh);
        }

        this._netRender.scene.remove(mesh);
        this._controls.hideTransform(100);
        this._netRender.render();
    }

    checkLink(s1, s2) {
        for (let line of this._lines) {
            if ((s1 === line.session[0] && s2 === line.session[1]) ||
                (s2 === line.session[0] && s1 === line.session[1])) {
                return true;
            }
        }
        return false;
    }

    addLink(s1, s2) {
        if (this.checkLink(s1, s2)) {
            return false;
        }
        let net = this._net,
            obj1 = net.get(Number(s1)),
            obj2 = net.get(Number(s2)),
            line = createNetLine(obj1.position, obj2.position),
            scene = this._netRender.scene;

        line.session = [];
        line.session.push(Number(s1));
        line.session.push(Number(s2));
        scene.add(line.mesh);
        this._lines.add(line);
        this._netRender.render();

        return true;
    }

    removeLink(s1, s2) {
        let scene = this._netRender.scene;

        for (let line of this._lines) {
            if ((s1 === line.session[0] && s2 === line.session[1]) ||
                (s2 === line.session[0] && s1 === line.session[1])) {
                scene.remove(line.mesh);
                this._lines.delete(line);
                this._netRender.render();
            }
        }
    }

    select(session) {
        for (let mesh of this._meshs) {
            if (mesh.session === session) {
                this.selectedBoxMesh = mesh;
                return;
            }
        }
        this.selectedBoxMesh = null;
    }

    checkBox(session) {
        let obj = this._net.get(session);

        if (typeof obj === 'undefined') {
            return false;
        }

        return true;
    }

    clearNet() {
        for (let key of this._net.keys()) {
            this.removeBox(key);
        }
    }

    resize() {
        let width = $(this._elem).width(),
            height = $(this._elem).height(),
            render = this._netRender,
            camera = render.camera;

        camera.aspect = width / height;
        camera.updateProjectionMatrix();

        render.renderer.setSize(width, height);
    }

    animate() {
        if (this.selectedBoxMesh !== null) {
            this.selectedBoxMesh.rotation.x += 0.01;
            this.selectedBoxMesh.rotation.y += 0.01;
        }
        this._netRender.render();
    }
}
