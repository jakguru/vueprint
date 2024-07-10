import Bowser from "bowser";

export interface BrowserInfo {
    browserName: string;
    browserVersion: string;
    osName: string;
    osVersion: string;
    platformType: string;
    engineName: string;
    engineVersion: string;
}

/**
 * Get the current browser information
 * @returns BrowserInfo
 */
export const getBrowserInfo = () => {
    if (!window || !window.navigator || !window.navigator.userAgent) {
        return {
            browserName: "SSR",
            browserVersion: "0.0.0",
            osName: "Unknown",
            osVersion: "0.0.0",
            platformType: "SSR",
            engineName: "SSR",
            engineVersion: "0.0.0",
        };
    }
    const parsed = Bowser.parse(window.navigator.userAgent);
    return {
        browserName: parsed.browser.name || "Unknown",
        browserVersion: parsed.browser.version || '0.0.0',
        osName: parsed.os.name || "Unknown",
        osVersion: parsed.os.version || '0.0.0',
        platformType: parsed.platform.type || "Unknown",
        engineName: parsed.engine.name || "Unknown",
        engineVersion: parsed.engine.version || '0.0.0',
    };
}