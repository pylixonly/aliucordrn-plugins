export type Track = {
    name: string;
    artist: string;
    album: string;
    albumArt: string;
    url: string;
    date: string | number | Date;
    duration?: number;
    nowPlaying: boolean;
    loved: boolean;
};

export type YoutubeTrack = {
    name: string;
    description: string;
    artist: string;
    albumArt: string;
    videoId: string;
    url: string;
    duration: number;
}