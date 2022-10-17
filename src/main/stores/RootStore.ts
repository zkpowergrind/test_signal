import { makeObservable, observable } from "mobx"
import Player from "../../common/player"
import Song, { emptySong } from "../../common/song"
import TrackMute from "../../common/trackMute"
import { SerializedState } from "../actions/history"
import { GroupOutput } from "../services/GroupOutput"
import { MIDIInput, previewMidiInput } from "../services/MIDIInput"
import { MIDIRecorder } from "../services/MIDIRecorder"
import { SoundFontSynth } from "../services/SoundFontSynth"
import ArrangeViewStore from "./ArrangeViewStore"
import { AuthStore } from "./AuthStore"
import { CloudFileStore } from "./CloudFileStore"
import { DialogStore } from "./DialogStore"
import { ExportStore } from "./ExportStore"
import HistoryStore from "./HistoryStore"
import { MIDIDeviceStore } from "./MIDIDeviceStore"
import PianoRollStore from "./PianoRollStore"
import { PromptStore } from "./PromptStore"
import { registerReactions } from "./reactions"
import RootViewStore from "./RootViewStore"
import Router from "./Router"
import SelectedNotesStore from "./SelectedNotesStore"
import { StarknetStore } from "./StarknetStore"
import TempoEditorStore from "./TempoEditorStore"
import { ToastStore } from "./ToastStore"

export default class RootStore {
  song: Song = emptySong()
  readonly router = new Router()
  readonly trackMute = new TrackMute()
  readonly historyStore = new HistoryStore<SerializedState>()
  readonly rootViewStore = new RootViewStore()
  readonly pianoRollStore: PianoRollStore
  readonly arrangeViewStore = new ArrangeViewStore(this)
  readonly tempoEditorStore = new TempoEditorStore(this)
  readonly midiDeviceStore = new MIDIDeviceStore()
  readonly exportStore = new ExportStore()
  readonly toastStore = new ToastStore()
  readonly authStore = new AuthStore()
  readonly dialogStore = new DialogStore()
  readonly promptStore = new PromptStore()
  readonly cloudFileStore = new CloudFileStore()
  readonly player: Player
  readonly synth: SoundFontSynth
  readonly synthGroup = new GroupOutput()
  readonly midiInput = new MIDIInput()
  readonly midiRecorder: MIDIRecorder
  readonly starknet = new StarknetStore()
  readonly selectedNotes = new SelectedNotesStore()

  constructor() {
    makeObservable(this, {
      song: observable.ref,
    })

    const context = new (window.AudioContext || window.webkitAudioContext)()
    this.synth = new SoundFontSynth(context, {
      soundFontURL:
        "https://cdn.jsdelivr.net/gh/ryohey/signal@4569a31/public/A320U.sf2",
    })
    // "https://cdn.jsdelivr.net/gh/ryohey/signal@4569a31/public/A320U.sf2"
    //https://github.com/caseywescott/soundfonts/blob/main/The_Nes_Soundfont5.sf2?raw=true

    const metronomeSynth = new SoundFontSynth(context, {
      soundFontURL:
        "https://cdn.jsdelivr.net/gh/ryohey/signal@6959f35/public/A320U_drums.sf2",
    })
    this.synthGroup.outputs.push({ synth: this.synth, isEnabled: true })

    this.player = new Player(
      this.synthGroup,
      metronomeSynth,
      this.trackMute,
      this
    )
    this.midiRecorder = new MIDIRecorder(this.player, this)

    this.pianoRollStore = new PianoRollStore(this)

    const preview = previewMidiInput(this)

    this.midiInput.onMidiMessage = (e) => {
      preview(e)
      this.midiRecorder.onMessage(e)
    }

    this.pianoRollStore.setUpAutorun()
    this.arrangeViewStore.setUpAutorun()
    this.tempoEditorStore.setUpAutorun()

    registerReactions(this)
  }
}
