var Animation = /** @class */ (function () {
    function Animation(_texture, animFrames, frameAmountX, frameAmountY, duration, offsetX, offsetY) {
        if (animFrames === void 0) { animFrames = 1; }
        if (frameAmountX === void 0) { frameAmountX = 1; }
        if (frameAmountY === void 0) { frameAmountY = 1; }
        if (duration === void 0) { duration = 1; }
        if (offsetX === void 0) { offsetX = 0; }
        if (offsetY === void 0) { offsetY = 0; }
        this.delay = duration;
        this.frameTime = 0;
        this.current = 0;
        this.frames = animFrames;
        this.constOffsetX = offsetX / frameAmountX;
        this.constOffsetY = offsetY / frameAmountY;
        _texture.wrapS = THREE.RepeatWrapping;
        _texture.wrapT = THREE.RepeatWrapping;
        _texture.repeat.set(1 / frameAmountX, 1 / frameAmountY);
        this.texture = _texture;
        this.dupa = 0;
    }
    Animation.prototype.update = function (deltaTime) {
        //TypeScript tries to sabotage my numbers!!!
        var dt = deltaTime;
        if (isNaN(this.frameTime))
            this.frameTime = 0;
        //ITs ANNOYING!
        this.frameTime += dt;
        if (this.frameTime > this.delay) {
            this.current += 1;
            if (this.current >= this.frames) {
                this.current = 0;
            }
            this.frameTime = 0;
        }
        this.texture.offset.x = (this.constOffsetX + this.current) / this.frames;
        this.texture.offset.y = this.constOffsetY;
    };
    Animation.prototype.dispose = function () {
        this.texture.dispose();
    };
    return Animation;
}());
var GameObject = /** @class */ (function () {
    function GameObject(animation, sizeX, sizeY) {
        if (sizeX === void 0) { sizeX = 1; }
        if (sizeY === void 0) { sizeY = 1; }
        animation.texture.magFilter = THREE.NearestFilter;
        this.anim = animation;
        this.plane = new THREE.PlaneGeometry(sizeX, sizeY, 1, 1);
        this.material = new THREE.MeshBasicMaterial({
            color: 0xFFFFFF,
            side: THREE.DoubleSide,
            transparent: true,
            map: animation.texture
        });
        this.mesh = new THREE.Mesh(this.plane, this.material);
        this.mesh.name = this.name;
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
        this.anim.update(deltaTime * 1000);
        this.velocity.y -= this.gravity;
        this.mesh.position.add(new THREE.Vector3(this.velocity.x * deltaTime, this.velocity.y * deltaTime, this.velocity.z * deltaTime));
        if (this.rotationSpeed != 0) {
            this.rotateBy(this.rotationSpeed);
        }
        if (this.torque > 0) {
            this.velocity.x = (1 - this.torque) * this.velocity.x;
            //this.velocity.y	= (1 - this.torque) * this.velocity.y;
            this.velocity.z = (1 - this.torque) * this.velocity.z;
        }
    };
    GameObject.prototype.flipLeft = function () {
        this.mesh.rotation.y = 3.14;
    };
    GameObject.prototype.flipRight = function () {
        this.mesh.rotation.y = 0;
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
        Game.player = new GameObject(new Animation(new THREE.TextureLoader().load("char/walk.png"), 4, 4, 1, 100, 0, 0), 4, 4);
        Game.player.setX(0).setY(-5).setZ(-10).setGravity(0);
        Game.player.addToScene(this.scene);
        Game.player.torque = 0.2;
        this.objects = new Array();
    }
    Game.prototype.spawnRandomFood = function () {
        var tempObj = new GameObject(new Animation(new THREE.TextureLoader().load("food.png"), 1, 8, 8, 1, Math.floor(Math.random() * 8), Math.floor(Math.random() * 8)));
        tempObj.setX((Math.random() * 26) - 13).setY(9).setZ(-10);
        tempObj.rotationSpeed = (Math.random() - 0.5) * 0.1;
        tempObj.velocity.x = (0.75 + Math.random() * 0.25) * 20;
        tempObj.velocity.x = tempObj.velocity.x * (Math.random() < 0.5 ? -1 : 1);
        tempObj.torque = 0.001;
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
        /*
        for(let i: number = 0; i < this.objects.length; ++i) {
            this.objects[i].update(deltaTime);

            //Debounce
            if (Math.abs(this.objects[i].getX()) > 13) {
                this.objects[i].velocity.x	*= -0.8;
            }

            if (this.objects[i].getY() < -10) {
                this.objects[i].dispose();
                delete this.objects[i];
                this.objects.splice(i, 1);
                continue;
            }
        }
        */
        Game.player.update(deltaTime);
        this.lastStamp = time;
        this.renderer.render(this.scene, this.camera);
    };
    Game.prototype.input = function (event) {
        switch (event.keyCode) {
            case (65):
            case (37): {
                Game.player.velocity.x = -7;
                Game.player.flipLeft();
                break;
            }
            case (87):
            case (38): {
                break;
            }
            case (68):
            case (39): {
                Game.player.velocity.x = 7;
                Game.player.flipRight();
                break;
            }
            case (83):
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
