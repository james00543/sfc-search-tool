export interface SFCConfig {
    STATION_ID: string;
    PROJECT: string;
    EMP_NO: string;
    MODEL_NAME: string;
}

export interface SearchParams {
    SN: string;
}

export interface GetConfigurationResponse {
    [key: string]: any;
}

export interface CheckRouteResponse {
    [key: string]: any;
}
