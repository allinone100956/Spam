# Nextron Discord Bot

A DM-first Discord utility bot inspired by the supplied dark mobile interface.

## Commands

- `/help` — DM-friendly command list
- `/checkuser <user>` — public profile information
- `/blame <user>` — harmless attribution test
- `/ban <user> [reason]` — confirmation-based guild moderation
- `/embedspam <text>` — sends one test embed in the current context
- `/fakeip` — harmless IP-format demonstration
- `/ghostping <user>` — safe mention notification test
- `/spamraid` — defensive demo only; never floods messages

## Setup

1. Install Node.js 18 or newer.
2. Run `npm install`.
3. Copy `.env.example` to `.env`.
4. Invite the bot with `applications.commands` and `bot` scopes.
5. Run `npm run deploy`.
6. Run `npm start`.

## Safety

This project does not send repeated or unsolicited messages, raid servers, or perform Discord abuse. The `/ban` command requires guild permissions and an explicit confirmation. `/spamraid` returns a single private demonstration embed only.
