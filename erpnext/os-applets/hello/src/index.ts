// Applet entry (ADR-0009): the module's DEFAULT export IS the SFC the OS mounts. The official
// preset builds this to a single stable-filename ESM with vue/frappe-ui/@frappe-os/api kept
// external. The OS's resolveApplet does `import(assetUrl)` and reads `.default`.
import Hello from "./Hello.vue";

export default Hello;
