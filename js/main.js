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
document.onkeydown = handler;
document.onkeyup = handler;

document.getElementById("backgroundSelect").addEventListener("change", function(){
	setBackground(document.getElementById("backgroundSelect").value);
});

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

	// Initialize CANNON WORLD
var world = new CANNON.World();
world.broadphase = new CANNON.SAPBroadphase(world);
world.gravity.set(0, -9.81, 0);			// -9.81 m/s^2

var groundMaterial = new CANNON.Material("groundMaterial");
var wheelMaterial = new CANNON.Material("wheelMaterial");
var wheelGroundContactMaterial = new CANNON.ContactMaterial(wheelMaterial, groundMaterial, {
    friction: 0.3,
    restitution: 0,
    contactEquationStiffness: 1000
});
world.addContactMaterial(wheelGroundContactMaterial);

var groundShape = new CANNON.Plane();
var groundBody = new CANNON.Body({ mass: 0, material: groundMaterial });
groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1,0,0), -Math.PI/2);
groundBody.addShape(groundShape);
world.addBody(groundBody);

	// Cannon Debugger
var cannonDebugRender = new THREE.CannonDebugRenderer(scene, world);

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

	// Load Texture Vehicle
var enableVehicleMesh = false;
var enableVehicleBody = false;
var vehicleMesh = new THREE.Object3D();
var loader = new THREE.GLTFLoader();
loader.load("models/pony_cartoon/scene.gltf",
		function(gltf){		// OnLoad
			vehicleMesh = gltf.scene;
			vehicleMesh.rotateZ(Math.PI/2);
			vehicleMesh.scale.set(0.005, 0.005, 0.005);
			vehicleMesh.updateMatrix();
			scene.add(vehicleMesh);
			enableVehicleMesh = true;
		},
		function(xhr){		// OnProgress
			var perc = xhr.loaded / xhr.total * 100;
			console.log('pony_cartoon ' + perc + '% loaded.');
		},
		function(error){	// OnError
			console.log("Cannot load the model.");
		}
);
	// Ground
var ground = buildGround();
scene.add(ground);

	// Palaces
//var palaces = buildPalaces();
//scene.add(palaces);

	// Sidewalks
var sidewalk = buildSidewalk();
scene.add(sidewalk);

	// lamps (not font of light)
//var lamps = buildSquareLamps();
//scene.add(lamps);
/*
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
*/

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
var fixedTimeStep = 1.0/60.0
function animate() {
  	requestAnimationFrame(animate);

  	world.step(fixedTimeStep);

  	cannonDebugRender.update();
  	/*
  	// update cannon world
  	for (var i = 0; i < bodies.length; i++){
  		meshes[i].position.copy(bodies[i].position);
        meshes[i].quaternion.copy(bodies[i].quaternion);
  	}
  	*/

	// Check for user input to make move the vehicle
	if (enableVehicleMesh && enableVehicleBody) {
		vehicleMesh.position.copy(chassisBody.position);
		vehicleMesh.quaternion.copy(chassisBody.quaternion);
		vehicleMesh.position.y -= 0.8;
		vehicleMesh.rotateZ(Math.PI/2);
		vehicleMesh.rotateX(Math.PI/2);
	}

	
	// Update target to follow for OrbitController
	controls.target.copy(vehicleMesh.position);
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

/*		Raycast vehicle  	*/
var mass = 150;
var chassisShape;
chassisShape = new CANNON.Box(new CANNON.Vec3(2, 1,0.5));
var chassisBody = new CANNON.Body({ mass: mass });
chassisBody.addShape(chassisShape);
chassisBody.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 0, 1), -Math.PI/2);
chassisBody.position.set(0, 5, 0);
chassisBody.angularVelocity.set(-2, 0, 0);

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
vehicle = new CANNON.RaycastVehicle({
    chassisBody: chassisBody,
});

options.chassisConnectionPointLocal.set(1, 1, 0);
vehicle.addWheel(options);

options.chassisConnectionPointLocal.set(1, -1, 0);
vehicle.addWheel(options);

options.chassisConnectionPointLocal.set(-1, 1, 0);
vehicle.addWheel(options);

options.chassisConnectionPointLocal.set(-1, -1, 0);
vehicle.addWheel(options);

vehicle.addToWorld(world);

var wheelBodies = [];
for(var i=0; i<vehicle.wheelInfos.length; i++){
    var wheel = vehicle.wheelInfos[i];
    var cylinderShape = new CANNON.Cylinder(wheel.radius, wheel.radius, wheel.radius / 2, 20);
    var wheelBody = new CANNON.Body({
        mass: 10
    });
    wheelBody.type = CANNON.Body.KINEMATIC;
    wheelBody.collisionFilterGroup = 0; // turn off collisions
    var q = new CANNON.Quaternion();
    q.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), Math.PI / 2);
    wheelBody.addShape(cylinderShape, new CANNON.Vec3(), q);
    wheelBodies.push(wheelBody);
    world.addBody(wheelBody);
}

// Update wheels
world.addEventListener('postStep', function(){
    for (var i = 0; i < vehicle.wheelInfos.length; i++) {
        vehicle.updateWheelTransform(i);
        var t = vehicle.wheelInfos[i].worldTransform;
        var wheelBody = wheelBodies[i];
        wheelBody.position.copy(t.position);
        wheelBody.quaternion.copy(t.quaternion);
    }
});

vehicle.addToWorld(world);

enableVehicleBody = true;

