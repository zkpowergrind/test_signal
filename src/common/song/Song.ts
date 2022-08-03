import { DocumentReference } from "firebase/firestore"
import pullAt from "lodash/pullAt"
import {
  action,
  computed,
  makeObservable,
  observable,
  reaction,
  transaction,
} from "mobx"
import { createModelSchema, list, object, primitive } from "serializr"
import { TIME_BASE } from "../../main/Constants"
import { FirestoreSong, FirestoreSongData } from "../../main/firebase/song"
import { isNotUndefined } from "../helpers/array"
import { Measure } from "../measure/Measure"
import { getMeasuresFromConductorTrack } from "../measure/MeasureList"
import { collectAllEvents, PlayerEvent } from "../player/PlayerEvent"
import Track from "../track"

const END_MARGIN = 480 * 30

export default class Song {
  tracks: Track[] = []
  selectedTrackId: number = 0
  filepath: string = ""
  timebase: number = TIME_BASE
  name: string = ""
  fileHandle: FileSystemFileHandle | null = null
  firestoreReference: DocumentReference<FirestoreSong> | null = null
  firestoreDataReference: DocumentReference<FirestoreSongData> | null = null
  isSaved = true

  constructor() {
    makeObservable(this, {
      addTrack: action,
      removeTrack: action,
      selectTrack: action,
      insertTrack: action,
      conductorTrack: computed,
      selectedTrack: computed,
      measures: computed,
      endOfSong: computed,
      allEvents: computed({ keepAlive: true }),
      tracks: observable.shallow,
      selectedTrackId: observable,
      filepath: observable,
      timebase: observable,
      name: observable,
      isSaved: observable,
    })

    reaction(
      () => [
        this.tracks.map((t) => ({ channel: t.channel, events: t.events })),
        this.name,
      ],
      () => (this.isSaved = false)
    )
  }

  insertTrack(t: Track, index: number) {
    // 最初のトラックは Conductor Track なので channel を設定しない
    if (t.channel === undefined && this.tracks.length > 0) {
      t.channel = t.channel || this.tracks.length - 1
    }
    this.tracks.splice(index, 0, t)
  }

  addTrack(t: Track) {
    this.insertTrack(t, this.tracks.length)
  }

  removeTrack(id: number) {
    transaction(() => {
      pullAt(this.tracks, id)
      this.selectTrack(Math.min(id, this.tracks.length - 1))
    })
  }

  selectTrack(id: number) {
    if (id === this.selectedTrackId) {
      return
    }
    this.selectedTrackId = id
  }

  get conductorTrack(): Track | undefined {
    return this.tracks.find((t) => t.isConductorTrack)
  }

  get selectedTrack(): Track | undefined {
    return this.tracks[this.selectedTrackId]
  }

  getTrack(id: number): Track | undefined {
    return this.tracks[id]
  }

  get measures(): Measure[] {
    const conductorTrack = this.conductorTrack
    if (conductorTrack === undefined) {
      return []
    }
    return getMeasuresFromConductorTrack(conductorTrack, this.timebase)
  }

  get endOfSong(): number {
    const eos = Math.max(
      ...this.tracks.map((t) => t.endOfTrack).filter(isNotUndefined)
    )
    return (eos ?? 0) + END_MARGIN
  }

  get allEvents(): PlayerEvent[] {
    return collectAllEvents(this.tracks)
  }
}

createModelSchema(Song, {
  tracks: list(object(Track)),
  selectedTrackId: primitive(),
  filepath: primitive(),
  timebase: primitive(),
})
