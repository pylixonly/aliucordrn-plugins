import { Logger } from "aliucord/utils/Logger";
import { Activity, ActivityTypes } from "../types/Activity";
import { Track } from "../types/Track";
import { RPLogger } from "../utils/Logger";
import { defaults, settings as RichPresenceSettings } from "../utils/Settings";

export default class LastFMClient {
    apiKey: string;
    username?: string;
    logger: Logger;

    updateInterval?: NodeJS.Timer;

    constructor(apiKey) {
        this.apiKey = apiKey ?? defaults.lastfm_apikey;
        this.logger = RPLogger;
    }

    setUsername(username: string) {
        if (!username) {
            this.logger.error(`[instance: ${this.apiKey}] Username is empty`);
            throw new Error('Username is empty');
        }
        this.username = username;
        return this;
    }

    async stream(callback): Promise<NodeJS.Timer> {
        this.clear();
        let currentTrack = await this.fetchCurrentScrobble();
        if (currentTrack.nowPlaying)
            callback(currentTrack);

        const getUnixSecond = () => Date.now() / 1000 | 0;

        let lastCalled = getUnixSecond();

        return this.updateInterval = setInterval(async () => {
            const newTrack = await this.fetchCurrentScrobble();

            // stop RPC when the user hasn't scrobbled in 30 seconds
            if (!newTrack.nowPlaying && getUnixSecond() - lastCalled > 30) {
                callback(null);
                return;
            }

            if (newTrack.url !== currentTrack.url && newTrack.nowPlaying) {
                currentTrack = newTrack;
                callback(currentTrack);
                lastCalled = getUnixSecond();
            }
        }, 10000);
    }

    clear() {
        this.updateInterval && clearInterval(this.updateInterval);
    }
    
    async fetchCurrentScrobble() {
        if (!this.username) {
            this.logger.error(`[instance: ${this.apiKey}] No username set`);
            throw new Error('No username set');
        }

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
            loved: track.loved === '1',
        }
    }

    mapToRPC(track : Track): Activity {
        return {
            name: 'Music',
            type: RichPresenceSettings.lastFm.get("listening_to") ? ActivityTypes.LISTENING : ActivityTypes.GAME,
            details: track.name,
            state: `by ${track.artist}`,
            ...((RichPresenceSettings.lastFm.get("show_album_art") ?? true) && track.album ? {
                assets: {
                    large_image: track.albumArt,
                    large_text: `on ${track.album}`,
                    ...(track.loved && RichPresenceSettings.lastFm.get("add_loved_icon") ? {
                        small_image: 'loved',
                        small_text: 'Loved' 
                    } : {})
                }
            } : {}),
            ...(RichPresenceSettings.lastFm.get("add_ytm_button") ?  { buttons: [
                { label: 'Listen on Youtube Music', url: track.ytUrl }
            ]} : {}),
        }
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
