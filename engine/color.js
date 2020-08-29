function Color(settings) {
	this.r=Math.min(255, Math.max(0, Math.round(settings.r)));
	this.g=Math.min(255, Math.max(0, Math.round(settings.g)));
	this.b=Math.min(255, Math.max(0, Math.round(settings.b)));
}