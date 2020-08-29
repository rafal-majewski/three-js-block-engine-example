let keyboard={};
document.addEventListener("keydown", (event)=>{
	if (keyboard[event.key] != "hold") keyboard[event.key]="pressed";
});
document.addEventListener("keyup", (event)=>{
	keyboard[event.key]="released";
});

// define a function to change the keystates from pressed to hold and released to free
const refreshKeys=()=>{
	for (let key in keyboard) {
		if (keyboard[key] == "pressed") keyboard[key]="hold";
		else if (keyboard[key] == "released") keyboard[key]="free";
	}
}
