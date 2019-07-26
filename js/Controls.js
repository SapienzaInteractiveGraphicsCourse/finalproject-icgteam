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