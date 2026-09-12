import fs from 'fs';
import path from 'path';

// Output directory
const outDir = path.resolve('public/sounds');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const sampleRate = 44100;
const durationSeconds = 24; // 24-second seamless loop
const totalSamples = sampleRate * durationSeconds;

// Allocate 16-bit PCM buffer (Stereo)
const channels = 2;
const buffer = new Float32Array(totalSamples * channels);

// Seeded RNG
let seed = 12345;
function random() {
  seed = (seed * 1664525 + 1013904223) % 4294967296;
  return seed / 4294967296;
}
function noise() {
  return random() * 2 - 1;
}

const leftChannel = new Float32Array(totalSamples);
const rightChannel = new Float32Array(totalSamples);

// -------------------------------------------------------------
// 1. WARM DESERT BREEZE & MELLOW DRONE (Ground tone in D / A)
// -------------------------------------------------------------
const droneBaseFreq = 146.83; // D3
for (let i = 0; i < totalSamples; i++) {
  const t = i / sampleRate;
  // Slow gentle breathing swell
  const swell = 0.5 + 0.35 * Math.sin((t / durationSeconds) * Math.PI * 4);
  
  // Drone harmonics (warm, subdued)
  const d1 = Math.sin(2 * Math.PI * droneBaseFreq * t) * 0.08;
  const d2 = Math.sin(2 * Math.PI * (droneBaseFreq * 1.5) * t) * 0.04; // Fifth (A)
  const d3 = Math.sin(2 * Math.PI * (droneBaseFreq * 2.0) * t) * 0.03; // Octave (D4)
  const dSub = Math.sin(2 * Math.PI * (droneBaseFreq * 0.5) * t) * 0.06; // Sub D2

  const droneVal = (d1 + d2 + d3 + dSub) * swell;
  leftChannel[i] += droneVal * 0.9;
  rightChannel[i] += droneVal * 0.95;
}

// -------------------------------------------------------------
// 2. TRADITIONAL OUD NOTES (مقام بياتي/كرد على الري D)
// Frequencies: D3=146.83, A3=220, D4=293.66, E4=329.63 (or half-flat ~320),
// F4=349.23, G4=392.00, A4=440.00, Bb4=466.16, C5=523.25, D5=587.33
// -------------------------------------------------------------
function addOudPluck(timeSec, freq, velocity = 0.5, pan = 0.0) {
  const startIdx = Math.floor(timeSec * sampleRate);
  const noteDuration = 3.2; // Long resonant decay
  const noteSamples = Math.floor(noteDuration * sampleRate);

  for (let s = 0; s < noteSamples; s++) {
    const idx = (startIdx + s) % totalSamples;
    const t = s / sampleRate;
    
    // Pluck attack & exponential decay
    const attack = Math.min(1.0, s / (sampleRate * 0.004));
    const decay = Math.exp(-t * 2.6);
    const env = attack * decay * velocity;

    // Oud string physical model: fundamental + rich harmonics + wood resonance
    const h1 = Math.sin(2 * Math.PI * freq * t);
    const h2 = Math.sin(2 * Math.PI * freq * 2.0 * t) * 0.55;
    const h3 = Math.sin(2 * Math.PI * freq * 3.0 * t) * 0.32;
    const h4 = Math.sin(2 * Math.PI * freq * 4.0 * t) * 0.18;
    const h5 = Math.sin(2 * Math.PI * freq * 5.0 * t) * 0.09;
    // Wood body cavity resonance (around 120Hz & 210Hz)
    const body = Math.sin(2 * Math.PI * 135 * t) * 0.25 * Math.exp(-t * 5.0);

    const stringSample = (h1 + h2 + h3 + h4 + h5 + body) * env * 0.38;

    leftChannel[idx] += stringSample * (1 - pan) * 0.5;
    rightChannel[idx] += stringSample * (1 + pan) * 0.5;
  }
}

// Gentle Arabian Oud phrases across the 24s loop
const oudNotes = [
  // Phrase 1 (0s - 6s): Opening contemplative motif (D -> A -> G -> F -> E -> D)
  { time: 0.6,  freq: 293.66, vel: 0.75, pan: -0.2 }, // D4
  { time: 1.8,  freq: 440.00, vel: 0.85, pan: 0.15 }, // A4
  { time: 3.0,  freq: 392.00, vel: 0.70, pan: -0.1 }, // G4
  { time: 3.8,  freq: 349.23, vel: 0.65, pan: -0.25 },// F4
  { time: 4.6,  freq: 329.63, vel: 0.60, pan: 0.2 },  // E4
  { time: 5.4,  freq: 293.66, vel: 0.70, pan: 0.0 },  // D4

  // Phrase 2 (6.5s - 12s): Rising ornament into high octave
  { time: 6.8,  freq: 220.00, vel: 0.75, pan: 0.3 },  // A3
  { time: 7.8,  freq: 293.66, vel: 0.70, pan: -0.15 },// D4
  { time: 8.7,  freq: 349.23, vel: 0.68, pan: -0.2 }, // F4
  { time: 9.6,  freq: 440.00, vel: 0.80, pan: 0.25 }, // A4
  { time: 10.6, freq: 523.25, vel: 0.85, pan: -0.1 }, // C5
  { time: 11.5, freq: 587.33, vel: 0.90, pan: 0.1 },  // D5

  // Phrase 3 (12.5s - 18s): Descending emotional cadence
  { time: 13.0, freq: 466.16, vel: 0.75, pan: -0.25 },// Bb4
  { time: 14.1, freq: 440.00, vel: 0.80, pan: 0.2 },  // A4
  { time: 15.2, freq: 392.00, vel: 0.70, pan: -0.1 }, // G4
  { time: 16.2, freq: 349.23, vel: 0.65, pan: 0.15 }, // F4
  { time: 17.1, freq: 329.63, vel: 0.60, pan: -0.2 }, // E4

  // Phrase 4 (18s - 23.5s): Resolving back to the quiet D tonic
  { time: 18.5, freq: 293.66, vel: 0.75, pan: 0.0 },  // D4
  { time: 19.8, freq: 220.00, vel: 0.68, pan: 0.25 }, // A3
  { time: 21.0, freq: 146.83, vel: 0.82, pan: -0.1 }, // D3 low resonance
  { time: 22.4, freq: 293.66, vel: 0.55, pan: 0.1 },  // D4 gentle final tap
];

oudNotes.forEach(n => addOudPluck(n.time, n.freq, n.vel, n.pan));

// -------------------------------------------------------------
// 3. NAY FLUTE (ناي تراثي هادئ وشجي)
// Soft breathy tone with warm vibrato
// -------------------------------------------------------------
function addNayPhrase(startSec, endSec, freq, pan = 0.0, volume = 0.35) {
  const startIdx = Math.floor(startSec * sampleRate);
  const totalNaySamples = Math.floor((endSec - startSec) * sampleRate);

  for (let s = 0; s < totalNaySamples; s++) {
    const idx = (startIdx + s) % totalSamples;
    const t = s / sampleRate;
    const totalT = (endSec - startSec);

    // Smooth envelope with swell and gentle fade
    const env = Math.sin((t / totalT) * Math.PI) * volume;
    
    // Natural Nay vibrato (5.2 Hz)
    const vibrato = 1.0 + 0.018 * Math.sin(2 * Math.PI * 5.2 * t);
    const currFreq = freq * vibrato;

    // Nay flute timbre (sine fundamental + breath air noise + subtle overtones)
    const tone = Math.sin(2 * Math.PI * currFreq * t);
    const overtone2 = Math.sin(2 * Math.PI * currFreq * 2.0 * t) * 0.22;
    const overtone3 = Math.sin(2 * Math.PI * currFreq * 3.0 * t) * 0.08;
    const breath = noise() * 0.12 * Math.sin(2 * Math.PI * currFreq * 0.5 * t);

    const val = (tone + overtone2 + overtone3 + breath) * env * 0.32;
    leftChannel[idx] += val * (1 - pan) * 0.5;
    rightChannel[idx] += val * (1 + pan) * 0.5;
  }
}

// Subtle soaring nay motifs
addNayPhrase(2.5, 6.0, 440.00, 0.25, 0.38);  // A4
addNayPhrase(8.5, 12.0, 587.33, -0.2, 0.42);  // D5
addNayPhrase(14.0, 18.0, 392.00, 0.2, 0.36);  // G4
addNayPhrase(19.0, 23.0, 293.66, -0.15, 0.32); // D4

// -------------------------------------------------------------
// 4. GENTLE DUFF / PERCUSSION (نبض الدف والمرواس التراثي الهادئ)
// Very soft warm rhythmic pulse (at 80 BPM, a beat every 0.75s)
// -------------------------------------------------------------
function addSoftDuff(timeSec, isDum = true) {
  const startIdx = Math.floor(timeSec * sampleRate);
  const duration = isDum ? 0.45 : 0.25;
  const count = Math.floor(duration * sampleRate);

  for (let s = 0; s < count; s++) {
    const idx = (startIdx + s) % totalSamples;
    const t = s / sampleRate;

    if (isDum) {
      // Warm low membrane resonance (Dum ~65Hz pitching down to 45Hz)
      const pitch = 68.0 - 25.0 * (s / count);
      const env = Math.exp(-t * 9.0);
      const thud = Math.sin(2 * Math.PI * pitch * t) * env * 0.16;
      leftChannel[idx] += thud * 0.5;
      rightChannel[idx] += thud * 0.5;
    } else {
      // Soft high tap (Tak)
      const env = Math.exp(-t * 18.0);
      const tap = (noise() * 0.5 + Math.sin(2 * Math.PI * 340 * t) * 0.5) * env * 0.08;
      leftChannel[idx] += tap * 0.4;
      rightChannel[idx] += tap * 0.6;
    }
  }
}

// Gentle Gulf rhythm (Dum ... Tak ... Tak)
const beatInterval = 0.75;
for (let t = 0; t < durationSeconds - 0.2; t += beatInterval) {
  const beatIndex = Math.round(t / beatInterval) % 4;
  if (beatIndex === 0) {
    addSoftDuff(t, true); // Dum
  } else if (beatIndex === 2) {
    addSoftDuff(t, false); // Tak
  }
}

// -------------------------------------------------------------
// 5. PERFECT LOOP CROSS-FADE (1.5s seamless circular crossfade)
// -------------------------------------------------------------
const crossfadeSamples = Math.floor(sampleRate * 1.5);
for (let i = 0; i < crossfadeSamples; i++) {
  const weight = i / crossfadeSamples;
  const endIdx = totalSamples - crossfadeSamples + i;
  const startIdx = i;

  const mixedL = (1 - weight) * leftChannel[endIdx] + weight * leftChannel[startIdx];
  const mixedR = (1 - weight) * rightChannel[endIdx] + weight * rightChannel[startIdx];

  leftChannel[startIdx] = mixedL;
  rightChannel[startIdx] = mixedR;
  leftChannel[endIdx] = mixedL;
  rightChannel[endIdx] = mixedR;
}

// -------------------------------------------------------------
// 6. ASSEMBLE STEREO PCM 16-BIT BUFFER
// -------------------------------------------------------------
// Find peak normalization
let maxAmp = 0;
for (let i = 0; i < totalSamples; i++) {
  maxAmp = Math.max(maxAmp, Math.abs(leftChannel[i]), Math.abs(rightChannel[i]));
}
const targetAmp = 0.72; // Gentle mastering level
const scale = maxAmp > 0 ? targetAmp / maxAmp : 1.0;

for (let i = 0; i < totalSamples; i++) {
  buffer[i * 2] = Math.max(-0.98, Math.min(0.98, leftChannel[i] * scale));
  buffer[i * 2 + 1] = Math.max(-0.98, Math.min(0.98, rightChannel[i] * scale));
}

// -------------------------------------------------------------
// 7. WRITE RIFF/WAVE FILE
// -------------------------------------------------------------
const bytesPerSample = 2;
const blockAlign = channels * bytesPerSample;
const byteRate = sampleRate * blockAlign;
const dataSize = totalSamples * blockAlign;
const headerSize = 44;
const wavBuffer = Buffer.alloc(headerSize + dataSize);

// RIFF Header
wavBuffer.write('RIFF', 0);
wavBuffer.writeUInt32LE(headerSize - 8 + dataSize, 4);
wavBuffer.write('WAVE', 8);

// fmt subchunk
wavBuffer.write('fmt ', 12);
wavBuffer.writeUInt32LE(16, 16);
wavBuffer.writeUInt16LE(1, 20); // PCM
wavBuffer.writeUInt16LE(channels, 22);
wavBuffer.writeUInt32LE(sampleRate, 24);
wavBuffer.writeUInt32LE(byteRate, 28);
wavBuffer.writeUInt16LE(blockAlign, 32);
wavBuffer.writeUInt16LE(16, 34);

// data subchunk
wavBuffer.write('data', 36);
wavBuffer.writeUInt32LE(dataSize, 40);

let offset = 44;
for (let i = 0; i < buffer.length; i++) {
  const s = Math.max(-1, Math.min(1, buffer[i]));
  const val = s < 0 ? s * 0x8000 : s * 0x7FFF;
  wavBuffer.writeInt16LE(Math.floor(val), offset);
  offset += 2;
}

const outPath = path.join(outDir, 'village_ambient_music.wav');
fs.writeFileSync(outPath, wavBuffer);
console.log(`Successfully generated Traditional Village Ambient Music at: ${outPath} (${wavBuffer.length} bytes, duration: ${durationSeconds}s)`);
