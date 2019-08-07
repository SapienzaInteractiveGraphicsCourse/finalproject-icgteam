	// Classes for NiceDude
function NiceDude(x, y, z, theta, Xc, Zc){
	this.group = new THREE.Group();

		// Head
	this.head = new Head();
	this.group.add(this.head.mesh);

		// Neck
	this.neck = new Neck();
	this.group.add(this.neck.mesh);

		// Body
	this.body = new Body();
	this.group.add(this.body.mesh);

		// LeftShoulder
	this.leftShoulder = new Shoulder("L");
	this.group.add(this.leftShoulder.mesh);
		// RightShoulder
	this.rightShoulder = new Shoulder("R");
	this.group.add(this.rightShoulder.mesh);
		
		// LeftArm
	this.leftArm = new Arm("L");
	this.group.add(this.leftArm.mesh);
		// RightArm
	this.rightArm = new Arm("R");
	this.group.add(this.rightArm.mesh);

		// LeftLeg
	this.leftLeg = new Leg("L");
	this.group.add(this.leftLeg.mesh);
		// RightLeg
	this.rightLeg = new Leg("R");
	this.group.add(this.rightLeg.mesh);

		// LeftLeg
	this.leftShoe = new Shoe("L");
	this.group.add(this.leftShoe.mesh);
		// RightShoe
	this.rightShoe = new Shoe("R");
	this.group.add(this.rightShoe.mesh);

		// Direction of the movement
	this.direction = new THREE.Vector3(1, 0, 0);
	this.step = 0.006 + 0.001*(Math.floor(Math.random() * 6));

		// Place the niceDude
	this.group.position.set(x, y, z);
	this.group.rotateY(theta);

		// Center of the block
	this.Xc = Xc;
	this.Zc = Zc;

		// 4 lamps position
	this.lamps = new Array(4);
	this.lamps[0] = new THREE.Vector3(Xc, 0, Zc);
	this.lamps[0].x += -blockSizeX/2 -roadW/2 -sidewalkW/2;
	this.lamps[0].z += -blockSizeZ/2 -roadD/2 -sidewalkD/2;
	
	this.lamps[1] = new THREE.Vector3(Xc, 0, Zc);
	this.lamps[1].x += +blockSizeX/2 +roadW/2 +sidewalkW/2;
	this.lamps[1].z += -blockSizeZ/2 -roadD/2 -sidewalkD/2;

	this.lamps[2] = new THREE.Vector3(Xc, 0, Zc);
	this.lamps[2].x += -blockSizeX/2 -roadW/2 -sidewalkW/2;
	this.lamps[2].z += +blockSizeZ/2 +roadD/2 +sidewalkD/2;

	this.lamps[3] = new THREE.Vector3(Xc, 0, Zc);
	this.lamps[3].x += +blockSizeX/2 +roadW/2 +sidewalkW/2;
	this.lamps[3].z += +blockSizeZ/2 +roadD/2 +sidewalkD/2;

	
	for (var i = 0; i < 4; i++){
		var g = new THREE.BoxGeometry(1, 1, 1);
		var m = new THREE.MeshBasicMaterial();
		var mm = new THREE.Mesh(g, m);
		mm.position.set(this.lamps[i].x, 0, this.lamps[i].z);
		scene.add(mm);
	}
	
	var g = new THREE.BoxGeometry(1, 1, 1);
	var m = new THREE.MeshBasicMaterial();
	var mm = new THREE.Mesh(g, m);
	mm.position.set(this.Xc, 0, this.Zc);
	scene.add(mm);
	
}

function Head(){
	var headRadius = 0.1;
	var headScaleHeight = 1.5;
	var headScaleWidth = 1.1;
	var headPositionX = 0;	
	var headPositionY = 1.9;	
	var headPositionZ = 0;	

	this.geometry = new THREE.SphereGeometry(headRadius, 32, 32);
	this.geometry.scale(headScaleWidth, headScaleHeight, headScaleWidth);
	this.geometry.translate(headPositionX, headPositionY, headPositionZ);
	
	this.material = new THREE.MeshBasicMaterial( {color : 0xffc1ae} );
	
	this.mesh = new THREE.Mesh(this.geometry, this.material);
}

function Neck(){
	var neckRadius = 0.1;
	var neckHeight = 0.3;
	var neckPositionX = 0;	
	var neckPositionY = 1.7;
	var neckPositionZ = 0;

	this.geometry = new THREE.ConeGeometry(neckRadius, neckHeight, 32);
	this.geometry.translate(neckPositionX, neckPositionY, neckPositionZ);
	
	this.material = new THREE.MeshBasicMaterial( {color : 0xffc1ae} );
	
	this.mesh = new THREE.Mesh(this.geometry, this.material);
}

function Body(){
	var bodyRadiusTop = 0.08;
	var bodyRadiusBottom = 0.1;
	var bodyHeight = 0.7;
	var bodyScaleWidthZ = 1.2;
	var bodyScaleWidthX = 2.2;
	var bodyPositionX = 0;	
	var bodyPositionY = 1.32;
	var bodyPositionZ = 0;

	this.geometry = new THREE.CylinderGeometry(bodyRadiusTop, bodyRadiusBottom, bodyHeight, 32);
	this.geometry.scale(bodyScaleWidthX, 1, bodyScaleWidthZ);
	this.geometry.translate(bodyPositionX, bodyPositionY, bodyPositionZ);
	
	this.material = new THREE.MeshBasicMaterial( {color : 0xff8c33} );
	
	this.mesh = new THREE.Mesh(this.geometry, this.material);
}

function Shoulder(label){
	var shoulderRadius = 0.1;
	var shoulderPositionX = 0 + (label == 'L' ? 0.2 : -0.2);	
	var shoulderPositionY = 1.59;
	var shoulderPositionZ = 0;

	this.geometry = new THREE.Geometry();

	this.geometry1 = new THREE.SphereGeometry(shoulderRadius, 32, 32, 0, Math.PI*2, 0, Math.PI/2);
	this.geometry.merge(this.geometry1);

	this.geometry2 = new THREE.CircleGeometry(shoulderRadius, 32);
	this.geometry2.rotateX(Math.PI/2);
	this.geometry.merge(this.geometry2);

	this.geometry.translate(shoulderPositionX, shoulderPositionY, shoulderPositionZ);
	
	this.material = new THREE.MeshBasicMaterial( {color : 0xff8c33} );
	
	this.mesh = new THREE.Mesh(this.geometry, this.material);
}

function Arm(label){
	var armRadius = 0.07;
	var armHeight = 0.6;
	var armPositionX = 0 + (label == 'L' ? 0.19 : -0.19);	
	var armPositionY = 1.35;
	var armPositionZ = 0;

	this.geometry = new THREE.CylinderGeometry(armRadius, armRadius, armHeight, 32);
	this.geometry.translate(armPositionX, armPositionY, armPositionZ);
	
	this.material = new THREE.MeshBasicMaterial( {color : 0xffc1ae} );
	
	this.mesh = new THREE.Mesh(this.geometry, this.material);
}

function Leg(label){
	var legRadius = 0.07;
	var legHeight = 0.9;
	var legPositionX = 0 + (label == 'L' ? 0.1 : -0.1);	
	var legPositionY = 0.63;
	var legPositionZ = 0;

	this.geometry = new THREE.CylinderGeometry(legRadius, legRadius, legHeight, 32);
	this.geometry.translate(legPositionX, legPositionY, legPositionZ);
	
	this.material = new THREE.MeshBasicMaterial( {color : 0x1b4ef6} );
	
	this.mesh = new THREE.Mesh(this.geometry, this.material);
}


function Shoe(label){
	var shoeRadius = 0.12;
	var shoeScaleX = 0.7;
	var shoeScaleZ = 1.6;
	var shoePositionX = 0 + (label == 'L' ? 0.1 : -0.1);	
	var shoePositionY = 0.1;
	var shoePositionZ = 0.08;
	
	this.geometry = new THREE.Geometry();

	this.geometry1 = new THREE.SphereGeometry(shoeRadius, 32, 32, 0, Math.PI*2, 0, Math.PI/2);
	this.geometry1.scale(shoeScaleX, 1, shoeScaleZ);
	this.geometry.merge(this.geometry1);

	this.geometry2 = new THREE.CircleGeometry(shoeRadius, 32);
	this.geometry2.rotateX(Math.PI/2);
	this.geometry2.scale(shoeScaleX, 1, shoeScaleZ);
	this.geometry.merge(this.geometry2);

	this.geometry.translate(shoePositionX, shoePositionY, shoePositionZ);
	
	this.material = new THREE.MeshBasicMaterial( {color : 0xff8c33} );
	
	this.mesh = new THREE.Mesh(this.geometry, this.material);
	this.material = new THREE.MeshBasicMaterial( {color : 0x402c11} );
	
	this.mesh = new THREE.Mesh(this.geometry, this.material);
}

NiceDude.prototype.isNearLamp = function(lamp) {
	if ((lamp.x-0.5 < this.group.position.x) &&
		(this.group.position.x < lamp.x+0.5) && 
		(lamp.z-0.5 < this.group.position.z) &&
		(this.group.position.z < lamp.z+0.5))
			return true;
	return false;
}

NiceDude.prototype.animate = function() {
	this.group.translateZ(this.step);
	
		// Check niceDude position to avoid lamps
	for (var i = 0; i < 4; i++){
		console.log(this);
		console.log(this.lamps[i]);
		if (this.isNearLamp(this.lamps[i]));
			this.group.rotateY(Math.PI);
	}
}
