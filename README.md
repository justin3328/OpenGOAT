# OpenGOAT 🐐

**The GOAT path to any goal.**

[![NPM Version](https://img.shields.io/npm/v/opengoat.svg)](https://www.npmjs.com/package/opengoat)
[![License](https://img.shields.io/npm/l/opengoat.svg)](https://github.com/YOUR_USERNAME/opengoat/blob/main/LICENSE)
[![CI Status](https://github.com/YOUR_USERNAME/opengoat/workflows/CI/badge.svg)](https://github.com/YOUR_USERNAME/opengoat/actions)

OpenGOAT is a plugin-first CLI platform that turns any goal into a displacement score, ranked paths, and weekly AI-generated missions.

<!-- add demo.gif here -->

## 30-Second Install

```bash
npx opengoat init
```

## Commands

| Command | Description |
|---|---|
| `init` | Interactive setup wizard for your goal |
| `path` | See your displacement + best route |
| `plan` | Generate this week's missions via AI |
| `missions` | Interactive mission tracker |
| `score` | Your Pathfinder Score card & rank |
| `dashboard` | Live terminal dashboard |
| `serve` | Start Web UI on localhost:4321 |
| `recap` | Weekly performance summary |
| `plugin` | Manage goal engine extensions |

## Plugin Development

OpenGOAT is built on a plugin architecture. You can contribute your own playbooks:

```typescript
// Minimal IPlaybookPlugin example
export const myPlaybook = {
  name: 'my-path',
  category: 'learning',
  version: '1.0.0',
  getPaths: (gap) => [/* ... */],
  // ...
};
```

## AI Providers

| Provider | Setup |
|---|---|
| Anthropic | Get key at console.anthropic.com |
| OpenAI | Get key at platform.openai.com |
| Groq | Get key at console.groq.com |
| Ollama | Run locally with `ollama serve` |

## Playbook Categories

- 💰 **Income**: Freelance, SaaS, Content Creation
- 🏃 **Fitness**: Marathon, Weight Loss
- 📚 **Learning**: Programming, Languages
- 🚀 **Launch**: Indie Hacker, Open Source

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) to add your own goal paths.

## License

MIT
