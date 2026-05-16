
export type UIAttributeInfo = {
    testId?: string;
    id?: string;
    dataAttrs: Record<string, string>;
    events: string[];
    props: Record<string, string>;
    handlerCalls?: string[];
};

export type UIElementInfo = {
    tag: string;
    attr: UIAttributeInfo;
    children: UIElementInfo[];
    condition?: string;
    loop?: string;
};

export type UIAnalysis = {
    elements: UIElementInfo[];
};
