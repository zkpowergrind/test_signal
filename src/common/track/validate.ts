import { isNumber } from "lodash"
import { TrackEvent } from "./TrackEvent"

export const validateMidiEvent = (e: TrackEvent) => {
  Object.values(e).forEach((v) => {
    if (isNumber(v)) {
      if (!Number.isInteger(v)) {
        console.warn("non integer is not allowed in MIDI", e, v)
      }
      if (v < 0) {
        console.warn("minus value is not allowed in MIDI", e, v)
      }
    }
  })
}
