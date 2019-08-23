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
world.gravity.set(0, -9.81, 0);			// -9.81 m/s^2
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

	// Cannon Debugger
var cannonDebugRender = new THREE.CannonDebugRenderer(scene, world);

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
controls.maxDistance = 29;

	// Vehicle Controls
var vehicle = new THREE.Object3D();
var vehicleBody = new CANNON.Body();
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

					// Vehicle 
				var vehicleMaterial = new CANNON.Material();
				var vehicleShape = new CANNON.Box(new CANNON.Vec3(1, 1, 2));
				vehicleBody = new CANNON.Body( {mass: 10, material: vehicleMaterial} );
				vehicleBody.addShape(vehicleShape);
				bodies.push(vehicleBody);
				world.add(vehicleBody);

				vehicle = gltf.scene;
				vehicle.scale.set(0.005,0.005,0.005);
				vehicle.updateMatrix();
				meshes.push(vehicle);
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
groundBody.quaternion.setFromAxisAngle( new CANNON.Vec3(1,0,0), -Math.PI/2 );
groundBody.addShape(groundShape);
world.add(groundBody);

var ground = buildGround();
ground.receiveShadow = true;
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

	// Demo ambient light
var ambient = new THREE.AmbientLight( 0xffffff, 0.3 );
scene.add( ambient );

	// Demo spotlight
var spotlight = new THREE.SpotLight(0xffffff, 1);
spotlight.position.set( 0, 100, 0 );
spotlight.castShadow = true;
scene.add(spotlight);

	// First call render
animate();

	// Rendering function
var delta = 1/60;
function animate() {
  	requestAnimationFrame(animate);

  	world.step(delta);

  	cannonDebugRender.update();
  	// update cannon world
  	for (var i = 0; i < bodies.length; i++){
  		meshes[i].position.copy(bodies[i].position);
        meshes[i].quaternion.copy(bodies[i].quaternion);
  	}
  
	// Check for user input to make move the vehicle
	checkUserInput();

	/*
	vehicle.position.copy(vehicleUpdate[0]);
	vehicle.rotation.copy(vehicleUpdate[1]);
	vehicleBody.position.copy(vehicle.position);
	vehicleBody.position.y = 1;
	vehicleBody.quaternion.copy(vehicle.quaternion);
	*/

	// Update target to follow for OrbitController
	controls.target.copy(vehicle.position);
	controls.target.y += 2.8;
	controls.update();

    // Render(scene, camera)
  	renderer.render(scene, camera);
}

/* Test with a boxBody and boxMesh

var boxMaterial = new CANNON.Material();
var boxShape = new CANNON.Box(new CANNON.Vec3(0.5, 0.5, 0.5));
var boxBody = new CANNON.Body( {mass: 10, material: boxMaterial} );
boxBody.addShape(boxShape);
boxBody.angularVelocity.set(0, 2, 0);
boxBody.position.set(0, 2, 5);
bodies.push(boxBody);
world.add(boxBody);

var boxGeometry = new THREE.BoxGeometry(1, 1, 1);
var boxMaterial = new THREE.MeshPhongMaterial( {color: 0xffff00, dithering: true} );
var boxMesh = new THREE.Mesh(boxGeometry, boxMaterial);
boxMesh.position.set(0, 2, 5);
boxMesh.receiveShadow = true;
boxMesh.castShadow = true;
meshes.push(boxMesh);
scene.add(boxMesh);

*/

var chassisShape;
chassisShape = new CANNON.Box(new CANNON.Vec3(2, 1,0.5));
var chassisBody = new CANNON.Body({ mass: 150 });
chassisBody.addShape(chassisShape);
chassisBody.position.set(0, 0, 4);
chassisBody.angularVelocity.set(0, 0, 0.5);
world.add(chassisBody);

var options = {
    radius: 0.5,
    directionLocal: new CANNON.Vec3(0, 0, -1),
    suspensionStiffness: 30,
    suspensionRestLength: 0.3,
    frictionSlip: 5,
    dampingRelaxation: 2.3,
    dampingCompression: 4.4,
    maxSuspensionForce: 100000,
    rollInfluence:  0.01,
    axleLocal: new CANNON.Vec3(0, 1, 0),
    chassisConnectionPointLocal: new CANNON.Vec3(1, 1, 0),
    maxSuspensionTravel: 0.3,
    customSlidingRotationalSpeed: -30,
    useCustomSlidingRotationalSpeed: true
};

// Create the vehicle
cannonVehicle = new CANNON.RaycastVehicle({
    chassisBody: chassisBody,
});

options.chassisConnectionPointLocal.set(1, 1, 0);
cannonVehicle.addWheel(options);

options.chassisConnectionPointLocal.set(1, -1, 0);
cannonVehicle.addWheel(options);

options.chassisConnectionPointLocal.set(-1, 1, 0);
cannonVehicle.addWheel(options);

options.chassisConnectionPointLocal.set(-1, -1, 0);
cannonVehicle.addWheel(options);

cannonVehicle.addToWorld(world);

var wheelBodies = [];
for(var i=0; i<cannonVehicle.wheelInfos.length; i++){
    var wheel = cannonVehicle.wheelInfos[i];
    var cylinderShape = new CANNON.Cylinder(wheel.radius, wheel.radius, wheel.radius / 2, 20);
    var wheelBody = new CANNON.Body({
        mass: 0
    });
    wheelBody.type = CANNON.Body.KINEMATIC;
    wheelBody.collisionFilterGroup = 0; // turn off collisions
    var q = new CANNON.Quaternion();
    q.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), Math.PI / 2);
    wheelBody.addShape(cylinderShape, new CANNON.Vec3(), q);
    wheelBodies.push(wheelBody);
    world.addBody(wheelBody);
}