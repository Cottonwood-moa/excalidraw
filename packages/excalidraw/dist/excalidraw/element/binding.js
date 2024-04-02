import { getElementAtPosition } from "../scene";
import { isBindableElement, isBindingElement, isLinearElement, } from "./typeChecks";
import { bindingBorderTest, distanceToBindableElement, maxBindingGap, determineFocusDistance, intersectElementWithLine, determineFocusPoint, } from "./collision";
import { mutateElement } from "./mutateElement";
import Scene from "../scene/Scene";
import { LinearElementEditor } from "./linearElementEditor";
import { arrayToMap, tupleToCoors } from "../utils";
import { KEYS } from "../keys";
import { getBoundTextElement, handleBindTextResize } from "./textElement";
export const shouldEnableBindingForPointerEvent = (event) => {
    return !event[KEYS.CTRL_OR_CMD];
};
export const isBindingEnabled = (appState) => {
    return appState.isBindingEnabled;
};
const getNonDeletedElements = (scene, ids) => {
    const result = [];
    ids.forEach((id) => {
        const element = scene.getNonDeletedElement(id);
        if (element != null) {
            result.push(element);
        }
    });
    return result;
};
export const bindOrUnbindLinearElement = (linearElement, startBindingElement, endBindingElement, elementsMap) => {
    const boundToElementIds = new Set();
    const unboundFromElementIds = new Set();
    bindOrUnbindLinearElementEdge(linearElement, startBindingElement, endBindingElement, "start", boundToElementIds, unboundFromElementIds, elementsMap);
    bindOrUnbindLinearElementEdge(linearElement, endBindingElement, startBindingElement, "end", boundToElementIds, unboundFromElementIds, elementsMap);
    const onlyUnbound = Array.from(unboundFromElementIds).filter((id) => !boundToElementIds.has(id));
    getNonDeletedElements(Scene.getScene(linearElement), onlyUnbound).forEach((element) => {
        mutateElement(element, {
            boundElements: element.boundElements?.filter((element) => element.type !== "arrow" || element.id !== linearElement.id),
        });
    });
};
const bindOrUnbindLinearElementEdge = (linearElement, bindableElement, otherEdgeBindableElement, startOrEnd, 
// Is mutated
boundToElementIds, 
// Is mutated
unboundFromElementIds, elementsMap) => {
    if (bindableElement !== "keep") {
        if (bindableElement != null) {
            // Don't bind if we're trying to bind or are already bound to the same
            // element on the other edge already ("start" edge takes precedence).
            if (otherEdgeBindableElement == null ||
                (otherEdgeBindableElement === "keep"
                    ? !isLinearElementSimpleAndAlreadyBoundOnOppositeEdge(linearElement, bindableElement, startOrEnd)
                    : startOrEnd === "start" ||
                        otherEdgeBindableElement.id !== bindableElement.id)) {
                bindLinearElement(linearElement, bindableElement, startOrEnd, elementsMap);
                boundToElementIds.add(bindableElement.id);
            }
        }
        else {
            const unbound = unbindLinearElement(linearElement, startOrEnd);
            if (unbound != null) {
                unboundFromElementIds.add(unbound);
            }
        }
    }
};
export const bindOrUnbindSelectedElements = (selectedElements, elements, elementsMap) => {
    selectedElements.forEach((selectedElement) => {
        if (isBindingElement(selectedElement)) {
            bindOrUnbindLinearElement(selectedElement, getElligibleElementForBindingElement(selectedElement, "start", elements, elementsMap), getElligibleElementForBindingElement(selectedElement, "end", elements, elementsMap), elementsMap);
        }
        else if (isBindableElement(selectedElement)) {
            maybeBindBindableElement(selectedElement, elementsMap);
        }
    });
};
const maybeBindBindableElement = (bindableElement, elementsMap) => {
    getElligibleElementsForBindableElementAndWhere(bindableElement, elementsMap).forEach(([linearElement, where]) => bindOrUnbindLinearElement(linearElement, where === "end" ? "keep" : bindableElement, where === "start" ? "keep" : bindableElement, elementsMap));
};
export const maybeBindLinearElement = (linearElement, appState, scene, pointerCoords, elementsMap) => {
    if (appState.startBoundElement != null) {
        bindLinearElement(linearElement, appState.startBoundElement, "start", elementsMap);
    }
    const hoveredElement = getHoveredElementForBinding(pointerCoords, scene.getNonDeletedElements(), elementsMap);
    if (hoveredElement != null &&
        !isLinearElementSimpleAndAlreadyBoundOnOppositeEdge(linearElement, hoveredElement, "end")) {
        bindLinearElement(linearElement, hoveredElement, "end", elementsMap);
    }
};
export const bindLinearElement = (linearElement, hoveredElement, startOrEnd, elementsMap) => {
    mutateElement(linearElement, {
        [startOrEnd === "start" ? "startBinding" : "endBinding"]: {
            elementId: hoveredElement.id,
            ...calculateFocusAndGap(linearElement, hoveredElement, startOrEnd, elementsMap),
        },
    });
    const boundElementsMap = arrayToMap(hoveredElement.boundElements || []);
    if (!boundElementsMap.has(linearElement.id)) {
        mutateElement(hoveredElement, {
            boundElements: (hoveredElement.boundElements || []).concat({
                id: linearElement.id,
                type: "arrow",
            }),
        });
    }
};
// Don't bind both ends of a simple segment
const isLinearElementSimpleAndAlreadyBoundOnOppositeEdge = (linearElement, bindableElement, startOrEnd) => {
    const otherBinding = linearElement[startOrEnd === "start" ? "endBinding" : "startBinding"];
    return isLinearElementSimpleAndAlreadyBound(linearElement, otherBinding?.elementId, bindableElement);
};
export const isLinearElementSimpleAndAlreadyBound = (linearElement, alreadyBoundToId, bindableElement) => {
    return (alreadyBoundToId === bindableElement.id && linearElement.points.length < 3);
};
export const unbindLinearElements = (elements, elementsMap) => {
    elements.forEach((element) => {
        if (isBindingElement(element)) {
            bindOrUnbindLinearElement(element, null, null, elementsMap);
        }
    });
};
const unbindLinearElement = (linearElement, startOrEnd) => {
    const field = startOrEnd === "start" ? "startBinding" : "endBinding";
    const binding = linearElement[field];
    if (binding == null) {
        return null;
    }
    mutateElement(linearElement, { [field]: null });
    return binding.elementId;
};
export const getHoveredElementForBinding = (pointerCoords, elements, elementsMap) => {
    const hoveredElement = getElementAtPosition(elements, (element) => isBindableElement(element, false) &&
        bindingBorderTest(element, pointerCoords, elementsMap));
    return hoveredElement;
};
const calculateFocusAndGap = (linearElement, hoveredElement, startOrEnd, elementsMap) => {
    const direction = startOrEnd === "start" ? -1 : 1;
    const edgePointIndex = direction === -1 ? 0 : linearElement.points.length - 1;
    const adjacentPointIndex = edgePointIndex - direction;
    const edgePoint = LinearElementEditor.getPointAtIndexGlobalCoordinates(linearElement, edgePointIndex, elementsMap);
    const adjacentPoint = LinearElementEditor.getPointAtIndexGlobalCoordinates(linearElement, adjacentPointIndex, elementsMap);
    return {
        focus: determineFocusDistance(hoveredElement, adjacentPoint, edgePoint, elementsMap),
        gap: Math.max(1, distanceToBindableElement(hoveredElement, edgePoint, elementsMap)),
    };
};
// Supports translating, rotating and scaling `changedElement` with bound
// linear elements.
// Because scaling involves moving the focus points as well, it is
// done before the `changedElement` is updated, and the `newSize` is passed
// in explicitly.
export const updateBoundElements = (changedElement, elementsMap, options) => {
    const boundLinearElements = (changedElement.boundElements ?? []).filter((el) => el.type === "arrow");
    if (boundLinearElements.length === 0) {
        return;
    }
    const { newSize, simultaneouslyUpdated } = options ?? {};
    const simultaneouslyUpdatedElementIds = getSimultaneouslyUpdatedElementIds(simultaneouslyUpdated);
    const scene = Scene.getScene(changedElement);
    getNonDeletedElements(scene, boundLinearElements.map((el) => el.id)).forEach((element) => {
        if (!isLinearElement(element)) {
            return;
        }
        const bindableElement = changedElement;
        // In case the boundElements are stale
        if (!doesNeedUpdate(element, bindableElement)) {
            return;
        }
        const startBinding = maybeCalculateNewGapWhenScaling(bindableElement, element.startBinding, newSize);
        const endBinding = maybeCalculateNewGapWhenScaling(bindableElement, element.endBinding, newSize);
        // `linearElement` is being moved/scaled already, just update the binding
        if (simultaneouslyUpdatedElementIds.has(element.id)) {
            mutateElement(element, { startBinding, endBinding });
            return;
        }
        updateBoundPoint(element, "start", startBinding, changedElement, elementsMap);
        updateBoundPoint(element, "end", endBinding, changedElement, elementsMap);
        const boundText = getBoundTextElement(element, scene.getNonDeletedElementsMap());
        if (boundText) {
            handleBindTextResize(element, scene.getNonDeletedElementsMap(), false);
        }
    });
};
const doesNeedUpdate = (boundElement, changedElement) => {
    return (boundElement.startBinding?.elementId === changedElement.id ||
        boundElement.endBinding?.elementId === changedElement.id);
};
const getSimultaneouslyUpdatedElementIds = (simultaneouslyUpdated) => {
    return new Set((simultaneouslyUpdated || []).map((element) => element.id));
};
const updateBoundPoint = (linearElement, startOrEnd, binding, changedElement, elementsMap) => {
    if (binding == null ||
        // We only need to update the other end if this is a 2 point line element
        (binding.elementId !== changedElement.id && linearElement.points.length > 2)) {
        return;
    }
    const bindingElement = Scene.getScene(linearElement).getElement(binding.elementId);
    if (bindingElement == null) {
        // We're not cleaning up after deleted elements atm., so handle this case
        return;
    }
    const direction = startOrEnd === "start" ? -1 : 1;
    const edgePointIndex = direction === -1 ? 0 : linearElement.points.length - 1;
    const adjacentPointIndex = edgePointIndex - direction;
    const adjacentPoint = LinearElementEditor.getPointAtIndexGlobalCoordinates(linearElement, adjacentPointIndex, elementsMap);
    const focusPointAbsolute = determineFocusPoint(bindingElement, binding.focus, adjacentPoint, elementsMap);
    let newEdgePoint;
    // The linear element was not originally pointing inside the bound shape,
    // we can point directly at the focus point
    if (binding.gap === 0) {
        newEdgePoint = focusPointAbsolute;
    }
    else {
        const intersections = intersectElementWithLine(bindingElement, adjacentPoint, focusPointAbsolute, binding.gap, elementsMap);
        if (intersections.length === 0) {
            // This should never happen, since focusPoint should always be
            // inside the element, but just in case, bail out
            newEdgePoint = focusPointAbsolute;
        }
        else {
            // Guaranteed to intersect because focusPoint is always inside the shape
            newEdgePoint = intersections[0];
        }
    }
    LinearElementEditor.movePoints(linearElement, [
        {
            index: edgePointIndex,
            point: LinearElementEditor.pointFromAbsoluteCoords(linearElement, newEdgePoint, elementsMap),
        },
    ], { [startOrEnd === "start" ? "startBinding" : "endBinding"]: binding });
};
const maybeCalculateNewGapWhenScaling = (changedElement, currentBinding, newSize) => {
    if (currentBinding == null || newSize == null) {
        return currentBinding;
    }
    const { gap, focus, elementId } = currentBinding;
    const { width: newWidth, height: newHeight } = newSize;
    const { width, height } = changedElement;
    const newGap = Math.max(1, Math.min(maxBindingGap(changedElement, newWidth, newHeight), gap * (newWidth < newHeight ? newWidth / width : newHeight / height)));
    return { elementId, gap: newGap, focus };
};
// TODO: this is a bottleneck, optimise
export const getEligibleElementsForBinding = (selectedElements, elements, elementsMap) => {
    const includedElementIds = new Set(selectedElements.map(({ id }) => id));
    return selectedElements.flatMap((selectedElement) => isBindingElement(selectedElement, false)
        ? getElligibleElementsForBindingElement(selectedElement, elements, elementsMap).filter((element) => !includedElementIds.has(element.id))
        : isBindableElement(selectedElement, false)
            ? getElligibleElementsForBindableElementAndWhere(selectedElement, elementsMap).filter((binding) => !includedElementIds.has(binding[0].id))
            : []);
};
const getElligibleElementsForBindingElement = (linearElement, elements, elementsMap) => {
    return [
        getElligibleElementForBindingElement(linearElement, "start", elements, elementsMap),
        getElligibleElementForBindingElement(linearElement, "end", elements, elementsMap),
    ].filter((element) => element != null);
};
const getElligibleElementForBindingElement = (linearElement, startOrEnd, elements, elementsMap) => {
    return getHoveredElementForBinding(getLinearElementEdgeCoors(linearElement, startOrEnd, elementsMap), elements, elementsMap);
};
const getLinearElementEdgeCoors = (linearElement, startOrEnd, elementsMap) => {
    const index = startOrEnd === "start" ? 0 : -1;
    return tupleToCoors(LinearElementEditor.getPointAtIndexGlobalCoordinates(linearElement, index, elementsMap));
};
const getElligibleElementsForBindableElementAndWhere = (bindableElement, elementsMap) => {
    const scene = Scene.getScene(bindableElement);
    return scene
        .getNonDeletedElements()
        .map((element) => {
        if (!isBindingElement(element, false)) {
            return null;
        }
        const canBindStart = isLinearElementEligibleForNewBindingByBindable(element, "start", bindableElement, elementsMap);
        const canBindEnd = isLinearElementEligibleForNewBindingByBindable(element, "end", bindableElement, elementsMap);
        if (!canBindStart && !canBindEnd) {
            return null;
        }
        return [
            element,
            canBindStart && canBindEnd ? "both" : canBindStart ? "start" : "end",
            bindableElement,
        ];
    })
        .filter((maybeElement) => maybeElement != null);
};
const isLinearElementEligibleForNewBindingByBindable = (linearElement, startOrEnd, bindableElement, elementsMap) => {
    const existingBinding = linearElement[startOrEnd === "start" ? "startBinding" : "endBinding"];
    return (existingBinding == null &&
        !isLinearElementSimpleAndAlreadyBoundOnOppositeEdge(linearElement, bindableElement, startOrEnd) &&
        bindingBorderTest(bindableElement, getLinearElementEdgeCoors(linearElement, startOrEnd, elementsMap), elementsMap));
};
// We need to:
// 1: Update elements not selected to point to duplicated elements
// 2: Update duplicated elements to point to other duplicated elements
export const fixBindingsAfterDuplication = (sceneElements, oldElements, oldIdToDuplicatedId, 
// There are three copying mechanisms: Copy-paste, duplication and alt-drag.
// Only when alt-dragging the new "duplicates" act as the "old", while
// the "old" elements act as the "new copy" - essentially working reverse
// to the other two.
duplicatesServeAsOld) => {
    // First collect all the binding/bindable elements, so we only update
    // each once, regardless of whether they were duplicated or not.
    const allBoundElementIds = new Set();
    const allBindableElementIds = new Set();
    const shouldReverseRoles = duplicatesServeAsOld === "duplicatesServeAsOld";
    oldElements.forEach((oldElement) => {
        const { boundElements } = oldElement;
        if (boundElements != null && boundElements.length > 0) {
            boundElements.forEach((boundElement) => {
                if (shouldReverseRoles && !oldIdToDuplicatedId.has(boundElement.id)) {
                    allBoundElementIds.add(boundElement.id);
                }
            });
            allBindableElementIds.add(oldIdToDuplicatedId.get(oldElement.id));
        }
        if (isBindingElement(oldElement)) {
            if (oldElement.startBinding != null) {
                const { elementId } = oldElement.startBinding;
                if (shouldReverseRoles && !oldIdToDuplicatedId.has(elementId)) {
                    allBindableElementIds.add(elementId);
                }
            }
            if (oldElement.endBinding != null) {
                const { elementId } = oldElement.endBinding;
                if (shouldReverseRoles && !oldIdToDuplicatedId.has(elementId)) {
                    allBindableElementIds.add(elementId);
                }
            }
            if (oldElement.startBinding != null || oldElement.endBinding != null) {
                allBoundElementIds.add(oldIdToDuplicatedId.get(oldElement.id));
            }
        }
    });
    // Update the linear elements
    sceneElements.filter(({ id }) => allBoundElementIds.has(id)).forEach((element) => {
        const { startBinding, endBinding } = element;
        mutateElement(element, {
            startBinding: newBindingAfterDuplication(startBinding, oldIdToDuplicatedId),
            endBinding: newBindingAfterDuplication(endBinding, oldIdToDuplicatedId),
        });
    });
    // Update the bindable shapes
    sceneElements
        .filter(({ id }) => allBindableElementIds.has(id))
        .forEach((bindableElement) => {
        const { boundElements } = bindableElement;
        if (boundElements != null && boundElements.length > 0) {
            mutateElement(bindableElement, {
                boundElements: boundElements.map((boundElement) => oldIdToDuplicatedId.has(boundElement.id)
                    ? {
                        id: oldIdToDuplicatedId.get(boundElement.id),
                        type: boundElement.type,
                    }
                    : boundElement),
            });
        }
    });
};
const newBindingAfterDuplication = (binding, oldIdToDuplicatedId) => {
    if (binding == null) {
        return null;
    }
    const { elementId, focus, gap } = binding;
    return {
        focus,
        gap,
        elementId: oldIdToDuplicatedId.get(elementId) ?? elementId,
    };
};
export const fixBindingsAfterDeletion = (sceneElements, deletedElements) => {
    const deletedElementIds = new Set(deletedElements.map((element) => element.id));
    // non-deleted which bindings need to be updated
    const affectedElements = new Set();
    deletedElements.forEach((deletedElement) => {
        if (isBindableElement(deletedElement)) {
            deletedElement.boundElements?.forEach((element) => {
                if (!deletedElementIds.has(element.id)) {
                    affectedElements.add(element.id);
                }
            });
        }
        else if (isBindingElement(deletedElement)) {
            if (deletedElement.startBinding) {
                affectedElements.add(deletedElement.startBinding.elementId);
            }
            if (deletedElement.endBinding) {
                affectedElements.add(deletedElement.endBinding.elementId);
            }
        }
    });
    sceneElements
        .filter(({ id }) => affectedElements.has(id))
        .forEach((element) => {
        if (isBindableElement(element)) {
            mutateElement(element, {
                boundElements: newBoundElementsAfterDeletion(element.boundElements, deletedElementIds),
            });
        }
        else if (isBindingElement(element)) {
            mutateElement(element, {
                startBinding: newBindingAfterDeletion(element.startBinding, deletedElementIds),
                endBinding: newBindingAfterDeletion(element.endBinding, deletedElementIds),
            });
        }
    });
};
const newBindingAfterDeletion = (binding, deletedElementIds) => {
    if (binding == null || deletedElementIds.has(binding.elementId)) {
        return null;
    }
    return binding;
};
const newBoundElementsAfterDeletion = (boundElements, deletedElementIds) => {
    if (!boundElements) {
        return null;
    }
    return boundElements.filter((ele) => !deletedElementIds.has(ele.id));
};
