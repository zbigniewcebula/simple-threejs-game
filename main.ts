class GameObject {
	private plane: THREE.PlaneGeometry;
	private material: THREE.MeshBasicMaterial;
	private mesh: THREE.Mesh;

	public velocity: THREE.Vector3;
	public rotationSpeed: number;
	private gravity: number;

	public constructor(texture: THREE.Texture) {
		this.plane			= new THREE.PlaneGeometry(1, 1, 1, 1);
		this.material		= new THREE.MeshBasicMaterial({
			color:			0xFFFFFF,
			side:			THREE.DoubleSide,
			transparent: 	true,
			map:			texture
		});
		this.mesh			= new THREE.Mesh(this.plane, this.material);

		this.velocity		= new THREE.Vector3(0, 0, 0);
		this.gravity		= 1;
		this.rotationSpeed	= 0;
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
		this.velocity.y	-= this.gravity;
		this.mesh.position.add(new THREE.Vector3(
			this.velocity.x * deltaTime,
			this.velocity.y * deltaTime,
			this.velocity.z * deltaTime
		));
		if (this.rotationSpeed != 0) {
			this.rotateBy(this.rotationSpeed);
		}
	}
}

class Game {
	static current: Game;

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

		this.objects	= new Array();
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
			THREE.ImageUtils.loadTexture("food/food ("
				+
				Math.floor(1 + (Math.random() * 64))
				+
				").png"
			)
		);
		tempObj.setX((Math.random() * 26) - 13).setY(9).setZ(-10);
		tempObj.rotationSpeed	= (Math.random() - 0.5) * 0.1;

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
		}

		this.lastStamp			= time;
		this.renderer.render(this.scene, this.camera);
	}

	public input(event: KeyboardEvent): void {
		switch(event.keyCode) {
			case(37): {	//Left
				break;
			}
			case(38): {	//Up
				break;
			}
			case(39): {	//Right
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

window.onload = function() {
	let game = new Game();
	game.createScene();

	document.addEventListener('keydown', game.input);

	game.animate(0);
}
