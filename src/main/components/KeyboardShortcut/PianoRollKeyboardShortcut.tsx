import { observer } from "mobx-react-lite"
import { FC } from "react"
import { pasteSelection } from "../../actions"
import { pasteControlSelection } from "../../actions/control"
import {
  isControlEventsClipboardData,
  isPianoNotesClipboardData,
} from "../../clipboard/clipboardTypes"
import { useStores } from "../../hooks/useStores"
import clipboard from "../../services/Clipboard"
import { controlPaneKeyboardShortcutActions } from "./controlPaneKeyboardShortcutActions"
import { isFocusable } from "./isFocusable"
import { KeyboardShortcut } from "./KeyboardShortcut"
import { pianoNotesKeyboardShortcutActions } from "./pianoNotesKeyboardShortcutActions"

const SCROLL_DELTA = 24

export const PianoRollKeyboardShortcut: FC = observer(() => {
  const rootStore = useStores()

  // Handle pasting here to allow pasting even when the element does not have focus, such as after clicking the ruler
  const onPaste = (e: ClipboardEvent) => {
    if (e.target !== null && isFocusable(e.target)) {
      return
    }

    const text = clipboard.readText()

    if (!text || text.length === 0) {
      return
    }

    const obj = JSON.parse(text)

    if (isPianoNotesClipboardData(obj)) {
      pasteSelection(rootStore)()
    } else if (isControlEventsClipboardData(obj)) {
      pasteControlSelection(rootStore)()
    }
  }

  return (
    <KeyboardShortcut
      actions={[
        ...(rootStore.pianoRollStore.selectedNoteIds.length > 0
          ? pianoNotesKeyboardShortcutActions(rootStore)
          : []),
        ...(rootStore.pianoRollStore.selectedControllerEventIds.length > 0
          ? controlPaneKeyboardShortcutActions(rootStore)
          : []),
        {
          code: "ArrowUp",
          metaKey: true,
          run: () => rootStore.pianoRollStore.scrollBy(0, SCROLL_DELTA),
        },
        {
          code: "ArrowDown",
          metaKey: true,
          run: () => rootStore.pianoRollStore.scrollBy(0, -SCROLL_DELTA),
        },
        {
          code: "ArrowRight",
          metaKey: true,
          run: () => rootStore.pianoRollStore.scrollBy(-SCROLL_DELTA, 0),
        },
        {
          code: "ArrowLeft",
          metaKey: true,
          run: () => rootStore.pianoRollStore.scrollBy(SCROLL_DELTA, 0),
        },
        {
          code: "Digit1",
          run: () => (rootStore.pianoRollStore.mouseMode = "pencil"),
        },
        {
          code: "Digit2",
          run: () => (rootStore.pianoRollStore.mouseMode = "selection"),
        },
      ]}
      onPaste={onPaste}
    />
  )
})
