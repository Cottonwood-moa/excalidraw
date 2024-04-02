import { ExcalidrawLinearElement, ExcalidrawBindableElement, NonDeleted, NonDeletedExcalidrawElement, ExcalidrawElement, ElementsMap, NonDeletedSceneElementsMap } from "./types";
import { AppState } from "../types";
import Scene from "../scene/Scene";
export type SuggestedBinding = NonDeleted<ExcalidrawBindableElement> | SuggestedPointBinding;
export type SuggestedPointBinding = [
    NonDeleted<ExcalidrawLinearElement>,
    "start" | "end" | "both",
    NonDeleted<ExcalidrawBindableElement>
];
export declare const shouldEnableBindingForPointerEvent: (event: React.PointerEvent<HTMLElement>) => boolean;
export declare const isBindingEnabled: (appState: AppState) => boolean;
export declare const bindOrUnbindLinearElement: (linearElement: NonDeleted<ExcalidrawLinearElement>, startBindingElement: ExcalidrawBindableElement | null | "keep", endBindingElement: ExcalidrawBindableElement | null | "keep", elementsMap: NonDeletedSceneElementsMap) => void;
export declare const bindOrUnbindSelectedElements: (selectedElements: NonDeleted<ExcalidrawElement>[], elements: readonly ExcalidrawElement[], elementsMap: NonDeletedSceneElementsMap) => void;
export declare const maybeBindLinearElement: (linearElement: NonDeleted<ExcalidrawLinearElement>, appState: AppState, scene: Scene, pointerCoords: {
    x: number;
    y: number;
}, elementsMap: NonDeletedSceneElementsMap) => void;
export declare const bindLinearElement: (linearElement: NonDeleted<ExcalidrawLinearElement>, hoveredElement: ExcalidrawBindableElement, startOrEnd: "start" | "end", elementsMap: NonDeletedSceneElementsMap) => void;
export declare const isLinearElementSimpleAndAlreadyBound: (linearElement: NonDeleted<ExcalidrawLinearElement>, alreadyBoundToId: ExcalidrawBindableElement["id"] | undefined, bindableElement: ExcalidrawBindableElement) => boolean;
export declare const unbindLinearElements: (elements: NonDeleted<ExcalidrawElement>[], elementsMap: NonDeletedSceneElementsMap) => void;
export declare const getHoveredElementForBinding: (pointerCoords: {
    x: number;
    y: number;
}, elements: readonly NonDeletedExcalidrawElement[], elementsMap: NonDeletedSceneElementsMap) => NonDeleted<ExcalidrawBindableElement> | null;
export declare const updateBoundElements: (changedElement: NonDeletedExcalidrawElement, elementsMap: ElementsMap, options?: {
    simultaneouslyUpdated?: readonly ExcalidrawElement[];
    newSize?: {
        width: number;
        height: number;
    };
}) => void;
export declare const getEligibleElementsForBinding: (selectedElements: NonDeleted<ExcalidrawElement>[], elements: readonly ExcalidrawElement[], elementsMap: NonDeletedSceneElementsMap) => SuggestedBinding[];
export declare const fixBindingsAfterDuplication: (sceneElements: readonly ExcalidrawElement[], oldElements: readonly ExcalidrawElement[], oldIdToDuplicatedId: Map<ExcalidrawElement["id"], ExcalidrawElement["id"]>, duplicatesServeAsOld?: "duplicatesServeAsOld" | undefined) => void;
export declare const fixBindingsAfterDeletion: (sceneElements: readonly ExcalidrawElement[], deletedElements: readonly ExcalidrawElement[]) => void;
