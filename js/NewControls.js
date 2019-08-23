var codes = {'W' : 87,
			 'A' : 65,
			 'S' : 83,
			 'D' : 68
			};

var velocityFactor = 0.2;
var rotationFactor = 0.2;

var inputVelocity = new THREE.Vector3();
var inputRotation = new THREE.Vector3();

var euler = new THREE.Euler();

var quaternion = new THREE.Quaternion();

// Function to check the control given in input from the user
function checkUserInput(){

	inputVelocity.set(0, 0, 0);

	if (keyDown[codes['W']]){		// Increase speed
		vehicleBody.applyEngineForce(3);
		//inputVelocity.z += velocityFactor;
	}		
	if (keyDown[codes['S']]){	// Decrease speed
		inputVelocity.z -= velocityFactor;
	}

	if (true){//Math.abs(speed) > 0.02){	// Rotate vehicle
		if (keyDown[codes['A']])
			inputRotation.y += rotationFactor;
		if (keyDown[codes['D']])
			inputRotation.y -= rotationFactor;
	}

	euler.y = inputRotation.y;
	euler.order = "XYZ";
	quaternion.setFromEuler(euler);
	inputVelocity.applyQuaternion(quaternion);

	vehicleBody.velocity.x += inputVelocity.x;
	vehicleBody.velocity.z += inputVelocity.z;

	vehicle.position.copy(vehicleBody.position);

}

