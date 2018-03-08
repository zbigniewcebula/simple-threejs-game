class Animation {
	public texture: THREE.Texture;
	private frames: number;

	private time: number;
	private timer: number;
	private current: number;

	private constOffsetX: number;
	private constOffsetY: number;

	public constructor(
		_texture: THREE.Texture, animFrames: number = 1,
		frameAmountX: number = 1,
		frameAmountY: number = 1,
		duration: number = 1,
		offsetX: number = 0, offsetY: number = 0
	) {
		_texture.wrapS 		= THREE.RepeatWrapping;
		_texture.wrapT 		= THREE.RepeatWrapping;
		_texture.repeat.set(1 / frameAmountX, 1 / frameAmountY);
		this.texture				= _texture;
		this.texture.needsUpdate	= true;

		this.time			= duration;
		this.timer			= 0;
		this.current		= 0;
		this.frames			= animFrames;

		this.constOffsetX		= offsetX / frameAmountX;
		this.constOffsetY		= offsetY / frameAmountY;
	}

	public update(deltaTime: number): void {
		this.timer	+= deltaTime;
		if (this.timer > this.time) {
			this.current			+= 1;
			if (this.current >= this.frames) {
				this.current		= 0;
			}
			this.timer				= 0;
		}
		this.texture.offset.x		= this.constOffsetX + this.current;
		this.texture.offset.y		= this.constOffsetY;
	}

	public dispose(): void {
		this.texture.dispose();
	}
}

class GameObject {
	private plane: THREE.PlaneGeometry;
	private material: THREE.MeshBasicMaterial;
	private mesh: THREE.Mesh;

	private anim: Animation;

	public velocity: THREE.Vector3;
	public torque: number;	//0-1
	public rotationSpeed: number;
	private gravity: number;

	public constructor(animation: Animation) {
		animation.texture.magFilter	= THREE.NearestFilter;

		this.anim			= animation;
		this.plane			= new THREE.PlaneGeometry(1, 1, 1, 1);
		this.material		= new THREE.MeshBasicMaterial({
			color:			0xFFFFFF,
			side:			THREE.DoubleSide,
			transparent: 	true,
			map:			animation.texture
		});
		this.mesh			= new THREE.Mesh(this.plane, this.material);

		this.velocity		= new THREE.Vector3(0, 0, 0);
		this.gravity		= 1;
		this.rotationSpeed	= 0;
		this.torque			= 0;
	}

	public setX(x: number): GameObject {
		this.mesh.position.x	= x;
		return this;
	}
	public setY(y: number): GameObject {
		this.mesh.position.y	= y;
		return this;
	}
	public setZ(z: number): GameObject {
		this.mesh.position.z	= z;
		return this;
	}
	public getX(): number {
		return this.mesh.position.x;
	}
	public getY(): number {
		return this.mesh.position.y
	}
	public getZ(): number {
		return this.mesh.position.z;
	}

	public addToScene(scene: THREE.Scene): void {
		scene.add(this.mesh);
	}

	public setGravity(newGravity: number): void {
		this.gravity	= newGravity;
	}

	public rotateBy(angle: number): void {
		this.mesh.setRotationFromEuler(
			new THREE.Euler(
				0, 0, this.mesh.rotation.z + angle,
			'XYZ')
		);
	}

	public update(deltaTime: number): void {
		this.anim.update(deltaTime);
		this.velocity.y	-= this.gravity;
		this.mesh.position.add(new THREE.Vector3(
			this.velocity.x * deltaTime,
			this.velocity.y * deltaTime,
			this.velocity.z * deltaTime
		));
		if (this.rotationSpeed != 0) {
			this.rotateBy(this.rotationSpeed);
		}
		if (this.torque > 0) {
			this.velocity.x	= (1 - this.torque) * this.velocity.x;
			this.velocity.y	= (1 - this.torque) * this.velocity.y;
			this.velocity.z	= (1 - this.torque) * this.velocity.z;
		}
	}

	public dispose(): void {
		this.anim.dispose();
		this.plane.dispose();
		this.material.dispose();
	}
}

class Game {
	static current: Game;
	static player: GameObject;

	private scene: THREE.Scene;
	private camera: THREE.PerspectiveCamera;
	private renderer: THREE.WebGLRenderer;

	private sizeX: number;
	private sizeY: number;

	private lastStamp: number;

	private objects: Array<GameObject>;

	public constructor() {
		Game.current	= this;

		this.sizeX		= window.innerWidth * 0.99;
		this.sizeY		= window.innerHeight * 0.99;
		this.scene		= new THREE.Scene();
		this.camera		= new THREE.PerspectiveCamera(75, this.sizeX / this.sizeY, 0.1, 1000);
		this.renderer	= new THREE.WebGLRenderer();

		Game.player		= new GameObject(
			new Animation(
				new THREE.TextureLoader().load("char/walk.png"),
				4,
				4, 1,
				100,
				0, 0
			)
		);
		Game.player.setX(0).setY(0).setZ(-10).setGravity(0);
		Game.player.addToScene(this.scene);
		Game.player.torque	= 0.2;

		this.objects		= new Array();
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

	public spawnRandomFood(): void {
		let tempObj: GameObject = new GameObject(
			new Animation(
				new THREE.TextureLoader().load("food.png"),
				1,
				8, 8,
				1,
				Math.floor(Math.random() * 8), Math.floor(Math.random() * 8)
			)
		);
		tempObj.setX((Math.random() * 26) - 13).setY(9).setZ(-10);
		tempObj.rotationSpeed	= (Math.random() - 0.5) * 0.1;

		tempObj.velocity.x		= 20 * (Math.random() - 0.5);

		tempObj.setGravity(9.81 / 30);
		tempObj.addToScene(this.scene);
		this.objects.push(tempObj);
	}

	public createScene(): void {
		this.renderer.setSize(this.sizeX, this.sizeY);
		document.body.appendChild(this.renderer.domElement);

		this.camera.position	= new THREE.Vector3(0, 0, 0);

		this.scene.add(this.camera);
		this.camera.lookAt(this.scene.position);
	}

	public animate(timestamp: number): void {
		requestAnimationFrame(this.animate.bind(this));
		this.render(timestamp);
	}

	private render(timestamp: number): void {
		let time:number			= timestamp / 1000;
		let deltaTime:number	= time - this.lastStamp;

		for(let i: number = 0; i < this.objects.length; ++i) {
			this.objects[i].update(deltaTime);

			if (this.objects[i].getY() < -10) {
				this.objects[i].dispose();
				delete this.objects[i];
				this.objects.splice(i, 1);
			}
		}
		Game.player.update(deltaTime);

		this.lastStamp			= time;
		this.renderer.render(this.scene, this.camera);
	}

	public input(event: KeyboardEvent): void {
		switch(event.keyCode) {
			case(37): {	//Left
				Game.player.velocity.x	= -7;
				break;
			}
			case(38): {	//Up
				break;
			}
			case(39): {	//Right
				Game.player.velocity.x	= 7;
				break;
			}
			case(40): {	//Down
				break;
			}
			case(32): {	//Space
				Game.current.spawnRandomFood();
				break;
			}
			default: {
				console.log("Pressed: " + event.keyCode);
			}
		}
	}
}

window.onload	= function() {
	let game	= new Game();
	game.createScene();

	document.addEventListener('keydown', game.input);

	game.animate(0);
}
