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
        this.gravity = 1;
        this.rotationSpeed = 0;
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
    GameObject.prototype.addToScene = function (scene) {
        scene.add(this.mesh);
    };
    GameObject.prototype.setGravity = function (newGravity) {
        this.gravity = newGravity;
    };
    GameObject.prototype.rotateBy = function (angle) {
        this.mesh.setRotationFromEuler(new THREE.Euler(0, 0, this.mesh.rotation.z + angle, 'XYZ'));
    };
    GameObject.prototype.update = function (deltaTime) {
        this.velocity.y -= this.gravity;
        this.mesh.position.add(new THREE.Vector3(this.velocity.x * deltaTime, this.velocity.y * deltaTime, this.velocity.z * deltaTime));
        if (this.rotationSpeed != 0) {
            this.rotateBy(this.rotationSpeed);
        }
    };
    return GameObject;
}());
var Game = /** @class */ (function () {
    function Game() {
        Game.current = this;
        this.sizeX = window.innerWidth * 0.99;
        this.sizeY = window.innerHeight * 0.99;
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, this.sizeX / this.sizeY, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer();
        this.objects = new Array();
        /*
        for(let i: number = 0; i < 64; ++i) {
            this.objects.push(
                new GameObject(
                    THREE.ImageUtils.loadTexture("food/food (" + (i + 1) + ").png")
                )
            );
            this.objects[this.objects.length - 1]
                .setX(i % 8 - 13)
                .setY(Math.floor(i / 8) - 7)
                .setZ(-10);
            this.objects[i].velocity.x	= 10 * Math.random();
            this.objects[i].velocity.y	= 40 * Math.random();

            this.objects[i].setGravity(9.81 / 20);
        }
        */
    }
    Game.prototype.spawnRandomFood = function () {
        var tempObj = new GameObject(THREE.ImageUtils.loadTexture("food/food ("
            +
                Math.floor(1 + (Math.random() * 64))
            +
                ").png"));
        tempObj.setX((Math.random() * 26) - 13).setY(9).setZ(-10);
        tempObj.rotationSpeed = (Math.random() - 0.5) * 0.1;
        tempObj.setGravity(9.81 / 30);
        tempObj.addToScene(this.scene);
        this.objects.push(tempObj);
    };
    Game.prototype.createScene = function () {
        this.renderer.setSize(this.sizeX, this.sizeY);
        document.body.appendChild(this.renderer.domElement);
        this.camera.position = new THREE.Vector3(0, 0, 0);
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
        for (var i = 0; i < this.objects.length; ++i) {
            this.objects[i].update(deltaTime);
        }
        this.lastStamp = time;
        this.renderer.render(this.scene, this.camera);
    };
    Game.prototype.input = function (event) {
        switch (event.keyCode) {
            case (37): {
                break;
            }
            case (38): {
                break;
            }
            case (39): {
                break;
            }
            case (40): {
                break;
            }
            case (32): {
                Game.current.spawnRandomFood();
                break;
            }
            default: {
                console.log("Pressed: " + event.keyCode);
            }
        }
    };
    return Game;
}());
window.onload = function () {
    var game = new Game();
    game.createScene();
    document.addEventListener('keydown', game.input);
    game.animate(0);
};
