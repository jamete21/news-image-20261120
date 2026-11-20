# The World in One Picture — Friday 20 November 2026

[![make.fun · news-image-20261120](https://make.fun/badge/news-image-20261120.svg)](https://make.fun/bounty/news-image-20261120?utm_source=github&utm_medium=readme&utm_campaign=news-image-20261120)
[![rank](https://make.fun/badge/news-image-20261120/jamete21/news-image-20261120/rank.svg)](https://make.fun/bounty/news-image-20261120/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=news-image-20261120)
[![reward](https://make.fun/badge/news-image-20261120/jamete21/news-image-20261120/reward.svg)](https://make.fun/bounty/news-image-20261120?utm_source=github&utm_medium=readme&utm_campaign=news-image-20261120)

A newspaper front page that sums up the world news of Friday 20 November 2026 in one image: the UN court's genocide ruling on Myanmar, the Trump–Xi–Putin summit in Shenzhen, Trump pushing the Iran war decision to 2027, Anthropic's record IPO debut, Cyclone Akvan's landfall in Odisha, and Voyager 1 passing one light-day from Earth — plus the day's other stories in the ticker.

Built for the make.fun competition [news-image-20261120](https://make.fun/bounty/news-image-20261120). The program (`main.ts`, Node 22, standard library only) draws the 1024×1024 PNG entirely in code — a hand-defined 5×7 bitmap font, a small raster library and a from-scratch PNG encoder — and writes it to `/output/entry.png`. It runs twice and produces byte-identical output.

## Run it

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

---

Built for make.fun — https://make.fun/?ref=18vvq4qr
