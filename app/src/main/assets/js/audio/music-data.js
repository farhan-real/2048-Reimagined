(function() {
  const TRACK_FILES = [
    "0BiT - Fax Spider 2.1 kg.mp3",
    "Dubmood - 4everblue morninsky.mp3",
    "Dubmood - Chiptune.mp3",
    "Dubmood - Colorful Troupe.mp3",
    "Dubmood - Insert No Coins.mp3",
    "Dubmood - InsertNoCoins Edit.mp3",
    "Dubmood - Keygen 23.mp3",
    "Dubmood - Keygen 31 Edit.mp3",
    "Dubmood - Keygen 31.mp3",
    "Dubmood - Keygen 5.mp3",
    "Dubmood - Paradox 2.mp3",
    "Dubmood - Paradox 3.mp3",
    "Dubmood - Rez 1911 Cracktro 6.mp3",
    "Dubmood - Track tracking.mp3",
    "Dubmood and Zabutom - Supersquatting (Razor 1911 intro edit).mp3",
    "GEAR - Acala DVD iPod Ripper 2.3.2.mp3",
    "Jakim - Whatever it means.mp3",
    "ko0x - Starlight sugar moon.mp3",
    "Moodmode - 8-bit Arcade Mode.mp3",
    "Oxbow - artcore-hidden.mp3",
    "rez & kenet - Unreeeal superhero 3.mp3",
    "SnD - VB Decompiler Pro 7.6 crk.mp3",
    "Zabutom - Final Blast.mp3",
    "Zalza - Dancing Midgets.mp3",
    "Zalza vs Floppi - Alanya Spring.mp3"
  ];

  function parseTrackFilename(filename) {
    const cleanName = filename.replace(/\.(mp3|flac|wav|ogg|m4a)$/i, "");
    const parts = cleanName.split(" - ");

    let rawArtists = "Unknown Artist";
    let title = cleanName;

    if (parts.length >= 2) {
      rawArtists = parts[0].trim();
      title = parts.slice(1).join(" - ").trim();
    }

    const artistList = rawArtists
      .split(/\s*(?:,|&|\band\b|\bvs\.?\b|\bfeat\.?\b|\bft\.?|\bx\b)\s*/i)
      .map(a => a.trim())
      .filter(Boolean);

    const formattedArtists = artistList.length > 1
      ? artistList.slice(0, -1).join(", ") + " & " + artistList[artistList.length - 1]
      : (artistList[0] || rawArtists);

    return {
      id: filename,
      filename: filename,
      path: encodeURI("music/" + filename),
      title: title,
      artists: artistList,
      artistText: formattedArtists
    };
  }

  window.MusicData = {
    getAvailableTracks: () => TRACK_FILES.map(parseTrackFilename),
    parseTrackFilename: parseTrackFilename
  };
})();