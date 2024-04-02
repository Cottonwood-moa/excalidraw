/// <reference types="react" />
import { ExcalidrawElement } from "../element/types";
import { AppState } from "../types";
export declare const actionDuplicateSelection: {
    name: "duplicateSelection";
    label: string;
    icon: JSX.Element;
    trackEvent: {
        category: "element";
    };
    perform: (elements: readonly ExcalidrawElement[], appState: Readonly<AppState>, formData: any, app: import("../types").AppClassProperties) => false | {
        commitToHistory: true;
        elements?: readonly ExcalidrawElement[] | null | undefined;
        appState?: import("../utility-types").MarkOptional<AppState, "offsetTop" | "offsetLeft" | "width" | "height"> | null | undefined;
        files?: import("../types").BinaryFiles | null | undefined;
        syncHistory?: boolean | undefined;
        replaceFiles?: boolean | undefined;
    };
    keyTest: (event: import("react").KeyboardEvent<Element> | KeyboardEvent) => boolean;
    PanelComponent: ({ elements, appState, updateData }: import("./types").PanelComponentProps) => JSX.Element;
} & {
    keyTest?: ((event: import("react").KeyboardEvent<Element> | KeyboardEvent) => boolean) | undefined;
};
