export const DomainKeys = [
    "search",
    "table",
    "pagination",
    "modal",
] as const;
export type Domain = typeof DomainKeys[number];

export type StateMachine = {
    state: string,
    event: Event,
    result: Result,
    nextState: string,
    expect?: Expect,
}

export const EventKeys = [
    "click",
    "change",
    "blur",
    "keydown"
] as const;
export const EventTargets = [
    "button",
    "input",
    "select"
] as const;
export type Event = {
    type: typeof EventKeys[number];
    target: typeof EventTargets[number];
    name: string;
    key?: string;
};

export type State = string; // dom.md の State 名

export const ResultKeys = [
    "SUCCESS",
    "FAIL",
    "CANCEL",
    "NOOP"
];

export type Result = typeof ResultKeys[number];

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

export const AssertionKeys = [
    "input",
    "select",
    "row",
    "text",
    "button",
    "role"
] as const;
export type Assertion =
    | { type: "input"; name: string; value: "empty" | "exist" }
    | { type: "select"; name: string; value: "empty" | "exist" }
    | { type: "row"; value: "none" | "exist" | "added" | "updated" | "removed" }
    | { type: "text"; value: string }
    | { type: "button"; name: string; enabled: boolean }
    | { type: "role"; name: "dialog"; visible: boolean };

export type AssertionKey = typeof AssertionKeys[number];
export type AssertionValue<T extends AssertionKey> =
    Omit<Extract<Assertion, { type: T }>, "type">;

// Scenario
export type ScenarioStep = {
    event: string;
    expect: string;
};

export type Scenario = {
    name: string;
    steps: ScenarioStep[];
};