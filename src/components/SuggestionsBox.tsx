import React from 'react';
import { AutocompleteState, TopLeftCoordinate } from '../types';

interface SuggestionsBoxProps {
    topLeftCoordinate: TopLeftCoordinate;
    suggestions: string[];
    selectionIndex: number;
    createAutocompleteEntity: (selectedIndex: number) => void;
}

const SuggestionsBox: React.FC<SuggestionsBoxProps> = ({
    topLeftCoordinate,
    selectionIndex,
    suggestions,
    createAutocompleteEntity
}) => {
    return (
        <ol
            style={{
                position: 'absolute',
                backgroundColor: 'gainsboro',
                zIndex: 2,
                top: topLeftCoordinate.top,
                left: topLeftCoordinate.left
            }}
        >
            {suggestions.map((suggestion, index) => {
                return (
                    <li
                        className="suggestion-item"
                        style={{
                            backgroundColor:
                                index === selectionIndex ? 'grey' : undefined
                        }}
                        key={suggestion + index}
                        onMouseDown={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            createAutocompleteEntity(index);
                        }}
                    >
                        {suggestion}
                    </li>
                );
            })}
        </ol>
    );
};

export default SuggestionsBox;
