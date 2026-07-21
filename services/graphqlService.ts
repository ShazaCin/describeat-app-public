
import { MOCK_TITLES, MOCK_AD_TRACKS } from '../data/mockData';
import { Title, AdTrack } from '../types';

const simulateNetworkDelay = <T,>(data: T): Promise<T> => {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(data);
        }, 500 + Math.random() * 500);
    });
};

export const listShazacinMetadataTitles = (): Promise<Title[]> => {
    console.log("Mock GraphQL: listShazacinMetadataTitles called");
    return simulateNetworkDelay(MOCK_TITLES);
};

export const getShazacinMetadataTitles = (titleId: string): Promise<Title | undefined> => {
    console.log(`Mock GraphQL: getShazacinMetadataTitles called with id: ${titleId}`);
    const title = MOCK_TITLES.find(t => t.titleId === titleId);
    return simulateNetworkDelay(title);
};

export const listShazacinMetadataAdTracks = (): Promise<AdTrack[]> => {
    console.log("Mock GraphQL: listShazacinMetadataAdTracks called");
    return simulateNetworkDelay(MOCK_AD_TRACKS);
};

export const getShazacinMetadataAdTracksByTitle = (titleId: string): Promise<AdTrack[]> => {
    console.log(`Mock GraphQL: listShazacinMetadataAdTracks for titleId: ${titleId}`);
    const tracks = MOCK_AD_TRACKS.filter(t => t.titleId === titleId);
    return simulateNetworkDelay(tracks);
};
