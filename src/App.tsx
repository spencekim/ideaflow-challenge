import React, { useEffect, useState } from 'react';
import {
    Editor,
    EditorState,
    getDefaultKeyBinding,
    DraftHandleValue,
    Modifier,
    CompositeDecorator
} from 'draft-js';
import 'draft-js/dist/Draft.css';

import './App.css';
import { AutocompleteState, KeyBindings } from './types';
import SuggestionsBox from './components/SuggestionsBox';
import data from './mockData';
import { findAutocompleteEntries, getPrefixMatches } from './helpers';
import AutocompleteEntry from './components/AutocompleteEntry';

const App = (): JSX.Element => {
    const compositeDecorator = new CompositeDecorator([
        {
            strategy: findAutocompleteEntries,
            component: AutocompleteEntry
        }
    ]);

    const [editorState, setEditorState] = useState(() =>
        EditorState.createEmpty(compositeDecorator)
    );

    const [autocompleteState, setAutocompleteState] = useState<
        AutocompleteState
    >(null);

    const setSelectionIndex = (newSelectionIndex: number): void => {
        if (!autocompleteState) {
            setAutocompleteState(null);
            return;
        }
        const newState = {
            ...autocompleteState,
            selectionIndex: newSelectionIndex
        };
        setAutocompleteState(newState);
    };

    const getAutocompleteState = (
        editorState: EditorState,
        data: string[]
    ): AutocompleteState => {
        const contentState = editorState.getCurrentContent();
        const selectionState = editorState.getSelection();
        const blockKey = selectionState.getAnchorKey();
        const contentBlock = contentState.getBlockForKey(blockKey);
        const anchorOffset = selectionState.getAnchorOffset();
        const focusOffset = selectionState.getFocusOffset();

        if (anchorOffset !== focusOffset) return null;

        if (contentBlock.getEntityAt(anchorOffset)) return null;

        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) return null;
        const range = selection.getRangeAt(0).cloneRange();
        if (range.getClientRects().length === 0) return null;

        const preAnchorText = contentBlock.getText().slice(0, anchorOffset);
        const nearestTriggerIndex = preAnchorText.lastIndexOf(
            '<>',
            anchorOffset
        );

        if (
            nearestTriggerIndex === -1 ||
            nearestTriggerIndex === anchorOffset - 2
        )
            return null;

        for (let i = nearestTriggerIndex + 2; i < anchorOffset; i++) {
            if (contentBlock.getEntityAt(i)) return null;
        }

        const boundingRangeStartOffset =
            nearestTriggerIndex - (anchorOffset - selection.focusOffset);

        if (boundingRangeStartOffset < 0) {
            return null;
        }

        range.setStart(range.startContainer, boundingRangeStartOffset);
        const rect = range.getBoundingClientRect();

        const compareString = contentBlock
            .getText()
            .slice(nearestTriggerIndex + 2, anchorOffset);

        const suggestions = getPrefixMatches(data, compareString);

        return {
            triggerOffset: nearestTriggerIndex,
            focusOffset,
            selectionIndex: 0,
            suggestions,
            topLeftCoordinate: { top: rect.bottom, left: rect.left }
        };
    };

    const createAutocompleteEntity = (selectedIndex: number): void => {
        if (!autocompleteState) {
            return;
        }
        const contentState = editorState.getCurrentContent();
        const contentStateWithEntity = contentState.createEntity(
            'AUTOCOMPLETE_ENTRY',
            'IMMUTABLE'
        );
        const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
        const selectionState = editorState.getSelection();

        const selectionToRemove = selectionState.merge({
            focusOffset: autocompleteState.focusOffset,
            anchorOffset: autocompleteState.triggerOffset
        });

        const selectedSuggestionString =
            autocompleteState.suggestions[selectedIndex];

        const replacedContentState = Modifier.replaceText(
            contentState,
            selectionToRemove,
            selectedSuggestionString,
            editorState.getCurrentInlineStyle(),
            entityKey
        );

        const nextEditorState = EditorState.push(
            editorState,
            replacedContentState,
            'insert-characters'
        );

        setEditorState(nextEditorState);
        setAutocompleteState(null);
    };

    const getKeyBindings = (e: React.KeyboardEvent) => {
        if (!autocompleteState) return getDefaultKeyBinding(e);
        switch (e.key) {
            case 'Enter':
                return KeyBindings.ENTER;
            case 'Tab':
                return KeyBindings.TAB;
            case 'ArrowDown':
                return KeyBindings.ARROW_DOWN;
            case 'ArrowUp':
                return KeyBindings.ARROW_UP;
            default:
                return getDefaultKeyBinding(e);
        }
    };

    const handleKeyCommand = (command: string): DraftHandleValue => {
        if (!autocompleteState) return 'not-handled';
        switch (command) {
            case KeyBindings.ENTER:
                createAutocompleteEntity(autocompleteState.selectionIndex);
                return 'handled';
            case KeyBindings.TAB:
                createAutocompleteEntity(autocompleteState.selectionIndex);
                return 'handled';
            case KeyBindings.ARROW_DOWN:
                if (
                    autocompleteState.selectionIndex ===
                    autocompleteState.suggestions.length - 1
                )
                    return 'not-handled';
                setSelectionIndex(autocompleteState.selectionIndex + 1);
                return 'handled';
            case KeyBindings.ARROW_UP:
                if (!(autocompleteState.selectionIndex > 0))
                    return 'not-handled';
                setSelectionIndex(autocompleteState.selectionIndex - 1);
                return 'handled';
            default:
                return 'not-handled';
        }
    };

    const onChange = (editorState: EditorState) => {
        setEditorState(editorState);
        setAutocompleteState(getAutocompleteState(editorState, data));
    };

    return (
        <>
            {autocompleteState && (
                <SuggestionsBox
                    topLeftCoordinate={autocompleteState.topLeftCoordinate}
                    suggestions={autocompleteState.suggestions}
                    selectionIndex={autocompleteState.selectionIndex}
                    createAutocompleteEntity={createAutocompleteEntity}
                />
            )}
            <Editor
                placeholder={'Start typing here...'}
                editorState={editorState}
                onChange={onChange}
                keyBindingFn={getKeyBindings}
                handleKeyCommand={handleKeyCommand}
            />
        </>
    );
};

export default App;
