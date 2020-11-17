import React, { useState } from 'react';
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
import data from './data';
import { findAutocompleteEntries, getPrefixMatches } from './utils';
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

    const createAutocompleteEntity = (selectedIndex: number) => {
        if (autocompleteState) {
            const selectedSuggestion =
                autocompleteState.suggestions[selectedIndex];

            const contentState = editorState.getCurrentContent();
            const contentStateWithEntity = contentState.createEntity(
                'AUTOCOMPLETE_ENTRY',
                'IMMUTABLE'
            );
            const entityKey = contentStateWithEntity.getLastCreatedEntityKey();

            const selectionState = editorState.getSelection();
            const blockKey = selectionState.getAnchorKey();
            const contentBlock = contentState.getBlockForKey(blockKey);
            const anchorOffset = selectionState.getAnchorOffset();
            const focusOffset = selectionState.getFocusOffset();

            const preAnchorText = contentBlock.getText().slice(0, anchorOffset);
            const nearestTriggerIndex = preAnchorText.lastIndexOf(
                '<>',
                anchorOffset
            );

            const selectionToRemove = selectionState.merge({
                focusOffset,
                anchorOffset: nearestTriggerIndex
            });

            const replacedContentState = Modifier.replaceText(
                contentState,
                selectionToRemove,
                selectedSuggestion,
                editorState.getCurrentInlineStyle(),
                entityKey
            );

            const finalEditorState = EditorState.push(
                editorState,
                replacedContentState,
                'insert-characters'
            );

            setEditorState(finalEditorState);
        }
        setAutocompleteState(null);
    };

    const getKeyBindings = (e: React.KeyboardEvent) => {
        if (autocompleteState) {
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
        }
        return getDefaultKeyBinding(e);
    };

    const handleKeyCommand = (command: string): DraftHandleValue => {
        switch (command) {
            case KeyBindings.ENTER:
                if (autocompleteState) {
                    createAutocompleteEntity(autocompleteState.selectionIndex);
                    return 'handled';
                }
                return 'not-handled';
            case KeyBindings.TAB:
                if (autocompleteState) {
                    createAutocompleteEntity(autocompleteState.selectionIndex);
                    return 'handled';
                }
                return 'not-handled';
            case KeyBindings.ARROW_DOWN:
                if (
                    autocompleteState &&
                    autocompleteState.selectionIndex <
                        autocompleteState.suggestions.length - 1
                ) {
                    setSelectionIndex(autocompleteState.selectionIndex + 1);
                    return 'handled';
                }
                return 'not-handled';
            case KeyBindings.ARROW_UP:
                if (autocompleteState && autocompleteState.selectionIndex > 0) {
                    setSelectionIndex(autocompleteState.selectionIndex - 1);
                    return 'handled';
                }
                return 'not-handled';
            default:
                return 'not-handled';
        }
    };

    const setSelectionIndex = (newSelectionIndex: number) => {
        if (!autocompleteState) return null;
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

        const entity = contentBlock.getEntityAt(anchorOffset);
        if (entity) return null;

        const selection = window.getSelection();
        if (!selection) return null;
        if (selection.rangeCount === 0) return null;

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

        const range = selection.getRangeAt(0).cloneRange();
        range.setStart(
            range.startContainer,
            nearestTriggerIndex - (anchorOffset - selection.focusOffset)
        );
        if (range.getClientRects().length === 0) return null;
        const rect = range.getBoundingClientRect();

        const compareString = contentBlock
            .getText()
            .slice(nearestTriggerIndex + 2, anchorOffset);

        const suggestions = getPrefixMatches(data, compareString);
        return {
            selectionIndex: 0,
            suggestions,
            topLeftCoordinate: { top: rect.bottom, left: rect.left }
        };
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
