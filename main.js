/*
			Z coord
			^
			| 
			|
			|
	--------+-------> X coord
			|
			|
			|

*/

    // HTML Listeners
document.onkeydown = function(event) {
	keyDown[event.keyCode] = true;
}
document.onkeyup = function(event) {
    keyDown[event.keyCode] = false;	
}
	// Function to check the control given in input from the user
function checkUserInput(){
	var codes = {'W' : 87,
				 'A' : 65,
				 'S' : 83,
				 'D' : 68
				};

	if (keyDown[codes['W']]){		// Increase speed
		if (speed < maxSpeed)			
			speed += 0.01;
	}		
	else if (keyDown[codes['S']]){	// Decrease speed
		if (speed > minSpeed)
			speed -= 0.01;
	}
	else {							// Friction force
		speed -= speed * 0.03;
	}
		
	if (Math.abs(speed) > 0.02){	// Rotate vehicle
		if (keyDown[codes['A']])
			vehicle.rotation.y += Math.sign(speed) * 0.02;
		if (keyDown[codes['D']])
			vehicle.rotation.y -= Math.sign(speed) * 0.02;
	}

		// Translate vehicle
	vehicle.position.x += speed * Math.sin(vehicle.rotation.y);
	vehicle.position.z += speed * Math.cos(vehicle.rotation.y);

}

    // Renderer
var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

	// Scene 
var scene = new THREE.Scene();

	// Camera
var fov = 45;
var ratio = window.innerWidth / window.innerHeight;
var near = 0.1;
var far = 3000;
var camera = new THREE.PerspectiveCamera(fov, ratio, near, far);
camera.position.x = 0;
camera.position.y = 4;
camera.position.z = -7;
scene.add(camera);


	// Vehicle Controls
var vehicle = new THREE.Object3D();;
var speed = 0;
var minSpeed = -0.1;
var maxSpeed = 0.1;

var keyDown = new Array();
for (var i = 0; i < 300; i++) {
    keyDown[i] = false;
}
	
	// Setup model loader and load car model
var loader = new THREE.GLTFLoader();
loader.load("models/pony_cartoon/scene.gltf",
			function(gltf){		// OnLoad
				vehicle = gltf.scene;
				vehicle.scale.set(0.005,0.005,0.005);
				vehicle.updateMatrix();
				scene.add(vehicle);
			},
			function(xhr){		// OnProgress
				var perc = xhr.loaded / xhr.total * 100;
				console.log('pony_cartoon ' + perc + '% loaded');
			},
			function(error){	// OnError
				console.log("Cannot load the model");
			}
);

	// Camera Controls
var controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.maxDistance = 9;

	// Ground
var ground = buildGround();
scene.add(ground);

	// Palaces
var palaces = buildPalaces();
scene.add(palaces);

	// Sidewalks
var sidewalk = buildSidewalk();
scene.add(sidewalk);

	// lamps (not font of light)
var lamps = buildSquareLamps();
scene.add(lamps);

	// Demo light
var light = new THREE.HemisphereLight(0xfffff0, 0x101020, 1.25);
light.position.set(50, 50, 50);
scene.add(light);

	// First call render
animate();

	// Rendering function
function animate() {

  	requestAnimationFrame(animate);

	// Check for user input to make move the vehicle
	checkUserInput();

	// Update target to follow for OrbitController
	controls.target.x = vehicle.position.x;
	controls.target.y = vehicle.position.y + 2.8;
	controls.target.z = vehicle.position.z;
	controls.update();

    // Render(scene, camera)
  	renderer.render(scene, camera);
  	
}