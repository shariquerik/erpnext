<script setup lang="ts">
// ERPNext Hello — the first SEPARATELY-BUILT applet (ADR-0009). It ships in erpnext's public
// assets, is compiled by the official preset (vue/frappe-ui/@frappe-os/api externalized), and
// is loaded by the OS at runtime as native ESM onto the HOST's single Vue/frappe-ui/OS-API.
// erpnext has no Vue frontend of its own, so this SFC can only be running on the OS's Vue —
// the cleanest possible proof of the shared-singleton load.
//
// It is also the falsifiable GREEN BAR: each numbered check below fails LOUDLY if the
// shared-singleton wiring is wrong (two Vues / wrong import-map / unshared Symbol).
import { inject, onMounted, ref } from "vue";
import { Button } from "frappe-ui";
// Bare specifier — externalized by the preset, resolved at runtime via the host import map
// to the host's own os-api module. OS_KEY is the SAME Symbol the host provided; formSurface
// builds a builtin Surface the host knows how to open.
import { OS_KEY, formSurface, type OsApi, type FrappeDoc } from "@frappe-os/api";

// (1) inject the OS API. If the import map / shared Vue is wrong, inject returns undefined
// and we render a loud "NO OS API" state instead of silently half-working.
const os = inject<OsApi>(OS_KEY);

// (2) data across the boundary: list a guaranteed-readable doctype and render the rows.
const rows = ref<FrappeDoc[]>([]);
const loaded = ref(false);
onMounted(async () => {
  if (!os) return;
  rows.value = await os.data.getList("DocType", { fields: ["name", "module"], limit: 5 });
  loaded.value = true;
});

// (4) local reactivity on the shared scheduler — a plain ref counter.
const count = ref(0);

// (3) frappe-ui Button (external #2) → host toast through the OS API.
function notify() {
  os?.ui.notify("Hello from the ERPNext applet");
}

// (5) windows across the boundary: spawn a builtin form window for the first listed row
// (ADR-0012 — an applet opens a builtin surface). Proves windows.open + formSurface.
function openWindow() {
  const first = rows.value[0];
  if (first) os?.windows.open(formSurface("DocType", first.name));
}
</script>

<template>
  <!-- loud failure state: no shared OS API resolved -->
  <div
    v-if="!os"
    data-applet="erp-hello"
    data-os="missing"
    class="flex min-h-0 flex-1 items-center justify-center bg-surface-base p-10 text-center"
  >
    <div class="text-[15px] font-semibold text-ink-red-4">NO OS API — inject(OS_KEY) returned nothing</div>
  </div>

  <div
    v-else
    data-applet="erp-hello"
    data-os="ok"
    class="flex min-h-0 flex-1 flex-col gap-5 overflow-auto bg-surface-base px-[30px] pb-[34px] pt-[26px]"
  >
    <div>
      <div class="mb-[3px] text-[12px] text-ink-gray-5">ERPNext · runtime-loaded applet</div>
      <div class="text-[23px] font-semibold tracking-[-0.01em] text-ink-gray-9">ERPNext Hello</div>
    </div>

    <!-- (4) reactivity -->
    <div class="flex items-center gap-3">
      <Button data-testid="counter-btn" variant="subtle" :label="`Count: ${count}`" @click="count++" />
      <!-- (3) frappe-ui Button → host toast -->
      <Button data-testid="notify-btn" variant="solid" label="Notify" @click="notify" />
      <!-- (5) spawn a builtin window -->
      <Button data-testid="open-btn" variant="outline" label="Open a window" @click="openWindow" />
    </div>

    <!-- (2) data across the boundary -->
    <div>
      <div class="mb-2 text-[11px] font-semibold uppercase tracking-wide text-ink-gray-5">
        DocTypes <span data-testid="row-count" class="tabular-nums text-ink-gray-4">{{ rows.length }}</span>
      </div>
      <div data-testid="rows" class="overflow-hidden rounded-[11px] border border-outline-gray-2">
        <div v-if="!loaded" class="px-4 py-2.5 text-[13px] text-ink-gray-5">Loading…</div>
        <div
          v-for="r in rows"
          :key="r.name"
          data-testid="row"
          class="flex items-center justify-between border-b border-outline-gray-1 px-4 py-2.5 text-[13px] text-ink-gray-8 last:border-b-0"
        >
          <span class="font-medium">{{ r.name }}</span>
          <span class="text-[11.5px] text-ink-gray-5">{{ r.module }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
