import React from "react";
export declare const actionSendBackward: {
    name: "sendBackward";
    label: string;
    icon: JSX.Element;
    trackEvent: {
        category: "element";
    };
    perform: (elements: readonly import("../element/types").ExcalidrawElement[], appState: Readonly<import("../types").AppState>) => {
        elements: import("../element/types").ExcalidrawElement[];
        appState: Readonly<import("../types").AppState>;
        commitToHistory: true;
    };
    keyPriority: number;
    keyTest: (event: React.KeyboardEvent<Element> | KeyboardEvent) => boolean;
    PanelComponent: ({ updateData, appState }: import("./types").PanelComponentProps) => JSX.Element;
} & {
    keyTest?: ((event: React.KeyboardEvent<Element> | KeyboardEvent) => boolean) | undefined;
};
export declare const actionBringForward: {
    name: "bringForward";
    label: string;
    icon: JSX.Element;
    trackEvent: {
        category: "element";
    };
    perform: (elements: readonly import("../element/types").ExcalidrawElement[], appState: Readonly<import("../types").AppState>) => {
        elements: import("../element/types").ExcalidrawElement[];
        appState: Readonly<import("../types").AppState>;
        commitToHistory: true;
    };
    keyPriority: number;
    keyTest: (event: React.KeyboardEvent<Element> | KeyboardEvent) => boolean;
    PanelComponent: ({ updateData, appState }: import("./types").PanelComponentProps) => JSX.Element;
} & {
    keyTest?: ((event: React.KeyboardEvent<Element> | KeyboardEvent) => boolean) | undefined;
};
export declare const actionSendToBack: {
    name: "sendToBack";
    label: string;
    icon: JSX.Element;
    trackEvent: {
        category: "element";
    };
    perform: (elements: readonly import("../element/types").ExcalidrawElement[], appState: Readonly<import("../types").AppState>) => {
        elements: readonly import("../element/types").ExcalidrawElement[] | import("../element/types").ExcalidrawElement[];
        appState: Readonly<import("../types").AppState>;
        commitToHistory: true;
    };
    keyTest: (event: React.KeyboardEvent<Element> | KeyboardEvent) => boolean;
    PanelComponent: ({ updateData, appState }: import("./types").PanelComponentProps) => JSX.Element;
} & {
    keyTest?: ((event: React.KeyboardEvent<Element> | KeyboardEvent) => boolean) | undefined;
};
export declare const actionBringToFront: {
    name: "bringToFront";
    label: string;
    icon: JSX.Element;
    trackEvent: {
        category: "element";
    };
    perform: (elements: readonly import("../element/types").ExcalidrawElement[], appState: Readonly<import("../types").AppState>) => {
        elements: readonly import("../element/types").ExcalidrawElement[] | import("../element/types").ExcalidrawElement[];
        appState: Readonly<import("../types").AppState>;
        commitToHistory: true;
    };
    keyTest: (event: React.KeyboardEvent<Element> | KeyboardEvent) => boolean;
    PanelComponent: ({ updateData, appState }: import("./types").PanelComponentProps) => JSX.Element;
} & {
    keyTest?: ((event: React.KeyboardEvent<Element> | KeyboardEvent) => boolean) | undefined;
};
