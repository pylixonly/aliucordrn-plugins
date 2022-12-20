export type Track = {
    name: string;
    artist: string;
    album: string;
    albumArt: string;
    url: string;
    date: string | number | Date;
    nowPlaying: boolean;
    loved: boolean;
    ytUrl: string;
};

export type YoutubeTrack = {
    name: string;
    description: string;
    artist: string;
    albumArt: string;
    videoId: string;
    url: string;
}