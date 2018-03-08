var Animation = /** @class */ (function () {
    function Animation(_texture, animFrames, frameAmountX, frameAmountY, duration, offsetX, offsetY) {
        if (animFrames === void 0) { animFrames = 1; }
        if (frameAmountX === void 0) { frameAmountX = 1; }
        if (frameAmountY === void 0) { frameAmountY = 1; }
        if (duration === void 0) { duration = 1; }
        if (offsetX === void 0) { offsetX = 0; }
        if (offsetY === void 0) { offsetY = 0; }
        _texture.wrapS = THREE.RepeatWrapping;
        _texture.wrapT = THREE.RepeatWrapping;
        _texture.repeat.set(1 / frameAmountX, 1 / frameAmountY);
        this.texture = _texture;
        this.texture.needsUpdate = true;
        this.time = duration;
        this.timer = 0;
        this.current = 0;
        this.frames = animFrames;
        this.constOffsetX = offsetX / frameAmountX;
        this.constOffsetY = offsetY / frameAmountY;
    }
    Animation.prototype.update = function (deltaTime) {
        this.timer += deltaTime;
        if (this.timer > this.time) {
            this.current += 1;
            if (this.current >= this.frames) {
                this.current = 0;
            }
            this.timer = 0;
        }
        this.texture.offset.x = this.constOffsetX + this.current;
        this.texture.offset.y = this.constOffsetY;
    };
    Animation.prototype.dispose = function () {
        this.texture.dispose();
    };
    return Animation;
}());
var GameObject = /** @class */ (function () {
    function GameObject(animation) {
        animation.texture.magFilter = THREE.NearestFilter;
        this.anim = animation;
        this.plane = new THREE.PlaneGeometry(1, 1, 1, 1);
        this.material = new THREE.MeshBasicMaterial({
            color: 0xFFFFFF,
            side: THREE.DoubleSide,
            transparent: true,
            map: animation.texture
        });
        this.mesh = new THREE.Mesh(this.plane, this.material);
        this.velocity = new THREE.Vector3(0, 0, 0);
        this.gravity = 1;
        this.rotationSpeed = 0;
        this.torque = 0;
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
    GameObject.prototype.getX = function () {
        return this.mesh.position.x;
    };
    GameObject.prototype.getY = function () {
        return this.mesh.position.y;
    };
    GameObject.prototype.getZ = function () {
        return this.mesh.position.z;
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
        this.anim.update(deltaTime);
        this.velocity.y -= this.gravity;
        this.mesh.position.add(new THREE.Vector3(this.velocity.x * deltaTime, this.velocity.y * deltaTime, this.velocity.z * deltaTime));
        if (this.rotationSpeed != 0) {
            this.rotateBy(this.rotationSpeed);
        }
        if (this.torque > 0) {
            this.velocity.x = (1 - this.torque) * this.velocity.x;
            this.velocity.y = (1 - this.torque) * this.velocity.y;
            this.velocity.z = (1 - this.torque) * this.velocity.z;
        }
    };
    GameObject.prototype.dispose = function () {
        this.anim.dispose();
        this.plane.dispose();
        this.material.dispose();
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
        Game.player = new GameObject(new Animation(new THREE.TextureLoader().load("char/walk.png"), 4, 4, 1, 100, 0, 0));
        Game.player.setX(0).setY(0).setZ(-10).setGravity(0);
        Game.player.addToScene(this.scene);
        Game.player.torque = 0.2;
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
        var tempObj = new GameObject(new Animation(new THREE.TextureLoader().load("food.png"), 1, 8, 8, 1, Math.floor(Math.random() * 8), Math.floor(Math.random() * 8)));
        tempObj.setX((Math.random() * 26) - 13).setY(9).setZ(-10);
        tempObj.rotationSpeed = (Math.random() - 0.5) * 0.1;
        tempObj.velocity.x = 20 * (Math.random() - 0.5);
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
            if (this.objects[i].getY() < -10) {
                this.objects[i].dispose();
                delete this.objects[i];
                this.objects.splice(i, 1);
            }
        }
        Game.player.update(deltaTime);
        this.lastStamp = time;
        this.renderer.render(this.scene, this.camera);
    };
    Game.prototype.input = function (event) {
        switch (event.keyCode) {
            case (37): {
                Game.player.velocity.x = -7;
                break;
            }
            case (38): {
                break;
            }
            case (39): {
                Game.player.velocity.x = 7;
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
