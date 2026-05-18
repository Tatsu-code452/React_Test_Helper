// 複数定義されている可能性があるため、先頭のみ参照させる
export const testWrapper = {
    queryAllByRole: (role: string) => `queryAllByRole("${role}")`,
    getByText: (name: string) => `getAllByText("${name}")`,
    getByRole: (role: string, name?: string) =>
        name
            ? `getAllByRole("${role}", { name: "${name}" })`
            : `getAllByRole("${role}")`,
    getByLabelText: (name: string) => `getAllByLabelText("${name}")`,
};

export const expectExists = (expr: string) =>
    `expect(screen.${expr}[0]).toBeInTheDocument();`;

export const expectNotExists = (expr: string) =>
    `expect(screen.${expr}[0]).not.toBeInTheDocument();`;

export const expectEnabled = (expr: string) =>
    `expect(screen.${expr}[0]).toBeEnabled();`;

export const expectDisabled = (expr: string) =>
    `expect(screen.${expr}[0]).toBeDisabled();`;

export const expectValue = (expr: string, value: string) =>
    `expect(screen.${expr}[0]).toHaveValue("${value}");`;

export const expectNotValue = (expr: string, value: string) =>
    `expect(screen.${expr}[0]).not.toHaveValue("${value}");`;
