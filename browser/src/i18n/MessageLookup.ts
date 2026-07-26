export type MessageMap = Record<'en' | 'fr', Record<string, unknown>>

export class MessageLookup {
  constructor(private readonly messages: MessageMap) {}

  resolve(lang: { htmlLang: 'en' | 'fr' }, key: string): string {
    const parts = key.split('.')
    let result: unknown = this.messages[lang.htmlLang]
    for (const part of parts) {
      if (typeof result !== 'object' || result === null) return key
      result = (result as Record<string, unknown>)[part]
    }
    return typeof result === 'string' ? result : key
  }

  has(lang: { htmlLang: 'en' | 'fr' }, key: string): boolean {
    return this.resolve(lang, key) !== key
  }
}
