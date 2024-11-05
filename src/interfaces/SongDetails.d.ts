interface SongDetails {
  id: string;
  art: string | undefined;
  title: string;
  artist: string;
  album: string;
}


interface SongEntry {
  song: SongDetails;
}
