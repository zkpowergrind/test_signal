import { FC } from "react"
import {
  copyTempoSelection,
  deleteTempoSelection,
  duplicateTempoSelection,
  pasteTempoSelection,
  resetTempoSelection,
} from "../../actions/tempo"
import { isTempoEventsClipboardData } from "../../clipboard/clipboardTypes"
import { useStores } from "../../hooks/useStores"
import clipboard from "../../services/Clipboard"
import { isFocusable } from "./isFocusable"
import { KeyboardShortcut } from "./KeyboardShortcut"

export const TempoEditorKeyboardShortcut: FC = () => {
  const rootStore = useStores()

  return (
    <KeyboardShortcut
      actions={[
        {
          code: "Digit1",
          run: () => (rootStore.tempoEditorStore.mouseMode = "pencil"),
        },
        {
          code: "Digit2",
          run: () => (rootStore.tempoEditorStore.mouseMode = "selection"),
        },
        { code: "Escape", run: resetTempoSelection(rootStore) },
        { code: "Backspace", run: deleteTempoSelection(rootStore) },
        { code: "Delete", run: deleteTempoSelection(rootStore) },
        { code: "KeyC", metaKey: true, run: copyTempoSelection(rootStore) },
        {
          code: "KeyX",
          metaKey: true,
          run: () => {
            {
              copyTempoSelection(rootStore)()
              deleteTempoSelection(rootStore)()
            }
          },
        },
        {
          code: "KeyD",
          metaKey: true,
          run: duplicateTempoSelection(rootStore),
        },
      ]}
      onPaste={(e) => {
        if (e.target !== null && isFocusable(e.target)) {
          return
        }

        const text = clipboard.readText()

        if (!text || text.length === 0) {
          return
        }

        const obj = JSON.parse(text)

        if (isTempoEventsClipboardData(obj)) {
          pasteTempoSelection(rootStore)()
        }
      }}
    />
  )
}
