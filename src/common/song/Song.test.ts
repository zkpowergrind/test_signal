import * as fs from "fs"
import * as path from "path"
import { deserialize, serialize } from "serializr"
import { songFromMidi } from "../midi/midiConversion"
import Song from "./Song"
import { emptySong } from "./SongFactory"

describe("Song", () => {
  const song = songFromMidi(
    fs.readFileSync(path.join(__dirname, "../../../testdata/tracks.mid")).buffer
  )

  it("fromMidi", () => {
    expect(song).not.toBeNull()
    const { tracks } = song
    expect(tracks.length).toBe(18)

    expect(tracks[0].isConductorTrack).toBeTruthy()
    expect(!tracks[1].isConductorTrack).toBeTruthy()
    expect(tracks[1].channel).toBe(0)
    expect(tracks[2].channel).toBe(0)
    expect(tracks[3].channel).toBe(1)
    expect(tracks[17].channel).toBe(15)

    expect(tracks[0].getTempo(240)).toBe(128)
    expect(tracks[2].getVolume(193)).toBe(100)
    expect(tracks[2].getPan(192)).toBe(1)
    expect(tracks[2].programNumber).toBe(29)
  })

  it("should be serializable", () => {
    const song = emptySong()
    song.filepath = "abc"
    const x = serialize(song)
    const s = deserialize(Song, x)
    expect(s.filepath).toBe("abc")
    expect(s.tracks.length).toBe(song.tracks.length)
  })
})
