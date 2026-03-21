# Contributing to OpenGOAT 🐐

We love contributions! The fastest way to help is by adding a new **Playbook**.

## How to add a Playbook

1. Create a JSON file in `playbooks/<category>/<name>.json`.
2. Follow the schema in `src/types/index.ts`.
3. Test it by running `opengoat init`.

## How to add a Provider Plugin

Implement the `IProviderPlugin` interface in `src/providers/`.

## Running Tests Locally

```bash
npm install
npm test
```

## PR Checklist

- [ ] TypeScript builds with no errors (`npm run build`)
- [ ] New playbook matches the Zod schema
- [ ] Tests pass (`npm test`)

## Labels

- `good first issue`: Ideal for new contributors adding playbooks.
- `playbook`: New goal path submissions.
- `plugin`: New AI or renderer integrations.
- `core`: Engine changes (requires deep review).
