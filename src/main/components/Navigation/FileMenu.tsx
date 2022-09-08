import { Divider, MenuItem } from "@mui/material"
import { useStarknetCall } from "@starknet-react/core"
import { observer } from "mobx-react-lite"
import { FC } from "react"
import { localized } from "../../../common/localize/localizedString"
import { createSong } from "../../actions"

import {
  openFile,
  openSoundFontFile,
  saveFile,
  saveFileAs,
  saveStarknetFile,
} from "../../actions/file"
import { useCounterContract } from "../../hooks/useCounterContract"
import { useStores } from "../../hooks/useStores"

export const FileMenu: FC<{ close: () => void }> = observer(({ close }) => {
  const rootStore = useStores()
  const { contract: counter } = useCounterContract()
  const { data: counterResult } = useStarknetCall({
    contract: counter,
    method: "counter",
    args: [],
    options: { watch: true },
  })

  function hex2bin2(hex: String) {
    hex = hex.replace("0x", "").toLowerCase()
    var out = ""
    for (var c of hex) {
      switch (c) {
        case "0":
          out += "0000"
          break
        case "1":
          out += "0001"
          break
        case "2":
          out += "0010"
          break
        case "3":
          out += "0011"
          break
        case "4":
          out += "0100"
          break
        case "5":
          out += "0101"
          break
        case "6":
          out += "0110"
          break
        case "7":
          out += "0111"
          break
        case "8":
          out += "1000"
          break
        case "9":
          out += "1001"
          break
        case "a":
          out += "1010"
          break
        case "b":
          out += "1011"
          break
        case "c":
          out += "1100"
          break
        case "d":
          out += "1101"
          break
        case "e":
          out += "1110"
          break
        case "f":
          out += "1111"
          break
        default:
          return ""
      }
    }

    return out
  }

  function hex2bin(hex: String) {
    let bin = ""
    let bitsInHex = 4

    Array.from(hex).forEach(function (char) {
      let currentBin = parseInt(char, 16).toString(2)

      if (currentBin.length < bitsInHex) {
        let padding = "0".repeat(bitsInHex - currentBin.length)
        currentBin = padding + currentBin
      }

      bin += currentBin
    })

    return bin
  }

  function text2Binary(string: String) {
    return string
      .split("")
      .map(function (char) {
        return char.charCodeAt(0).toString(2)
      })
      .join(" ")
  }

  function a2hex(str: String) {
    var arr = []
    for (var i = 0, l = str.length; i < l; i++) {
      var hex = Number(str.charCodeAt(i)).toString(16)
      arr.push(hex)
    }
    return arr.join("")
  }

  function hex2a(hexx: String) {
    var hex = hexx.toString()
    //force conversion
    var str = ""
    for (var i = 0; i < hex.length; i += 2)
      str += String.fromCharCode(parseInt(hex.substr(i, 2), 16))
    return str
  }

  const onClickNew = () => {
    const { song } = rootStore
    close()
    if (
      song.isSaved ||
      confirm(localized("confirm-new", "Are you sure you want to continue?"))
    ) {
      createSong(rootStore)()
    }
  }

  const onClickOpen = async () => {
    const { song } = rootStore
    close()
    try {
      if (
        song.isSaved ||
        confirm(localized("confirm-open", "Are you sure you want to continue?"))
      ) {
        await openFile(rootStore)
      }
    } catch (e) {
      rootStore.toastStore.showError((e as Error).message)
    }
  }

  const onClickLoadSoundFont = async () => {
    const { song } = rootStore
    close()
    openSoundFontFile(rootStore)
  }

  const onClickSave = async () => {
    close()
    await saveFile(rootStore)
  }

  const onClickSaveAs = async () => {
    close()
    await saveFileAs(rootStore)
  }

  const onClickOpenStarkNet = async () => {
    const { song } = rootStore
    close()
    try {
      if (
        song.isSaved ||
        confirm(localized("confirm-open", "Are you sure you want to continue?"))
      ) {
        await openFile(rootStore)
      }
    } catch (e) {
      rootStore.toastStore.showError((e as Error).message)
    }
  }

  const onClickStarknet = async () => {
    const { song } = rootStore

    const fileHandle = rootStore.song.fileHandle
    if (fileHandle === null) {
      await saveFileAs(rootStore)
      return
    }

    // fs.writeFile("/Users/caseywescott/Desktop/some.jpeg", "data", "binary")

    if (counterResult) {
      let buffer: any[] = []

      for (let i = 0; i < 20; i++) {
        buffer = buffer.concat(counterResult[0][i].toArray())
      }

      var view = new Uint8Array(buffer)
      console.log(view, buffer, counterResult)

      await saveStarknetFile(rootStore, view)
    }
    close()
    try {
      if (
        song.isSaved ||
        confirm(localized("confirm-open", "Are you sure you want to continue?"))
      ) {
        //await openStarkNetFile(rootStore, 'hello starknet', 'hi')
      }
    } catch (e) {
      rootStore.toastStore.showError((e as Error).message)
    }

    //close()
  }

  return (
    <>
      <MenuItem onClick={onClickNew}>{localized("new-song", "New")}</MenuItem>

      <Divider />

      <MenuItem onClick={onClickOpen}>
        {localized("open-song", "Open")}
      </MenuItem>
      <MenuItem onClick={onClickLoadSoundFont}>
        {localized("load-soundfont", "Load SoundFont")}
      </MenuItem>

      <MenuItem
        onClick={onClickSave}
        disabled={rootStore.song.fileHandle === null}
      >
        {localized("save-song", "Save")}
      </MenuItem>

      <MenuItem onClick={onClickSaveAs}>
        {localized("save-as", "Save As")}
      </MenuItem>
      <MenuItem onClick={onClickOpenStarkNet}>
        {localized("Open Starknet", "Open Starknet")}
      </MenuItem>

      <MenuItem onClick={onClickStarknet}>
        {localized("Starknet", "Save Starknet")}
      </MenuItem>
    </>
  )
})
