const controls=(dt)=>{
	refreshKeys();
	if (keyboard["e"] == "hold") { // move the camera forward
		let p={x: Math.sin(camera.rot.h)*Math.cos(camera.rot.v), y: Math.sin(camera.rot.v), z: Math.cos(camera.rot.h)*Math.cos(camera.rot.v)};
		camera.setP({x: camera.p.x+p.x*dt*camera.speed, y: camera.p.y+p.y*dt*camera.speed, z: camera.p.z+p.z*dt*camera.speed})
	}
	if (keyboard["q"] == "hold") { // move the camera backward
		let p={x: Math.sin(camera.rot.h)*Math.cos(camera.rot.v), y: Math.sin(camera.rot.v), z: Math.cos(camera.rot.h)*Math.cos(camera.rot.v)};
		camera.setP({x: camera.p.x-p.x*dt*camera.speed, y: camera.p.y-p.y*dt*camera.speed, z: camera.p.z-p.z*dt*camera.speed})
	}
	if (keyboard["a"] == "hold") { // rotate left
		camera.setRot({h: camera.rot.h+dt*camera.rotSpeed});
	}
	if (keyboard["d"] == "hold") { // rotate right
		camera.setRot({h: camera.rot.h-dt*camera.rotSpeed});
	}
	if (keyboard["w"] == "hold") { // rotate up
		camera.setRot({v: camera.rot.v+dt*camera.rotSpeed});
	}
	if (keyboard["s"] == "hold") { // rotate down
		camera.setRot({v: camera.rot.v-dt*camera.rotSpeed});
	}
};