import cursorPencil from "!url-loader!../images/cursor-pencil.svg"
import { clamp, flatten, maxBy, minBy } from "lodash"
import { ControllerEvent, MIDIControlEvents, PitchBendEvent } from "midifile-ts"
import { action, autorun, computed, makeObservable, observable } from "mobx"
import { containsPoint, IPoint, IRect } from "../../common/geometry"
import { isNotUndefined } from "../../common/helpers/array"
import { filterEventsOverlapScroll } from "../../common/helpers/filterEvents"
import { getMBTString } from "../../common/measure/mbt"
import Quantizer from "../../common/quantizer"
import { ControlSelection } from "../../common/selection/ControlSelection"
import { getSelectionBounds, Selection } from "../../common/selection/Selection"
import {
  isControllerEventWithType,
  isExpressionEvent,
  isModulationEvent,
  isNoteEvent,
  isPanEvent,
  isPitchBendEvent,
  isVolumeEvent,
  TrackEvent,
  TrackEventOf,
} from "../../common/track"
import { NoteCoordTransform } from "../../common/transform"
import { ControlMode } from "../components/ControlPane/ControlPane"
import { InstrumentSetting } from "../components/InstrumentBrowser/InstrumentBrowser"
import { Layout } from "../Constants"
import RootStore from "./RootStore"
import { RulerStore } from "./RulerStore"

export type PianoRollMouseMode = "pencil" | "selection"

export type PianoNoteItem = IRect & {
  id: number
  velocity: number
  isSelected: boolean
  isDrum: boolean
}

export default class PianoRollStore {
  readonly rulerStore: RulerStore

  scrollLeftTicks = 0
  scrollTopKeys = 70 // 中央くらいの音程にスクロールしておく
  SCALE_X_MIN = 0.15
  SCALE_X_MAX = 15
  SCALE_Y_MIN = 0.5
  SCALE_Y_MAX = 4
  notesCursor = "auto"
  mouseMode: PianoRollMouseMode = "pencil"
  scaleX = 1
  scaleY = 1
  autoScroll = true
  quantize = 8
  isQuantizeEnabled = true
  selection: Selection | null = null
  selectedNoteIds: number[] = []
  lastNoteDuration: number | null = null
  openInstrumentBrowser = false
  instrumentBrowserSetting: InstrumentSetting = {
    isRhythmTrack: false,
    programNumber: 0,
  }
  notGhostTracks: Set<number> = new Set()
  canvasWidth: number = 0
  canvasHeight: number = 0
  showEventList = false
  openTransposeDialog = false

  controlHeight = 0
  controlMode: ControlMode = "velocity"
  controlSelection: ControlSelection | null = null
  selectedControllerEventIds: number[] = []

  constructor(readonly rootStore: RootStore) {
    this.rulerStore = new RulerStore(this)

    makeObservable(this, {
      scrollLeftTicks: observable,
      scrollTopKeys: observable,
      controlHeight: observable,
      notesCursor: observable,
      controlMode: observable,
      mouseMode: observable,
      scaleX: observable,
      scaleY: observable,
      autoScroll: observable,
      quantize: observable,
      isQuantizeEnabled: observable,
      selection: observable.shallow,
      selectedNoteIds: observable,
      lastNoteDuration: observable,
      openInstrumentBrowser: observable,
      instrumentBrowserSetting: observable,
      notGhostTracks: observable,
      canvasWidth: observable,
      canvasHeight: observable,
      showEventList: observable,
      openTransposeDialog: observable,
      selectedControllerEventIds: observable,
      controlSelection: observable,
      contentWidth: computed,
      contentHeight: computed,
      scrollLeft: computed,
      scrollTop: computed,
      transform: computed,
      windowedEvents: computed,
      notes: computed,
      ghostNotes: computed,
      selectionBounds: computed,
      modulationEvents: computed,
      expressionEvents: computed,
      panEvents: computed,
      volumeEvents: computed,
      pitchBendEvents: computed,
      currentVolume: computed,
      currentPan: computed,
      currentTempo: computed,
      currentMBTTime: computed,
      cursorX: computed,
      quantizer: computed,
      controlCursor: computed,
      setScrollLeftInPixels: action,
      setScrollTopInPixels: action,
      setScrollLeftInTicks: action,
      scaleAroundPointX: action,
      scaleAroundPointY: action,
      scrollBy: action,
      toggleTool: action,
    })
  }

  setUpAutorun() {
    autorun(() => {
      const { isPlaying, position } = this.rootStore.player
      const { autoScroll, scrollLeftTicks, transform, canvasWidth } = this

      // keep scroll position to cursor
      if (autoScroll && isPlaying) {
        const screenX = transform.getX(position - scrollLeftTicks)
        if (screenX > canvasWidth * 0.7 || screenX < 0) {
          this.scrollLeftTicks = position
        }
      }
    })
  }

  get contentWidth(): number {
    const { scrollLeft, transform, canvasWidth } = this
    const trackEndTick = this.rootStore.song.endOfSong
    const startTick = scrollLeft / transform.pixelsPerTick
    const widthTick = transform.getTicks(canvasWidth)
    const endTick = startTick + widthTick
    return Math.max(trackEndTick, endTick) * transform.pixelsPerTick
  }

  get contentHeight(): number {
    const { transform } = this
    return transform.getMaxY()
  }

  get scrollLeft(): number {
    return Math.round(this.transform.getX(this.scrollLeftTicks))
  }

  get scrollTop(): number {
    return Math.round(this.transform.getY(this.scrollTopKeys))
  }

  setScrollLeftInPixels(x: number) {
    const { canvasWidth, contentWidth } = this
    const maxX = contentWidth - canvasWidth
    const scrollLeft = clamp(x, 0, maxX)
    this.scrollLeftTicks = this.transform.getTicks(scrollLeft)
  }

  setScrollTopInPixels(y: number) {
    const { transform, canvasHeight } = this
    const maxY = transform.getMaxY() - canvasHeight
    const scrollTop = clamp(y, 0, maxY)
    this.scrollTopKeys = this.transform.getNoteNumberFractional(scrollTop)
  }

  setScrollLeftInTicks(tick: number) {
    this.setScrollLeftInPixels(this.transform.getX(tick))
  }

  setScrollTopInKeys(keys: number) {
    this.setScrollTopInPixels(this.transform.getY(keys))
  }

  scrollBy(x: number, y: number) {
    this.setScrollLeftInPixels(this.scrollLeft - x)
    this.setScrollTopInPixels(this.scrollTop - y)
  }

  scaleAroundPointX(scaleXDelta: number, pixelX: number) {
    const pixelXInTicks0 = this.transform.getTicks(this.scrollLeft + pixelX)
    this.scaleX = clamp(
      this.scaleX * (1 + scaleXDelta),
      this.SCALE_X_MIN,
      this.SCALE_X_MAX
    )
    const pixelXInTicks1 = this.transform.getTicks(this.scrollLeft + pixelX)
    const scrollInTicks = pixelXInTicks1 - pixelXInTicks0
    this.setScrollLeftInTicks(this.scrollLeftTicks - scrollInTicks)
  }

  scaleAroundPointY(scaleYDelta: number, pixelY: number) {
    const pixelYInKeys0 = this.transform.getNoteNumberFractional(
      this.scrollTop + pixelY
    )
    this.scaleY = clamp(
      this.scaleY * (1 + scaleYDelta),
      this.SCALE_Y_MIN,
      this.SCALE_Y_MAX
    )

    const pixelYInKeys1 = this.transform.getNoteNumberFractional(
      this.scrollTop + pixelY
    )
    const scrollInKeys = pixelYInKeys1 - pixelYInKeys0
    this.setScrollTopInKeys(this.scrollTopKeys - scrollInKeys)
  }

  toggleTool() {
    this.mouseMode === "pencil" ? "selection" : "pencil"
  }

  get transform(): NoteCoordTransform {
    return new NoteCoordTransform(
      Layout.pixelsPerTick * this.scaleX,
      Layout.keyHeight * this.scaleY,
      127
    )
  }

  get windowedEvents(): TrackEvent[] {
    const { transform, scrollLeft, canvasWidth } = this
    const track = this.rootStore.song.selectedTrack
    if (track === undefined) {
      return []
    }

    return filterEventsOverlapScroll(
      track.events,
      transform.pixelsPerTick,
      scrollLeft,
      canvasWidth
    )
  }

  get notes(): PianoNoteItem[] {
    const song = this.rootStore.song
    const { transform, windowedEvents, selectedNoteIds } = this

    const track = song.selectedTrack
    if (track === undefined) {
      return []
    }
    const isRhythmTrack = track.isRhythmTrack

    const noteEvents = windowedEvents.filter(isNoteEvent)

    return noteEvents.map((e): PianoNoteItem => {
      const rect = isRhythmTrack
        ? transform.getDrumRect(e)
        : transform.getRect(e)
      const isSelected = selectedNoteIds.includes(e.id)
      return {
        ...rect,
        id: e.id,
        velocity: e.velocity,
        isSelected,
        isDrum: isRhythmTrack,
      }
    })
  }

  get ghostNotes(): PianoNoteItem[] {
    const song = this.rootStore.song
    const { selectedTrackId } = song
    const { transform, notGhostTracks, scrollLeft, canvasWidth } = this

    return flatten(
      song.tracks.map((track, id) => {
        if (
          notGhostTracks.has(id) ||
          id === selectedTrackId ||
          track == undefined
        ) {
          return []
        }
        return filterEventsOverlapScroll(
          track.events.filter(isNoteEvent),
          transform.pixelsPerTick,
          scrollLeft,
          canvasWidth
        ).map((e): PianoNoteItem => {
          const rect = track.isRhythmTrack
            ? transform.getDrumRect(e)
            : transform.getRect(e)
          return {
            ...rect,
            id: e.id,
            velocity: 127, // draw opaque when ghost
            isSelected: false,
            isDrum: track.isRhythmTrack,
          }
        })
      })
    )
  }

  // hit test notes in canvas coordinates
  getNotes(local: IPoint): PianoNoteItem[] {
    return this.notes.filter((n) => containsPoint(n, local))
  }

  // convert mouse position to the local coordinate on the canvas
  getLocal(e: { offsetX: number; offsetY: number }): IPoint {
    return {
      x: e.offsetX + this.scrollLeft,
      y: e.offsetY + this.scrollTop,
    }
  }

  get selectionBounds(): IRect | null {
    if (this.selection !== null) {
      return getSelectionBounds(this.selection, this.transform)
    }
    return null
  }

  private filteredEvents<T extends TrackEvent>(
    filter: (e: TrackEvent) => e is T
  ): T[] {
    const song = this.rootStore.song
    const { selectedTrack } = song
    const { windowedEvents, scrollLeft, canvasWidth, transform } = this

    const controllerEvents = (selectedTrack?.events ?? []).filter(filter)
    const events = windowedEvents.filter(filter)

    // Add controller events in the outside of the visible area

    const tickStart = scrollLeft / transform.pixelsPerTick
    const tickEnd = (scrollLeft + canvasWidth) / transform.pixelsPerTick

    const prevEvent = maxBy(
      controllerEvents.filter((e) => e.tick < tickStart),
      (e) => e.tick
    )
    const nextEvent = minBy(
      controllerEvents.filter((e) => e.tick > tickEnd),
      (e) => e.tick
    )

    return [prevEvent, ...events, nextEvent].filter(isNotUndefined)
  }

  get modulationEvents(): TrackEventOf<ControllerEvent>[] {
    return this.filteredEvents(isModulationEvent)
  }

  get expressionEvents(): TrackEventOf<ControllerEvent>[] {
    return this.filteredEvents(isExpressionEvent)
  }

  get panEvents(): TrackEventOf<ControllerEvent>[] {
    return this.filteredEvents(isPanEvent)
  }

  get volumeEvents(): TrackEventOf<ControllerEvent>[] {
    return this.filteredEvents(isVolumeEvent)
  }

  get pitchBendEvents(): TrackEventOf<PitchBendEvent>[] {
    return this.filteredEvents(isPitchBendEvent)
  }

  get sustainEvents(): TrackEventOf<ControllerEvent>[] {
    return this.filteredEvents(
      isControllerEventWithType(MIDIControlEvents.SUSTAIN)
    )
  }

  get currentVolume(): number | undefined {
    return this.rootStore.song.selectedTrack?.getVolume(
      this.rootStore.player.position
    )
  }

  get currentPan(): number | undefined {
    return this.rootStore.song.selectedTrack?.getPan(
      this.rootStore.player.position
    )
  }

  get currentTempo(): number | undefined {
    return this.rootStore.song.conductorTrack?.getTempo(
      this.rootStore.player.position
    )
  }

  get currentMBTTime(): string {
    return getMBTString(
      this.rootStore.song.measures,
      this.rootStore.player.position,
      this.rootStore.song.timebase
    )
  }

  get cursorX(): number {
    return this.transform.getX(this.rootStore.player.position)
  }

  get quantizer(): Quantizer {
    return new Quantizer(this.rootStore, this.quantize, this.isQuantizeEnabled)
  }

  get enabledQuantizer(): Quantizer {
    return new Quantizer(this.rootStore, this.quantize, true)
  }

  get controlCursor(): string {
    return this.mouseMode === "pencil"
      ? `url("${cursorPencil}") 0 20, pointer`
      : "auto"
  }
}
