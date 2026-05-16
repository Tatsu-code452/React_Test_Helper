import { screen } from "@testing-library/react";
import { expect } from "vitest";

export const assertSearchNotInput = () => {
    expect(screen.getByLabelText("案件名")).toHaveValue("");
    expect(screen.getByLabelText("顧客名")).toHaveValue("");
    expect(screen.getByLabelText("ステータス")).toHaveValue("");
};

export const assertSearchInput = () => {
    expect(screen.getByLabelText("案件名")).not.toHaveValue("");
    expect(screen.getByLabelText("顧客名")).not.toHaveValue("");
    expect(screen.getByLabelText("ステータス")).not.toHaveValue("");
};


//=============
export const assertTableNotExistData = () => {
    expect(screen.queryAllByRole("row")).toHaveLength(0);
};

export const assertTableOnePage = () => {
    expect(screen.queryAllByRole("row").length).toBeGreaterThan(0);
};

export const assertTableFirstPage = assertTableOnePage;
export const assertTableSecondPage = assertTableOnePage;
export const assertTableLastPage = assertTableOnePage;

//=====

export const assertPaginationNotExistData = () => {
    expect(screen.getByText("0 件の結果")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "《" })).toBeDisabled();
    expect(screen.getByText("1 / 1")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "》" })).toBeDisabled();
};

export const assertPaginationOnePage = () => {
    expect(screen.getByText("10 件の結果")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "《" })).toBeDisabled();
    expect(screen.getByText("1 / 1")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "》" })).toBeDisabled();
};

export const assertPaginationFirstPage = () => {
    expect(screen.getByText("100 件の結果")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "《" })).toBeDisabled();
    expect(screen.getByText("1 / 5")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "》" })).toBeEnabled();
};

export const assertPaginationSecondPage = () => {
    expect(screen.getByText("100 件の結果")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "《" })).toBeEnabled();
    expect(screen.getByText("2 / 5")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "》" })).toBeEnabled();
};

export const assertPaginationLastPage = () => {
    expect(screen.getByText("100 件の結果")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "《" })).toBeEnabled();
    expect(screen.getByText("5 / 5")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "》" })).toBeDisabled();
};

// =======

export const assertModalCreate = () => {
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("新規作成")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "作成" })).toBeInTheDocument();
};

export const assertModalUpdate = () => {
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("編集")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "更新" })).toBeInTheDocument();
};
