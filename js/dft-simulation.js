// manual DFT calculation
function manualDFT(y) {
  const N = y.length;
  const X = new Array(N).fill(0).map(() => new Complex(0, 0));
  for (let k = 0; k < N; k++) {
    for (let n = 0; n < N; n++) {
      const angle = (-2 * Math.PI * k * n) / N;
      const exp = new Complex(Math.cos(angle), Math.sin(angle));
      X[k] = X[k].add(y[n].multiply(exp));
    }
  }
  return X;
}

// manual inverse DFT calculation
function manualIDFT(Y, t_continuous, N) {
  const y_reconstructed = new Array(t_continuous.length)
    .fill(0)
    .map(() => new Complex(0, 0));
  for (let k = 0; k < N; k++) {
    for (let n = 0; n < t_continuous.length; n++) {
      const angle = (2 * Math.PI * k * t_continuous[n]) / N;
      const exp = new Complex(Math.cos(angle), Math.sin(angle));
      y_reconstructed[n] = y_reconstructed[n].add(Y[k].multiply(exp));
    }
  }
  return y_reconstructed.map((val) => val.re / N);
}

// complex number class
class Complex {
  constructor(re, im) {
    // each number has a real and imaginary part
    this.re = re;
    this.im = im;
  }

  add(other) {
    return new Complex(this.re + other.re, this.im + other.im);
  }

  multiply(other) {
    // (a+bi)*(c+di)=ac+(ad+bc)i+bd
    // = (ac-bd) * (ad+bc)i
    return new Complex(
      this.re * other.re - this.im * other.im,
      this.re * other.im + this.im * other.re
    );
  }

  abs() {
    return Math.sqrt(this.re ** 2 + this.im ** 2);
  }

  angle() {
    // using principle argument form (-pi < theta <= pi), hence we can use arctan
    return Math.atan2(this.im, this.re);
  }
}

// Function to plot the DFT and reconstructed signal
function plotDFT() {
  const input = document.querySelector("#valuesInput").value;
  const vals = input.split(" ").map(Number);

  const t = Array.from({ length: vals.length }, (_, i) => i);
  const y = vals.map((val) => new Complex(val, 0));
  const N = y.length;

  const Y = manualDFT(y);
  const frequencies = Array.from({ length: N }, (_, i) => i / N);

  // define the range for reconstruction
  // essentially means there will be 1000 points in the sample
  const t_continuous = Array.from(
    { length: 1000 },
    (_, i) => (i * (N - 1)) / 999
  );

  // reconstruct the signal using the manual inverse DFT
  const y_reconstructed = manualIDFT(Y, t_continuous, N);

  // PLOTTING

  // original data points
  const trace1 = {
    x: t,
    y: vals,
    mode: "markers",
    name: "Original Data Points",
  };

  // reconstructed signal
  const trace2 = {
    x: t_continuous,
    y: y_reconstructed,
    mode: "lines",
    name: "Reconstructed Signal",
  };

  // individual sine waves
  const sineWaves = frequencies.map((f, k) => {
    const amplitude = Y[k].abs() / N;
    const phase = Y[k].angle();
    const sine_wave = t_continuous.map(
      (t) => amplitude * Math.cos(2 * Math.PI * f * t + phase)
    );
    return {
      x: t_continuous,
      y: sine_wave,
      mode: "lines",
      line: { dash: "dash" },
      name: `Sine wave k=${k}`,
    };
  });

  // config settings
  const layout = {
    title: "Original Data and Reconstructed Signal",
    xaxis: { title: "t" },
    yaxis: { title: "Value" },
  };

  Plotly.newPlot("plot", [trace1, trace2, ...sineWaves], layout);
}
