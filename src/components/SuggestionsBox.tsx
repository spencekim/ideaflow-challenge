import React from 'react';
import { TopLeftCoordinate } from '../types';

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
        <div
            className="suggestions-box"
            style={{
                position: 'absolute',
                top: topLeftCoordinate.top + 4,
                left: topLeftCoordinate.left
            }}
        >
            {suggestions.map((suggestion, index) => {
                return (
                    <div
                        className="suggestion-item"
                        style={{
                            backgroundColor:
                                index === selectionIndex
                                    ? 'lightblue'
                                    : undefined
                        }}
                        key={suggestion + index}
                        onMouseDown={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            createAutocompleteEntity(index);
                        }}
                    >
                        {suggestion}
                    </div>
                );
            })}
        </div>
    );
};

export default SuggestionsBox;
