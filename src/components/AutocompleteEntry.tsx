import React from 'react';

const AutocompleteEntry: React.FC<{ children: React.ReactNode }> = ({
    children
}) => {
    return <div className="autocomplete-entry">{children}</div>;
};

export default AutocompleteEntry;
