import { isNonDeletedElement } from "../element";
import { isFrameLikeElement } from "../element/typeChecks";
import { getSelectedElements } from "./selection";
import { randomInteger } from "../random";
import { toBrandedType } from "../utils";
const getNonDeletedElements = (allElements) => {
    const elementsMap = new Map();
    const elements = [];
    for (const element of allElements) {
        if (!element.isDeleted) {
            elements.push(element);
            elementsMap.set(element.id, element);
        }
    }
    return { elementsMap, elements };
};
const hashSelectionOpts = (opts) => {
    const keys = ["includeBoundTextElement", "includeElementsInFrames"];
    let hash = "";
    for (const key of keys) {
        hash += `${key}:${opts[key] ? "1" : "0"}`;
    }
    return hash;
};
const isIdKey = (elementKey) => {
    if (typeof elementKey === "string") {
        return true;
    }
    return false;
};
class Scene {
    // ---------------------------------------------------------------------------
    // static methods/props
    // ---------------------------------------------------------------------------
    static sceneMapByElement = new WeakMap();
    static sceneMapById = new Map();
    static mapElementToScene(elementKey, scene) {
        if (isIdKey(elementKey)) {
            // for cases where we don't have access to the element object
            // (e.g. restore serialized appState with id references)
            this.sceneMapById.set(elementKey, scene);
        }
        else {
            this.sceneMapByElement.set(elementKey, scene);
            // if mapping element objects, also cache the id string when later
            // looking up by id alone
            this.sceneMapById.set(elementKey.id, scene);
        }
    }
    static getScene(elementKey) {
        if (isIdKey(elementKey)) {
            return this.sceneMapById.get(elementKey) || null;
        }
        return this.sceneMapByElement.get(elementKey) || null;
    }
    // ---------------------------------------------------------------------------
    // instance methods/props
    // ---------------------------------------------------------------------------
    callbacks = new Set();
    nonDeletedElements = [];
    nonDeletedElementsMap = toBrandedType(new Map());
    elements = [];
    nonDeletedFramesLikes = [];
    frames = [];
    elementsMap = toBrandedType(new Map());
    selectedElementsCache = {
        selectedElementIds: null,
        elements: null,
        cache: new Map(),
    };
    versionNonce;
    getElementsMapIncludingDeleted() {
        return this.elementsMap;
    }
    getNonDeletedElementsMap() {
        return this.nonDeletedElementsMap;
    }
    getElementsIncludingDeleted() {
        return this.elements;
    }
    getNonDeletedElements() {
        return this.nonDeletedElements;
    }
    getFramesIncludingDeleted() {
        return this.frames;
    }
    getSelectedElements(opts) {
        const hash = hashSelectionOpts(opts);
        const elements = opts?.elements || this.nonDeletedElements;
        if (this.selectedElementsCache.elements === elements &&
            this.selectedElementsCache.selectedElementIds === opts.selectedElementIds) {
            const cached = this.selectedElementsCache.cache.get(hash);
            if (cached) {
                return cached;
            }
        }
        else if (opts?.elements == null) {
            // if we're operating on latest scene elements and the cache is not
            //  storing the latest elements, clear the cache
            this.selectedElementsCache.cache.clear();
        }
        const selectedElements = getSelectedElements(elements, { selectedElementIds: opts.selectedElementIds }, opts);
        // cache only if we're not using custom elements
        if (opts?.elements == null) {
            this.selectedElementsCache.selectedElementIds = opts.selectedElementIds;
            this.selectedElementsCache.elements = this.nonDeletedElements;
            this.selectedElementsCache.cache.set(hash, selectedElements);
        }
        return selectedElements;
    }
    getNonDeletedFramesLikes() {
        return this.nonDeletedFramesLikes;
    }
    getElement(id) {
        return this.elementsMap.get(id) || null;
    }
    getVersionNonce() {
        return this.versionNonce;
    }
    getNonDeletedElement(id) {
        const element = this.getElement(id);
        if (element && isNonDeletedElement(element)) {
            return element;
        }
        return null;
    }
    /**
     * A utility method to help with updating all scene elements, with the added
     * performance optimization of not renewing the array if no change is made.
     *
     * Maps all current excalidraw elements, invoking the callback for each
     * element. The callback should either return a new mapped element, or the
     * original element if no changes are made. If no changes are made to any
     * element, this results in a no-op. Otherwise, the newly mapped elements
     * are set as the next scene's elements.
     *
     * @returns whether a change was made
     */
    mapElements(iteratee) {
        let didChange = false;
        const newElements = this.elements.map((element) => {
            const nextElement = iteratee(element);
            if (nextElement !== element) {
                didChange = true;
            }
            return nextElement;
        });
        if (didChange) {
            this.replaceAllElements(newElements);
        }
        return didChange;
    }
    replaceAllElements(nextElements) {
        this.elements =
            // ts doesn't like `Array.isArray` of `instanceof Map`
            nextElements instanceof Array
                ? nextElements
                : Array.from(nextElements.values());
        const nextFrameLikes = [];
        this.elementsMap.clear();
        this.elements.forEach((element) => {
            if (isFrameLikeElement(element)) {
                nextFrameLikes.push(element);
            }
            this.elementsMap.set(element.id, element);
            Scene.mapElementToScene(element, this);
        });
        const nonDeletedElements = getNonDeletedElements(this.elements);
        this.nonDeletedElements = nonDeletedElements.elements;
        this.nonDeletedElementsMap = nonDeletedElements.elementsMap;
        this.frames = nextFrameLikes;
        this.nonDeletedFramesLikes = getNonDeletedElements(this.frames).elements;
        this.informMutation();
    }
    informMutation() {
        this.versionNonce = randomInteger();
        for (const callback of Array.from(this.callbacks)) {
            callback();
        }
    }
    addCallback(cb) {
        if (this.callbacks.has(cb)) {
            throw new Error();
        }
        this.callbacks.add(cb);
        return () => {
            if (!this.callbacks.has(cb)) {
                throw new Error();
            }
            this.callbacks.delete(cb);
        };
    }
    destroy() {
        this.nonDeletedElements = [];
        this.elements = [];
        this.nonDeletedFramesLikes = [];
        this.frames = [];
        this.elementsMap.clear();
        this.selectedElementsCache.selectedElementIds = null;
        this.selectedElementsCache.elements = null;
        this.selectedElementsCache.cache.clear();
        Scene.sceneMapById.forEach((scene, elementKey) => {
            if (scene === this) {
                Scene.sceneMapById.delete(elementKey);
            }
        });
        // done not for memory leaks, but to guard against possible late fires
        // (I guess?)
        this.callbacks.clear();
    }
    insertElementAtIndex(element, index) {
        if (!Number.isFinite(index) || index < 0) {
            throw new Error("insertElementAtIndex can only be called with index >= 0");
        }
        const nextElements = [
            ...this.elements.slice(0, index),
            element,
            ...this.elements.slice(index),
        ];
        this.replaceAllElements(nextElements);
    }
    insertElementsAtIndex(elements, index) {
        if (!Number.isFinite(index) || index < 0) {
            throw new Error("insertElementAtIndex can only be called with index >= 0");
        }
        const nextElements = [
            ...this.elements.slice(0, index),
            ...elements,
            ...this.elements.slice(index),
        ];
        this.replaceAllElements(nextElements);
    }
    addNewElement = (element) => {
        if (element.frameId) {
            this.insertElementAtIndex(element, this.getElementIndex(element.frameId));
        }
        else {
            this.replaceAllElements([...this.elements, element]);
        }
    };
    getElementIndex(elementId) {
        return this.elements.findIndex((element) => element.id === elementId);
    }
    getContainerElement = (element) => {
        if (!element) {
            return null;
        }
        if (element.containerId) {
            return this.getElement(element.containerId) || null;
        }
        return null;
    };
}
export default Scene;
