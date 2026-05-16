export const template = `
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ProjectListPage } from "@/features/ProjectList/ProjectListPage";

describe("ProjectListPage 結合テスト", () => {

  beforeEach(() => {
    vi.mock("@api/tauri/projectApi", () => ({
      projectApi: {
        search: vi.fn().mockResolvedValue({
          items: mockItems,
          total_num: mockItems.length,
        }),
        create: vi.fn().mockResolvedValue({ ok: true }),
        update: vi.fn().mockResolvedValue({ ok: true }),
        delete: vi.fn().mockResolvedValue({ ok: true }),
      }
    }));
  });

  it("検索 → ページング → 編集 → 保存 → 削除 の一連の操作が動作する", async () => {

    render(<ProjectListPage />);

    // 検索条件入力
    await userEvent.type(screen.getByLabelText("プロジェクト名"), "テスト");

    // 検索実行
    await userEvent.click(screen.getByText("検索"));

    // 次ページ
    await userEvent.click(screen.getByText("次へ"));

    // 前ページ
    await userEvent.click(screen.getByText("前へ"));

    // 編集開始
    await userEvent.click(screen.getByText("編集"));

    // フォーム入力
    await userEvent.type(screen.getByLabelText("名称"), "修正後");

    // 保存
    await userEvent.click(screen.getByText("保存"));

    // 削除
    await userEvent.click(screen.getByText("削除"));

    // API 呼び出し検証
    expect(projectApi.search).toHaveBeenCalled();
    expect(projectApi.update).toHaveBeenCalled();
    expect(projectApi.delete).toHaveBeenCalled();

    // UI 検証
    expect(screen.getByText("修正後")).toBeInTheDocument();
  });
});
`