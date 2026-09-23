# Prompt

Paste this into Claude Code (or any agent with shell access) from the folder
holding the recording. Fill in the brackets.

---

> Make a 60–75 second public **summary video** of `[session.mp4]` using the
> `summary-video` skill. Transcript: `[transcript.srt]`. Brand: `[STYLE-GUIDE.md
> or website URL]`. Organisation: `[name]`, programme: `[name]`, domain:
> `[example.org]`. Logo: `[logo.png]`.
>
> Clearance: `[participants agreed on the call / in writing to public use of
> their faces and voices]`. If you find anything in the recording that
> contradicts this, stop and tell me before cutting.
>
> Names table (use exactly these spellings and role lines):
> `[Full Name — role line, one per person]`
>
> The film:
> - Opens on the title card; the name is stated once.
> - Premise: `[the host's thesis sentence, or "find it"]`.
> - Two host clips on why this exists.
> - A montage of up to seven participants, one line each on why they're here,
>   2–6s, their own words. Skip anyone without video and tell me who you left out.
> - The deal: `[what the programme provides]`. The numbers: `[up to three public
>   stats]`. The ask: `[what participants must do]` — the film wraps on it.
> - End card: lockup + domain.
>
> Work in this order and show me each checkpoint before moving on:
> 1. The line list — who, timecode, the exact words, why this line.
> 2. The clips — `check_clips.sh` output and the contact sheet.
> 3. A half-scale draft render.
> 4. The master, the web copy, and post copy (long post, short post, alt text
>    with the runtime).
>
> Rules: cut only on detected pauses; beat ≥ clip length; one idea per beat;
> hard cuts only; one accent colour; no narrator; call it a summary video.

---

## Notes on giving feedback

Most revision rounds on the reference film came from three things. Say them
early if they apply:

- **"Too much per sequence."** One idea per beat; strip motion graphics.
- **"Get to the point."** Shorter beats, faster cuts, 118 BPM.
- **Audio.** A clipped consonant or a trailing breath on any line — name the
  line and the timecode.
