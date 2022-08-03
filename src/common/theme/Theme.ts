export interface Theme {
  font: string
  canvasFont: string
  themeColor: string
  backgroundColor: string
  secondaryBackgroundColor: string
  dividerColor: string
  textColor: string
  secondaryTextColor: string
  tertiaryTextColor: string
  pianoKeyBlack: string
  pianoKeyWhite: string
  pianoBlackKeyLaneColor: string
  ghostNoteColor: string
  recordColor: string
}

export const defaultTheme: Theme = {
  font: "Inter, -apple-system, BlinkMacSystemFont, Avenir, Lato",
  canvasFont: "Arial",
  themeColor: "hsl(230, 70%, 55%)",
  textColor: "#ffffff",
  secondaryTextColor: "#8e96ab",
  tertiaryTextColor: "#5a6173",
  dividerColor: "#454a58",
  backgroundColor: "hsl(228, 16%, 18%)",
  secondaryBackgroundColor: "hsl(227, 16%, 32%)",
  pianoKeyBlack: "#272a36",
  pianoKeyWhite: "#fbfcff",
  pianoBlackKeyLaneColor: "hsl(228, 16%, 14%)",
  ghostNoteColor: "#444444",
  recordColor: "#dd3c3c",
}
