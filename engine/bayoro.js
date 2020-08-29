// for more information about the bayoro noise please check https://github.com/Rafal-Majewski/bayoro-noise

function Bayoro2(settings) {
	this.layers=[];
	for (let i=0; i<settings.layersCount; ++i) {
		let layer={};
		let angle=2*Math.PI*Math.random();
		layer.rxx=Math.cos(angle);
		layer.rxy=-Math.sin(angle);
		layer.ryx=Math.sin(angle);
		layer.ryy=Math.cos(angle);
		layer.shiftx=2*Math.PI*Math.random();
		layer.shifty=2*Math.PI*Math.random();
		layer.amplitude=settings.mapIndexToAmplitude(i);
		layer.frequency=settings.mapIndexToFrequency(i);
		this.layers.push(layer);
	}
	this.cache={}; // to prevent unnecessary calculations a caching system needs to be implemented
};

Bayoro2.prototype.calculate=function(x, y) {
	if (this.cache[x] == undefined) this.cache[x]={};
	if (this.cache[x][y] == undefined) this.cache[x][y]=this.layers.reduce((sum, layer)=>(sum+layer.amplitude*Math.sin(layer.shiftx+(x*layer.rxx+y*layer.rxy)*layer.frequency)*Math.sin(layer.shifty+(x*layer.ryx+y*layer.ryy)*layer.frequency)), 0);
	return this.cache[x][y];
}