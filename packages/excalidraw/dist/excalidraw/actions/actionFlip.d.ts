/// <reference types="react" />
import { ExcalidrawElement } from "../element/types";
import { AppState } from "../types";
export declare const actionFlipHorizontal: {
    name: "flipHorizontal";
    label: string;
    icon: JSX.Element;
    trackEvent: {
        category: "element";
    };
    perform: (elements: readonly ExcalidrawElement[], appState: Readonly<AppState>, _: any, app: import("../types").AppClassProperties) => {
        elements: ExcalidrawElement[];
        appState: Readonly<AppState>;
        commitToHistory: true;
    };
    keyTest: (event: import("react").KeyboardEvent<Element> | KeyboardEvent) => boolean;
} & {
    keyTest?: ((event: import("react").KeyboardEvent<Element> | KeyboardEvent) => boolean) | undefined;
};
export declare const actionFlipVertical: {
    name: "flipVertical";
    label: string;
    icon: JSX.Element;
    trackEvent: {
        category: "element";
    };
    perform: (elements: readonly ExcalidrawElement[], appState: Readonly<AppState>, _: any, app: import("../types").AppClassProperties) => {
        elements: ExcalidrawElement[];
        appState: Readonly<AppState>;
        commitToHistory: true;
    };
    keyTest: (event: import("react").KeyboardEvent<Element> | KeyboardEvent) => boolean;
} & {
    keyTest?: ((event: import("react").KeyboardEvent<Element> | KeyboardEvent) => boolean) | undefined;
};
