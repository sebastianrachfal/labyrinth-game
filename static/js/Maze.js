const MazeSize = 2000;
const Rotations = {
    "UP": 0,
    "DOWN": Math.PI,
    "LEFT": -Math.PI * 1.5,
    "RIGHT": -Math.PI / 2
}
function Maze(plansza) {
    var mazeGeo = new THREE.Geometry();
    let mat = new THREE.MeshPhongMaterial({
        //map: THREE.ImageUtils.loadTexture("/mat/wall.png"),
        specular: 0xffffff,
        shininess: 5,
        side: THREE.DoubleSide,
        wireframe: false,
        transparent: true,
        opacity: 1,
        color: '#a5a5a5'
    });
    let planszaid = plansza || Math.round((__mazeLayouts.length - 1) * Math.random());
    this.layout = __mazeLayouts[planszaid] || { layout: "", shouldLook: "DOWN" };
    let container = new THREE.Object3D();
    let rows = this.layout.layout.trim().split('\n');
    let exit, start;
    let step = MazeSize / (rows.length - 1);
    for (let i = 1; i < rows.length; i++) {
        let row = rows[i].trim();
        console.log(row);
        for (let j = 1; j < row.length - 1; j++) {
            switch (row[j]) {
                case '_':
                    if (i == rows.length - 1) break;
                    new Wall(-MazeSize / 2 + step / 2 + ((j - 1) / 2) * step, 50, -MazeSize / 2 + i * step, step, 10).getMesh();
                    if (j != row.length - 2 && row[j + 1] == '_') j++;
                    break;
                case '|':
                    new Wall(-MazeSize / 2 + step / 2 + ((j - 1) / 2) * step, 50, -MazeSize / 2 + (i - 1) * step + step / 2, 10, step).getMesh();
                    break;
                case 'S':
                    start = [(j - 1) / 2, i - 1];
                    break;
                case 'M':
                    exit = [(j - 1) / 2, i - 1];
                    break;
            }
        }
    };

    // MERGE
    for (let wall of _walls) {
        let mesh = wall.getMesh();
        mesh.updateMatrix();
        mazeGeo.merge(mesh.geometry, mesh.matrix);
    }
    let m = new THREE.Mesh(
        mazeGeo,
        mat
    )
    m.dropShadow = true;
    container.add(m)
    console.log("Looking: " + this.layout.shouldLook)
    this.points = () => [[-MazeSize / 2 + start[0] * step + step / 2, -MazeSize / 2 + start[1] * step + step / 2], [-MazeSize / 2 + exit[0] * step + step / 2, -MazeSize / 2 + exit[1] * step + step / 2]];
    this.rotation = () => Rotations[this.layout.shouldLook];
    this.getMesh = () => container;
    this.step = step;
    this.getId = () => planszaid;
}