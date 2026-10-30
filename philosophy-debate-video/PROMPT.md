# Prompt

Paste this into Claude Code (or any agent with shell access) from an empty
folder. Fill in the brackets.

---

> Make a vertical **philosophy debate video** with the `philosophy-debate-video`
> skill. Question: `[Is it better to be good, or effective?]`. Philosophers:
> `[Socrates]` vs `[Machiavelli]`. If I haven't said who wins, pick the side
> whose rule the other ends up borrowing, and tell me why.
>
> First, draft the 13-line script in the skill's format and show it to me. Each
> line should rest on one named idea from that philosopher, plus accuracy notes
> for any quote or date. Wait for my go-ahead before generating anything.
>
> Then: copy `template/`, fetch the sound effects, find public-domain
> portraits on Wikimedia Commons, voice the lines with ElevenLabs v3 through
> OpenRouter (key: `[path to .env with OPENROUTER_API_KEY]`, distinct voices per
> philosopher), and give every speaker line its own animated drawing of its
> idea. Run `check`, snapshot every scene and fix what you see, then render to
> `renders/`. Tell me the length and anything you couldn't verify. You can't
> hear the voices, so say so.
