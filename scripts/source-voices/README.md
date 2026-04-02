# Voice Recording Drop-in

Place your own voice recording here as `my-voice.wav` (or update `custom.voiceFile` in `demo-config.json`).

**Requirements:**
- Format: WAV (16-bit PCM preferred) or MP3
- Duration: 10–30 seconds of clean speech (no background noise)
- Content: Can be any phrase — the script uses it as the voice seed

**Then run:**
```bash
node scripts/generate-demos.mjs --provider custom
```

This will use your recording as the "before" baseline voice, and generate the "after" clip from the Ghost prosody layer.
