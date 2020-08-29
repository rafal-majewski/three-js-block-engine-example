function Animal(settings) {
	this.world=settings.world;
	this.type=settings.type;
	this.world.animals.push(this);
	this.meshes=[];
	let p=settings.p; // starting position
	this.animalInfo=animalsInfo[this.type];
	// create meshes
	this.animalInfo.meshesSchemas.forEach((meshSchema)=>{
		let geometry=new THREE.BufferGeometry();
		geometry.setAttribute("position", new THREE.BufferAttribute(meshSchema.vertices, 3));
		geometry.setAttribute("uv", new THREE.BufferAttribute(new Float32Array(meshSchema.uvs), 2));
		geometry.computeFaceNormals();
		geometry.computeVertexNormals();
		let material=new THREE.MeshStandardMaterial({map: meshSchema.texture});
		let mesh=new THREE.Mesh(geometry, material);
		mesh.position.x=p.x;
		mesh.position.y=p.y;
		mesh.position.z=p.z;
		this.world.threeScene.add(mesh);
		this.meshes.push(mesh);
	});
	// create animal's physical body
	this.body=this.world.oimoWorld.add({ 
		type: "box",
		size: [this.animalInfo.size.x, this.animalInfo.size.y, this.animalInfo.size.z],
		pos: [p.x, p.y, p.z],
		rot: [0, 360*Math.random(), 0],
		move: true,
		friction: 0.1,
		belongsTo: 2,
		collidesWith: 3,
	});
}