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
};
document.onkeyup = function(event) {
    keyDown[event.keyCode] = false;	
};
document.getElementById("backgroundSelect").addEventListener("change", function(){
	setBackground(document.getElementById("backgroundSelect").value);
});

	// Renderer
var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

	// Scene 
//var scene = new THREE.Scene();
var scene = new Physijs.Scene();
scene.setGravity(new THREE.Vector3(0, -30, 0));
scene.addEventListener('update', function(){
	scene.simulate(undefined, 1);
});

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

	// WindowResize lib to handle window resize
var windowResize = new THREEx.WindowResize(renderer, camera);

	// BackgroundSelector
function setBackground(background){
	if (background == 'null')
		scene.background = null;
	else{
		var format = (background == 'pisa' ? '.png' : '.jpg');
		var urls = ['px'+format, 'nx'+format, 'py'+format, 'ny'+format, 'pz'+format, 'nz'+format];

		scene.background = new THREE.CubeTextureLoader().setPath('images/background/'+background+'/').load(urls);
	}
}

	// Camera Controls
var controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.maxDistance = 9;

var speed = 0;
var minSpeed = -0.1;
var maxSpeed = 0.1;

	// Car Model
var vehicleGeometry = new THREE.BoxGeometry(2, 1.8, 3.2);
//geometryContainer.translate(0, 1.9, 0);
var vehicleMaterial = new THREE.MeshBasicMaterial({wireframe : true, opacity : 0.5});
var vehicle = new Physijs.BoxMesh(vehicleGeometry, vehicleMaterial);

	// Setup model loader and load vehicle model
var vehicleModel = new THREE.Object3D();
var loader = new THREE.GLTFLoader();
loader.load("models/pony_cartoon/scene.gltf",
			function(gltf){		// OnLoad
				loaded = gltf.scene;
				loaded.scale.set(0.005, 0.005, 0.005);
				loaded.updateMatrix();
				vehicleModel = loaded;
				vehicle.add(vehicleModel);
			},
			function(xhr){		// OnProgress
				var perc = xhr.loaded / xhr.total * 100;
				console.log('pony_cartoon ' + perc + '% loaded');
			},
			function(error){	// OnError
				console.log("Cannot load the model");
			}
);
scene.add(vehicle);

	// Ground
var ground = buildGround();
scene.add(ground);

	// Palaces
//var palaces = buildPalaces();
//scene.add(palaces);

	//TestCube
var boxGeometry = new THREE.BoxGeometry(1, 1, 1);
var boxMaterial = new Physijs.createMaterial(new THREE.MeshLambertMaterial({color : 0x00ff00}));
var box = new Physijs.BoxMesh(boxGeometry, boxMaterial);
box.position.set(-10, 15, 10);
scene.add(box);

	// Sidewalks
//var sidewalk = buildSidewalk();
//scene.add(sidewalk);
//buildSidewalk();

	// lamps (not font of light)
var lamps = buildSquareLamps();
scene.add(lamps);

	// Generate NiceDude
var NNiceDudes = nBlockX * nBlockZ;
var niceDudes = new Array(NNiceDudes);
var i = 0;
for (var r = -nBlockX/2; r < nBlockX/2; r++){
	for (var c = -nBlockZ/2; c < nBlockZ/2; c++){
			// Set the position at the center of the block
		var x = r * blockSizeX + blockSizeX/2;
		var y = 0.01;
		var z = c * blockSizeZ + blockSizeZ/2;
		var theta;
		var velocity;	// !!! TODO: Randomize velocity for animation  !!!
			// Randomize the position on the sidewalk (0:N, 1:E, 2:S, 3:O)
			// Randomize the direction of the niceDude (0:clockwise, 1:anticlockwise)
		var side = Math.floor(Math.random() * 4);
		var direction = Math.floor(Math.random()*2);
		switch (side){
			case 0:
				z = z + blockSizeZ/2 - roadD/2 - sidewalkD/2;
				theta = (direction ? +Math.PI/2 : -Math.PI/2);
				break;
			case 1:
				x = x + blockSizeX/2 - roadW/2 - sidewalkW/2;
				theta = (direction ? +Math.PI : 0);
				break;
			case 2:
				z = z - blockSizeZ/2 + roadD/2 + sidewalkD/2;
				theta = (direction ? -Math.PI/2 : +Math.PI/2);
				break;
			case 3:
				x = x - blockSizeX/2 + roadW/2 + sidewalkW/2;
				theta = (direction ? 0 : -Math.PI);
				break;
		}
		niceDudes[i] = new NiceDude(x, y, z, theta);
		scene.add(niceDudes[i].group);

		i += 1;
	}
}

	// Demo light
var light = new THREE.HemisphereLight(0xfffff0, 0x101020, 1.25);
light.position.set(50, 50, 50);
scene.add(light);

	// First call render
animate();
scene.simulate();

	// Rendering function
function animate(now) {
  	requestAnimationFrame(animate);

  	//vehicle.__dirtyPosition = true;
  	//vehicle.__dirtyRotation = true;

	// Check for user input to make move the vehicle
	checkUserInput();
	
	// Update target to follow for OrbitController
	controls.target.x = vehicle.position.x;
	controls.target.y = vehicle.position.y + 2.8;
	controls.target.z = vehicle.position.z;
	controls.update();
	
	// Start to simulate Physijs world
	scene.simulate(undefined, 2);
    // Render(scene, camera)
  	renderer.render(scene, camera);
}