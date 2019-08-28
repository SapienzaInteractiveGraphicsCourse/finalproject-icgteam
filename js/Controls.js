var maxSteerVal = 0.5;
var maxForce = 200;
var brakeForce = 15;
var frictionForce = 1.0;

var keyDown = new Array(320);
for (var i = 0; i < keyDown.length; i++)
    keyDown[i] = false;

function CarController(){
    if (!keyDown[65] && !keyDown[68]){
        vehicle.setSteeringValue(0, 0);
        vehicle.setSteeringValue(0, 1);
    }
    if (!keyDown[87] && !keyDown[83]){
        vehicle.applyEngineForce(0, 2);
        vehicle.applyEngineForce(0, 3);
    }
    if (!keyDown[32]){
        vehicle.setBrake(frictionForce, 0);
        vehicle.setBrake(frictionForce, 1);
    }

    if (keyDown[81]){ // q
        var impulse = new CANNON.Vec3(0, 0, 10); 
        var leftSide = new CANNON.Vec3(0, -1, 0);
        chassisBody.applyLocalImpulse(impulse, leftSide);
    }    
    if (keyDown[69]){ // e
        var impulse = new CANNON.Vec3(0, 0, 10); 
        var rightSide = new CANNON.Vec3(0, 1, 0);
        chassisBody.applyLocalImpulse(impulse, rightSide);
    }
    if (keyDown[32]){ // space
        vehicle.setBrake(brakeForce, 0);
        vehicle.setBrake(brakeForce, 1);
    }
    if (keyDown[87]){ // forward
        vehicle.setBrake(0, 0);
        vehicle.setBrake(0, 1);
        if (keyDown[32]){ // space
            vehicle.setBrake(brakeForce, 0);
            vehicle.setBrake(brakeForce, 1);
        }
        vehicle.applyEngineForce(-maxForce, 2);
        vehicle.applyEngineForce(-maxForce, 3);
    }
    if (keyDown[83]){ // backward
        vehicle.setBrake(0, 0);
        vehicle.setBrake(0, 1);
        vehicle.applyEngineForce(maxForce, 2);
        vehicle.applyEngineForce(maxForce, 3);
    }
    if (keyDown[65]){  // left
        vehicle.setSteeringValue(maxSteerVal, 0);
        vehicle.setSteeringValue(maxSteerVal, 1);
    }
    if (keyDown[68]){  // right
        vehicle.setSteeringValue(-maxSteerVal, 0);
        vehicle.setSteeringValue(-maxSteerVal, 1);
    }

}

function handler(event){
    var up = (event.type == 'keyup');
    var down = (event.type == 'keydown');
    if (down){
        switch(event.keyCode){
            case 27:   // esc
                blocker.style.display = '-webkit-box';
                blocker.style.display = '-moz-box';
                blocker.style.display = 'box';

                instructions.style.display = '';

                gameRunning = false;
                break;
            case 81:
                keyDown[81] = true;
                break;
            case 69:
                keyDown[69] = true;
                break;
            case 32:
                keyDown[32] = true;
                break;
            case 87:
                keyDown[87] = true;
                break;
            case 83:
                keyDown[83] = true;
                break;
            case 68:
                keyDown[68] = true;
                break;
            case 65:
                keyDown[65] = true;
                break;
        }
    }
    else if (up) {
        switch(event.keyCode){
            case 81:
                keyDown[81] = false;
                break;
            case 69:
                keyDown[69] = false;
                break;
            case 32:
                keyDown[32] = false;
                break;
            case 87:
                keyDown[87] = false;
                break;
            case 83:
                keyDown[83] = false;
                break;
            case 68:
                keyDown[68] = false;
                break;
            case 65:
                keyDown[65] = false;
                break;
        }
    }

}
