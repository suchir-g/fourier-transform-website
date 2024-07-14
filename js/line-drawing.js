const DRAWING = 0;
const TRANSFORM = 1;

let points = [];
let fourierPoints;
let t = 0;
let tracedPath = [];
let sketch = [];
let mode = -1;
let fullCycleCompleted = false;

function mousePressed() {
  mode = DRAWING;
  sketch = [];
  points = [];
  t = 0;
  tracedPath = [];
  fullCycleCompleted = false;
}

function mouseReleased() {
  mode = TRANSFORM;
  const step = 1;
  for (let i = 0; i < sketch.length; i += step) {
    points.push(new ComplexNum(sketch[i].x, sketch[i].y));
  }
  fourierPoints = computeDFT(points);
  fourierPoints.sort((a, b) => b.amplitude - a.amplitude);
}

function setup() {
  createCanvas(windowWidth, windowHeight).parent("line-drawing-container");
  background(0);
  fill(255);
  textAlign(CENTER);
  textSize(40);
  text("Draw some lines", width / 2, height / 2);
}

function visualizeEpicycles(x, y, rotation, fourierData) {
  for (let i = 0; i < fourierData.length; i++) {
    let prevX = x;
    let prevY = y;
    let frequency = fourierData[i].frequency;
    let radius = fourierData[i].amplitude;
    let phaseShift = fourierData[i].phase;
    x += radius * cos(frequency * t + phaseShift + rotation);
    y += radius * sin(frequency * t + phaseShift + rotation);

    stroke(255, 100);
    noFill();
    ellipse(prevX, prevY, radius * 2);
    stroke(255, 200);
    line(prevX, prevY, x, y);
  }
  return createVector(x, y);
}

function draw() {
  if (mode === DRAWING) {
    background(0);
    let pt = createVector(mouseX - width / 2, mouseY - height / 2);
    sketch.push(pt);
    stroke(255);
    noFill();
    beginShape();
    for (let v of sketch) {
      vertex(v.x + width / 2, v.y + height / 2);
    }
    endShape();
  } else if (mode === TRANSFORM && !fullCycleCompleted) {
    background(0);
    let v = visualizeEpicycles(width / 2, height / 2, 0, fourierPoints);
    tracedPath.unshift(v);
    beginShape();
    noFill();
    strokeWeight(2);
    stroke(0, 255, 255); // Blue color for the traced path
    for (let i = 0; i < tracedPath.length; i++) {
      vertex(tracedPath[i].x, tracedPath[i].y);
    }
    endShape();

    const deltaTime = TWO_PI / fourierPoints.length;
    t += deltaTime;

    if (t >= TWO_PI) {
      fullCycleCompleted = true;
    }
  }
}

class ComplexNum {
  constructor(real, imaginary) {
    this.real = real;
    this.imaginary = imaginary;
  }
}

function computeDFT(input) {
  const result = [];
  const N = input.length;
  for (let k = 0; k < N; k++) {
    let sumReal = 0;
    let sumImaginary = 0;
    for (let n = 0; n < N; n++) {
      const angle = (TWO_PI * k * n) / N;
      sumReal += input[n].real * cos(angle) + input[n].imaginary * sin(angle);
      sumImaginary +=
        input[n].imaginary * cos(angle) - input[n].real * sin(angle);
    }
    sumReal = sumReal / N;
    sumImaginary = sumImaginary / N;

    const frequency = k;
    const amplitude = sqrt(sumReal * sumReal + sumImaginary * sumImaginary);
    const phase = atan2(sumImaginary, sumReal);
    result[k] = {
      real: sumReal,
      imaginary: sumImaginary,
      frequency,
      amplitude,
      phase,
    };
  }
  return result;
}
