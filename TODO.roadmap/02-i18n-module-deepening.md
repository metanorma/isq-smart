# 02 — Deepen i18n module

## Problem
`src/i18n/client.ts` (108 lines) has **five responsibilities** in one file:
1. Language state (localStorage get/set)
2. Message lookup (key → string)
3. Text matching (DOM text-node walker)
4. DOM translation application
5. Event dispatching (`language-change`)

**Deletion test**: if we delete this file, complexity reappears scattered across every page that needs translations. It's earning its keep, but it's too shallow — each responsibility is a one-liner that callers can't substitute.

## Solution
Split into deep modules behind small interfaces:

### `src/i18n/MessageLookup.ts`
```ts
export class MessageLookup {
  constructor(private messages: MessageMap) {}
  resolve(lang: Language, key: string): string  // returns key if not found
  has(lang: Language, key: string): boolean
}
```

### `src/i18n/LanguageStore.ts`
```ts
export class LanguageStore {
  get(): Language          // reads localStorage with fallback
  set(lang: Language): void
  onChange(cb: (l: Language) => void): () => void  // unsubscribe
}
```

### `src/i18n/DomTranslator.ts`
```ts
export class DomTranslator {
  constructor(
    private lookup: MessageLookup,
    private textMatcher: TextMatcher,
  ) {}
  translate(root: HTMLElement, lang: Language): void
}
```

### `src/i18n/TextMatcher.ts`
```ts
export class TextMatcher {
  constructor(private enToFr: Map<string, string>) {}
  translateText(text: string, lang: Language): string | null
}
```

### `src/i18n/I18nService.ts` (orchestrator — the only thing pages import)
```ts
export class I18nService {
  constructor(
    private store: LanguageStore,
    private translator: DomTranslator,
  ) {}
  init(): Language
  switchTo(lang: Language): void
  apply(root: HTMLElement): void
}
```

## Benefits
- Each module has one responsibility behind a small interface → **deep**
- Testable in isolation (no DOM needed for MessageLookup, TextMatcher)
- `I18nService` is the single seam; swapping implementations is trivial
- No more global mutable state scattered across the file

## Test plan
- MessageLookup: key lookup, missing key returns key itself
- LanguageStore: get/set round-trip, fallback to default
- TextMatcher: exact-match replacement, preserves whitespace
- DomTranslator: data-i18n attribute replacement, data-i18n-html for HTML
- I18nService: init reads store, switchTo dispatches events
