import wave
import math
import struct
import random
import os

os.makedirs('public/sounds', exist_ok=True)

SAMPLE_RATE = 24000

def write_wav(filename, samples):
    with wave.open(filename, 'w') as wav_file:
        wav_file.setnchannels(1)        # mono
        wav_file.setsampwidth(2)       # 16-bit
        wav_file.setframerate(SAMPLE_RATE)
        # normalize
        max_amp = max(abs(s) for s in samples) if samples else 1.0
        if max_amp == 0:
            max_amp = 1.0
        scale = 28000.0 / max_amp

        raw_bytes = bytearray()
        for s in samples:
            val = int(s * scale)
            val = max(-32768, min(32767, val))
            raw_bytes.extend(struct.pack('<h', val))
        wav_file.writeframes(raw_bytes)
    print(f"Generated {filename} ({len(samples)} samples)")

# 1. Click sound (clean crisp wooden tap)
def gen_click():
    duration = 0.06
    n = int(SAMPLE_RATE * duration)
    samples = []
    for i in range(n):
        t = i / SAMPLE_RATE
        env = math.exp(-t * 80.0)
        freq = 950.0 - 550.0 * (i / n)
        sine = math.sin(2 * math.pi * freq * t)
        noise = (random.random() * 2 - 1) * 0.15
        samples.append((sine + noise) * env)
    return samples

# 2. Door Open sound (heavy traditional wooden door with creak and resonance)
def gen_door_open():
    duration = 0.85
    n = int(SAMPLE_RATE * duration)
    samples = []
    for i in range(n):
        t = i / SAMPLE_RATE
        env = math.sin(math.pi * min(1.0, t / 0.15)) * math.exp(-t * 2.8)
        # Creak frequency modulates
        creak_freq = 110.0 + 90.0 * math.sin(2 * math.pi * 3.5 * t) + 40.0 * t
        saw = 2.0 * (creak_freq * t - math.floor(creak_freq * t + 0.5))
        # Add friction noise
        friction = (random.random() * 2 - 1) * 0.3 * math.exp(-t * 3.0)
        # Deep wood body resonance
        thud = math.sin(2 * math.pi * 75.0 * t) * math.exp(-t * 5.0) * 0.7
        samples.append((saw * 0.6 + friction + thud) * env)
    return samples

# 3. Footstep sound (footstep in gravel and desert sand)
def gen_footstep():
    duration = 0.10
    n = int(SAMPLE_RATE * duration)
    samples = []
    prev = 0.0
    for i in range(n):
        t = i / SAMPLE_RATE
        env = math.exp(-t * 45.0)
        # Filtered sand noise
        white = random.random() * 2 - 1
        sand = 0.7 * prev + 0.3 * white
        prev = sand
        crunch = sand * math.sin(2 * math.pi * 650.0 * t)
        low_tap = math.sin(2 * math.pi * 120.0 * t) * 0.4
        samples.append((crunch * 0.8 + low_tap) * env)
    return samples

# 4. Success / Stamp sound (sparkling pentatonic Arabian chime: D, F#, A, B, D5)
def gen_success():
    duration = 1.1
    n = int(SAMPLE_RATE * duration)
    samples = [0.0] * n
    notes = [
        (0.00, 293.66), # D4
        (0.08, 369.99), # F#4
        (0.16, 440.00), # A4
        (0.24, 493.88), # B4
        (0.32, 587.33), # D5
        (0.40, 739.99), # F#5
    ]
    for start_t, freq in notes:
        start_idx = int(start_t * SAMPLE_RATE)
        note_len = n - start_idx
        for i in range(note_len):
            t = i / SAMPLE_RATE
            env = math.exp(-t * 3.8)
            # Bell timbre with harmonics
            harmonic1 = math.sin(2 * math.pi * freq * t)
            harmonic2 = math.sin(2 * math.pi * freq * 2.0 * t) * 0.35
            harmonic3 = math.sin(2 * math.pi * freq * 3.0 * t) * 0.15
            shimmer = math.sin(2 * math.pi * (freq * 1.01) * t) * 0.2
            val = (harmonic1 + harmonic2 + harmonic3 + shimmer) * env
            samples[start_idx + i] += val
    return samples

# 5. Proximity Chime sound (approaching historical building)
def gen_chime():
    duration = 0.55
    n = int(SAMPLE_RATE * duration)
    samples = []
    for i in range(n):
        t = i / SAMPLE_RATE
        env = math.sin(math.pi * min(1.0, t / 0.05)) * math.exp(-t * 5.0)
        freq = 523.25 + (659.25 - 523.25) * (1 - math.exp(-t * 12.0)) # C5 -> E5
        tone1 = math.sin(2 * math.pi * freq * t)
        tone2 = math.sin(2 * math.pi * (freq * 1.5) * t) * 0.4
        samples.append((tone1 + tone2) * env)
    return samples

# 6. Sea waves ambient loop (calm Arabian Gulf shoreline)
def gen_sea_waves():
    duration = 6.0
    n = int(SAMPLE_RATE * duration)
    samples = [0.0] * n
    # pink-brown noise smoothed
    pink = 0.0
    for i in range(n):
        t = i / SAMPLE_RATE
        # Gentle swell envelope (wave in and out every 3 seconds)
        swell = 0.4 + 0.6 * math.sin(2 * math.pi * (1.0 / 3.0) * t - math.pi / 2)**2
        white = random.random() * 2 - 1
        pink = (pink + 0.03 * white) / 1.03
        foam = (random.random() * 2 - 1) * 0.08 * math.sin(2 * math.pi * 0.5 * t)**2
        samples[i] = (pink + foam) * swell
    # Smooth loop boundary (fade at start and end)
    fade_len = int(SAMPLE_RATE * 0.3)
    for i in range(fade_len):
        f = i / fade_len
        samples[i] *= f
        samples[n - 1 - i] *= f
    return samples

# 7. Majlis Oud plucked string chime
def gen_majlis_oud():
    duration = 1.3
    n = int(SAMPLE_RATE * duration)
    samples = []
    base_freq = 220.0 # A3
    for i in range(n):
        t = i / SAMPLE_RATE
        env = math.exp(-t * 3.2)
        # Oud string characteristic (fundamental + odd/even harmonics + body resonance)
        h1 = math.sin(2 * math.pi * base_freq * t)
        h2 = math.sin(2 * math.pi * base_freq * 2.0 * t) * 0.55
        h3 = math.sin(2 * math.pi * base_freq * 3.0 * t) * 0.35
        h4 = math.sin(2 * math.pi * base_freq * 4.0 * t) * 0.2
        body = math.sin(2 * math.pi * 110.0 * t) * 0.3 * math.exp(-t * 6.0)
        samples.append((h1 + h2 + h3 + h4 + body) * env)
    return samples

write_wav('public/sounds/click.wav', gen_click())
write_wav('public/sounds/door_open.wav', gen_door_open())
write_wav('public/sounds/footstep.wav', gen_footstep())
write_wav('public/sounds/success.wav', gen_success())
write_wav('public/sounds/chime.wav', gen_chime())
write_wav('public/sounds/sea_waves.wav', gen_sea_waves())
write_wav('public/sounds/majlis_oud.wav', gen_majlis_oud())
print("All heritage sound effects successfully generated!")
