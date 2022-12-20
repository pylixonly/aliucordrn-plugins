import { Logger } from "aliucord/utils/Logger";
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
            if (track.name.replace(/\s/g, '') !== result.snippet.title.replace(/\s/g, '')) {
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

    async getDuration(videoId: string): Promise<number> {
        RPLogger.info(`Fetching duration for ${videoId}..`);
        const video = await fetch(`${this.apiUrl}/videos?part=contentDetails&id=${videoId}`);
        const videoResults = await video.json();
        const [videoResult] = videoResults.items;

        RPLogger.info(`Duration for ${videoId} is ${videoResult.contentDetails.duration}`);

        return this.convertToSeconds(videoResult.contentDetails.duration);
    }

    convertToSeconds(duration): number {
        let match = duration
            .match(/PT(\d+H)?(\d+M)?(\d+S)?/)
            .slice(1)
            .map((x: string) => x?.replace(/\D/, ''));

        return (
            (Number(match[0]) || 0) * 3600 +
            (Number(match[1]) || 0) * 60 +
            (Number(match[2]) || 0)
        );
    }
}