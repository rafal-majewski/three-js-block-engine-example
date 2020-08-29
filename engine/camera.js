function Camera(settings) {
	this.rotSpeed=(settings.rotSpeed != null)?(settings.rotSpeed):(0.1);
	this.speed=(settings.speed != null)?(settings.speed):(1);
	this.autoFov=(settings.autoFov != null)?(settings.autoFov):(null);
	this.p={...(settings.p || {x: 0, y: 0, z: 0})};
	this.rot={...(settings.rot && {v: settings.rot.v || 0, h: Math.max(Math.min(settings.rot.h || 0, Math.PI/2-0.001), -Math.PI/2+0.001)} || {v: 0, h: 0})};
	this.fov={...(settings.fov || {v: 2, h: 2})};
	this.world=settings.world;
	this.generationRange=(settings.generationRange != null)?(settings.generationRange):(4);
	this.threeCamera=new THREE.PerspectiveCamera(this.fov.v*180/Math.PI, this.fov.v/this.fov.h, 0.01, 1000);
	this.threeCamera.position.x=this.p.x;
	this.threeCamera.position.y=this.p.y;
	this.threeCamera.position.z=this.p.z;
	this.world.threeScene.add(this.threeCamera);
	let p={x: this.p.x+Math.sin(this.rot.h)*Math.cos(this.rot.v), y: this.p.y+Math.sin(this.rot.v), z: this.p.z+Math.cos(this.rot.h)*Math.cos(this.rot.v)};
	this.threeCamera.lookAt(p.x, p.y, p.z);
};

Camera.prototype.setP=function(p) {
	if (p.x != null) {
		this.p.x=p.x;
		this.threeCamera.position.x=this.p.x;
	};
	if (p.y != null) {
		this.p.y=p.y;
		this.threeCamera.position.y=this.p.y;
	};
	if (p.z != null) {
		this.p.z=p.z;
		this.threeCamera.position.z=this.p.z;
	};
};

Camera.prototype.setFov=function(fov) {
	if (typeof fov != "object") {
		this.autoFov=fov;
		this.setFov({v: fov, h: fov*window.innerHeight/window.innerWidth});
	} else {
		this.autoFov=null;
		if (fov.v != null) {
			this.fov.v=fov.v;
			this.threeCamera.fov=fov.v*180/Math.PI;
		};
		if (fov.h != null) {
			this.fov.h=fov.h;
			this.threeCamera.aspect=this.fov.v/fov.h;
		};
	}
};

Camera.prototype.setRot=function(rot) {
	if (rot.h != null) this.rot.h=rot.h;
	if (rot.v != null) this.rot.v=Math.min(Math.max(rot.v, -Math.PI/2+0.001), Math.PI/2-0.001);
	let p={x: this.p.x+Math.sin(this.rot.h)*Math.cos(this.rot.v), y: this.p.y+Math.sin(this.rot.v), z: this.p.z+Math.cos(this.rot.h)*Math.cos(this.rot.v)};
	this.threeCamera.lookAt(p.x, p.y, p.z);
};

Camera.prototype.generate=function() {
	this.world.generate(this.p, this.generationRange);
}