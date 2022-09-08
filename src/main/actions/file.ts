import { songFromMidi, songToMidi } from "../../common/midi/midiConversion"
import { writeFile } from "../services/fs-helper"
import { GroupOutput } from "../services/GroupOutput"
import { SoundFontSynth } from "../services/SoundFontSynth"
import RootStore from "../stores/RootStore"
import { setSong } from "./song"

//import { useStores } from "../../hooks/useStores"
//import { useStarknetCall } from "@starknet-react/core"
//import { useCounterContract } from "../../hooks/useCounterContract"

// URL parameter for automation purposes used in scripts/perf/index.js
// /edit?disableFileSystem=true

function str2ab(str: String) {
  var buf = new ArrayBuffer(str.length * 2) // 2 bytes for each char
  var bufView = new Uint16Array(buf)
  for (var i = 0, strLen = str.length; i < strLen; i++) {
    bufView[i] = str.charCodeAt(i)
  }
  return buf
}

export const disableFileSystem =
  new URL(window.location.href).searchParams.get("disableFileSystem") === "true"

export const hasFSAccess =
  ("chooseFileSystemEntries" in window || "showOpenFilePicker" in window) &&
  !disableFileSystem

export const openFile = async (rootStore: RootStore) => {
  let fileHandle: FileSystemFileHandle
  try {
    fileHandle = (
      await window.showOpenFilePicker({
        types: [
          {
            description: "MIDI file",
            accept: { "audio/midi": [".mid"] },
          },
        ],
      })
    )[0]
  } catch (ex) {
    if ((ex as Error).name === "AbortError") {
      return
    }
    const msg = "An error occured trying to open the file."
    console.error(msg, ex)
    alert(msg)
    return
  }
  const file = await fileHandle.getFile()

  const buf = await file.arrayBuffer()

  const starknetdata = new Uint8Array(buf.slice(0, 8))
  console.log(buf)
  console.log("buf")
  console.log(starknetdata)

  var foobar = starknetdata.subarray(0, 2)
  var arrayBuffer = foobar.buffer.slice(
    foobar.byteOffset,
    foobar.byteLength + foobar.byteOffset
  )

  console.log("converted to Uint8Array")

  console.log(new Uint8Array(arrayBuffer))

  console.log(file)
  const song = await songFromFile(file)
  song.fileHandle = fileHandle
  setSong(rootStore)(song)
}


export const openSoundFontFile = async (rootStore: RootStore) => {
  let fileHandle: FileSystemFileHandle
  try {
    fileHandle = (
      await window.showOpenFilePicker({
        types: [
          {
            description: "SoundFont file",
            accept: { "audio/*": [".sf2"] },
          },
        ],
      })
    )[0]
  } catch (ex) {
    if ((ex as Error).name === "AbortError") {
      return
    }
    const msg = "An error occured trying to open the file."
    console.error(msg, ex)
    alert(msg)
    return
  }
  const file = await fileHandle.getFile()

  const buf = await file.arrayBuffer()
  const context = new (window.AudioContext || window.webkitAudioContext)()
  const synth = new SoundFontSynth(
    context,
    {
      soundFontData: buf
    }
  )
  const synthGroup = new GroupOutput()
  synthGroup.outputs.push({ synth: synth, isEnabled: true })


  rootStore.player.setOutput(synthGroup)
}

export const openStarkNetFile = async (
  rootStore: RootStore,
  data: String,
  data2: String,
  data3: Uint8Array
) => {
  async function getFile() {
    // open file picker, destructure the one element returned array
    // [fileHandle] = await window.showOpenFilePicker();
    // run code with our fileHandle
  }

  console.log(data)
  console.log("0" + data2)
  console.log("openStarkNetFile")

  const data9 = data3.buffer

  //const mfile = writeMidiFile([][], 480);

  let fileHandle: FileSystemFileHandle
  try {
    fileHandle = (
      await window.showOpenFilePicker({
        types: [
          {
            description: "MIDI file",
            accept: { "audio/midi": [".mid"] },
          },
        ],
      })
    )[0]
  } catch (ex) {
    if ((ex as Error).name === "AbortError") {
      return
    }

    const fileHandle = rootStore.song.fileHandle
    if (fileHandle === null) {
      await saveFileAs(rootStore)
      return
    }
    await writeFile(fileHandle, data9)

    const msg = "An error occured trying to open the file."
    console.error(msg, ex)
    alert(msg)
    return
  }

  const file = await fileHandle.getFile()
  const song = await songFromFile(file)
  song.fileHandle = fileHandle
  setSong(rootStore)(song)
}

export const songFromFile = async (file: File) => {
  const buf = await file.arrayBuffer()

  console.log("buf")
  console.log(buf)

  const song = songFromMidi(new Uint8Array(buf))
  if (song.name.length === 0) {
    // Use the file name without extension as the song title
    song.name = file.name.replace(/\.[^/.]+$/, "")
  }
  song.filepath = file.name
  song.isSaved = true
  return song
}

export const saveStarknetFile = async (
  rootStore: RootStore,
  data: Uint8Array
) => {
  const fileHandle = rootStore.song.fileHandle
  if (fileHandle === null) {
    await saveFileAs(rootStore)
    return
  }

  //const data4 = data3.buffer

  try {
    await writeFile(fileHandle, Buffer.from(data))
  } catch (e) {
    console.error(e)
    alert("unable to save file")
  }
}

export const saveFile = async (rootStore: RootStore) => {
  const fileHandle = rootStore.song.fileHandle
  if (fileHandle === null) {
    await saveFileAs(rootStore)
    return
  }

  const data = songToMidi(rootStore.song).buffer
  try {
    await writeFile(fileHandle, data)
  } catch (e) {
    console.error(e)
    alert("unable to save file")
  }
}

export const saveFileAs = async (rootStore: RootStore) => {
  let fileHandle
  try {
    fileHandle = await window.showSaveFilePicker({
      types: [
        {
          description: "MIDI file",
          accept: { "audio/midi": [".mid"] },
        },
      ],
    })
  } catch (ex) {
    if ((ex as Error).name === "AbortError") {
      return
    }
    const msg = "An error occured trying to open the file."
    console.error(msg, ex)
    alert(msg)
    return
  }
  try {
    const data = songToMidi(rootStore.song).buffer
    await writeFile(fileHandle, data)
    rootStore.song.fileHandle = fileHandle
  } catch (ex) {
    const msg = "Unable to save file."
    console.error(msg, ex)
    alert(msg)
    return
  }
}
