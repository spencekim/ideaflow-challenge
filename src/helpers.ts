import { ContentBlock, ContentState, EditorState } from 'draft-js';

export const findAutocompleteEntries = (
    contentBlock: ContentBlock,
    callback: (start: number, end: number) => void,
    contentState: ContentState
): void => {
    contentBlock.findEntityRanges((char) => {
        const entityKey = char.getEntity();
        return (
            entityKey !== null &&
            contentState.getEntity(entityKey).getType() === 'AUTOCOMPLETE_ENTRY'
        );
    }, callback);
};

export const getPrefixMatches = (
    data: string[],
    inputText: string
): string[] => {
    const matchList = data.filter((str) => {
        return str.toLowerCase().startsWith(inputText.toLowerCase());
    });

    if (matchList.length === 0) {
        return [inputText];
    }

    return matchList;
};
