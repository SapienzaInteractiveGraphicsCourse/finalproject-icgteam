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

var gameRunning = false;
var startingTime = 3;
var playingTime = "02:00";
var remainingTime = playingTime;
var savedTimer;
var gameScore = 0;

    // HTML Listeners
document.onkeydown = handler;
document.onkeyup = handler;

instructions.addEventListener( 'click', function ( event ) {
	blocker.style.display = 'none';
	//instructions.style.display = 'none';

	document.getElementById("countdown").innerHTML = "";
	document.getElementById("countdown").style.display = "";
	document.getElementById("timer").innerHTML = "";
	document.getElementById("timer").style.display = "";
	startCountdown(startingTime, remainingTime);
});

function startCountdown(startingTime, playingTime){
	var start = Date.now();
	for (var i = 0; i < startingTime; i++){
		setTimeout(function() {
			var millis = Date.now() - start;
			var value = (3 - Math.floor(millis/1000));
			document.getElementById("countdown").innerHTML = value;
		}, i * 1000);
	}
	setTimeout(function() {
		var millis = Date.now() - start;
		var value = (3 - Math.floor(millis/1000));
		document.getElementById("countdown").innerHTML = "VIA!";
		gameRunning = true;
	}, (startingTime)*1000);

	setTimeout(function() {
		var millis = Date.now() - start;
		document.getElementById("countdown").style.display = 'none';
		document.getElementById("timer").innerHTML = playingTime;

		document.getElementById("totalscore").innerHTML = "YOUR SCORE: "+gameScore;
		startTimer();

	}, (startingTime+1)*1000);
};

function startTimer() {
	if (!gameRunning)
		return;

	var presentTime = document.getElementById("timer").innerHTML;
	remainingTime = presentTime;
	var timeArray = presentTime.split(":");
	var m = timeArray[0];
	var s = checkSecond((timeArray[1] - 1));
	if (s == 59){
		m = m - 1;
	}
 	if (m < 0){
		var annulla = window.confirm("TIMER ELAPSED.\n You totalized " + gameScore + " points by killing pedestrians.\n GOOD JOB !.\n\n\n Restart the game?");
	if (annulla) {
		 location.reload();
	}
	else {
 		gameRunning = false;
 	window.open("index.html" ,"_top");
 	}
}
	document.getElementById('timer').innerHTML = m + ":" + s;

	setTimeout(startTimer, 1000);

	function checkSecond(sec) {
		if (sec < 10 && sec >= 0) {
			sec = "0" + sec;
		}
		if (sec < 0) {
			sec = "59";
		}
		return sec;
	}
}

function updateScore(points){
	var pointsUpdate = document.getElementById("pointsupdate");
	var totalScore = document.getElementById("totalscore");

	gameScore += points;

	pointsUpdate.innerHTML = (points > 0 ? "+"+points : "-"+points);
	var start = Date.now();
	for (var i = 0; i < startingTime; i++){
		setTimeout(function() {
			var millis = Date.now() - start;
			pointsUpdate.innerHTML = "";
			totalScore.innerHTML = "YOUR SCORE: "+gameScore;
		}, 500);
	}
}

/*
document.getElementById("backgroundSelect").addEventListener("change", function(){
	setBackground(document.getElementById("backgroundSelect").value);
});
*/

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

// ground
var groundShape = new CANNON.Plane();
var groundBody = new CANNON.Body({ mass: 0, material: groundMaterial });
groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1,0,0), -Math.PI/2);
groundBody.addShape(groundShape);
world.addBody(groundBody);

// Body limitsGround
var northLimitShape = new CANNON.Plane();
var northLimitBody = new CANNON.Body({ mass: 0, material: groundMaterial });
northLimitBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1,0,0), Math.PI);
northLimitBody.position.set(0, 0, +(nBlockZ * blockSizeZ) / 2.0);
northLimitBody.addShape(northLimitShape);
world.addBody(northLimitBody);

var southLimitShape = new CANNON.Plane();
var southLimitBody = new CANNON.Body({ mass: 0, material: groundMaterial });
southLimitBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1,0,0), 0);
southLimitBody.position.set(0, 0, -(nBlockZ * blockSizeZ) / 2.0);
southLimitBody.addShape(southLimitShape);
world.addBody(southLimitBody);

var westLimitShape = new CANNON.Plane();
var westLimitBody = new CANNON.Body({ mass: 0, material: groundMaterial });
westLimitBody.quaternion.setFromAxisAngle(new CANNON.Vec3(0,1,0), -Math.PI/2);
westLimitBody.position.set(+(nBlockX * blockSizeX) / 2.0, 0, 0);
westLimitBody.addShape(westLimitShape);
world.addBody(westLimitBody);

var eastLimitShape = new CANNON.Plane();
var eastLimitBody = new CANNON.Body({ mass: 0, material: groundMaterial });
eastLimitBody.quaternion.setFromAxisAngle(new CANNON.Vec3(0,1,0), +Math.PI/2);
eastLimitBody.position.set(-(nBlockX * blockSizeX) / 2.0, 0, 0);
eastLimitBody.addShape(eastLimitShape);
world.addBody(eastLimitBody);

	// Cannon Debugger
var cannonDebugRender = new THREE.CannonDebugRenderer(scene, world);

	// WindowResize lib to handle window resizes
var windowResize = new THREEx.WindowResize(renderer, camera);

	// Stats
var render_stats = new Stats();
render_stats.domElement.style.position = 'absolute';
render_stats.domElement.style.top = '3px';
render_stats.domElement.style.left = '3px';
render_stats.domElement.style.zIndex = 100;
document.body.appendChild(render_stats.domElement);

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
var groundMesh = ground[0];
scene.add(groundMesh);

var limitsMesh = ground[1]
scene.add(limitsMesh);

	// Palaces
var palacesMesh = buildPalaces();
scene.add(palacesMesh);

	// Sidewalks
var sidewalk = buildSidewalk();
scene.add(sidewalk);

	// lamps (not font of light)
var lamps = buildSquareLamps();
scene.add(lamps);

	// Demo ambient light
var ambient = new THREE.AmbientLight( 0xffffff, 0.3 );
scene.add( ambient );

	// Demo spotlight
var spotlight = new THREE.SpotLight(0xffffff, 1);
spotlight.position.set( 0, 100, 0 );
spotlight.castShadow = true;
scene.add(spotlight);

	// NiceDudes variables
var enableNiceDudeBody = false;
var niceDudesAnimationFlag = false;
var NNiceDudes = nBlockX * nBlockZ;
var niceDudes = new Array(NNiceDudes);

	// First call render
animate();

	/*		Raycast vehicle  	*/
var chassisShape;
chassisShape = new CANNON.Box(new CANNON.Vec3(1.6, 0.8, 0.3));
var chassisBody = new CANNON.Body({ mass: 150 });
chassisBody.addShape(chassisShape);
chassisBody.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 0, 1), -Math.PI/2);
chassisBody.position.set(0, 5, 0);
chassisBody.angularVelocity.set(-2, 0, 0);

var topChassisBody;
topChassisShape = new CANNON.Sphere(0.8);
var topChassisBody = new CANNON.Body({ mass: 50 });
topChassisBody.addShape(topChassisShape);
topChassisBody.position.set(0, 5.5, 0.5);
world.addBody(topChassisBody);

var topChassisConstraint = new CANNON.LockConstraint(chassisBody, topChassisBody);
topChassisConstraint.collideConnected = false;
world.addConstraint(topChassisConstraint);

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

vehicle = new CANNON.RaycastVehicle({
    chassisBody: chassisBody,
});

options.chassisConnectionPointLocal.set(1, 0.8, 0);
vehicle.addWheel(options);

options.chassisConnectionPointLocal.set(1, -0.8, 0);
vehicle.addWheel(options);

options.chassisConnectionPointLocal.set(-1, 0.8, 0);
vehicle.addWheel(options);

options.chassisConnectionPointLocal.set(-1, -0.8, 0);
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

	// Generate NiceDude
var i = 0;
for (var r = -nBlockX/2; r < nBlockX/2; r++){
	for (var c = -nBlockZ/2; c < nBlockZ/2; c++){
			// Set the position at the center of the block
		var x = r * blockSizeX + blockSizeX/2;
		var y = 0;
		var z = c * blockSizeZ + blockSizeZ/2;
		var theta;
			// Randomize the position on the sidewalk (0:N, 1:E, 2:S, 3:O)
			// Randomize the side of the sidewalk (0:N, 1:E, 2:S, 3:O)
			// Randomize the direction of the niceDude (0:clockwise, 1:anticlockwise)
		var Xc = x;
		var Zc = z;
		var side = Math.floor(Math.random() * 4);
		var direction = Math.floor(Math.random() * 2);
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
				theta = (direction ? 0 : +Math.PI);
				break;
		}
		niceDudes[i] = new NiceDude(x, y, z, theta, direction, Xc, Zc);
		scene.add(niceDudes[i].group);

		i += 1;
	}
}
enableNiceDudeBody = true;

	// Rendering function
var fixedTimeStep = 1.0/60.0;
function animate() {
	requestAnimationFrame(animate);

	if (gameRunning) {

	  	world.step(fixedTimeStep);

		//cannonDebugRender.update();

		// Check for user input to make move the vehicle
		if (enableVehicleMesh && enableVehicleBody){
			vehicleMesh.position.copy(chassisBody.position);
			vehicleMesh.quaternion.copy(chassisBody.quaternion);
			vehicleMesh.position.y -= 0.7;
			vehicleMesh.position.z += 0.05;
			vehicleMesh.rotateZ(Math.PI/2);
			vehicleMesh.rotateX(Math.PI/2);

			CarController();
		}
		if (enableNiceDudeBody){
			for (var i = 0; i < niceDudes.length; i++){
				// The body has to follow the mesh animation

				// NiceDudes Animation
				for (var i = 0; i < NNiceDudes; i++)
					niceDudes[i].animate();
			}
		}
	}

	// Update target to follow for OrbitController
	controls.target.copy(vehicleMesh.position);
	controls.target.y += 2.8;
	controls.update();

	// Update statistics
	render_stats.update();

    // Render(scene, camera)
  	renderer.render(scene, camera);
}
