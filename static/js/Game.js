function Game() {
    _walls = [];
    let ended = false;
    let started = false;
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(45, innerWidth / innerHeight, 100, 10000);
    var renderer = new THREE.WebGLRenderer();
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.playing = false;
    let ref = this;
    function init(plansza) {
        var meshGeo = new THREE.PlaneGeometry(2000, 2000, 16, 16);
        meshGeo.rotateX(Math.PI / 2);
        var material = new THREE.MeshPhongMaterial({
            map: THREE.ImageUtils.loadTexture("/mat/ground.png"),
            specular: 0xffffff,
            shininess: 1,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 1
        });
        let a = new THREE.Mesh(meshGeo, material);
        a.material.map.repeat.set(50, 50); //gęstość powtarzania
        a.material.map.wrapS = a.material.map.wrapT = THREE.RepeatWrapping;
        scene.add(a)
        camera.position.set(0, 2500, 1000);
        a.receiveShadow = true;


        var directionalLight = new THREE.DirectionalLight(0xafffaf, .1);
        scene.add(directionalLight);
        directionalLight.position.set(100, 10000, 100)
        // BORDER WALLS
        new Wall(0, 50, -1000, 2000, 10).getMesh();
        new Wall(0, 50, 1000, 2000, 10).getMesh();
        new Wall(1000, 50, 0, 10, 2000).getMesh();
        new Wall(-1000, 50, 0, 10, 2000).getMesh();

        // GENERATE MAZE
        _Maze = new Maze(plansza);
        mazePoints = _Maze.points();
        scene.add(_Maze.getMesh());

        // LOAD BALL
        _Ball = new Ball(render, endGame);
        this.ball = _Ball;
        console.log(this);
        ballMesh = _Ball.getMesh()

        // -- set end
        scene.add(new Wall(mazePoints[1][0], 50, mazePoints[1][1], _Maze.step - 10.5, _Maze.step - 10.5, 1).getMesh())
        scene.add(new Wall(mazePoints[0][0], 50, mazePoints[0][1], _Maze.step - 10.5, _Maze.step - 10.5, 2).getMesh())

        renderer.setClearColor(0x000);
        renderer.setSize(window.innerWidth, window.innerHeight);
        pathmax = 0;
        const MAX_POINTS = 100000;
        var geometry = new THREE.BufferGeometry();
        var positions = new Float32Array(MAX_POINTS * 3);
        geometry.addAttribute('position', new THREE.BufferAttribute(positions, 3));
        let drawCount = 0;
        geometry.setDrawRange(0, 0);
        let ognik = new THREE.PointLight(0xff7b00, 4, 105, 2);
        ognik.position.set(0, 5000, 0);
        scene.add(ognik);
        var material = new THREE.LineBasicMaterial({ color: '#1da51d', linewidth: 6 });
        line = new THREE.Line(geometry, material);
        scene.add(line);
        let shouldDraw = false;
        camera.position.set(0, 3000, 300);
        camera.lookAt(scene.position);
        $("#root").append(renderer.domElement);
        $(window).on('resize', function () {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });
        _Ball.update(controls.keyboard, _walls, line.geometry.attributes.position.array);
        function render() {
            if (shouldDraw) {
                geometry.setDrawRange(0, drawCount++);
                let arr = line.geometry.attributes.position.array;
                ognik.position.set(arr[(drawCount - 1) * 3], 50, arr[(drawCount - 1) * 3 + 2]);
                console.log(ognik.position)
                if (drawCount == 1)
                    line.geometry.attributes.position.needsUpdate = true;
                if (drawCount == pathmax / 3 - 1) {
                    shouldDraw = false;
                    console.log('finish screen');
                }
            }
            if (!ended && started) {
                let mult = ref.playing ? 100 : 500;
                let newpos = ballMesh.position.clone().add(new THREE.Vector3(Math.cos(-ballMesh.rotation.y + Math.PI / 2) * mult, mult * 2.5, Math.sin(-ballMesh.rotation.y + Math.PI / 2) * mult));
                camera.position.lerp(newpos, 0.1);
                camera.lookAt(ballMesh.position);
            }
            requestAnimationFrame(render);
            renderer.render(scene, camera);
            if (ref.playing)
                _Ball.update(controls.keyboard, _walls, line.geometry.attributes.position.array);
        }
        function endGame(amm) {
            if (ended) return;
            let ballPos = ballMesh.position.clone();
            let center = new THREE.Vector3(0, 50, 0);
            let end = new THREE.Vector3(0, 3000, 300);
            let inter = setInterval(() => {
                ballMesh.position.y += 2;
                let p = ballPos.lerp(center, 0.01);
                if (p.distanceTo(center) < 1) {
                    camera.lookAt(center);
                } else camera.lookAt(p);

                if (camera.position.distanceTo(end) > .1) {
                    camera.position.lerp(end, 0.02);
                } else {
                    camera.position.set(end.x, end.y, end.z);
                    camera.lookAt(center);
                    clearInterval(inter);
                    pathmax = amm;
                    let arr = line.geometry.attributes.position.array;
                    arr[pathmax] = arr[pathmax++ - 3];
                    arr[pathmax++] = -300;
                    arr[pathmax] = arr[pathmax++ - 3];
                    //alert('draw sciezke');
                    shouldDraw = true;
                }

            }, 10);
            ended = true;
        }
    }
    this.i = init;
    this.getBoardId = () => _Maze.getId();
    this.start = function () {
        scene.add(ballMesh);
        // -- set start
        ballMesh.position.set(mazePoints[0][0], 50, mazePoints[0][1]);
        // ballMesh.position.set(mazePoints[1][0], 50, mazePoints[1][1]);
        ballMesh.rotation.y = _Maze.rotation();
        started = true;
    }
}
