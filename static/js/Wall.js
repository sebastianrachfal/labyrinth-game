// let box = THREE.ImageUtils.loadTexture("/mat/box.png");
let wallsAmm = 0;
function Wall(x, y, z, w, h, end) {
    _walls.push(this);
    this.x = x;
    this.y = z;
    this.w = w;
    this.h = h;
    this.end = end == 1;
    this.start = end == 2;
    let mat = new THREE.MeshBasicMaterial({
        //map: box,
        side: THREE.DoubleSide,
        wireframe: false,
        transparent: true,
        opacity: .5,
        color: end == 1 ? 'red' : 'green'
    });
    let klocek = new THREE.Mesh(
        new THREE.BoxGeometry(w > h ? w + 10 : w, 100, h > w ? h + 10 : h),
        mat
    );
    klocek.position.set(x, y, z);
    this.getMesh = () => klocek;
}