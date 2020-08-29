function Chunk(settings) {
	this.world=settings.world;
	this.p={...settings.p};
	this.size=settings.size;
	this.blocksMap={};
}

Chunk.prototype.getBlock=function(p) {
	return this.blocksMap[p.x] && this.blocksMap[p.x][p.z] && this.blocksMap[p.x][p.z][p.y];
};

Chunk.prototype.setBlock=function(p, block) {
	this.blocksMap[p.x][p.z][p.y]=block;
	// check all possible 6 neighbors
	faces.forEach((face, index)=>{
		let neighbor=this.world.getBlock({x: block.p.x+face.d.x, y: block.p.y+face.d.y, z: block.p.z+face.d.z}, false);
		if (block.type != "air") {
			if (neighbor) {
				if (neighbor.type != "air") neighbor.removeFace(face.inverseIndex);
				else block.addFace(index);
			}
			else block.addFace(index);
		}
		else {
			if (neighbor && neighbor.type != "air") neighbor.addFace(face.inverseIndex);
		}
	});
};

function World(settings) {
	this.chunksMap={};
	this.chunkSize=settings && settings.chunkSize || 16;
	this.threeScene=new THREE.Scene();
	this.threeScene.background=new THREE.Color("rgb(123,140,183)"); // sky color
	let ambientLight=new THREE.AmbientLight(0x808080);
	this.threeScene.add(ambientLight);
	this.animals=[];
	let directionalLight=new THREE.DirectionalLight(0xffffff, 1);
	directionalLight.position.set(1, 1, 0.5).normalize();
	this.threeScene.add(directionalLight);
	this.oimoWorld=new OIMO.World({ 
		iterations: 20, 
		broadphase: 3,
		worldscale: 1,
		info: false,
		gravity: [0, settings.gravity || 0, 0],
	});
	this.generators={
		stone: new Bayoro2({
			layersCount: 20,
			mapIndexToAmplitude: (i)=>(Math.pow(2, (Math.random()+0.5)*0.04*Math.pow(Math.floor(i/4), 3)-(Math.floor(i/4)))),
			mapIndexToFrequency: (i)=>(2*Math.PI*(Math.random()+0.5)*Math.pow(2, Math.floor(i/4))/200),
		}),
		temperature: new Bayoro2({
			layersCount: 10,
			mapIndexToAmplitude: (i)=>(Math.pow(2, -(Math.floor(i/2)))),
			mapIndexToFrequency: (i)=>(2*Math.PI*(Math.random()+0.5)*Math.pow(2, Math.floor(i/2))/800),
		}),
		height: new Bayoro2({
			layersCount: 24,
			mapIndexToAmplitude: (i)=>(Math.pow(2, -(Math.floor(i/4)))),
			mapIndexToFrequency: (i)=>(2*Math.PI*(Math.random()+0.5)*Math.pow(2, Math.floor(i/4))/1000),
		}),
	};
}

// define a function to retrieve data of given position p such as height, temperature, stone level
World.prototype.getPositionData=function(p) {
	let data={
		p,
		height: Math.round(20*this.generators.height.calculate(p.x, p.z)+7),
		temperature: 24*this.generators.temperature.calculate(p.x, p.z)+16,
		stone: 5*this.generators.stone.calculate(p.x, p.z)-3,
	};
	// slightly decrease temperature with every block up
	data.temperature-=0.2*Math.max(0, data.p.y);
	// slightly increase temperature with every block down
	data.temperature+=0.03*Math.min(0, data.p.y);
	return data;
}

World.prototype.getChunk=function(p, doGenerate) {
	if (doGenerate == null) doGenerate=true;
	if (!doGenerate && (!this.chunksMap[p.x] || !this.chunksMap[p.x][p.z] || !this.chunksMap[p.x][p.z][p.y])) return null;
	if (this.chunksMap[p.x] == undefined) this.chunksMap[p.x]={};
	if (this.chunksMap[p.x][p.z] == undefined) this.chunksMap[p.x][p.z]={};
	if (this.chunksMap[p.x][p.z][p.y] == undefined) {
		this.chunksMap[p.x][p.z][p.y]=new Chunk({p, size: this.chunkSize, world: this});
		let chunk=this.chunksMap[p.x][p.z][p.y];
		// fill the new chunk with blocks
		for (let x=-Math.floor(chunk.size/2); x<Math.floor(chunk.size/2+.5); ++x) {
			chunk.blocksMap[x]={};
			for (let z=-Math.floor(chunk.size/2); z<Math.floor(chunk.size/2+.5); ++z) {
				chunk.blocksMap[x][z]={};
				for (let y=-Math.floor(chunk.size/2); y<Math.floor(chunk.size/2+.5); ++y) {
					chunk.blocksMap[x][z][y]=null;
					// calculate block's absolute position
					let p={x: chunk.p.x*chunk.size+x, y: chunk.p.y*chunk.size+y, z: chunk.p.z*chunk.size+z};
					// and get position's data such as temperature height and stone level
					let data=this.getPositionData(p);
					if (data.p.y < 0 || data.p.y < data.height) continue;
					localBlockP={x, y, z};
					// determine the block type
					let blockType=(Object.values(blocksInfo).find((blockInfo)=>(blockInfo.generate && blockInfo.generate(data))) || {}).id || "air";
					// create a new block
					let block=new Block({world: chunk.world, p, type: blockType});
					// put the block in chunk
					chunk.setBlock(localBlockP, block);
					// if the block is of type air
					if (blockType == "air") {
						// try to generate an animal
						let animalType=(Object.values(animalsInfo).find((animalInfo)=>(animalInfo.generate && animalInfo.generate(data))) || {}).id || null;
						if (animalType) new Animal({world: chunk.world, p, type: animalType});
					}
				}
			}
		}
	}
	return this.chunksMap[p.x][p.z][p.y];
};

World.prototype.doTick=function(dt) {
	this.oimoWorld.timestep=dt;
	// do a physics tick
	this.oimoWorld.step();
	this.animals.forEach((animal)=>{
		// calculate animal's speed
		let s=Math.sqrt(Math.pow(animal.body.linearVelocity.x, 2)+Math.pow(animal.body.linearVelocity.y, 2)+Math.pow(animal.body.linearVelocity.z, 2));
		// calculate animal's angular speed
		let angularSpeed=Math.sqrt(Math.pow(animal.body.angularVelocity.x, 2)+Math.pow(animal.body.angularVelocity.y, 2)+Math.pow(animal.body.angularVelocity.z, 2));
		// if the animal is neither moving nor rotating
		if (s < 0.01 && angularSpeed < 0.01) {
			// decide whether to rotate or to move
			let move=Math.floor(Math.random()*2);
			if (move) {
				// randomize the new speed
				let newS=10*Math.random();
				angle=quaternionToEuler(world.animals[0].body.orientation).y;
				// and apply the new speed
				animal.body.linearVelocity.x=Math.sin(angle)*newS;
				animal.body.linearVelocity.z=Math.cos(angle)*newS;
			}
			else animal.body.angularVelocity.y=16*Math.random()-8;
		}
		// update animal's meshes' positions
		animal.meshes.forEach((mesh)=>{
			mesh.position.copy(animal.body.getPosition());
			mesh.quaternion.copy(animal.body.getQuaternion());
		});
	})
};

// get block at position p, if the chunk at position p is not generated yet and doGenerate==true then generate the chunk
World.prototype.getBlock=function(p, doGenerate) {
	if (doGenerate == null) doGenerate=true;
	let chunkP={
		x: Math.floor((p.x+this.chunkSize/2)/this.chunkSize),
		y: Math.floor((p.y+this.chunkSize/2)/this.chunkSize),
		z: Math.floor((p.z+this.chunkSize/2)/this.chunkSize),
	};
	let chunk=this.getChunk(chunkP, doGenerate);
	if (!chunk) return null;
	let localBlockP={
		x: p.x-chunk.p.x*chunk.size,
		y: p.y-chunk.p.y*chunk.size,
		z: p.z-chunk.p.z*chunk.size,
	};
	return chunk.getBlock(localBlockP);
};

// set block at position p
World.prototype.setBlock=function(p, block) {
	let chunk=this.getChunk(p);
	let localBlockP={x: p.x-chunk.p.x*chunk.size, y: p.y-chunk.p.y*chunk.size, z: p.z-chunk.p.z*chunk.size};
	chunk.setBlock(localBlockP, block);
};

// generate the world around given position p
World.prototype.generate=function(p, range) {
	let centerChunkP={
		x: Math.floor((p.x+this.chunkSize/2)/this.chunkSize),
		y: Math.floor((p.y+this.chunkSize/2)/this.chunkSize),
		z: Math.floor((p.z+this.chunkSize/2)/this.chunkSize),
	};
	for (let dx=-(range-1); dx <= range-1; ++dx) {
		for (let dz=-(range-1); dz <= range-1; ++dz) {
			for (let dy=-(range-1); dy <= range-1; ++dy) {
				let chunkP={x: centerChunkP.x+dx, y: centerChunkP.y+dy, z: centerChunkP.z+dz};
				this.getChunk(chunkP);
			}
		}
	}
};