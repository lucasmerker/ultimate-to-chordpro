/* global gtag */
import ChordSheetJS from "chordsheetjs";
import LatexFormatter from "./latex-formatter";
import "./style/index.css";

/**
 * Lines that UltimateGuitarParser treats as section starts (see ChordSheetJS
 * VERSE_LINE_REGEX, CHORUS_LINE_REGEX, BRIDGE_LINE_REGEX, PART_LINE_REGEX).
 * Blank lines immediately after these confuse isSectionEnd() and close the
 * section before the first chord/lyric line.
 */
function isUgSectionDirectiveLine(line) {
  const t = line.trim();
  return (
    /^\[(Verse.*)]$/i.test(t) ||
    /^\[(Chorus.*)]$/i.test(t) ||
    /^\[(Bridge.*)]$/i.test(t) ||
    /^\[(Intro|Outro|Instrumental|Interlude|Solo|Pre-Chorus)( \d+)?]$/i.test(
      t,
    )
  );
}

function normalizeUltimateGuitarSectionGaps(text) {
  const lines = text.split(/\r?\n/);
  const out = [];
  for (let i = 0; i < lines.length; i += 1) {
    out.push(lines[i]);
    if (isUgSectionDirectiveLine(lines[i])) {
      while (i + 1 < lines.length && lines[i + 1].trim() === "") {
        i += 1;
      }
    }
  }
  return out.join("\n");
}

const parsers = {
  chordpro: new ChordSheetJS.ChordProParser(),
  ultimate: new ChordSheetJS.UltimateGuitarParser({
    preserveWhitespace: false,
  }),
};
const formatters = {
  chordpro: new ChordSheetJS.ChordProFormatter(),
  latex: new LatexFormatter(),
  ultimate: new ChordSheetJS.TextFormatter(),
};

let formatTracked = false;

function trackFormatConversion() {
  if (formatTracked) return;
  const input = document.getElementById("ultimate").value;
  if (!input.trim()) return;
  formatTracked = true;
  const fromFormat = document.getElementById("from-format").value;
  const toFormat = document.getElementById("to-format").value;
  gtag("event", "format_conversion", {
    from_format: fromFormat,
    to_format: toFormat,
  });
}

function resetFormatTracking() {
  formatTracked = false;
}

function convert() {
  let input = document.getElementById("ultimate").value;

  const fromFormatEl = document.getElementById("from-format");
  const toFormatEl = document.getElementById("to-format");
  const fromFormat = fromFormatEl.options[fromFormatEl.selectedIndex].value;
  const toFormat = toFormatEl.options[toFormatEl.selectedIndex].value;

  if (fromFormat === "ultimate") {
    input = normalizeUltimateGuitarSectionGaps(input);
  }

  const parsed = parsers[fromFormat].parse(input);
  const output = formatters[toFormat].format(parsed);
  document.getElementById("chordpro").value = output;
}

function convertAndTrack() {
  convert();
  trackFormatConversion();
}

function convertAndTrackIfToggled() {
  if (toggleState) {
    convertAndTrack();
  }
}

let toggleState = document.getElementById("toggle").checked;
function setToggle(e) {
  toggleState = e.target.checked;
}

document.getElementById("convert").addEventListener("click", convertAndTrack);
document.getElementById("toggle").addEventListener("change", setToggle);
document
  .getElementById("ultimate")
  .addEventListener("keyup", convertAndTrackIfToggled);
document.getElementById("from-format").addEventListener("change", function () {
  resetFormatTracking();
  convertAndTrack();
});
document.getElementById("to-format").addEventListener("change", function () {
  resetFormatTracking();
  convertAndTrack();
});
convert();
