// The Korean phrase “안녕하세요” means “Hello” in English.

let font;
let spots = [];
let isOrigin = false;

async function setup() {
	createCanvas(windowWidth, windowHeight);
	textSize(150);
	textAlign(CENTER);
	
	font = await loadFont('https://cdn.jsdelivr.net/gh/fonts-archive/NanumGothic/NanumGothicLight.ttf');
	let points = await font.textToPoints('Mixtape', windowWidth / 2, windowHeight / 2, { sampleFactor: 0.1 });
	
	for (let p of points) {
		let spot = new Spot(p.x, p.y);
		spots.push(spot);
	}
	
	describe('Hundreds of points freely drift through space. When you click the mouse, a hidden message appears.');
}

function draw() {
	background(0);
	
	for (let s of spots) {
		if (this.isOrigin) {
			s.originalize();
		} else {
			s.diffuse();
		}
		
		s.checkEdges();
		s.run();
		s.show();
	}
}

function windowResized() {
	resizeCanvas(windowWidth, windowHeight);
}

function mouseClicked() {
	this.isOrigin = !this.isOrigin;
}

class Spot {
	constructor(x, y) {
		this.origin = createVector(x, y);
		this.pos = createVector(random(0, windowWidth), random(0, windowHeight));
		this.acc = createVector(0, 0);
		this.vel = createVector(0, 0);
		this.maxforce = 8.0;
	}
	
	// F = ma
	applyForce(force) {
		let limited = force.limit(this.maxforce);
		this.acc.add(limited);
	}
	
	checkEdges() {
		// UpSdie
		if (this.pos.y <= 0) {
			this.vel.y *= -1;
		}
		// DownSide
		else if (this.pos.y >= windowHeight) {
			this.vel.y *= -1;
		}
		// LeftSide
		else if (this.pos.x <= 0) {
			this.vel.x *= -1;
		}
		// RightSide
		else if (this.pos.x >= windowWidth) {
			this.vel.x *= -1;
		}
	}
	
	run() {
		this.vel.add(this.acc);
		this.pos.add(this.vel);
		this.acc.mult(0);
	}
	
	diffuse() {
		let randomed = createVector(random(-0.5, 0.5), random(-0.5, 0.5));
		this.applyForce(randomed);
	}
	
	originalize() {
		let desired = p5.Vector.sub(this.origin, this.pos);
		let d = desired.mag();
		if (d < 100) {
			let m = map(d, 0, 100, 0, this.maxforce);
			desired.setMag(m);
		} else {
			desired.setMag(this.maxforce);
		}
		
		let steer = p5.Vector.sub(desired, this.vel);
		this.applyForce(steer);
	}
	
	show() {
		stroke(255);
		strokeWeight(5);
		point(this.pos.x, this.pos.y);
	}
}





























