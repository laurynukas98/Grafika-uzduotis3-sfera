const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
var stats = initStats();

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setClearColor(0xEEEEEE, 1.0);
renderer.shadowMap.enabled = true;
document.body.appendChild( renderer.domElement );

camera.position.z = 20;

//add spotlight for the shadows
var spotLight = new THREE.SpotLight( 0xffffff );
spotLight.position.set( 0, 0, 30 );
spotLight.castShadow = true;
scene.add( spotLight );

const axesHelper = new THREE.AxesHelper( 40 );
scene.add( axesHelper );

let controls = new THREE.TrackballControls( camera, renderer.domElement );  

function animate() {
    requestAnimationFrame( animate );
    renderer.render( scene, camera );
    controls.update();
    stats.update();
}
animate();

//-------------------------------------------
// GUI
//-------------------------------------------

var obj = {
	points: 1000,
	R: 10,
	redraw: function(){ console.log("clicked"); drawSphere(this.R,this.points); }
};

var gui = new dat.gui.GUI();

gui.add(obj, 'points').min(500).max(10000).step(100).onChange(function (value){
	drawSphere(obj.R, value);
});
gui.add(obj, 'R').min(5).max(30).step(1).onChange(function (value){
	drawSphere(value, obj.points);
});
gui.add(obj, 'redraw');

function initStats(){

  var stats = new Stats();
  stats.setMode(0); //0: fps, 1: ms

  //Align top-left
  stats.domElement.style.position = 'absolute';
  stats.domElement.style.left = '0px';
  stats.domElement.style.top = '0px';

  document.getElementById("statz").append(stats.domElement);

  return stats;
}

/* drawSphere */

function UV(point){
	var u = 0.5 + Math.atan2(point.x, point.z) / (2 * Math.PI);
	var v = 0.5 - Math.asin(point.y / obj.R) / Math.PI;
	var rez = [u, v];
    return rez;
}

var texture = new THREE.TextureLoader().load('./Chess.png');
texture.wrapS = THREE.RepeatWrapping;
texture.wrapT = THREE.RepeatWrapping;
var wireframe = new THREE.MeshBasicMaterial({wireframe: true, color:0xff0000, side: THREE.DoubleSide});
var textureMat = new THREE.MeshBasicMaterial({map: texture, color: 0xffffff, side: THREE.DoubleSide});
var sphere = null;

function drawSphere(R, iter){
	if (sphere != null){
		scene.remove(sphere);
	}
	var pointz = new Array();
	var uv = [];
	for (var i = 0; i < iter; ){
		var x = (Math.random() * (R*2))-R;
		var y = (Math.random() * (R*2))-R;
		var z = (Math.random() * (R*2))-R;
		if ( x*x+y*y+z*z <= R*R){
			pointz.push(new THREE.Vector3(x,y,z));
			i++;
		}
	}
	console.log(pointz);
	var sphereGeo = new ConvexGeometry(pointz);
	for (var i = 0; i < sphereGeo.faces.length; ++i){
		var u1 = UV(sphereGeo.vertices[sphereGeo.faces[i].a])[0];
		var v1 = UV(sphereGeo.vertices[sphereGeo.faces[i].a])[1];
		var u2 = UV(sphereGeo.vertices[sphereGeo.faces[i].b])[0];
		var v2 = UV(sphereGeo.vertices[sphereGeo.faces[i].b])[1];
		var u3 = UV(sphereGeo.vertices[sphereGeo.faces[i].c])[0];
		var v3 = UV(sphereGeo.vertices[sphereGeo.faces[i].c])[1];
		var rightSide = 0.6;
		var leftSide = 0.3;
		if ( u1 > rightSide && u2 < leftSide && u3 < leftSide)
			u1 = u1 - 1;
		else if ( u2 > rightSide && u1 < leftSide && u3 < leftSide)
			u2 = u2 - 1;
		else if ( u3 > rightSide && u1 < leftSide && u2 < leftSide)
			u3 = u3 - 1;
		if ( u1 < leftSide && u2 > rightSide && u3 > rightSide)
			u1 = u1 + 1;
		else if ( u2 < leftSide && u1 > rightSide && u3 > rightSide)
			u2 = u2 + 1;
		else if ( u3 < leftSide && u2 > rightSide && u1 > rightSide)
			u3 = u3 + 1;
		uv.push( [new THREE.Vector2( u1, v1),
			new THREE.Vector2( u2, v2),
			new THREE.Vector2( u3, v3)]);
		sphereGeo.faceVertexUvs[0].push(uv[i]);
	}
	console.log(sphereGeo);
	sphere = SceneUtils.createMultiMaterialObject(sphereGeo, [textureMat, wireframe]);
	scene.add(sphere);
}

drawSphere(obj.R,obj.points);

/* drawSphere */