<script setup lang="ts">
</script>

<template>
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
    <router-link to="/reference" class="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-brand-600 transition-colors mb-6">
      <svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" d="M15 19l-7-7 7-7"/></svg>
      API &amp; Reference
    </router-link>

    <h1 class="text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight mb-3">URN Identifier Patterns</h1>
    <p class="text-slate-500 dark:text-slate-400 mb-12 max-w-2xl leading-relaxed">
      ISO 80000 and IEC 80000 use separate URN namespaces. ISO parts follow <a href="https://www.rfc-editor.org/rfc/rfc5141" class="text-brand-600 dark:text-brand-400 hover:underline" target="_blank" rel="noopener">RFC 5141</a> (URNs for ISO documents). IEC parts follow the IEC URN scheme.
    </p>

    <!-- ISO URN pattern -->
    <section class="mb-12">
      <h2 class="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">ISO Parts</h2>
      <p class="text-sm text-slate-600 dark:text-slate-400 mb-4">
        Parts published by ISO (2, 3, 4, 5, 7, 8, 9, 10, 11, 12) use the ISO standard URN namespace. The 2019 edition is edition 2.
      </p>

      <div class="rounded-xl border border-slate-200/60 dark:border-dark-600/60 bg-white dark:bg-dark-900 overflow-hidden mb-4">
        <div class="px-5 py-3 bg-slate-50/80 dark:bg-dark-800/80 border-b border-slate-200/60 dark:border-dark-600/60">
          <h3 class="text-[10px] font-semibold text-slate-500 uppercase tracking-[0.12em]">Part-level URN</h3>
        </div>
        <div class="p-5">
          <code class="text-sm font-mono text-brand-700 dark:text-brand-400 bg-brand-50/50 dark:bg-brand-950/20 px-3 py-2 rounded-lg break-all block">urn:iso:std:iso:80000:-{part}:ed-{edition}:{lang}</code>
          <div class="mt-4">
            <div class="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider mb-2">Example</div>
            <code class="text-sm font-mono text-slate-700 dark:text-slate-300 break-all block">urn:iso:std:iso:80000:-3:ed-2:en</code>
            <p class="text-xs text-slate-400 mt-1">ISO 80000-3 (Space and time), edition 2, English</p>
          </div>
        </div>
      </div>

      <div class="rounded-xl border border-slate-200/60 dark:border-dark-600/60 bg-white dark:bg-dark-900 overflow-hidden mb-4">
        <div class="px-5 py-3 bg-slate-50/80 dark:bg-dark-800/80 border-b border-slate-200/60 dark:border-dark-600/60">
          <h3 class="text-[10px] font-semibold text-slate-500 uppercase tracking-[0.12em]">Item-level URN</h3>
        </div>
        <div class="p-5">
          <code class="text-sm font-mono text-brand-700 dark:text-brand-400 bg-brand-50/50 dark:bg-brand-950/20 px-3 py-2 rounded-lg break-all block">urn:iso:std:iso:80000:-{part}:ed-{edition}:{lang}:item:{num}</code>
          <div class="mt-4">
            <div class="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider mb-2">Example</div>
            <code class="text-sm font-mono text-slate-700 dark:text-slate-300 break-all block">urn:iso:std:iso:80000:-2:ed-2:en:item:2-8.19</code>
            <p class="text-xs text-slate-400 mt-1">ISO 80000-2 entry 2-8.19 (parentheses), edition 2</p>
          </div>
        </div>
      </div>

      <div class="rounded-xl border border-slate-200/60 dark:border-dark-600/60 bg-white dark:bg-dark-900 overflow-hidden">
        <div class="px-5 py-3 bg-slate-50/80 dark:bg-dark-800/80 border-b border-slate-200/60 dark:border-dark-600/60">
          <h3 class="text-[10px] font-semibold text-slate-500 uppercase tracking-[0.12em]">Bilingual (English + French)</h3>
        </div>
        <div class="p-5">
          <code class="text-sm font-mono text-brand-700 dark:text-brand-400 bg-brand-50/50 dark:bg-brand-950/20 px-3 py-2 rounded-lg break-all block">urn:iso:std:iso:80000:-{part}:ed-{edition}:en,fr</code>
          <div class="mt-4">
            <code class="text-sm font-mono text-slate-700 dark:text-slate-300 break-all block">urn:iso:std:iso:80000:-4:ed-2:en,fr:item:4-1</code>
            <p class="text-xs text-slate-400 mt-1">ISO 80000-4 entry 4-1 (length), bilingual</p>
          </div>
        </div>
      </div>
    </section>

    <!-- IEC URN pattern -->
    <section class="mb-12">
      <h2 class="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">IEC Parts</h2>
      <p class="text-sm text-slate-600 dark:text-slate-400 mb-4">
        Parts published by IEC (6, 13) use the IEC URN namespace with date-based editions.
      </p>

      <div class="rounded-xl border border-slate-200/60 dark:border-dark-600/60 bg-white dark:bg-dark-900 overflow-hidden">
        <div class="px-5 py-3 bg-slate-50/80 dark:bg-dark-800/80 border-b border-slate-200/60 dark:border-dark-600/60">
          <h3 class="text-[10px] font-semibold text-slate-500 uppercase tracking-[0.12em]">IEC Part URN</h3>
        </div>
        <div class="p-5 space-y-4">
          <div>
            <code class="text-sm font-mono text-teal-700 dark:text-teal-400 bg-teal-50/50 dark:bg-teal-950/20 px-3 py-2 rounded-lg break-all block">urn:iec:std:iec:80000-6:2022-11:::</code>
            <p class="text-xs text-slate-400 mt-1">IEC 80000-6 (Electromagnetism), edition 2022-11</p>
          </div>
          <div>
            <code class="text-sm font-mono text-teal-700 dark:text-teal-400 bg-teal-50/50 dark:bg-teal-950/20 px-3 py-2 rounded-lg break-all block">urn:iec:std:iec:80000-13:2025-02:::</code>
            <p class="text-xs text-slate-400 mt-1">IEC 80000-13 (Information science), edition 2025-02</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Structure breakdown -->
    <section class="mb-12">
      <h2 class="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">URN Components</h2>

      <div class="rounded-xl border border-slate-200/60 dark:border-dark-600/60 bg-white dark:bg-dark-900 overflow-hidden">
        <table class="w-full text-sm">
          <thead>
            <tr class="bg-slate-50/80 dark:bg-dark-800/80 border-b border-slate-200/60 dark:border-dark-600/60">
              <th class="text-left px-5 py-2.5 font-semibold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">Component</th>
              <th class="text-left px-5 py-2.5 font-semibold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">Description</th>
              <th class="text-left px-5 py-2.5 font-semibold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">Example</th>
            </tr>
          </thead>
          <tbody>
            <tr class="border-b border-slate-100 dark:border-dark-700/50">
              <td class="px-5 py-3 font-mono text-xs text-brand-700 dark:text-brand-400">urn:iso:std:iso:</td>
              <td class="px-5 py-3 text-slate-600 dark:text-slate-400">ISO namespace per RFC 5141</td>
              <td class="px-5 py-3 font-mono text-xs text-slate-500">urn:iso:std:iso</td>
            </tr>
            <tr class="border-b border-slate-100 dark:border-dark-700/50">
              <td class="px-5 py-3 font-mono text-xs text-brand-700 dark:text-brand-400">80000</td>
              <td class="px-5 py-3 text-slate-600 dark:text-slate-400">Standard number</td>
              <td class="px-5 py-3 font-mono text-xs text-slate-500">80000</td>
            </tr>
            <tr class="border-b border-slate-100 dark:border-dark-700/50">
              <td class="px-5 py-3 font-mono text-xs text-brand-700 dark:text-brand-400">-{part}</td>
              <td class="px-5 py-3 text-slate-600 dark:text-slate-400">Part number (dash-prefixed)</td>
              <td class="px-5 py-3 font-mono text-xs text-slate-500">-3, -2-8, -11-5</td>
            </tr>
            <tr class="border-b border-slate-100 dark:border-dark-700/50">
              <td class="px-5 py-3 font-mono text-xs text-brand-700 dark:text-brand-400">ed-{edition}</td>
              <td class="px-5 py-3 text-slate-600 dark:text-slate-400">Edition number</td>
              <td class="px-5 py-3 font-mono text-xs text-slate-500">ed-2 (2019 parts)</td>
            </tr>
            <tr class="border-b border-slate-100 dark:border-dark-700/50">
              <td class="px-5 py-3 font-mono text-xs text-brand-700 dark:text-brand-400">{lang}</td>
              <td class="px-5 py-3 text-slate-600 dark:text-slate-400">Language code(s)</td>
              <td class="px-5 py-3 font-mono text-xs text-slate-500">en, en,fr</td>
            </tr>
            <tr>
              <td class="px-5 py-3 font-mono text-xs text-brand-700 dark:text-brand-400">item:{num}</td>
              <td class="px-5 py-3 text-slate-600 dark:text-slate-400">Entry number within the part</td>
              <td class="px-5 py-3 font-mono text-xs text-slate-500">item:4-1, item:2-8.19</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- Edition mapping -->
    <section class="mb-12">
      <h2 class="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">Edition Mapping</h2>
      <div class="rounded-xl border border-slate-200/60 dark:border-dark-600/60 bg-white dark:bg-dark-900 overflow-hidden">
        <table class="w-full text-sm">
          <thead>
            <tr class="bg-slate-50/80 dark:bg-dark-800/80 border-b border-slate-200/60 dark:border-dark-600/60">
              <th class="text-left px-5 py-2.5 font-semibold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">Publisher</th>
              <th class="text-left px-5 py-2.5 font-semibold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">Parts</th>
              <th class="text-left px-5 py-2.5 font-semibold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">Year</th>
              <th class="text-left px-5 py-2.5 font-semibold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">Edition</th>
            </tr>
          </thead>
          <tbody>
            <tr class="border-b border-slate-100 dark:border-dark-700/50">
              <td class="px-5 py-3 text-slate-600 dark:text-slate-400">ISO</td>
              <td class="px-5 py-3 font-mono text-xs">2, 3, 4, 5, 7, 9, 10, 11, 12</td>
              <td class="px-5 py-3 text-slate-600 dark:text-slate-400">2019</td>
              <td class="px-5 py-3 font-mono text-xs">2</td>
            </tr>
            <tr class="border-b border-slate-100 dark:border-dark-700/50">
              <td class="px-5 py-3 text-slate-600 dark:text-slate-400">ISO</td>
              <td class="px-5 py-3 font-mono text-xs">8</td>
              <td class="px-5 py-3 text-slate-600 dark:text-slate-400">2020</td>
              <td class="px-5 py-3 font-mono text-xs">1</td>
            </tr>
            <tr class="border-b border-slate-100 dark:border-dark-700/50">
              <td class="px-5 py-3 text-slate-600 dark:text-slate-400">IEC</td>
              <td class="px-5 py-3 font-mono text-xs">6</td>
              <td class="px-5 py-3 text-slate-600 dark:text-slate-400">2022-11</td>
              <td class="px-5 py-3 font-mono text-xs">2022-11</td>
            </tr>
            <tr>
              <td class="px-5 py-3 text-slate-600 dark:text-slate-400">IEC</td>
              <td class="px-5 py-3 font-mono text-xs">13</td>
              <td class="px-5 py-3 text-slate-600 dark:text-slate-400">2025-02</td>
              <td class="px-5 py-3 font-mono text-xs">2025-02</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <div class="text-xs text-slate-400 dark:text-slate-500">
      <strong class="text-slate-500 dark:text-slate-400">Note:</strong> The ISO 80000 series is <em>not</em> published as ISO/IEC 80000. It is a joint series where individual parts are published separately by ISO and IEC. Each part carries the publisher name of the organization that published it.
    </div>
  </div>
</template>
