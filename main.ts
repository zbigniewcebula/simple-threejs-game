class Animation {
	public texture: THREE.Texture;
	private frames: number;

	private delay: number;
	private frameTime: number;
	private dupa: number;
	private current: number;

	private constOffsetX: number;
	private constOffsetY: number;

	private isPlaying: boolean;

	public constructor(
		_texture: THREE.Texture, animFrames: number = 1,
		frameAmountX: number = 1,
		frameAmountY: number = 1,
		duration: number = 1,
		offsetX: number = 0, offsetY: number = 0
	) {

		this.delay			= duration;
		this.frameTime		= 0;
		this.current		= 0;
		this.frames			= animFrames;

		this.constOffsetX	= offsetX / frameAmountX;
		this.constOffsetY	= offsetY / frameAmountY;

		_texture.wrapS 		= THREE.RepeatWrapping;
		_texture.wrapT 		= THREE.RepeatWrapping;
		_texture.repeat.set(1 / frameAmountX, 1 / frameAmountY);
		this.texture		= _texture;

		this.isPlaying		= true;
	}

	public update(deltaTime: number): void {
		//TypeScript tries to sabotage my numbers!!!
		let dt: number	= deltaTime;
		if (isNaN(this.frameTime))	this.frameTime = 0;
		//ITs ANNOYING!
		if (this.isPlaying) {
			this.frameTime	+= dt;
			if (this.frameTime > this.delay) {
				this.current			+= 1;
				if (this.current >= this.frames) {
					this.current		= 0;
				}
				this.frameTime				= 0;
			}
			this.texture.offset.x	= (this.constOffsetX + this.current) / this.frames;
			this.texture.offset.y	= this.constOffsetY;
		} else {
			this.texture.offset.x	= (this.constOffsetX + 1) / this.frames;
			this.texture.offset.y	= this.constOffsetY;
		}
	}

	public dispose(): void {
		this.texture.dispose();
	}

	public stop(): void {
		this.isPlaying = false;
	}
	public start(): void {
		this.isPlaying = true;
	}
}

class GameObject {
	private plane: THREE.PlaneGeometry;
	private material: THREE.MeshBasicMaterial;
	private mesh: THREE.Mesh;

	public anim: Animation;

	public velocity: THREE.Vector3;
	public torque: number;	//0-1
	public rotationSpeed: number;
	private gravity: number;

	private name: string;

	public constructor(
		animation: Animation,
		sizeX: number = 1, sizeY: number = 1
	) {
		animation.texture.magFilter	= THREE.NearestFilter;

		this.anim			= animation;
		this.plane			= new THREE.PlaneGeometry(sizeX, sizeY, 1, 1);
		this.material		= new THREE.MeshBasicMaterial({
			color:			0xFFFFFF,
			side:			THREE.DoubleSide,
			transparent: 	true,
			map:			animation.texture
		});
		this.mesh			= new THREE.Mesh(this.plane, this.material);
		this.mesh.name		= this.name;	

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
		this.anim.update(deltaTime * 1000);
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
			let sign: number	= (this.velocity.x < 0? -1: 1);
			this.velocity.x		= Math.abs(this.velocity.x) * (1 - this.torque);
			this.velocity.x		= Math.floor(this.velocity.x * 10000) / 10000;
			this.velocity.x		= this.velocity.x * sign;

			sign				= (this.velocity.z < 0? -1: 1);
			this.velocity.z		= this.velocity.z * (1 - this.torque);
			this.velocity.z		= Math.floor(Math.abs(this.velocity.z) * 10000) / 10000;
			this.velocity.z		= this.velocity.z * sign;
		}
	}

	public flipLeft(): void {
		this.mesh.rotation.y	= 3.14;
	}
	public flipRight(): void {
		this.mesh.rotation.y	= 0;
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
	static points: number;

	private scene: THREE.Scene;
	private camera: THREE.PerspectiveCamera;
	private renderer: THREE.WebGLRenderer;

	private sizeX: number;
	private sizeY: number;

	private lastStamp: number;

	private objects: Array<GameObject>;

	private foodTimer: number;

	public constructor() {
		Game.current	= this;
		Game.points		= 0;

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
			),
			4, 4
		);
		Game.player.setX(0).setY(-5).setZ(-11).setGravity(0);
		Game.player.addToScene(this.scene);
		Game.player.torque	= 0.4;

		this.foodTimer		= 0;

		this.objects		= new Array();
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

		tempObj.velocity.x		= (0.75 + Math.random() * 0.25) * 20;
		tempObj.velocity.x		= tempObj.velocity.x * (Math.random() < 0.5? -1: 1);
		tempObj.torque			= 0.001;

		tempObj.setGravity(9.81 / 100);
		tempObj.addToScene(this.scene);
		this.objects.push(tempObj);
	}

	public createScene(): void {
		this.renderer.setSize(this.sizeX, this.sizeY);
		document.body.appendChild(this.renderer.domElement);

		window.addEventListener('onkeydown', this.input, false);
		window.addEventListener('keydown', this.input, false);

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

		if (isNaN(this.foodTimer))	this.foodTimer = 0;
		this.foodTimer	+= Number(deltaTime);
		if (this.foodTimer > 2) {
			this.spawnRandomFood();
			this.foodTimer	= 0;
		}

		for(let i: number = 0; i < this.objects.length; ++i) {
			this.objects[i].update(deltaTime);

			//Debounce
			if (Math.abs(this.objects[i].getX()) > 13) {
				this.objects[i].velocity.x	*= -0.8;
			}

			//Destroy
			if (this.objects[i].getY() < -10) {
				this.objects[i].dispose();
				delete this.objects[i];
				this.objects.splice(i, 1);
				continue;
			}

			console.log(this.objects[i].getX() + " " + this.objects[i].getY());


			if ((Game.player.getX() - 1) < this.objects[i].getX() 
			&&	(Game.player.getX() + 1) > this.objects[i].getX() 
			) {
				if ((Game.player.getY() + 1.5) > this.objects[i].getY()
				&&	(Game.player.getY() - 1.5) < this.objects[i].getY()
				) {
					console.log("QURWA");
					Game.points	+= 1;
					document.getElementById("points").innerHTML	= String(Game.points);

					this.objects[i].setY(-10);
					this.objects[i].dispose();
					delete this.objects[i];
					this.objects.splice(i, 1);
					continue;
				}
			}
		}

		if (Math.floor(Game.player.velocity.x) != 0) {
			Game.player.anim.start();
		} else {
			Game.player.anim.stop();
		}

		Game.player.update(deltaTime);

		this.lastStamp			= time;
		this.renderer.render(this.scene, this.camera);
	}

	public input(event: KeyboardEvent): void {
		switch(event.keyCode) {
			case(65):
			case(37): {	//Left
				Game.player.velocity.x	= -17;
				Game.player.flipLeft();
				break;
			}
			case(87):
			case(38): {	//Up
				break;
			}
			case(68):
			case(39): {	//Right
				Game.player.velocity.x	= 17;
				Game.player.flipRight();
				break;
			}
			case(83):
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

	game.animate(0);
}
