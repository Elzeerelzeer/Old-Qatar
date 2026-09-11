import fs from 'fs';
import path from 'path';

// Output directory
const outDir = path.resolve('public/sounds');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const sampleRate = 44100;
const durationSeconds = 14;
const totalSamples = sampleRate * durationSeconds;

// Allocate 16-bit PCM buffer (Stereo)
const channels = 2;
const buffer = new Float32Array(totalSamples * channels);

// Helper RNG with seed
let seed = 42;
function random() {
  seed = (seed * 1664525 + 1013904223) % 4294967296;
  return seed / 4294967296;
}
function noise() {
  return random() * 2 - 1;
}

// 1. Generate Wind Layer (Pink/Brown noise with wind gust modulation)
let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
const windL = new Float32Array(totalSamples);
const windR = new Float32Array(totalSamples);

for (let i = 0; i < totalSamples; i++) {
  const white = noise();
  // Paul Kellet's filtered pink noise
  b0 = 0.99886 * b0 + white * 0.0555179;
  b1 = 0.99332 * b1 + white * 0.0750759;
  b2 = 0.96900 * b2 + white * 0.1538520;
  b3 = 0.86650 * b3 + white * 0.3104856;
  b4 = 0.55000 * b4 + white * 0.5329522;
  b5 = -0.7616 * b5 - white * 0.0168980;
  const pink = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
  b6 = white * 0.115926;

  // Gentle wind gust envelopes (LFOs)
  const t = i / sampleRate;
  const gust1 = Math.sin((t / durationSeconds) * Math.PI * 2) * 0.35;
  const gust2 = Math.sin((t / durationSeconds) * Math.PI * 4 + 0.8) * 0.25;
  const gust3 = Math.sin((t / durationSeconds) * Math.PI * 6 + 2.1) * 0.15;
  const windMod = Math.max(0.08, 0.45 + gust1 + gust2 + gust3);

  // Slight stereo spread
  windL[i] = pink * windMod * 0.42;
  windR[i] = pink * (windMod + 0.05 * Math.sin(t * 1.3)) * 0.40;
}

// Lowpass filter for warm alley breeze (around 320Hz - 600Hz)
let lpL = 0, lpR = 0;
const alpha = 0.065; // ~450Hz at 44.1kHz
for (let i = 0; i < totalSamples; i++) {
  lpL += alpha * (windL[i] - lpL);
  lpR += alpha * (windR[i] - lpR);
  windL[i] = lpL;
  windR[i] = lpR;
}

// 2. Crowd / Passersby Murmur Layer (Faint distant voices & market chatter)
// Formant frequencies for vocal murmurs (vowels: /a/, /u/, /i/ murmurs in distance)
const murmurL = new Float32Array(totalSamples);
const murmurR = new Float32Array(totalSamples);

// We simulate several distant speakers with varying cadence and pitch
const speakers = [
  { pitch: 110, rate: 3.2, formants: [400, 1100, 2400], pan: -0.4, amp: 0.14 },
  { pitch: 145, rate: 4.1, formants: [550, 1400, 2600], pan: 0.35, amp: 0.12 },
  { pitch: 180, rate: 2.8, formants: [350, 950, 2100], pan: 0.1, amp: 0.10 },
  { pitch: 95, rate: 3.8, formants: [480, 1250, 2300], pan: -0.2, amp: 0.13 },
];

speakers.forEach(sp => {
  let phase = 0;
  let formPhase1 = 0, formPhase2 = 0;
  for (let i = 0; i < totalSamples; i++) {
    const t = i / sampleRate;
    // Speech syllables envelope (phrases and pauses)
    const phraseEnv = Math.max(0, Math.sin(t * sp.rate * 2) * Math.sin(t * 0.9 + sp.pitch));
    const isSpeaking = phraseEnv > 0.12 ? phraseEnv : 0;

    phase += (sp.pitch + 8 * Math.sin(t * 5.5)) / sampleRate;
    if (phase > 1) phase -= 1;

    // Glottal pulse approximation
    const glottal = (phase < 0.2 ? Math.sin((phase / 0.2) * Math.PI) : 0) - 0.1;

    // Formant resonators
    formPhase1 += sp.formants[0] / sampleRate;
    formPhase2 += sp.formants[1] / sampleRate;
    const vSound = glottal * (Math.sin(formPhase1 * 2 * Math.PI) * 0.6 + Math.sin(formPhase2 * 2 * Math.PI) * 0.4);

    const val = vSound * isSpeaking * sp.amp;
    murmurL[i] += val * (1 - sp.pan) * 0.5;
    murmurR[i] += val * (1 + sp.pan) * 0.5;
  }
});

// Diffuse the murmurs with lowpass & subtle room reflection so they sound distant and outdoors in an alley
let dL = 0, dR = 0;
for (let i = 0; i < totalSamples; i++) {
  dL += 0.08 * (murmurL[i] - dL);
  dR += 0.08 * (murmurR[i] - dR);
  murmurL[i] = dL;
  murmurR[i] = dR;
}

// 3. Footsteps in Sand and Gravel (Gentle footsteps of passersby)
const footsteps = [
  { time: 1.1, pan: -0.3, vol: 0.12 },
  { time: 1.9, pan: -0.2, vol: 0.11 },
  { time: 2.7, pan: -0.1, vol: 0.13 },
  { time: 3.5, pan: 0.0, vol: 0.10 },
  { time: 5.2, pan: 0.4, vol: 0.14 },
  { time: 6.0, pan: 0.3, vol: 0.12 },
  { time: 6.8, pan: 0.2, vol: 0.11 },
  { time: 9.0, pan: -0.4, vol: 0.13 },
  { time: 9.8, pan: -0.3, vol: 0.12 },
  { time: 11.5, pan: 0.2, vol: 0.12 },
  { time: 12.3, pan: 0.1, vol: 0.11 },
];

footsteps.forEach(step => {
  const startIdx = Math.floor(step.time * sampleRate);
  const stepSamples = Math.floor(0.12 * sampleRate);
  for (let s = 0; s < stepSamples; s++) {
    const idx = (startIdx + s) % totalSamples;
    const progress = s / stepSamples;
    const env = Math.sin(progress * Math.PI) * Math.exp(-progress * 3.5);
    const sandCrunch = noise() * env * step.vol;
    windL[idx] += sandCrunch * (1 - step.pan) * 0.5;
    windR[idx] += sandCrunch * (1 + step.pan) * 0.5;
  }
});

// 4. Distant Finjan Coffee Cup / Brass Utensil Clinks (Very faint, atmospheric)
const clinks = [
  { time: 2.4, freq: 2150, decay: 0.45, pan: 0.5, vol: 0.045 },
  { time: 7.2, freq: 2600, decay: 0.40, pan: -0.4, vol: 0.040 },
  { time: 11.0, freq: 1950, decay: 0.50, pan: 0.3, vol: 0.035 },
];

clinks.forEach(clink => {
  const startIdx = Math.floor(clink.time * sampleRate);
  const clinkSamples = Math.floor(clink.decay * sampleRate);
  for (let s = 0; s < clinkSamples; s++) {
    const idx = (startIdx + s) % totalSamples;
    const t = s / sampleRate;
    const env = Math.exp(-t * 9.0);
    const tone = Math.sin(2 * Math.PI * clink.freq * t) * env * clink.vol;
    windL[idx] += tone * (1 - clink.pan) * 0.5;
    windR[idx] += tone * (1 + clink.pan) * 0.5;
  }
});

// 5. Combine and Loop Cross-Fade (Seamless looping across start and end)
const crossfadeSamples = Math.floor(sampleRate * 0.8); // 800ms crossfade
for (let i = 0; i < crossfadeSamples; i++) {
  const weight = i / crossfadeSamples;
  // Fade out end, fade in start
  const endIdx = totalSamples - crossfadeSamples + i;
  const startIdx = i;

  const mixedL = (1 - weight) * windL[endIdx] + weight * windL[startIdx];
  const mixedR = (1 - weight) * windR[endIdx] + weight * windR[startIdx];

  windL[startIdx] = mixedL;
  windR[startIdx] = mixedR;
  windL[endIdx] = mixedL;
  windR[endIdx] = mixedR;

  const mMixedL = (1 - weight) * murmurL[endIdx] + weight * murmurL[startIdx];
  const mMixedR = (1 - weight) * murmurR[endIdx] + weight * murmurR[startIdx];
  murmurL[startIdx] = mMixedL;
  murmurR[startIdx] = mMixedR;
  murmurL[endIdx] = mMixedL;
  murmurR[endIdx] = mMixedR;
}

// Assemble into interleaved stereo buffer with master limiter
for (let i = 0; i < totalSamples; i++) {
  const left = (windL[i] + murmurL[i] * 0.85) * 1.35;
  const right = (windR[i] + murmurR[i] * 0.85) * 1.35;

  // Soft clipping
  buffer[i * 2] = Math.max(-0.95, Math.min(0.95, left));
  buffer[i * 2 + 1] = Math.max(-0.95, Math.min(0.95, right));
}

// Write to Standard WAV file
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
wavBuffer.writeUInt32LE(16, 16); // Subchunk1Size (16 for PCM)
wavBuffer.writeUInt16LE(1, 20); // AudioFormat (1 for PCM)
wavBuffer.writeUInt16LE(channels, 22); // NumChannels
wavBuffer.writeUInt32LE(sampleRate, 24); // SampleRate
wavBuffer.writeUInt32LE(byteRate, 28); // ByteRate
wavBuffer.writeUInt16LE(blockAlign, 32); // BlockAlign
wavBuffer.writeUInt16LE(16, 34); // BitsPerSample

// data subchunk
wavBuffer.write('data', 36);
wavBuffer.writeUInt32LE(dataSize, 40);

// Fill PCM 16-bit
let offset = 44;
for (let i = 0; i < buffer.length; i++) {
  const s = Math.max(-1, Math.min(1, buffer[i]));
  const val = s < 0 ? s * 0x8000 : s * 0x7FFF;
  wavBuffer.writeInt16LE(Math.floor(val), offset);
  offset += 2;
}

const outPath = path.join(outDir, 'souq_ambience.wav');
fs.writeFileSync(outPath, wavBuffer);
console.log(`Generated Souq ambience WAV at: ${outPath} (${wavBuffer.length} bytes, duration: ${durationSeconds}s)`);
