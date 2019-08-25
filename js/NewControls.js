var maxSteerVal = 0.5;
var maxForce = 100;
var brakeForce = 10000;
function handler(event){
    var up = (event.type == 'keyup');

    if(!up && event.type !== 'keydown'){
        return;
    }

    vehicle.setBrake(0, 0);
    vehicle.setBrake(0, 1);
    vehicle.setBrake(0, 2);
    vehicle.setBrake(0, 3);

    switch(event.keyCode){

    case 32: // space
        vehicle.setBrake(brakeForce, 0);
        vehicle.setBrake(brakeForce, 1);
        vehicle.setBrake(brakeForce, 2);
        vehicle.setBrake(brakeForce, 3);
        break;

    case 87: // forward
        vehicle.applyEngineForce(up ? 0 : -maxForce, 2);
        vehicle.applyEngineForce(up ? 0 : -maxForce, 3);
        break;

    case 83: // backward
        vehicle.applyEngineForce(up ? 0 : maxForce, 2);
        vehicle.applyEngineForce(up ? 0 : maxForce, 3);
        break;

    case 68: // right
        vehicle.setSteeringValue(up ? 0 : -maxSteerVal, 0);
        vehicle.setSteeringValue(up ? 0 : -maxSteerVal, 1);
        break;

    case 65: // left
        vehicle.setSteeringValue(up ? 0 : maxSteerVal, 0);
        vehicle.setSteeringValue(up ? 0 : maxSteerVal, 1);
        break;

    }
}