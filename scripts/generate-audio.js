import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Generate a gentle, romantic music box / piano lullaby WAV file
// 44.1kHz, 16-bit, stereo, ~28 seconds seamless romantic loop
const sampleRate = 44100;
const bpm = 76;
const beatDuration = 60 / bpm; // ~0.789s
const totalBeats = 32; // ~25.26 seconds
const totalSeconds = totalBeats * beatDuration;
const numSamples = Math.floor(sampleRate * totalSeconds);

// Romantic chord progression: Cmaj7 - G/B - Am7 - Fmaj7 - C/E - Dm7 - Gsus4 - G
// Notes frequencies in Hz:
const notes = {
  C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61, G3: 196.00, A3: 220.00, B3: 246.94,
  C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.00, A4: 440.00, B4: 493.88,
  C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880.00, B5: 987.77,
  C6: 1046.50
};

// Patterns: Bass notes, arpeggio notes, and high melody bells
const chords = [
  // bar 1: Cmaj7 (4 beats)
  { bass: notes.C3, arpeggio: [notes.C4, notes.E4, notes.G4, notes.B4], melody: [notes.E5, notes.G5, notes.C6, notes.B5] },
  // bar 2: G (4 beats)
  { bass: notes.B3 / 2, arpeggio: [notes.G3, notes.B3, notes.D4, notes.G4], melody: [notes.D5, notes.G5, notes.B5, notes.A5] },
  // bar 3: Am7 (4 beats)
  { bass: notes.A3 / 2, arpeggio: [notes.A3, notes.C4, notes.E4, notes.G4], melody: [notes.C5, notes.E5, notes.A5, notes.G5] },
  // bar 4: Fmaj7 (4 beats)
  { bass: notes.F3 / 2, arpeggio: [notes.F3, notes.A3, notes.C4, notes.E4], melody: [notes.A4, notes.C5, notes.F5, notes.E5] },
  // bar 5: Em7 (4 beats)
  { bass: notes.E3 / 2, arpeggio: [notes.E3, notes.G3, notes.B3, notes.D4], melody: [notes.G4, notes.B4, notes.E5, notes.D5] },
  // bar 6: Dm7 (4 beats)
  { bass: notes.D3, arpeggio: [notes.D3, notes.F3, notes.A3, notes.C4], melody: [notes.F4, notes.A4, notes.D5, notes.C5] },
  // bar 7: F/G (4 beats)
  { bass: notes.G3 / 2, arpeggio: [notes.F3, notes.A3, notes.C4, notes.D4], melody: [notes.D5, notes.F5, notes.A5, notes.G5] },
  // bar 8: C (4 beats)
  { bass: notes.C3, arpeggio: [notes.C3, notes.G3, notes.C4, notes.E4], melody: [notes.E5, notes.D5, notes.C5, notes.C5] },
];

const leftBuffer = new Float32Array(numSamples);
const rightBuffer = new Float32Array(numSamples);

function addTone(buffer, startSec, duration, freq, amp, pan = 0, isBell = false) {
  const startSample = Math.floor(startSec * sampleRate);
  const endSample = Math.min(numSamples, startSample + Math.floor(duration * sampleRate));
  const toneSamples = endSample - startSample;

  for (let i = 0; i < toneSamples; i++) {
    const t = i / sampleRate;
    // Envelope: quick attack, smooth exponential decay
    let env = 0;
    if (t < 0.015) {
      env = t / 0.015;
    } else {
      env = Math.exp(-t * (isBell ? 2.5 : 1.2));
    }

    // Bell / Rhodes harmonic mix
    let sample = Math.sin(2 * Math.PI * freq * t);
    if (isBell) {
      sample += 0.4 * Math.sin(2 * Math.PI * freq * 2 * t);
      sample += 0.15 * Math.sin(2 * Math.PI * freq * 3.01 * t);
      sample += 0.08 * Math.sin(2 * Math.PI * freq * 4.02 * t);
    } else {
      sample += 0.25 * Math.sin(2 * Math.PI * freq * 2 * t);
      sample += 0.08 * Math.sin(2 * Math.PI * freq * 3 * t);
    }

    const val = sample * env * amp;
    const idx = startSample + i;
    if (idx < numSamples) {
      buffer[idx] += val;
    }
  }
}

// Populate audio
for (let b = 0; b < chords.length; b++) {
  const chord = chords[b];
  const barStart = b * 4 * beatDuration;

  // Bass note at start of bar
  addTone(leftBuffer, barStart, 3.5 * beatDuration, chord.bass, 0.22, -0.2, false);
  addTone(rightBuffer, barStart, 3.5 * beatDuration, chord.bass, 0.22, 0.2, false);

  // Arpeggios (eighth notes, 8 notes per bar)
  for (let noteIdx = 0; noteIdx < 8; noteIdx++) {
    const noteTime = barStart + noteIdx * (beatDuration / 2);
    const arpFreq = chord.arpeggio[noteIdx % chord.arpeggio.length];
    const panSide = (noteIdx % 2 === 0) ? -0.3 : 0.3;
    addTone(leftBuffer, noteTime, 1.8 * beatDuration, arpFreq, 0.14, panSide, false);
    addTone(rightBuffer, noteTime, 1.8 * beatDuration, arpFreq, 0.14, -panSide, false);
  }

  // Melody bells (quarter notes on beats 0, 1, 2, 3)
  for (let m = 0; m < 4; m++) {
    const melodyTime = barStart + m * beatDuration;
    const melFreq = chord.melody[m];
    addTone(leftBuffer, melodyTime, 2.5 * beatDuration, melFreq, 0.20, 0.1, true);
    addTone(rightBuffer, melodyTime, 2.5 * beatDuration, melFreq, 0.20, -0.1, true);
  }
}

// Convert float samples to 16-bit PCM WAV
const bytesPerSample = 2;
const channels = 2;
const dataSize = numSamples * channels * bytesPerSample;
const headerSize = 44;
const buffer = Buffer.alloc(headerSize + dataSize);

// RIFF chunk descriptor
buffer.write('RIFF', 0);
buffer.writeUInt32LE(36 + dataSize, 4);
buffer.write('WAVE', 8);

// "fmt " sub-chunk
buffer.write('fmt ', 12);
buffer.writeUInt32LE(16, 16); // subchunk1 size
buffer.writeUInt16LE(1, 20);  // PCM format
buffer.writeUInt16LE(channels, 22);
buffer.writeUInt32LE(sampleRate, 24);
buffer.writeUInt32LE(sampleRate * channels * bytesPerSample, 28); // byte rate
buffer.writeUInt16LE(channels * bytesPerSample, 32); // block align
buffer.writeUInt16LE(16, 34); // bits per sample

// "data" sub-chunk
buffer.write('data', 36);
buffer.writeUInt32LE(dataSize, 40);

// Write interleaved samples
let offset = 44;
for (let i = 0; i < numSamples; i++) {
  // Soft fade in & fade out to make looping seamless
  let fade = 1.0;
  if (i < sampleRate * 0.5) {
    fade = i / (sampleRate * 0.5);
  } else if (i > numSamples - sampleRate * 0.5) {
    fade = (numSamples - i) / (sampleRate * 0.5);
  }

  // Left
  let sL = Math.max(-1, Math.min(1, leftBuffer[i] * fade));
  let intL = sL < 0 ? sL * 32768 : sL * 32767;
  buffer.writeInt16LE(Math.floor(intL), offset);
  offset += 2;

  // Right
  let sR = Math.max(-1, Math.min(1, rightBuffer[i] * fade));
  let intR = sR < 0 ? sR * 32768 : sR * 32767;
  buffer.writeInt16LE(Math.floor(intR), offset);
  offset += 2;
}

const outDir = path.resolve(__dirname, '../public/audio');
fs.mkdirSync(outDir, { recursive: true });
const targetFile = path.join(outDir, 'romantic-song.mp3');
fs.writeFileSync(targetFile, buffer);

console.log(`Successfully generated romantic song at ${targetFile} (${(buffer.length / 1024 / 1024).toFixed(2)} MB)`);
