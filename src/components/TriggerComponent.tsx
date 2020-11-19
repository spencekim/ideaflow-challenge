import { ContentState } from 'draft-js';
import React, { useCallback, useRef } from 'react';
import ReactDOM from 'react-dom';

const TriggerComponent: React.FC<{
    children: React.ReactNode;
    entityKey: string;
    contentState: ContentState;
}> = ({ children, entityKey, contentState }) => {
    const triggerSpan = useRef<HTMLSpanElement>(null);
    if (triggerSpan.current) {
        console.log(triggerSpan.current.getRootNode());
    }
    return (
        <>
            <span
                ref={triggerSpan}
                style={{
                    position: 'relative',
                    color: 'lightsteelblue',
                    zIndex: 9
                }}
            >
                {children}
            </span>
        </>
    );
};

const Popup: React.FC = () => {
    return (
        <div
            style={{
                zIndex: -1,
                position: 'fixed',
                top: 20,
                left: 0
            }}
            contentEditable={false}
        >
            here
        </div>
    );
};

ReactDOM.render(
    <Popup />,
    document.body.appendChild(document.createElement('div'))
);

export default TriggerComponent;
