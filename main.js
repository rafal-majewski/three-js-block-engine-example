// initialize the world
let world=new World({
	chunkSize: 4,
	gravity: -9.81
});

// initialize the camera
let camera=new Camera({
	generationRange: 4, // camera generation range in chunks
	world,
	rotSpeed: 1, // camera rotation speed in radians
	speed: 6, // camera movement speed
	p: {x: 0, y: Math.max(0, world.getPositionData({x: 0, y: 0, z: 0}).height)+5, z: 0}, // camera starting position
	rot: {h: 0, v: 0}, // camera starting rotation
	autoFov: 2, // fov (in radians) in the biggest display axis, the fov in the second axis will be calculated proportionally
	//fov: {h: 2, v: 2} // mutually exclusive with autoFov, use this to set a fixed fov (in radians)
});

// initialize a three.js webgl renderer
let renderer=new THREE.WebGLRenderer();
// set its size to match the window size
renderer.setSize(window.innerWidth, window.innerHeight);
// add the renderer to the dom
document.body.appendChild(renderer.domElement);

// handle window resize
window.addEventListener("resize", ()=>{
	// refresh the renderer's size
	renderer.setSize(window.innerWidth, window.innerHeight);
	// recalculate the fov if the camera runs in the autoFov mode
	if (camera.autoFov != null) {
		if (window.innerWidth > window.innerHeight) camera.setFov({v: camera.autoFov, h: camera.autoFov*window.innerHeight/window.innerWidth});
		else camera.setFov({v: camera.autoFov*window.innerWidth/window.innerHeight, h: camera.autoFov});
		// the fov changed so you need to call threeCamera.updateProjectionMatrix()
		camera.threeCamera.updateProjectionMatrix();
	}
})

// time (in seconds) of the last displayed frame
let lastAnimationT=Date.now()/1000-1;

// define the render loop
const render=()=>{
	let t=Date.now()/1000;
	// time difference from the last frame
	let dt=t-lastAnimationT;
	// load new chunks if needed
	camera.generate();
	// check pressed keys and move the camera if needed
	controls(dt);
	// display the current frame
	renderer.render(world.threeScene, camera.threeCamera);
	lastAnimationT=t;
}

setInterval(render, 20);

// time (in seconds) of the last world tick
let lastTickT=Date.now()/1000-1;

const tick=()=>{
	let t=Date.now()/1000;
	// time difference from the last frame
	let dt=lastTickT-t;
	// do a world tick
	world.doTick(dt);
	lastTickT=t;
}

setInterval(tick, 10);
