// CopyButton.test.ts
import { describe, it, expect, vi, beforeEach, type MockInstance } from "vitest";
import { mount } from "@vue/test-utils";
import CopyButton from "~/components/Display/CopyButton.vue";

describe("CopyButton", () => {
  let writeTextMock: MockInstance;

  beforeEach(() => {
    // Mock the clipboard API
    writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      value: {
        writeText: writeTextMock,
      },
      configurable: true,
    });
  });

  it("renders correctly with default props", () => {
    const wrapper = mount(CopyButton);
    expect(wrapper.find("button").exists()).toBe(true);
    expect(wrapper.text()).toContain("Copy Markdown");
  });

  it("copies content to clipboard and shows success feedback", async () => {
    const testContent = "# Test Markdown";
    const wrapper = mount(CopyButton, {
      props: {
        markdownContent: testContent,
      },
    });

    // Click the button
    await wrapper.find("button").trigger("click");

    // Verify clipboard API was called with correct content
    expect(writeTextMock).toHaveBeenCalledWith(testContent);

    // Verify the button text and icon changed
    expect(wrapper.text()).toContain("Copied!");

    // Advance timers to verify it reverts back
    vi.advanceTimersByTime(2000);
    await wrapper.vm.$nextTick();

    // Should be back to original state
    expect(wrapper.text()).toContain("Copy Markdown");
  });

  it("does not attempt to copy when content is empty", async () => {
    const wrapper = mount(CopyButton, {
      props: {
        markdownContent: "",
      },
    });

    await wrapper.find("button").trigger("click");
    expect(writeTextMock).not.toHaveBeenCalled();
  });

  it("handles clipboard API errors gracefully", async () => {
    // Mock a failed clipboard operation
    writeTextMock.mockRejectedValueOnce(new Error("Clipboard error"));

    const wrapper = mount(CopyButton, {
      props: {
        markdownContent: "Test content",
      },
    });

    // Should not throw errors when clipboard fails
    await expect(
      wrapper.find("button").trigger("click")
    ).resolves.not.toThrow();
    expect(wrapper.text()).toContain("Copy Markdown"); // Should not change text on error
  });
});
