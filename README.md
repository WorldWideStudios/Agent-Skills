# Worldwide Studios — Agent Skills

Skills for Claude Code (and any agent that reads `SKILL.md` files) that we use
to make video for our programmes. Each folder is one self-contained skill.

| Skill | What it does |
|---|---|
| [`video-brand-guide/`](video-brand-guide/) | Build a video style guide from an organisation's website: tokens, one type scale for 16:9 and 9:16, card specs, motion/picture/sound rules, a Never list and a pre-render checklist — Markdown plus an illustrated HTML sheet. Includes a worked example. |
| [`summary-video/`](summary-video/) | Cut a recorded group call into a 60–75s public summary video: ffmpeg scripts for finding and cutting lines, a Remotion template driven by one JSON beat table, and an original synthesised score that follows the cut. |

They work best together: make the brand guide first, then cut the video against it.

## Install

```bash
git clone https://github.com/WorldWideStudios/Agent-Skills.git
mkdir -p ~/.claude/skills
cp -R Agent-Skills/video-brand-guide Agent-Skills/summary-video ~/.claude/skills/
```

Or copy a skill into a project's `.claude/skills/` to scope it to that project.
Then ask for it in plain words ("make a brand guide for our videos from
example.org", "cut a summary video of this call"), or start from
[`summary-video/PROMPT.md`](summary-video/PROMPT.md).

## Requirements

- `ffmpeg` / `ffprobe`
- Node 18+ (Remotion)
- Python 3 (stdlib only; Pillow optional for checking a logo)

## Notes

- Nothing here contains footage or participant data. The summary-video template
  uses placeholder names and ships without clips; the brand-guide example is our
  own brand with project-specific sections removed.
- Publishing people's faces and voices needs their clearance. The summary-video
  skill treats that as a precondition, not a formality.
