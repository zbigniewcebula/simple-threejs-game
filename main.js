var GameObject = /** @class */ (function () {
    function GameObject(texture) {
        this.plane = new THREE.PlaneGeometry(1, 1, 1, 1);
        this.material = new THREE.MeshBasicMaterial({
            color: 0xFFFFFF,
            side: THREE.DoubleSide,
            transparent: true,
            map: texture
        });
        this.mesh = new THREE.Mesh(this.plane, this.material);
    }
    GameObject.prototype.setX = function (x) {
        this.mesh.position.x = x;
        return this;
    };
    GameObject.prototype.setY = function (y) {
        this.mesh.position.y = y;
        return this;
    };
    GameObject.prototype.setZ = function (z) {
        this.mesh.position.z = z;
        return this;
    };
    return GameObject;
}());
var Game = /** @class */ (function () {
    function Game() {
        this.sizeX = window.innerWidth * 0.99;
        this.sizeY = window.innerHeight * 0.99;
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, this.sizeX / this.sizeY, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer();
        this.testObj = new GameObject(THREE.ImageUtils.loadTexture("food/food (1).png"));
        this.testObj.setX(0).setY(0).setZ(-10);
    }
    Game.prototype.createScene = function () {
        this.renderer.setSize(this.sizeX, this.sizeY);
        document.body.appendChild(this.renderer.domElement);
        this.camera.position = new THREE.Vector3(0, 0, 0);
        this.scene.add(this.testObj.mesh);
        this.scene.add(this.camera);
        this.camera.lookAt(this.scene.position);
    };
    Game.prototype.animate = function (timestamp) {
        requestAnimationFrame(this.animate.bind(this));
        this.render(timestamp);
    };
    Game.prototype.render = function (timestamp) {
        var time = timestamp;
        var deltaTime = time - this.lastStamp;
        //console.log(deltaTime);
        this.lastStamp = time;
        this.renderer.render(this.scene, this.camera);
    };
    return Game;
}());
window.onload = function () {
    var game = new Game();
    game.createScene();
    game.animate(0);
};
