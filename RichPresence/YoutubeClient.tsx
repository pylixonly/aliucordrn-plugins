import { Logger } from "aliucord/utils/Logger";

type Track = {
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

export default class YoutubeClient {
    logger: Logger;
    apiUrl: string;
    
    constructor(logger, apiUrl = 'https://yt.lemnoslife.com/noKey', apiKey?) {
        this.logger = logger;
        this.apiUrl = apiUrl;
    }

    applyToTrack(yt: YoutubeTrack, track: Track): Track {
        return {
            ...track,
            albumArt: yt.albumArt,
            url: `https://music.youtube.com/watch?v=${yt.videoId}`,
            duration: yt.duration
        }
    }

    async findYoutubeEquivalent(track: Track): Promise<YoutubeTrack | null> {
        const searchParam = `${track.artist} - "${track.name}" on ${track.album}`;
        this.logger.info(`Begin searching for ${searchParam} on Youtube...`);
        const search = await fetch(`${this.apiUrl}/search?part=snippet&q=${searchParam} "Provided to Youtube by"`)
        const results = await search.json();
        
        if (results.items.length === 0) {
            this.logger.info(`No results found for ${searchParam}`);
            return null;
        }

        this.logger.info(`Found ${results.items.length} results for ${searchParam}`);

        for (const result of results.items) {
            // check if the track name matches, whitespaces are removed
            if (track.name.replace(/\s/g, '') !== result.snippet.title.replace(/\s/g, '')) {
                this.logger.info(`Track name mismatch: ${track.name} != ${result.snippet.name}`);
                continue;
            }

            this.logger.info(`Track name matches: ${track.name} == ${result.snippet.name}`);

            return {
                name: result.snippet.title,
                description: result.snippet.description,
                artist: result.snippet.channelTitle,
                albumArt: `https://i.ytimg.com/vi/${result.id.videoId}/maxresdefault.jpg`,
                videoId: result.id.videoId,
                url: `https://www.youtube.com/watch?v=${result.id.videoId}`,
                // TODO: make fetch duration an option 
                duration: true ? await this.getDuration(result.id.videoId) : 0
            } as YoutubeTrack;
        }

        return null; // not found
    }

    async getDuration(videoId: string): Promise<number> {
        this.logger.info(`Fetching duration for ${videoId}..`);
        const video = await fetch(`${this.apiUrl}/videos?part=contentDetails&id=${videoId}`);
        const videoResults = await video.json();
        const [videoResult] = videoResults.items;

        this.logger.info(`Duration for ${videoId} is ${videoResult.contentDetails.duration}`);

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