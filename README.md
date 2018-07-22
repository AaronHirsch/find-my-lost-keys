## I lost my keys and I am lazy af.

This small tool helps me to check the Berlin Lost Property Office for my lost keys.
It is connected to a private bot (limited to a given telegram user id). You can use this bot to request different actions.
You can ask the tool to crawl the entire result page. The tool uses redis to persist already found keys. It does so by
generating a hash based on the key description, date, place and office. This hash is used to uniquely identify one key.

You can use the bot to retrieve one crawled key at a time. You can reject or mark a key as potentially yours.
You can view stats and keys you previously marked.

## Requirements
You have to create a small `.env` file. See example below. Make sure to add the correct values.

```bash
TELEGRAM_API_TOKEN=xxx
TELEGRAM_CHAT_ID=xxx
FUNDBUERO="https://fundsuche02.kivbf.de/MyApp.asp"
```
