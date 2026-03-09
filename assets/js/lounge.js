/* ============================================
   LOUNGE — 3D Sandbox Room
   Drag the sofa around · Click to get in touch
   ============================================ */
(function () {
    const canvas = document.getElementById('lounge-canvas');
    const card = document.getElementById('lounge-card');
    if (!canvas || !card) return;

    /* ---------- Renderer ---------- */
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: false, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x0a0e14, 1);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x0a0e14, 3, 8);

    /* ---------- Camera ---------- */
    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
    camera.position.set(0, 1.4, 2.0);
    camera.lookAt(0, 0, 0);

    /* ---------- Lights (warm & cozy) ---------- */
    const ambient = new THREE.AmbientLight(0xdde8ff, 0.35);
    scene.add(ambient);

    const mainLight = new THREE.DirectionalLight(0xe0eaff, 0.7);
    mainLight.position.set(2, 5, 3);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.set(512, 512);
    mainLight.shadow.camera.near = 0.1;
    mainLight.shadow.camera.far = 20;
    mainLight.shadow.camera.left = -4;
    mainLight.shadow.camera.right = 4;
    mainLight.shadow.camera.top = 4;
    mainLight.shadow.camera.bottom = -4;
    scene.add(mainLight);

    /* Teal accent from the side */
    const tealLight = new THREE.PointLight(0x3d8899, 0.5, 8);
    tealLight.position.set(-1.5, 1.5, 1);
    scene.add(tealLight);

    /* Cool accent for contrast */
    const coolLight = new THREE.PointLight(0x667eea, 0.25, 8);
    coolLight.position.set(2, 1.5, -1);
    scene.add(coolLight);

    /* ---------- Floor (dark wood feel) ---------- */
    const floorGeo = new THREE.PlaneGeometry(8, 8);
    const floorMat = new THREE.MeshStandardMaterial({
        color: 0x0e1318,
        roughness: 0.9,
        metalness: 0.0,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.25;
    floor.receiveShadow = true;
    scene.add(floor);

    /* ---------- Room walls (dark, subtle) ---------- */
    const wallMat = new THREE.MeshStandardMaterial({
        color: 0x0c1119,
        roughness: 1.0,
        side: THREE.BackSide,
    });
    const backWall = new THREE.Mesh(new THREE.PlaneGeometry(8, 3), wallMat);
    backWall.position.set(0, 1.2, -4);
    scene.add(backWall);

    const leftWall = new THREE.Mesh(new THREE.PlaneGeometry(8, 3), wallMat);
    leftWall.rotation.y = Math.PI / 2;
    leftWall.position.set(-4, 1.2, 0);
    scene.add(leftWall);

    const rightWall = new THREE.Mesh(new THREE.PlaneGeometry(8, 3), wallMat);
    rightWall.rotation.y = -Math.PI / 2;
    rightWall.position.set(4, 1.2, 0);
    scene.add(rightWall);

    /* ---------- Potted Plant ---------- */
    (function buildPlant() {
        const plant = new THREE.Group();

        /* Pot */
        const potGeo = new THREE.CylinderGeometry(0.12, 0.09, 0.18, 8);
        const potMat = new THREE.MeshStandardMaterial({ color: 0x8b5e3c, roughness: 0.9 });
        const pot = new THREE.Mesh(potGeo, potMat);
        pot.position.y = 0.09;
        pot.castShadow = true;
        pot.receiveShadow = true;
        plant.add(pot);

        /* Soil */
        const soilGeo = new THREE.CylinderGeometry(0.11, 0.11, 0.03, 8);
        const soilMat = new THREE.MeshStandardMaterial({ color: 0x2a1e14, roughness: 1.0 });
        const soil = new THREE.Mesh(soilGeo, soilMat);
        soil.position.y = 0.17;
        plant.add(soil);

        /* Stem */
        const stemGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.28, 6);
        const stemMat = new THREE.MeshStandardMaterial({ color: 0x3a5a2a, roughness: 0.8 });
        const stem = new THREE.Mesh(stemGeo, stemMat);
        stem.position.y = 0.32;
        stem.castShadow = true;
        plant.add(stem);

        /* Leaves (clusters of spheres) */
        const leafMat = new THREE.MeshStandardMaterial({ color: 0x2d6b3f, roughness: 0.7 });
        const leafPositions = [
            [0, 0.48, 0, 0.09],
            [-0.06, 0.44, 0.04, 0.07],
            [0.05, 0.42, -0.03, 0.065],
            [0.02, 0.52, 0.03, 0.06],
            [-0.04, 0.50, -0.04, 0.055],
        ];
        leafPositions.forEach(function (lp) {
            const leafGeo = new THREE.SphereGeometry(lp[3], 6, 5);
            const leaf = new THREE.Mesh(leafGeo, leafMat);
            leaf.position.set(lp[0], lp[1], lp[2]);
            leaf.castShadow = true;
            plant.add(leaf);
        });

        plant.position.set(1.15, -0.25, -0.15);
        scene.add(plant);
    })();

    /* ---------- Load Sofa ---------- */
    let sofa = null;
    const BOUNDS = 2.0;

    const matOverrides = {
        mat23: 0x2a2a2a,
        mat17: 0x1e3a50,
        mat16: 0x3d6b80,
        mat19: 0xe87a1a,
        mat22: 0x6a6a6a,
        mat15: 0xa8bcc2,
    };

    function placeSofa(object) {
        const box = new THREE.Box3().setFromObject(object);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = maxDim > 0 ? 1.8 / maxDim : 1;
        object.scale.setScalar(scale);

        box.setFromObject(object);
        box.getCenter(center);
        object.position.set(-center.x, -box.min.y - 0.25, -center.z);

        object.traverse(function (child) {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
                const materialName = child.material && child.material.name;
                if (materialName && matOverrides[materialName] !== undefined) {
                    child.material = new THREE.MeshStandardMaterial({
                        color: matOverrides[materialName],
                        roughness: 0.72,
                        metalness: 0.0,
                    });
                } else if (child.material) {
                    child.material = new THREE.MeshStandardMaterial({
                        color: 0x566372,
                        roughness: 0.72,
                        metalness: 0.0,
                    });
                }
            }
        });

        object.rotation.y = Math.PI;
        sofa = object;
        scene.add(sofa);
    }

    function loadPlainOBJ() {
        const objLoader = new THREE.OBJLoader();
        objLoader.setPath('Couch/');
        objLoader.load(
            'model.obj',
            placeSofa,
            undefined,
            function (err) {
                console.error('[Lounge] OBJ load failed. Run site via HTTP server.', err);
            }
        );
    }

    function loadWithMTL() {
        const mtlLoader = new THREE.MTLLoader();
        mtlLoader.setPath('Couch/');
        mtlLoader.load(
            'materials.mtl',
            function (materials) {
                materials.preload();
                const objLoader = new THREE.OBJLoader();
                objLoader.setMaterials(materials);
                objLoader.setPath('Couch/');
                objLoader.load(
                    'model.obj',
                    placeSofa,
                    undefined,
                    function (err) {
                        console.warn('[Lounge] OBJ+MTL load failed. Retrying OBJ only.', err);
                        loadPlainOBJ();
                    }
                );
            },
            undefined,
            function (err) {
                console.warn('[Lounge] MTL failed. Retrying OBJ only.', err);
                loadPlainOBJ();
            }
        );
    }

    loadWithMTL();

    /* ---------- Resize ---------- */
    function resize() {
        const w = card.clientWidth;
        const h = card.clientHeight;
        if (w === 0 || h === 0) return;
        renderer.setSize(w, h);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
    }
    resize();
    new ResizeObserver(resize).observe(card);

    /* ---------- Camera orbit ---------- */
    let orbiting = false;
    let prevX = 0;
    let prevY = 0;
    let theta = Math.atan2(camera.position.x, camera.position.z); // horizontal angle
    let phi = Math.acos(camera.position.y / camera.position.length()); // vertical angle
    const radius = camera.position.length();
    const PHI_MIN = 0.3;
    const PHI_MAX = Math.PI / 2 - 0.05;

    function updateCamera() {
        camera.position.x = radius * Math.sin(phi) * Math.sin(theta);
        camera.position.y = radius * Math.cos(phi);
        camera.position.z = radius * Math.sin(phi) * Math.cos(theta);
        camera.lookAt(0, 0, 0);
    }

    function onDown(cx, cy) {
        orbiting = true;
        prevX = cx;
        prevY = cy;
    }

    function onMove(cx, cy) {
        if (!orbiting) return;
        const dx = cx - prevX;
        const dy = cy - prevY;
        prevX = cx;
        prevY = cy;
        theta -= dx * 0.005;
        phi = Math.max(PHI_MIN, Math.min(PHI_MAX, phi + dy * 0.005));
        updateCamera();
    }

    function onUp() {
        orbiting = false;
    }

    canvas.addEventListener('mousedown', (e) => { e.preventDefault(); onDown(e.clientX, e.clientY); });
    window.addEventListener('mousemove', (e) => onMove(e.clientX, e.clientY));
    window.addEventListener('mouseup', onUp);

    canvas.addEventListener('touchstart', (e) => { onDown(e.touches[0].clientX, e.touches[0].clientY); }, { passive: true });
    canvas.addEventListener('touchmove', (e) => { onMove(e.touches[0].clientX, e.touches[0].clientY); e.preventDefault(); }, { passive: false });
    canvas.addEventListener('touchend', onUp);

    /* ---------- Animate ---------- */
    function animate() {
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
    }
    animate();
})();
