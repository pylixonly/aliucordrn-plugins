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

    async findYoutubeEquivalent(track: Track): Promise<YoutubeTrack | null> {
        const searchParam = `${track.artist} - ${track.name} on ${track.album}`;
        const search = await fetch(`${this.apiUrl}/search?part=snippet&q=${searchParam} "Provided to Youtube by"`)
        const results = await search.json();
        
        if (results.length === 0) {
            this.logger.info(`No results found for ${searchParam}`);
            return null;
        }

        const [result] = results.items;

        const parsed = {
            name: result.snippet.title,
            description: result.snippet.description,
            artist: result.snippet.channelTitle,
            albumArt: `https://i.ytimg.com/vi/${result.id.videoId}/maxresdefault.jpg`,
            videoId: result.id.videoId,
            url: `https://www.youtube.com/watch?v=${result.id.videoId}`
        } as YoutubeTrack;

        if (track.name.replace(/\s/g, '') !== parsed.name.replace(/\s/g, '')) {
            this.logger.info(`Track name mismatch: ${track.name} != ${parsed.name}`);
            return null;
        }
        
        // get duration
        const video = await fetch(`${this.apiUrl}/videos?part=contentDetails&id=${result.id.videoId}`);
        const videoResults = await video.json();
        const [videoResult] = videoResults.items;

        parsed.duration = this.convertToSeconds(videoResult.contentDetails.duration);
        return parsed;
    }

    convertToSeconds(duration) {
        var match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
      
        match = match.slice(1).map(function(x) {
          if (x != null) {
              return x.replace(/\D/, '');
          }
        });
      
        var hours = (parseInt(match[0]) || 0);
        var minutes = (parseInt(match[1]) || 0);
        var seconds = (parseInt(match[2]) || 0);
      
        return hours * 3600 + minutes * 60 + seconds;
      }
}