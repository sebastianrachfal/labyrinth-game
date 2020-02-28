function Ball(cb, endGame) {
    let container = new THREE.Object3D();
    let modelMaterial = new THREE.MeshPhongMaterial({
        specular: 0xffffff,
        shininess: 5,
        map: THREE.ImageUtils.loadTexture("/mat/rubber.png"),
        //morphTargets: true // odpowiada za animację materiału modelu
    });
    let ball;
    new THREE.JSONLoader().load('/js/__spike_ball.json', function (geometry) {
        ball = new THREE.Mesh(geometry, modelMaterial);
        ball.castShadow = true;
        ball.recieveShadow = true;
        ball.rotation.y = 2; // ustaw obrót modelu
        ball.position.set(0, 0, 0) // ustaw pozycje modelu
        ball.scale.set(20, 20, 20); // ustaw skalę modelu
        light = new THREE.PointLight(0xff7b00, 4, 225, 2);
        light.position.set(0, 50, 0);
        container.add(light)
        container.add(ball);
        cb();
    });
    let flop = 0;
    let index = 0;
    let gameEnded = false;
    this.getMesh = () => container;
    let _xwalls = undefined;
    let _xpositions = undefined;
    this.update = function (keyboard, walls, positions) {
        if (gameEnded) return;
        let data = keyboard.getKeyboardData();
        _xwalls = walls;
        _xpositions = positions;
        if (!!data) {
            let speed = keyboard.isHolding(keyboard.keys.shift) ? 4 : 2;
            let newpos = {
                ballrot: ball.rotation.x,
                containerx: container.position.x,
                containery: container.position.z
            }
            if (keyboard.isHolding(keyboard.keys.w)) {
                newpos.containery -= Math.cos(container.rotation.y) * speed;
                newpos.containerx -= Math.sin(container.rotation.y) * speed;
                newpos.ballrot -= speed * 3 / 100;
                changedX = true;
            }
            if (keyboard.isHolding(keyboard.keys.s)) {
                newpos.containery += Math.cos(container.rotation.y) * speed;
                newpos.containerx += Math.sin(container.rotation.y) * speed;
                newpos.ballrot += speed * 3 / 100;
            }
            if (keyboard.isHolding(keyboard.keys.a)) {
                container.rotation.y += 0.04;
            }
            if (keyboard.isHolding(keyboard.keys.d)) {
                container.rotation.y -= 0.04;
            }
            if (!checkCollision(walls, newpos)) {
                container.position.z = newpos.containery;
                container.position.x = newpos.containerx;
                ball.rotation.x = newpos.ballrot;
            }
            net.emit('updatestate', { x: container.position.x, y: container.position.z, brot: ball.rotation.x, crot: container.rotation.y })
            if ((flop = ++flop % 4) == 1) {
                positions[index++] = container.position.x;
                positions[index++] = 50;
                positions[index++] = container.position.z;
            }
        }
    }
    this.updatePos = function (data) {
        let did = container.position.z != data.y || container.position.x != data.x || container.rotation.y != data.crot;
        console.log(did);
        container.position.z = data.y;
        container.position.x = data.x;
        ball.rotation.x = data.brot;
        container.rotation.y = data.crot;
        if (did) {
            if ((flop = ++flop % 4) == 1) {
                _xpositions[index++] = container.position.x;
                _xpositions[index++] = 50;
                _xpositions[index++] = container.position.z;
            }
        }
        checkCollision(_xwalls, {
            ballrot: ball.rotation.x,
            containerx: container.position.x,
            containery: container.position.z
        });
    }
    function checkCollision(walls, newpos) {
        for (let wall of walls) {
            let x = wall.x - wall.w / 2;
            let y = wall.y - wall.h / 2;
            let DeltaX = newpos.containerx - Math.max(x, Math.min(newpos.containerx, x + wall.w));
            let DeltaY = newpos.containery - Math.max(y, Math.min(newpos.containery, y + wall.h));
            if ((DeltaX * DeltaX + DeltaY * DeltaY) < (400)) {
                if (wall.start) continue;
                if (wall.end) {
                    gameEnded = true;
                    endGame(index);
                    return false;
                }
                return true;
            }
        };
        return false;
    }
}