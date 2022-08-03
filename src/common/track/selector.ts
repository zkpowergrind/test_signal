import last from "lodash/last"
import uniq from "lodash/uniq"
import { isNotUndefined } from "../helpers/array"
import {
  isControllerEvent,
  isControllerEventWithType,
  isEndOfTrackEvent,
  isPanEvent,
  isPitchBendEvent,
  isProgramChangeEvent,
  isSetTempoEvent,
  isTimeSignatureEvent,
  isTrackNameEvent,
  isVolumeEvent,
} from "./identify"
import { TrackEvent } from "./TrackEvent"

export const getLast = <T extends TrackEvent>(events: T[]): T | undefined =>
  last(events.slice().sort((e) => e.tick))

export const isTickBefore =
  (tick: number) =>
  <T extends TrackEvent>(e: T) =>
    e.tick <= tick

export const getVolume = (events: TrackEvent[], tick: number) =>
  getLast(events.filter(isVolumeEvent).filter(isTickBefore(tick)))?.value

export const getPan = (events: TrackEvent[], tick: number) =>
  getLast(events.filter(isPanEvent).filter(isTickBefore(tick)))?.value

export const getTrackNameEvent = (events: TrackEvent[]) =>
  getLast(events.filter(isTrackNameEvent))

export const getTempoEvent = (events: TrackEvent[], tick: number) =>
  getLast(events.filter(isSetTempoEvent).filter(isTickBefore(tick)))

export const getTimeSignatureEvent = (events: TrackEvent[], tick: number) =>
  getLast(events.filter(isTimeSignatureEvent).filter(isTickBefore(tick)))

export const getProgramNumberEvent = (events: TrackEvent[]) =>
  getLast(events.filter(isProgramChangeEvent))

export const getEndOfTrackEvent = (events: TrackEvent[]) =>
  getLast(events.filter(isEndOfTrackEvent))

export const getTempo = (
  events: TrackEvent[],
  tick: number
): number | undefined => {
  const e = getTempoEvent(events, tick)
  if (e === undefined) {
    return undefined
  }
  return 60000000 / e.microsecondsPerBeat
}

// collect events which will be retained in the synthesizer
export const getStatusEvents = (events: TrackEvent[], tick: number) => {
  const controlEvents = events
    .filter(isControllerEvent)
    .filter(isTickBefore(tick))
  // remove duplicated control types
  const recentControlEvents = uniq(controlEvents.map((e) => e.controllerType))
    .map((type) =>
      getLast(controlEvents.filter(isControllerEventWithType(type)))
    )
    .filter(isNotUndefined)

  const setTempo = getLast(
    events.filter(isSetTempoEvent).filter(isTickBefore(tick))
  )

  const programChange = getLast(
    events.filter(isProgramChangeEvent).filter(isTickBefore(tick))
  )

  const pitchBend = getLast(
    events.filter(isPitchBendEvent).filter(isTickBefore(tick))
  )

  return [...recentControlEvents, setTempo, programChange, pitchBend].filter(
    isNotUndefined
  )
}
