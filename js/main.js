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

	// CANNON JS initialization
var world = new CANNON.World();
world.quatNormalizeSkip = 0;
world.quatNormalizeFast = false;
world.defaultContactMaterial.contactEquationStiffness = 1e9;
world.defaultContactMaterial.contactEquationRelaxation = 4;
world.gravity.set(0, -1, 0);
world.broadphase = new CANNON.NaiveBroadphase();

var solver = new CANNON.GSSolver();
solver.iterations = 7;
solver.tolerance = 0.1;

world.solver = new CANNON.SplitSolver(solver);

physicsMaterial = new CANNON.Material("slipperyMaterial");
var physicsContactMaterial = new CANNON.ContactMaterial(physicsMaterial,
                                                        physicsMaterial,
                                                        0.0, // friction
                                                        0.3  // restitution
                                                        );
world.addContactMaterial(physicsContactMaterial);
	
var bodies = new Array();
var meshes = new Array();


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

	// Ground
var groundShape = new CANNON.Plane();
var groundMaterial = new CANNON.Material();
var groundBody = new CANNON.Body({ mass: 0, material: groundMaterial });
groundBody.quaternion.setFromAxisAngle( new CANNON.Vec3(1,0,0), -Math.PI/2);
groundBody.addShape(groundShape);
world.add(groundBody);

var ground = buildGround();
scene.add(ground);

	// Palaces
//var palaces = buildPalaces();
//scene.add(palaces);

	// Sidewalks
//var sidewalk = buildSidewalk();
//scene.add(sidewalk);

	// lamps (not font of light)
//var lamps = buildSquareLamps();
//scene.add(lamps);

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
		var velocity;	// !!! TODO: Randomize velocity for animatyion  !!!
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

	// Rendering function
var delta = 1/60;
function animate() {
  	requestAnimationFrame(animate);

  	world.step(delta);

  	// update cannon world
  	for (var i = 0; i < bodies.length; i++){
  		meshes[i].position.copy(bodies[i].position);
        meshes[i].quaternion.copy(bodies[i].quaternion);
  	}
  
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

	// Little pause to enstablish the CAnnnon world
function pausecomp(millis)
{
    var date = new Date();
    var curDate = null;
    do { curDate = new Date(); }
    while(curDate-date < millis);
}

pausecomp(2000);

	// Box
var boxMaterial = new CANNON.Material();
var boxShape = new CANNON.Box(new CANNON.Vec3(0.5, 0.5, 0.5));
var boxBody = new CANNON.Body( {mass: 10, material: boxMaterial} );
boxBody.addShape(boxShape);
boxBody.angularVelocity.set(0, 2, 0);
boxBody.position.set(0, 2, 5);
world.add(boxBody);
bodies.push(boxBody);

var boxGeometry = new THREE.BoxGeometry(1, 1, 1);
var boxMaterial = new THREE.MeshLambertMaterial( {color: 0xffff00} );
var boxMesh = new THREE.Mesh(boxGeometry, boxMaterial);
boxMesh.position.set(0, 2, 5);
scene.add(boxMesh);
meshes.push(boxMesh);
