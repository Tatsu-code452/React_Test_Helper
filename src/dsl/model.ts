export type Domain =
    | "search"
    | "table"
    | "pagination"
    | "modal";

export const Domains: Domain[] = [
    "search",
    "table",
    "pagination",
    "modal",
];

export type StateMachine = {
    state: string,
    event: Event,
    result: Result,
    nextState: string,
    expect?: Expect,
}

export type Event = {
    type: "click" | "change" | "blur" | "keydown";
    target: "button" | "input" | "select";
    name: string;
    key?: string;
};

export type State = string; // dom.md の State 名

export type Result = "SUCCESS" | "FAIL" | "CANCEL" | "NOOP";

export type Expect = {
    domain: Domain;
    state: State;
};

// dom
export type DomState = {
    domain: Domain;
    state: State;
    assertions: Assertion[];
};

export type Assertion =
    | { type: "input"; name: string; value: "empty" | "exist" }
    | { type: "select"; name: string; value: "empty" | "exist" }
    | { type: "row"; value: "none" | "exist" | "added" | "updated" | "removed" }
    | { type: "text"; value: string }
    | { type: "button"; name: string; enabled: boolean }
    | { type: "role"; name: "dialog"; visible: boolean };

export type AssertionKey = Assertion["type"];
export type AssertionValue<T extends AssertionKey> =
    Omit<Extract<Assertion, { type: T }>, "type">;

