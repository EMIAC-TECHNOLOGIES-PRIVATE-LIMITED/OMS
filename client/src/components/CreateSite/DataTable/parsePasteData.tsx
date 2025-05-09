export function parsePasteData(clipboardData: string) {
    return clipboardData
      .trim()
      .replace(/\r\n?/g, "\n")
      .split("\n")
      .map((row) => (row.length === 0 ? [""] : row.split("\t")));
  }
  