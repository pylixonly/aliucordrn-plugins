import { RPLogger } from "../utils/Logger";
import { Track, YoutubeTrack } from "../types/Track";

export default class YoutubeClient {
    apiUrl: string;
    
    constructor(apiUrl = 'https://yt.lemnoslife.com/noKey', apiKey?) {
        this.apiUrl = apiUrl;
    }

    applyToTrack(yt: YoutubeTrack, track: Track): Track {
        return {
            ...track,
            albumArt: yt.albumArt,
            ytUrl: `https://music.youtube.com/watch?v=${yt.videoId}`
        }
    }

    async findYoutubeEquivalent(track: Track): Promise<YoutubeTrack | null> {
        const searchParam = `${track.artist} - "${track.name}" on ${track.album}`;
        
        RPLogger.info(`Begin searching for ${searchParam} on Youtube...`);
        const search = await fetch(`${this.apiUrl}/search?part=snippet&q=${searchParam} "Provided to Youtube by"`)
        const results = await search.json();

        if (results.items.length === 0) {
            RPLogger.info(`No results found for ${searchParam}`);
            return null;
        }

        RPLogger.info(`Found ${results.items.length} results for ${searchParam}`);

        for (const result of results.items) {
            // check if the track name matches, whitespaces are removed
            if (track.name.replace(/\s/g, '') !== result.snippet.title.replace(/\s/g, '').replace(/&quot;/g, '"')) {
                RPLogger.info(`Track name mismatch: ${track.name} ≠ ${result.snippet.title}`);
                continue;
            }

            RPLogger.info(`Track name matches: ${track.name} = ${result.snippet.title}`);

            return {
                name: result.snippet.title,
                description: result.snippet.description,
                artist: result.snippet.channelTitle,
                albumArt: `https://i.ytimg.com/vi/${result.id.videoId}/maxresdefault.jpg`,
                videoId: result.id.videoId,
                url: `https://www.youtube.com/watch?v=${result.id.videoId}`,
            } as YoutubeTrack;
        }

        return null; // not found
    }
}