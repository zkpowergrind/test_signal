import { NoteEvent } from "../../common/track"

export default class SelectionNotesStore<State> {
  selectedNotes: NoteEvent[] = []

  push(currentState: State) {
    this.selectedNotes = currentState as any
  }
}
