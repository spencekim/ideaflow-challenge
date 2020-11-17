import React from 'react';

const AutocompleteEntry: React.FC<{ children: React.ReactNode }> = ({
    children
}) => {
    return <span className="autocomplete-entry">{children}</span>;
};

export default AutocompleteEntry;
