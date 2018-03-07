class GameObject {
	public plane: THREE.PlaneGeometry;
	public material: THREE.MeshBasicMaterial;
	public mesh: THREE.Mesh;

	public constructor(texture: THREE.Texture) {
		this.plane			= new THREE.PlaneGeometry(1, 1, 1, 1);
		this.material		= new THREE.MeshBasicMaterial({
			color:			0xFFFFFF,
			side:			THREE.DoubleSide,
			transparent: 	true,
			map:			texture
		});
		this.mesh			= new THREE.Mesh(this.plane, this.material);
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
}

class Game {
	private scene: THREE.Scene;
	private camera: THREE.PerspectiveCamera;
	private renderer: THREE.WebGLRenderer;

	private sizeX: number;
	private sizeY: number;

	private lastStamp: number;

	private testObj: GameObject;

	public constructor() {
		this.sizeX		= window.innerWidth * 0.99;
		this.sizeY		= window.innerHeight * 0.99;
		this.scene		= new THREE.Scene();
		this.camera		= new THREE.PerspectiveCamera(75, this.sizeX / this.sizeY, 0.1, 1000);
		this.renderer	= new THREE.WebGLRenderer();


		this.testObj			= new GameObject(
			THREE.ImageUtils.loadTexture("food/food (1).png")
		);
		this.testObj.setX(0).setY(0).setZ(-10);
	}

	public createScene(): void {
		this.renderer.setSize(this.sizeX, this.sizeY);
		document.body.appendChild(this.renderer.domElement);

		this.camera.position	= new THREE.Vector3(0, 0, 0);

		this.scene.add(this.testObj.mesh);

		this.scene.add(this.camera);
		this.camera.lookAt(this.scene.position);
	}

	public animate(timestamp: number): void {
		requestAnimationFrame(this.animate.bind(this));
		this.render(timestamp);
	}

	private render(timestamp: number): void {
		let time:number			= timestamp;
		let deltaTime:number	= time - this.lastStamp;

		//console.log(deltaTime);

		this.lastStamp			= time;
		this.renderer.render(this.scene, this.camera);
	}
}

window.onload = function() {
	let game = new Game();
	game.createScene();
	game.animate(0);
}
