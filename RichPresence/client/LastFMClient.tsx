import { Logger } from "aliucord/utils/Logger";
import { Activity, ActivityTypes } from "../types/Activity";

export default class LastFMClient {
    apiKey: string;
    username: string;
    logger: Logger;

    updateInterval?: Promise<void>;

    constructor(apiKey, username, logger) {
        this.apiKey = apiKey;
        this.username = username;
        this.logger = logger;
    }

    // callback is invoked when the user starts scrobbling a new song
    // or when the user stops scrobbling (10 minutes timeout with null as argument
    async stream(callback) {
        let currentTrack = await this.fetchCurrentScrobble();
        if (currentTrack.nowPlaying)
            callback(currentTrack);

        const getUnixSecond = () => Date.now() / 1000 | 0;

        let lastCalled = getUnixSecond();

        return this.updateInterval = new Promise(async () => {
            return setInterval(async() => {
                const newTrack = await this.fetchCurrentScrobble();

                // stop RPC when the user hasn't scrobbled in 10 minutes
                if (!newTrack.nowPlaying && getUnixSecond() - lastCalled > 600) {
                    // clearInterval(this.updateInterval);
                    callback(null);
                    return;
                }

                if (newTrack.url !== currentTrack.url && newTrack.nowPlaying) {
                    currentTrack = newTrack;
                    callback(currentTrack);
                    lastCalled = getUnixSecond();
                }
            }, 10000);
        });
    }

    
    async fetchCurrentScrobble() {
        const params = new URLSearchParams({
            'method': 'user.getrecenttracks',
            'user': this.username,
            'api_key': this.apiKey,
            'format': 'json',
            'limit': '1',
            'extended': '1'
        }).toString();

        const response = await fetch(`http://ws.audioscrobbler.com/2.0/?${params}`).then(x => x.json());
        
        const trackDataParams = new URLSearchParams({
            method: 'track.getInfo',
            user: this.username,
            api_key: this.apiKey,
            format: 'json',
            artist: response.recenttracks.track[0].artist.name,
            track: response.recenttracks.track[0].name
        }).toString();

        const trackData = await fetch(`http://ws.audioscrobbler.com/2.0/?${trackDataParams}`).then(x => x.json());
        
        const [track] = response.recenttracks.track;
        return this.mapTrack(track, trackData);
    }

    mapTrack(track, trackData) {
        return {
            name: track.name,
            artist: track.artist.name,
            album: track.album['#text'],
            albumArt: this.polishAlbumArt(track.image[3]['#text']),
            duration: Number(trackData.track.duration) / 1000 | 0,
            url: track.url,
            date: track.date?.['#text'] ?? 'now',
            nowPlaying: Boolean(track['@attr']?.nowplaying),
            loved: track.loved === '1',
            playCount: trackData.track.playcount
        }
    }

    mapToRPC(track): Activity | null {
        return track ? {
            name: 'Music',
            type: ActivityTypes.LISTENING,
            details: track.name,
            state: `by ${track.artist}`,
            ...(track.album ? {
                assets: {
                    large_image: track.albumArt,
                    large_text: `on ${track.album}`,
                    ...(track.loved && false ? { 
                        small_image: 'loved',
                        small_text: 'Loved' 
                    } : {})
                }
            } : {}),
            ...(track.duration !== 0 ? { 
                timestamps: {
                    start: (Date.now() / 1000 | 0),
                    end: (Date.now() / 1000 | 0) + track.duration
                }
            }: {}),
            buttons: [
                { label: 'Listen', url: track.url }
            ],
            application_id: "463151177836658699"
        } : null
    }

    polishAlbumArt(albumArt) {
        const defaultCoverHashes = [
            "2a96cbd8b46e442fc41c2b86b821562f",
            "c6f59c1e5e7240a4c0d427abd71f3dbb",
        ];
    
        if (defaultCoverHashes.some(x => albumArt.includes(x))) {
            return undefined;
        }
        
        return albumArt;
    }
}