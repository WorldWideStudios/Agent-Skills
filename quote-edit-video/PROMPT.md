# Prompt

Paste this into Claude Code (or any agent with shell access on a Mac) from an
empty folder. Fill in the brackets.

---

> Make a vertical **quote edit video** with the `quote-edit-video` skill.
> Philosopher: `[Epictetus]`. Closing quote: `[a real line, or pick one and
> cite where it's from]`. Keep it hopeful.
>
> First, write the 14-line script in the skill's shape and show it to me with
> the source of the closing quote and a note that the other lines are
> narration built from the author's ideas. Wait for my go-ahead.
>
> Then: copy `template/`, install, fetch the music, find 9–12 public-domain or
> CC0 portraits of the author only on Wikimedia Commons (list them in
> `SOURCES.txt`), find and check every eye position, cut out the hold
> portrait, voice the script with Aura-2 through OpenRouter (key:
> `[path to .env with OPENROUTER_API_KEY]`), write the config and shot list,
> render with `tools/finish.sh` and read contact sheets of the whole video.
> Fix any window that doesn't show eyes. Tell me the length and anything you
> couldn't verify. You can't hear the mix, so say so.
