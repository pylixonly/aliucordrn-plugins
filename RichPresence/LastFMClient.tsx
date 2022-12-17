import { Logger } from "aliucord/utils/Logger";
import { Activity } from ".";

export enum ActivityTypes {
    GAME = 0,
    STREAMING = 1,
    LISTENING = 2,
    WATCHING = 3,
    COMPETING = 5
}

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
    // or when the user stops scrobbling (10 minutes timeout with undefined as an argument)
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
                    callback(undefined);
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
        const [track] = response.recenttracks.track;
        this.logger.info('Mapped track:', this.mapTrack(track));
        return this.mapTrack(track);
    }

    mapTrack(track) {
        return {
            name: track.name,
            artist: track.artist.name,
            album: track.album['#text'],
            albumArt: this.polishAlbumArt(track.image[3]['#text']),
            url: track.url,
            date: track.date?.['#text'] ?? 'now',
            nowPlaying: Boolean(track['@attr']?.nowplaying),
            loved: track.loved === '1'
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
                    ...(track.loved ? { 
                        small_image: 'loved',
                        small_text: 'Loved' 
                    } : {})
                }
            } : {}),
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
    
        if (defaultCoverHashes.filter(x => albumArt.includes(x)).length > 0) {
            return "https://www.last.fm/static/images/lastfm_avatar_twitter.52a5d69a85ac.png";
        }
        
        return albumArt;
    }
}