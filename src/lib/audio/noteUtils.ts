const NOTE_NAMES = [
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
  "A",
  "A#",
  "B",
];

const A4_FREQUENCY = 440;
const A4_MIDI_NUMBER = 69;

export interface NoteInfo {
  note: string;
  octave: number;
  cents: number;
  midiNumber: number;
}

export function frequencyToNote(frequency: number): NoteInfo {
  const midiNumberFloat =
    A4_MIDI_NUMBER + 12 * Math.log2(frequency / A4_FREQUENCY);
  const midiNumber = Math.round(midiNumberFloat);
  const cents = Math.round((midiNumberFloat - midiNumber) * 100);

  const noteIndex = ((midiNumber % 12) + 12) % 12;
  const octave = Math.floor(midiNumber / 12) - 1;

  return {
    note: NOTE_NAMES[noteIndex],
    octave,
    cents,
    midiNumber,
  };
}

export function noteToFrequency(midiNumber: number): number {
  return A4_FREQUENCY * Math.pow(2, (midiNumber - A4_MIDI_NUMBER) / 12);
}

export function midiToNoteName(midiNumber: number): string {
  const noteIndex = ((midiNumber % 12) + 12) % 12;
  const octave = Math.floor(midiNumber / 12) - 1;
  return `${NOTE_NAMES[noteIndex]}${octave}`;
}
