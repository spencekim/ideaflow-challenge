import { ContentBlock, ContentState } from 'draft-js';

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
