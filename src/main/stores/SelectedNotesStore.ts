export default class SelectionNotesStore<State> {
  SelectedNotes: Object = {}

  push(currentState: State) {
    this.SelectedNotes = currentState
  }
}
