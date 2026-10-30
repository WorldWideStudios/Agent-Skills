// Generates one mp3 per debate line with the model and voices in script.json
// (ElevenLabs v3 through OpenRouter). A line's optional `tag` is a delivery cue
// sent ahead of the text; it is not spoken or shown. `say` overrides the spoken text
// when it must differ from what is shown (numbers).
//   OPENROUTER_API_KEY=... node tools/voice.mjs [lineId ...]
import { readFile, writeFile, mkdir } from 'node:fs/promises';

const script = JSON.parse(await readFile(new URL('../script.json', import.meta.url)));
const outDir = new URL('../assets/voice/', import.meta.url);
await mkdir(outDir, { recursive: true });
const only = process.argv.slice(2);

const key = process.env.OPENROUTER_API_KEY;
if (!key) throw new Error('OPENROUTER_API_KEY is not set');

await Promise.all(script.lines.filter((l) => !only.length || only.includes(l.id)).map(async (line) => {
  const r = await fetch('https://openrouter.ai/api/v1/audio/speech', {
    method: 'POST',
    headers: { authorization: `Bearer ${key}`, 'content-type': 'application/json', 'X-Title': 'Philosophy debate' },
    body: JSON.stringify({ model: script.model, input: [line.tag, line.say || line.text].filter(Boolean).join(' '), voice: script.voices[line.who], response_format: 'mp3' }),
  });
  if (!r.ok) throw new Error(`${line.id}: TTS ${r.status} ${(await r.text()).slice(0, 300)}`);
  await writeFile(new URL(`${line.id}.mp3`, outDir), Buffer.from(await r.arrayBuffer()));
  console.log('wrote', line.id);
}));
