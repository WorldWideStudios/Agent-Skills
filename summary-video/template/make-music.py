"""
Writes an original score for the summary film — synthesised from scratch, no
samples, nothing licensed — to public/audio/score.wav.

Minimal A-minor electronic bed at 118 BPM, arranged against the cut: a half-time
groove under the hosts, a riser and impact on the title, an arpeggio through the
montage, a breakdown on the deal, the lift on the numbers, and a final hit on
the end card.

The section markers are read from src/cut.json — the same beat table the video
renders from — so the arrangement follows any re-cut automatically. Tag beats
with "marker": title | montage | floor | lift | end. A missing marker simply
drops that section change.

    python3 make-music.py            # ~15s, deterministic (seeded noise)
"""
import json
import math
import os
import struct
import wave

HERE = os.path.dirname(os.path.abspath(__file__))
CUT = json.load(open(os.path.join(HERE, 'src', 'cut.json')))
FPS = CUT['fps']

_starts, _at = {}, 0
for _b in CUT['beats']:
    if _b.get('marker'):
        _starts[_b['marker']] = _at / FPS
    _at += _b['frames']

SR = 48000
DUR = _at / FPS
BPM = 118.0             # 118 suited "fast, get to the point"; 100 felt like a corporate sizzle
BEAT = 60.0 / BPM          # 0.6s
BAR = BEAT * 4             # 2.4s

N = int(SR * DUR)
left = [0.0] * N
right = [0.0] * N

# ---------------------------------------------------------------- helpers
def add(buf, start, samples, gain=1.0):
    i = int(start * SR)
    for k, v in enumerate(samples):
        j = i + k
        if 0 <= j < len(buf):
            buf[j] += v * gain


def stereo(start, samples, gain=1.0, pan=0.0):
    """pan: -1 hard left, +1 hard right."""
    lg = gain * math.sqrt((1.0 - pan) / 2.0)
    rg = gain * math.sqrt((1.0 + pan) / 2.0)
    add(left, start, samples, lg)
    add(right, start, samples, rg)


# deterministic noise so re-running gives an identical file
_seed = 20260918


def rnd():
    global _seed
    _seed = (1103515245 * _seed + 12345) & 0x7FFFFFFF
    return (_seed / 0x3FFFFFFF) - 1.0


def kick(dur=0.42):
    n = int(SR * dur)
    out = []
    phase = 0.0
    for i in range(n):
        t = i / SR
        f = 48.0 + 92.0 * math.exp(-t * 34.0)
        phase += 2 * math.pi * f / SR
        env = math.exp(-t * 7.0) * (1 - math.exp(-t * 900.0))
        out.append(math.sin(phase) * env)
    return out


def sub(note, dur):
    n = int(SR * dur)
    out = []
    for i in range(n):
        t = i / SR
        env = (1 - math.exp(-t * 180.0)) * math.exp(-t * 2.2)
        s = math.sin(2 * math.pi * note * t) * 0.85
        s += math.sin(2 * math.pi * note * 2 * t) * 0.12
        out.append(s * env)
    return out


def hat(dur=0.06, bright=1.0):
    n = int(SR * dur)
    out = []
    prev = 0.0
    for i in range(n):
        t = i / SR
        x = rnd()
        hp = x - prev          # crude one-pole high-pass
        prev = x
        out.append(hp * math.exp(-t * 90.0) * bright)
    return out


def pad(freqs, dur, attack=0.9, release=1.4):
    """Detuned additive pad, one buffer per channel for width."""
    n = int(SR * dur)
    chans = [[0.0] * n, [0.0] * n]
    for ch in (0, 1):
        detune = 1.0 + (0.0012 if ch == 0 else -0.0012)
        for f in freqs:
            for h, amp in ((1, 1.0), (2, 0.34), (3, 0.16), (4, 0.07)):
                w = 2 * math.pi * f * h * detune / SR
                for i in range(n):
                    chans[ch][i] += math.sin(w * i) * amp
    # envelope + gentle one-pole low-pass
    for ch in (0, 1):
        buf = chans[ch]
        lp = 0.0
        a = 0.06
        for i in range(n):
            t = i / SR
            env = min(1.0, t / attack) * min(1.0, (dur - t) / release if dur - t > 0 else 0)
            lp += a * (buf[i] - lp)
            buf[i] = lp * env
    return chans


def pluck(f, dur=0.5):
    n = int(SR * dur)
    out = []
    for i in range(n):
        t = i / SR
        env = math.exp(-t * 9.0) * (1 - math.exp(-t * 600.0))
        s = 0.0
        for h, amp in ((1, 1.0), (3, 0.11), (5, 0.04)):
            s += math.sin(2 * math.pi * f * h * t) * amp
        out.append(s * env)
    return out


def riser(dur):
    n = int(SR * dur)
    out = []
    lp = 0.0
    for i in range(n):
        t = i / SR
        p = t / dur
        a = 0.004 + 0.22 * (p ** 2)          # filter opens as it rises
        lp += a * (rnd() - lp)
        out.append(lp * (p ** 2.2))
    return out


def impact(dur=1.6):
    n = int(SR * dur)
    out = []
    phase = 0.0
    lp = 0.0
    for i in range(n):
        t = i / SR
        f = 40.0 + 60.0 * math.exp(-t * 12.0)
        phase += 2 * math.pi * f / SR
        lp += 0.05 * (rnd() - lp)
        out.append((math.sin(phase) * 0.9 + lp * 0.5) * math.exp(-t * 3.2))
    return out


# ---------------------------------------------------------------- arrangement
A2, F2, C3, G2 = 110.00, 87.31, 130.81, 98.00
PROG = [
    (A2, [220.00, 261.63, 329.63]),   # Am
    (F2, [174.61, 220.00, 261.63]),   # F
    (C3, [261.63, 329.63, 392.00]),   # C
    (G2, [196.00, 246.94, 293.66]),   # G
]
CHORD_LEN = BAR * 2                    # 4.8s per chord

# Cut points, in seconds, from src/cut.json
NEVER = DUR + 10
T_OPEN = 0.0                                   # pads and drums from the first frame
T_TITLE = _starts.get('title', 0.0) + 0.9      # impact as the title lands
T_MONTAGE = _starts.get('montage', NEVER)      # arpeggio in with the first participant
T_FLOOR = _starts.get('floor', NEVER)          # breakdown on the deal
T_CEILING = _starts.get('lift', NEVER)         # lift on the numbers
T_END = _starts.get('end', NEVER)              # final hit on the end card
T_CLOSE = T_END
print('markers:', {k: round(v, 3) for k, v in _starts.items()}, 'duration', round(DUR, 3))

# --- pads: run the progression end to end
t = 0.0
ci = 0
while t < DUR:
    root, notes = PROG[ci % len(PROG)]
    chans = pad(notes, CHORD_LEN + 0.6)
    lvl = 0.035 if t < T_MONTAGE else 0.052
    add(left, t, chans[0], lvl)
    add(right, t, chans[1], lvl)
    t += CHORD_LEN
    ci += 1

# --- drums and bass
beat_i = 0
# Grid origin is set so a downbeat lands exactly on the title impact.
t = T_TITLE - BAR * math.ceil((T_TITLE - T_OPEN) / BAR)
while t < DUR - 0.5:
    bar_pos = beat_i % 4
    chord = PROG[int((t // CHORD_LEN)) % len(PROG)]

    montage = T_MONTAGE <= t < T_FLOOR
    lifted = T_CEILING <= t < T_CLOSE or t >= T_END
    breath = T_FLOOR <= t < T_CEILING
    outro_tail = t > DUR - 2.0

    if not outro_tail:
        # half-time kick everywhere; add the "and" of 3 when the track lifts
        if bar_pos == 0:
            stereo(t, kick(), 0.60)
        elif bar_pos == 2 and (montage or lifted):
            stereo(t, kick(), 0.42)

        if bar_pos in (0, 2):
            stereo(t, sub(chord[0], BEAT * 2), 0.16 if breath else 0.21)

        if (montage or lifted) and not breath:
            stereo(t + BEAT * 0.5, hat(), 0.11, pan=-0.25)
            stereo(t + BEAT * 1.5, hat(bright=0.7), 0.085, pan=0.3)
            stereo(t + BEAT * 0.25, hat(dur=0.04, bright=0.45), 0.05, pan=0.15)

    t += BEAT
    beat_i += 1

# --- arpeggio: montage, the stat cards, and the end card
def arp_section(start, end, gain):
    t = start
    step = BEAT / 2
    k = 0
    while t < end:
        notes = PROG[int((t // CHORD_LEN)) % len(PROG)][1]
        seq = [notes[0], notes[1], notes[2], notes[1] * 2, notes[2], notes[1]]
        f = seq[k % len(seq)]
        stereo(t, pluck(f, 0.55), gain, pan=0.35 * math.sin(k * 1.1))
        t += step
        k += 1


arp_section(T_MONTAGE, T_FLOOR, 0.052)
arp_section(T_CEILING, T_CLOSE, 0.060)
arp_section(T_END, DUR - 1.2, 0.058)

# --- risers and impacts on the section changes
for at, length, hit in ((T_TITLE, 0.9, True), (T_MONTAGE, 1.2, False),
                        (T_FLOOR, 1.2, False), (T_CEILING, 1.5, True), (T_END, 1.2, True)):
    if at >= DUR:
        continue
    stereo(at - length, riser(length), 0.10)
    if hit:
        stereo(at, impact(), 0.50)

# ---------------------------------------------------------------- master
peak = max(max(abs(v) for v in left), max(abs(v) for v in right))
norm = 0.80 / peak if peak > 0 else 1.0
frames = bytearray()
for i in range(N):
    t = i / SR
    fade = 1.0
    if t < 0.2:
        fade = t / 0.2
    if t > DUR - 2.0:
        fade = max(0.0, (DUR - t) / 2.0)
    for buf in (left, right):
        v = math.tanh(buf[i] * norm * 1.25) * 0.92 * fade
        frames += struct.pack('<h', int(max(-1.0, min(1.0, v)) * 32767))

out = os.path.join(HERE, 'public', 'audio', 'score.wav')
os.makedirs(os.path.dirname(out), exist_ok=True)
with wave.open(out, 'wb') as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(bytes(frames))

print('wrote', out, round(DUR, 3), 'seconds')
