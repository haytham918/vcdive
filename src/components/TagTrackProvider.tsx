import { createContext, useState } from "react";
import React from "react";

export interface TagTrack {
    tag: number | null;
    setTag: (n: number | null) => void;
}

export const TagTrackContext = createContext<TagTrack>({
    tag: null,
    setTag: () => {},
});

const TagTrackProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [tag, setTag] = useState<null | number>(null);

    return (
        <TagTrackContext.Provider value={{ tag, setTag }}>
            {children}
        </TagTrackContext.Provider>
    );
};

export default React.memo(TagTrackProvider);
