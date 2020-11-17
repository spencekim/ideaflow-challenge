import { ContentBlock, ContentState } from 'draft-js';

export const getPrefixMatches = (
    data: string[],
    inputText: string
): string[] => {
    const matchList = data.filter((str) => {
        return str.toLowerCase().startsWith(inputText.toLowerCase());
    });

    // if there are no matches the match is set to current text
    if (matchList.length === 0) {
        return [inputText];
    }

    return matchList;
};

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
