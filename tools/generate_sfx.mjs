import { writeFileSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'

const outDir = join(process.cwd(), 'public', 'assets', 'sfx')
mkdirSync(outDir, { recursive: true })

const sampleRate = 44100

function writeWavPCM16(filename, samples) {
  const numSamples = samples.length
  const byteRate = sampleRate * 2
  const blockAlign = 2
  const dataSize = numSamples * 2
  const buffer = Buffer.alloc(44 + dataSize)
  buffer.write('RIFF', 0)
  buffer.writeUInt32LE(36 + dataSize, 4)
  buffer.write('WAVE', 8)
  buffer.write('fmt ', 12)
  buffer.writeUInt32LE(16, 16)
  buffer.writeUInt16LE(1, 20)
  buffer.writeUInt16LE(1, 22)
  buffer.writeUInt32LE(sampleRate, 24)
  buffer.writeUInt32LE(byteRate, 28)
  buffer.writeUInt16LE(blockAlign, 32)
  buffer.writeUInt16LE(16, 34)
  buffer.write('data', 36)
  buffer.writeUInt32LE(dataSize, 40)
  for (let i = 0; i < numSamples; i++) {
    let s = Math.max(-1, Math.min(1, samples[i]))
    buffer.writeInt16LE((s * 32767) | 0, 44 + i * 2)
  }
  writeFileSync(join(outDir, filename), buffer)
}

function envelope(len, attack = 0.01, release = 0.1) {
  const a = Math.floor(sampleRate * attack)
  const r = Math.floor(sampleRate * release)
  return (i) => {
    if (i < a) return i / a
    if (i > len - r) return Math.max(0, (len - i) / r)
    return 1
  }
}

function sine(freq, lenSec, vol = 0.5) {
  const len = Math.floor(sampleRate * lenSec)
  const env = envelope(len, 0.01, 0.1)
  const out = new Float32Array(len)
  for (let i = 0; i < len; i++) out[i] = Math.sin((2 * Math.PI * freq * i) / sampleRate) * env(i) * vol
  return out
}

function noise(lenSec, vol = 0.5) {
  const len = Math.floor(sampleRate * lenSec)
  const env = envelope(len, 0.005, 0.12)
  const out = new Float32Array(len)
  let x = 0
  for (let i = 0; i < len; i++) {
    // simple filtered noise
    x = 0.98 * x + (Math.random() * 2 - 1) * 0.2
    out[i] = x * env(i) * vol
  }
  return out
}

function mix(...buffers) {
  const len = Math.max(...buffers.map((b) => b.length))
  const out = new Float32Array(len)
  for (const b of buffers) {
    for (let i = 0; i < b.length; i++) out[i] += b[i]
  }
  // normalize if needed
  let peak = 0
  for (let i = 0; i < len; i++) peak = Math.max(peak, Math.abs(out[i]))
  const k = peak > 1 ? 1 / peak : 1
  for (let i = 0; i < len; i++) out[i] *= k
  return out
}

// SFX
// cast_whoosh: noise sweep
{
  const n = noise(0.2, 0.6)
  for (let i = 0; i < n.length; i++) n[i] *= 1 - i / n.length
  writeWavPCM16('cast_whoosh.wav', n)
}

// melee_hit: low thunk + short noise
{
  const thud = sine(120, 0.08, 0.6)
  const n = noise(0.05, 0.4)
  writeWavPCM16('melee_hit.wav', mix(thud, n))
}

// enemy_hit: higher pitch
{
  const thud = sine(220, 0.07, 0.5)
  const n = noise(0.04, 0.35)
  writeWavPCM16('enemy_hit.wav', mix(thud, n))
}

// chest_open: small arpeggio
{
  const a = sine(660, 0.06, 0.4)
  const b = sine(880, 0.06, 0.35)
  const c = sine(990, 0.1, 0.3)
  // stagger
  const len = Math.max(a.length + 0, b.length + 1000, c.length + 2000)
  const out = new Float32Array(len)
  out.set(a, 0)
  out.set(b, 1000)
  out.set(c, 2000)
  writeWavPCM16('chest_open.wav', out)
}

// pickup: blip
{
  const blip = sine(1200, 0.05, 0.5)
  writeWavPCM16('pickup.wav', blip)
}

// breakable_smash: burst noise
{
  const n = noise(0.12, 0.8)
  writeWavPCM16('breakable_smash.wav', n)
}

// ui_click
{
  const click = sine(1500, 0.02, 0.4)
  writeWavPCM16('ui_click.wav', click)
}

console.log('Generated SFX into', outDir)


