<template>
  <footer class="mt-auto relative bg-brand-950">
    <div class="h-px bg-gradient-to-r from-transparent via-brand-500/40 to-transparent" />

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <div class="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
        <!-- Brand -->
        <div class="lg:col-span-1">
          <div class="flex items-center gap-2 mb-4">
            <img src="/img/logo-iso.svg" alt="ISO" class="h-6 w-auto rounded opacity-90" />
            <span class="text-white/30 text-xs">+</span>
            <img src="/img/logo-iec.svg" alt="IEC" class="h-6 w-auto rounded opacity-90" />
          </div>
          <p class="text-xs text-white/40 leading-relaxed max-w-xs">
            ISO 80000 &amp; IEC 80000 — the international standards for quantities, units, and mathematical notation.
          </p>
        </div>

        <!-- Domains -->
        <div>
          <h3 class="text-[11px] font-semibold text-white/50 uppercase tracking-wider mb-3">Browse</h3>
          <ul class="space-y-2 text-xs">
            <li><router-link to="/quantities" class="text-white/50 hover:text-brand-300 transition-colors">Quantities and Units</router-link></li>
            <li><router-link to="/math" class="text-white/50 hover:text-brand-300 transition-colors">Mathematical Notation</router-link></li>
            <li><router-link to="/units" class="text-white/50 hover:text-brand-300 transition-colors">Units Database</router-link></li>
            <li><router-link to="/dimensions" class="text-white/50 hover:text-brand-300 transition-colors">Dimensions</router-link></li>
            <li><router-link to="/about" class="text-white/50 hover:text-brand-300 transition-colors">About the Standard</router-link></li>
            <li><router-link to="/reference" class="text-white/50 hover:text-brand-300 transition-colors">API &amp; Reference</router-link></li>
          </ul>
        </div>

        <!-- Linked Data -->
        <div>
          <h3 class="text-[11px] font-semibold text-white/50 uppercase tracking-wider mb-3">Linked Data</h3>
          <ul class="space-y-2 text-xs">
            <li><a href="https://unitsml.org" class="text-white/50 hover:text-brand-300 transition-colors" target="_blank" rel="noopener">UnitsML.org</a></li>
            <li><a href="https://unitsml.org/schemas/" class="text-white/50 hover:text-brand-300 transition-colors" target="_blank" rel="noopener">UnitsDB Schemas</a></li>
            <li><span class="text-white/50">RFC 5141 URN identifiers</span></li>
            <li><span class="text-white/50">JSON-LD + RDF/Turtle vocabulary</span></li>
          </ul>
        </div>

        <!-- Vocabulary preview -->
        <div>
          <h3 class="text-[11px] font-semibold text-white/50 uppercase tracking-wider mb-3">Vocabulary</h3>
          <div class="p-3 rounded-lg bg-white/[0.04] border border-white/[0.06] font-mono text-[10px] leading-relaxed text-white/40">
            <pre>@context: isq/ontologies/core
@type:   isq:Quantity
@id:     isq:{id}
dcterms: urn:iso:std:iso:80000:...</pre>
          </div>
        </div>
      </div>

      <!-- Bottom bar -->
      <div class="mt-10 pt-6 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-3">
        <span class="text-[11px] text-white/25">Content copyright &copy; ISO and IEC. All rights reserved.</span>
        <span class="text-[11px] text-white/25">Service provided by Ribose. UnitsML data used with permission.</span>
      </div>
    </div>
  </footer>
</template>
