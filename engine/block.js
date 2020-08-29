function Block(settings) {
	this.world=settings.world;
	this.p={...settings.p};
	this.type=settings.type;
	this.faces=[null, null, null, null, null, null];
	if (this.type != "air") this.body=this.world.oimoWorld.add({ 
		type: "box", // type of shape : sphere, box, cylinder 
		size: [1, 1, 1], // size of shape
		pos: [this.p.x, this.p.y, this.p.z], // start position in degree
		rot: [0, 0, 0], // start rotation in degree
		move: false, // dynamic or statique
		friction: 0.1,
		belongsTo: 1,
		collidesWith: 2,
	});
}


// used to minimize the number of displayed planes, see https://threejsfundamentals.org/threejs/lessons/threejs-voxel-geometry.html
Block.prototype.removeFace=function(index) { // index is the index in the "faces" array, see world.js
	this.world.threeScene.remove(this.faces[index]);
	this.faces[index]=null;
};

Block.prototype.addFace=function(index) { // index is the index in the "faces" array, see world.js
	let geometry=new THREE.BufferGeometry();
	let face=faces[index];
	geometry.setAttribute("position", new THREE.BufferAttribute(face.vertices, 3));
	geometry.setAttribute("uv", new THREE.BufferAttribute(new Float32Array(face.uvs[Math.floor(face.uvs.length*Math.random())]), 2));
	geometry.computeFaceNormals();
	geometry.computeVertexNormals();
	let material=new THREE.MeshStandardMaterial({map: blocksInfo[this.type].texture});
	let mesh=new THREE.Mesh(geometry, material);
	mesh.position.x=this.p.x;
	mesh.position.y=this.p.y;
	mesh.position.z=this.p.z;
	this.world.threeScene.add(mesh);
	this.faces[index]=mesh;
}