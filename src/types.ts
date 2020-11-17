export type AutocompleteState = {
    topLeftCoordinate: TopLeftCoordinate;
    suggestions: string[];
    selectionIndex: number;
} | null;

export interface TopLeftCoordinate {
    top: number;
    left: number;
}

export enum KeyBindings {
    ENTER = 'ENTER',
    TAB = 'TAB',
    ARROW_DOWN = 'ARROW_DOWN',
    ARROW_UP = 'ARROW_UP'
}
