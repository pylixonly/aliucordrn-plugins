export interface Activity {
    name: string;
    type: ActivityTypes;
    state?: string;
    details: string;
    timestamps?: {
        start?: Number;
        end?: Number;
    },
    assets?: {
        large_image?: string;
        large_text?: string;
        small_image?: string;
        small_text?: string;
    },
    buttons?: Array<{
        label: string;
        url: string;
    }>;
}

export enum ActivityTypes {
    GAME = 0,
    STREAMING = 1,
    LISTENING = 2,
    WATCHING = 3,
    COMPETING = 5
}