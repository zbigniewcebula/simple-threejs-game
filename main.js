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
        this.velocity = new THREE.Vector3(0, 0, 0);
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
    GameObject.prototype.rotateBy = function (angle) {
        this.mesh.setRotationFromEuler(new THREE.Euler(0, 0, this.mesh.rotation.z + angle, 'XYZ'));
    };
    GameObject.prototype.update = function (deltaTime) {
        this.mesh.position.add(new THREE.Vector3(this.velocity.x * deltaTime, this.velocity.y * deltaTime, this.velocity.z * deltaTime));
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
        this.objects = new Array();
        for (var i = 0; i < 64; ++i) {
            this.objects.push(new GameObject(THREE.ImageUtils.loadTexture("food/food (" + (i + 1) + ").png")));
            this.objects[this.objects.length - 1]
                .setX(i % 8 - 13)
                .setY(Math.floor(i / 8) - 7)
                .setZ(-10);
            this.objects[i].velocity.x = 6 * Math.random();
            this.objects[i].velocity.y = 6 * Math.random();
        }
    }
    Game.prototype.createScene = function () {
        this.renderer.setSize(this.sizeX, this.sizeY);
        document.body.appendChild(this.renderer.domElement);
        this.camera.position = new THREE.Vector3(0, 0, 0);
        for (var i = 0; i < 64; ++i) {
            this.scene.add(this.objects[i].mesh);
        }
        this.scene.add(this.camera);
        this.camera.lookAt(this.scene.position);
    };
    Game.prototype.animate = function (timestamp) {
        requestAnimationFrame(this.animate.bind(this));
        this.render(timestamp);
    };
    Game.prototype.render = function (timestamp) {
        var time = timestamp / 1000;
        var deltaTime = time - this.lastStamp;
        for (var i = 0; i < 64; ++i) {
            this.objects[i].rotateBy(deltaTime);
            this.objects[i].update(deltaTime);
        }
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
