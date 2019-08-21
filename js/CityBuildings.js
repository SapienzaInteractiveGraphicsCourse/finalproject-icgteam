/*
This is a support library that contatins all the directives
to construct the buildings of the city.
*/

var nBlockX = 6;
var nBlockZ = 6;
var blockSizeX = 30;
var blockSizeZ = 30;
var roadW = 10;
var roadD = 10;
var lampDensityW = 1;
var lampDensityD = 1;
var lampH = 3;
var blockDensity = 5;
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

// Useful function to generate the texture
function generateTextureCanvas(){
	// build a small canvas 32x64 and paint it in white
	var canvas  = document.createElement( 'canvas' );
	canvas.width  = 32;
	canvas.height = 64;
	var context = canvas.getContext( '2d' );
	// plain it in white
	context.fillStyle = '#ffffff';
	context.fillRect( 0, 0, 32, 64 );
	/*
	// draw the window rows - with a small noise to simulate light variations in each room
	for( var y = 2; y < 64; y += 2 ){
		for( var x = 0; x < 32; x += 2 ){
			var value = Math.floor( Math.random() * 64 );
			context.fillStyle = 'rgb(' + [value, value, value].join( ',' )  + ')';
			context.fillRect( x, y, 2, 1 );
		}
	}
*/
	// build a bigger canvas and copy the small one in it
	// This is a trick to upscale the texture without filtering
	var canvas2 = document.createElement( 'canvas' );
	canvas2.width = 512;
	canvas2.height  = 1024;
	var context = canvas2.getContext( '2d' );
	// disable smoothing
	context.imageSmoothingEnabled   = false;
	context.webkitImageSmoothingEnabled = false;
	context.mozImageSmoothingEnabled  = false;
	// then draw the image
	context.drawImage( canvas, 0, 0, canvas2.width, canvas2.height );
	// return the just built canvas2
	return canvas2;
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
	// Ground
	var geometry = new THREE.PlaneGeometry( 1, 1, 1 );
	var texture = new THREE.TextureLoader().load( "./images/road_road.jpg");

	texture.wrapS = THREE.RepeatWrapping;
	texture.wrapT = THREE.RepeatWrapping;
	texture.repeat.set( 4, 4 );
var material = new THREE.MeshBasicMaterial( { map: texture } );
	var ground  = new THREE.Mesh(geometry, material);
	ground.scale.x = (nBlockX)*blockSizeX;
	ground.scale.y = (nBlockZ)*blockSizeZ;
	ground.lookAt(new THREE.Vector3(0,1,0));

	return ground;
}

// Return the mesh containing all palaces meshes
function buildPalaces(){
	var texture = new THREE.TextureLoader().load('images/windows.jpg');
		var material  = new THREE.PointsMaterial({
		map : texture,
		size : 7,
		transparent : true,

		});
	// base colors for vertexColors. light is for vertices at the top, shaddow is for the ones at the bottom
	function colorifyBuilding(buildingMesh){
		var light = new THREE.Color( 0xffffff );
		var shadow  = new THREE.Color( 0x303050 );
			// establish the base color for the buildingMesh
		var value = 1 - Math.random() * Math.random();
		var baseColor = new THREE.Color().setRGB( value + Math.random() * 0.1, value, value + Math.random() * 0.1 );
			// set topColor/bottom vertexColors as adjustement of baseColor
		var topColor  = baseColor.clone().multiply( light );
		var bottomColor = baseColor.clone().multiply( shadow );
			// set .vertexColors for each face
		var geometry  = buildingMesh.geometry;
		for ( var j = 0, jl = geometry.faces.length; j < jl; j ++ ) {
			if ( j === 2 ) {
				// set face.vertexColors on root face
				geometry.faces[ j ].vertexColors = [ baseColor, baseColor, baseColor, baseColor ];
			} else {
				// set face.vertexColors on sides faces
				geometry.faces[ j ].vertexColors = [ topColor, bottomColor, bottomColor, topColor ];
			}
		}
	}

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

				//colorifyBuilding(buildingMesh);

				// merge it with cityGeometry - very important for performance
				buildingMesh.updateMatrix();
				cityGeometry.merge( buildingMesh.geometry, buildingMesh.matrix );
			}
		}
    }
/*
	var buildingTexture = new THREE.Texture( generateTextureCanvas() );
	buildingTexture.anisotropy  = renderer.capabilities.getMaxAnisotropy();
	buildingTexture.needsUpdate = true;
*/
	var texture = new THREE.TextureLoader().load( "./images/windows.jpg" );
		var material = new THREE.PointsMaterial({
		map : texture,
		size : 8,
		transparent : true
		});
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

    var texture = new THREE.TextureLoader().load( "./images/lensflare2_alpha.png" );
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

function buildSquareCarLights(){

	// Useful functino to add a single CarLight
	function addCarLights(position){
		var positionL = position.clone();
		positionL.x += -carW/2;
		// set position for block
		positionL.x += (blockX+0.5-nBlockX/2)*blockSizeX;
		positionL.z += (blockZ+0.5-nBlockZ/2)*blockSizeZ;
		geometry.vertices.push( positionL );
		geometry.colors.push( colorFront );

		var positionR = position.clone();
		positionR.x += carW/2;
		// set position for block
		positionR.x += (blockX+0.5-nBlockX/2)*blockSizeX;
		positionR.z += (blockZ+0.5-nBlockZ/2)*blockSizeZ;
		geometry.vertices.push( positionR );
		geometry.colors.push( colorFront );

		position.x = -position.x;

		var positionL = position.clone();
		positionL.x += -carW/2;
		// set position for block
		positionL.x += (blockX+0.5-nBlockX/2)*blockSizeX;
		positionL.z += (blockZ+0.5-nBlockZ/2)*blockSizeZ;
		geometry.vertices.push( positionL );
		geometry.colors.push( colorBack );

		var positionR = position.clone();
		positionR.x += carW/2;
		// set position for block
		positionR.x += (blockX+0.5-nBlockX/2)*blockSizeX
		positionR.z += (blockZ+0.5-nBlockZ/2)*blockSizeZ
		geometry.vertices.push( positionR );
		geometry.colors.push( colorBack );
    }

	var carLightsDensityD = 4;
    var carW = 1;
    var carH = 2;

    var geometry = new THREE.Geometry();
    var position = new THREE.Vector3();
    position.y = carH/2;

    var colorFront = new THREE.Color('white');
    var colorBack = new THREE.Color('red');

    for( var blockX = 0; blockX < nBlockX; blockX++){
    	for( var blockZ = 0; blockZ < nBlockZ; blockZ++){
    		// east
    		for(var i = 0; i < carLightsDensityD+1; i++){
				position.x  = +0.5*blockSizeX-roadW/4
				position.z  = (i/carLightsDensityD-0.5)*(blockSizeZ-roadD)
				addCarLights(position)
        	}
      	}
    }

    var object3d  = new THREE.Object3D();

    var texture = new THREE.TextureLoader().load( "../images/lensflare2_alpha.png" );
    var material  = new THREE.PointsMaterial({
		map : texture,
		size : 6,
		transparent : true,
		vertexColors : THREE.VertexColors
    });
    var particles = new THREE.Points( geometry, material );
    particles.sortParticles = true;
    object3d.add(particles);

    return object3d;
}
