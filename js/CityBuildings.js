/*
This is a support library that contatins all the directives
to construct the buildings of the city.
*/

var nBlockX = 4;
var nBlockZ = 4;
var blockSizeX = 30;
var blockSizeZ = 30;
var limitH = 1.5;
var roadW = 10;
var roadD = 10;
var lampDensityW = 1;
var lampDensityD = 1;
var lampH = 3;
var blockDensity = 1;
var buildingMaxW = 15;
var buildingMaxD = 15;
var sidewalkW = 2;
var sidewalkH = 0.1;
var sidewalkD = 2;

// Useful function to detect if a face is the BottomFace (uses normals)
function isBottomFace(face){
	if (face.normal.x != 0)
		return false;
	if (face.normal.y != -1)
		return false;
	if (face.normal.z != 0)
		return false;
	return true;
}

// Return the basic building
function createBaseBuilding(){
		// Building
	var geometry = new THREE.CubeGeometry( 1, 1, 1 );
	geometry.translate(0, 0.5, 0);

		// Remove texture from top face
	for (var i = 0; i < 3; i++){
		geometry.faceVertexUvs[0][4][i].set(0, 0);
		geometry.faceVertexUvs[0][5][i].set(0, 0);
	}

		// Replace the bottom face with a fake face
	var fakeFace = geometry.faces[1];
	for (var i = 0; i < geometry.faces.length; i++){
		if (isBottomFace(geometry.faces[i]))
			geometry.faces.splice(i, 1, fakeFace);
	}

	var meshBuilding = new THREE.Mesh( geometry );
	return meshBuilding;
}

// Return the ground mesh
function buildGround(){
	var groundTexture = new THREE.TextureLoader().load( "./images/textures/road_road.jpg");
	groundTexture.wrapS = THREE.RepeatWrapping;
	groundTexture.wrapT = THREE.RepeatWrapping;
	groundTexture.repeat.set( 4, 4 );
	
	var groundGeometry = new THREE.Geometry();
	var groundMaterial = new THREE.MeshPhongMaterial({ 
		color: 0x222222, 
		shininess: 0,
		map: groundTexture,
		dithering: true 
	});
    
		// Ground
	var groundGeometry = new THREE.PlaneGeometry( (nBlockX)*blockSizeX, (nBlockZ)*blockSizeZ);
	groundGeometry.lookAt(new THREE.Vector3(0,1,0));
	var groundMesh = new THREE.Mesh(groundGeometry, groundMaterial);
	
		// groundLimits
	var limitsGeometry = new THREE.Geometry();

	var northLimitGeometry = new THREE.PlaneGeometry((nBlockZ)*blockSizeZ, limitH);
	northLimitGeometry.rotateY(Math.PI);
	northLimitGeometry.translate(0, limitH/2-0.1, (nBlockZ * blockSizeZ) / 2.0);
	var northLimitMesh = new THREE.Mesh(northLimitGeometry, groundMaterial);
	limitsGeometry.merge(northLimitMesh.geometry, northLimitMesh.matrix);

	var southLimitGeometry = new THREE.PlaneGeometry((nBlockZ)*blockSizeZ, limitH);
	southLimitGeometry.translate(0, limitH/2-0.1, -(nBlockZ * blockSizeZ) / 2.0);
	var southLimitMesh = new THREE.Mesh(southLimitGeometry, groundMaterial);
	limitsGeometry.merge(southLimitMesh.geometry, southLimitMesh.matrix);
	
	var eastLimitGeometry = new THREE.PlaneGeometry((nBlockX)*blockSizeX, limitH);
	eastLimitGeometry.rotateY(Math.PI/2);
	eastLimitGeometry.translate(-(nBlockX * blockSizeX) / 2.0, limitH/2-0.1, 0);
	var eastLimitMesh = new THREE.Mesh(eastLimitGeometry, groundMaterial);
	limitsGeometry.merge(eastLimitMesh.geometry, eastLimitMesh.matrix);
	
	var westLimitGeometry = new THREE.PlaneGeometry((nBlockX)*blockSizeX, limitH);
	westLimitGeometry.rotateY(-Math.PI/2);
	westLimitGeometry.translate(+(nBlockX * blockSizeX) / 2.0, limitH/2-0.1, 0);
	var westLimitMesh = new THREE.Mesh(westLimitGeometry, groundMaterial);
	limitsGeometry.merge(westLimitMesh.geometry, westLimitMesh.matrix);

	var limitsTexture = new THREE.TextureLoader().load( "./images/textures/wood_fence.jpg");
	limitsTexture.wrapS = THREE.RepeatWrapping;
	limitsTexture.wrapT = THREE.RepeatWrapping;

	var limitsMaterial = new THREE.MeshPhongMaterial({ 
		color: 0x222222, 
		shininess: 0,
		map: limitsTexture,
		dithering: true 
	});

	var limitsMesh = new THREE.Mesh(limitsGeometry, limitsMaterial);

	return [groundMesh, limitsMesh];
}

// Return the mesh containing all palaces meshes
function buildPalaces(){
	var buildingMesh = createBaseBuilding();
	var cityGeometry = new THREE.Geometry();
    for( var blockZ = 0; blockZ < nBlockZ; blockZ++){
		for( var blockX = 0; blockX < nBlockX; blockX++){
			for( var n = 0; n < blockDensity; n++){
				// set position
				buildingMesh.position.x = (Math.random()-0.5)*(blockSizeX-buildingMaxW-roadW-sidewalkW);
				buildingMesh.position.z = (Math.random()-0.5)*(blockSizeZ-buildingMaxD-roadD-sidewalkD);

				// add position for the blocks
				buildingMesh.position.x += (blockX+0.5-nBlockX/2)*blockSizeX;
				buildingMesh.position.z += (blockZ+0.5-nBlockZ/2)*blockSizeZ;

				// put a random scale
				buildingMesh.scale.x = Math.min(Math.random() * 5 + 10, buildingMaxW);
				buildingMesh.scale.y = (Math.random() * Math.random() * buildingMesh.scale.x) * 3 + 4;
				buildingMesh.scale.z = Math.min(buildingMesh.scale.x, buildingMaxD)

				    // Create sidewalkBody
		        var buildingMaterial = new CANNON.Material();
				var buildingShape = new CANNON.Box(new CANNON.Vec3(buildingMesh.scale.x/2, buildingMesh.scale.y, buildingMesh.scale.z/2));
				var buildingBody = new CANNON.Body( {mass: 0, material: buildingMaterial} );
				buildingBody.addShape(buildingShape);
				buildingBody.position.set(buildingMesh.position.x, buildingMesh.position.y, buildingMesh.position.z);
				world.add(buildingBody);

				// merge it with cityGeometry - very important for performance
				buildingMesh.updateMatrix();
				cityGeometry.merge( buildingMesh.geometry, buildingMesh.matrix );
			}
		}
    }

	var texture = new THREE.TextureLoader().load( "./images/textures/windows.jpg" )

    // build the city Mesh
    var material  = new THREE.MeshLambertMaterial({
    	//color : 0x00ff00,
    	map : texture,
    	vertexColors  : THREE.VertexColors
    });
    var cityMesh = new THREE.Mesh( cityGeometry, material );
    return cityMesh;
}

function buildSidewalk(){
	var buildingMesh = createBaseBuilding();
    var sidewalksGeometry = new THREE.Geometry();
    for( var blockZ = 0; blockZ < nBlockZ; blockZ++){
      for( var blockX = 0; blockX < nBlockX; blockX++){
        // set position
        buildingMesh.position.x = (blockX+0.5-nBlockX/2)*blockSizeX;
        buildingMesh.position.z = (blockZ+0.5-nBlockZ/2)*blockSizeZ;

        buildingMesh.scale.x  = blockSizeX-roadW;
        buildingMesh.scale.y  = sidewalkH;
        buildingMesh.scale.z  = blockSizeZ-roadD;

        	// Create sidewalkBody
        var sidewalkMaterial = new CANNON.Material();
		var sidewalkShape = new CANNON.Box(new CANNON.Vec3(buildingMesh.scale.x/2, buildingMesh.scale.y, buildingMesh.scale.z/2));
		var sidewalkBody = new CANNON.Body( {mass: 0, material: sidewalkMaterial} );
		sidewalkBody.addShape(sidewalkShape);
		sidewalkBody.position.set(buildingMesh.position.x, buildingMesh.position.y, buildingMesh.position.z);
		world.add(sidewalkBody);

        // merge it with cityGeometry - very important for performance
        buildingMesh.updateMatrix();
        sidewalksGeometry.merge( buildingMesh.geometry, buildingMesh.matrix );
      }
    }

	var material = new THREE.MeshBasicMaterial({
        color  : 0x262626
    });

    var sidewalksMesh = new THREE.Mesh(sidewalksGeometry, material );
    return sidewalksMesh;
}

function buildSquareLamps(){
	// Useful functino to add a single lamp
	function addLamp(position){
		var lightPosition = position.clone();
		lightPosition.y = sidewalkH+lampH+0.1;
		// set position for block
		lightPosition.x += (blockX+0.5-nBlockX/2)*blockSizeX;
		lightPosition.z += (blockZ+0.5-nBlockZ/2)*blockSizeZ;

		lightsGeometry.vertices.push( lightPosition );

		// set head position
		lampMesh.position.copy(position);
		lampMesh.position.y = sidewalkH+lampH;
		// add poll offset
		lampMesh.scale.set(0.2,0.2,0.2);
		// colorify
		for(var i = 0; i < lampMesh.geometry.faces.length; i++ ) {
			lampMesh.geometry.faces[i].color.set( 'white' );
		}
		// set position for block
		lampMesh.position.x += (blockX+0.5-nBlockX/2)*blockSizeX;
		lampMesh.position.z += (blockZ+0.5-nBlockZ/2)*blockSizeZ;
		// merge it with cityGeometry - very important for performance
		lampMesh.updateMatrix();
		lampsGeometry.merge( lampMesh.geometry, lampMesh.matrix );

		// set pole position
		lampMesh.position.copy(position);
		lampMesh.position.y += sidewalkH;
		// add pole offset
		lampMesh.scale.set(0.1,lampH,0.1);
		// colorify
		for(var i = 0; i < lampMesh.geometry.faces.length; i++ ) {
			lampMesh.geometry.faces[i].color.set('grey' );
		}
		// set position for block
		lampMesh.position.x += (blockX+0.5-nBlockX/2)*blockSizeX;
		lampMesh.position.z += (blockZ+0.5-nBlockZ/2)*blockSizeZ;
		// merge it with cityGeometry - very important for performance
		lampMesh.updateMatrix();
		lampsGeometry.merge( lampMesh.geometry, lampMesh.matrix );

			// Create lampBody
        var lampMaterial = new CANNON.Material();
		var lampShape = new CANNON.Box(new CANNON.Vec3(0.05, lampH, 0.05));
		var lampBody = new CANNON.Body( {mass: 0, material: lampMaterial} );
		lampBody.addShape(lampShape);
		lampBody.position.set(lampMesh.position.x, lampMesh.position.y, lampMesh.position.z);
		world.add(lampBody);
		    
		// set base position
		lampMesh.position.copy(position);
		lampMesh.position.y += sidewalkH;
		// add poll offset
		lampMesh.scale.set(0.12,0.4,0.12);
		// colorify
		for(var i = 0; i < lampMesh.geometry.faces.length; i++ ) {
			lampMesh.geometry.faces[i].color.set('maroon' );
		}
		// set position for block
		lampMesh.position.x += (blockX+0.5-nBlockX/2)*blockSizeX;
		lampMesh.position.z += (blockZ+0.5-nBlockZ/2)*blockSizeZ;

		// merge it with cityGeometry - very important for performance
		lampMesh.updateMatrix();
		lampsGeometry.merge( lampMesh.geometry, lampMesh.matrix );
    }

    var object3d = new THREE.Object3D();

    var lampGeometry= new THREE.CubeGeometry(1,1,1);
    lampGeometry.applyMatrix( new THREE.Matrix4().makeTranslation( 0, 0.5, 0 ) );
    var lampMesh = new THREE.Mesh(lampGeometry);

    // These are the cumulative geometry
    var lightsGeometry  = new THREE.Geometry();
    var lampsGeometry = new THREE.Geometry();
    for( var blockZ = 0; blockZ < nBlockZ; blockZ++){
    	for( var blockX = 0; blockX < nBlockX; blockX++){
	        var position = new THREE.Vector3();
	        // south
	        for(var i = 0; i < lampDensityW+1; i++){
				position.x = (i/lampDensityW-0.5)*(blockSizeX-roadW-sidewalkW);
				position.z = -0.5*(blockSizeZ-roadD-sidewalkD);
				addLamp(position);
	        }
	        // north
	        for(var i = 0; i < lampDensityW+1; i++){
				position.x = (i/lampDensityW-0.5)*(blockSizeX-roadW-sidewalkW);
				position.z = +0.5*(blockSizeZ-roadD-sidewalkD);
				addLamp(position);
	        }
	        // east
			for(var i = 1; i < lampDensityD; i++){
				position.x = +0.5*(blockSizeX-roadW-sidewalkW);
				position.z = (i/lampDensityD-0.5)*(blockSizeZ-roadD-sidewalkD);
				addLamp(position);
			}
	        // west
			for(var i = 1; i < lampDensityD; i++){
				position.x = -0.5*(blockSizeX-roadW-sidewalkW);
				position.z = (i/lampDensityD-0.5)*(blockSizeZ-roadD-sidewalkD);
				addLamp(position);
			}
    	}
    }

    // build the lamps Mesh
    var material  = new THREE.MeshLambertMaterial({
    	vertexColors : THREE.VertexColors
    });
    var lampsMesh = new THREE.Mesh(lampsGeometry, material );
    object3d.add(lampsMesh);

    var texture = new THREE.TextureLoader().load( "./images/lights/lensflare2_alpha.png" );
    var material = new THREE.PointsMaterial({
		map : texture,
		size : 8,
		transparent : true
    });
    var lightParticles = new THREE.Points( lightsGeometry, material );
    lightParticles.sortParticles = true;
    object3d.add( lightParticles );

    return object3d;
}