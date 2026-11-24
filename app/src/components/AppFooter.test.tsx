// story: e01s02
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AppFooter } from "./AppFooter";

describe("AppFooter", () => {
  it("shows baked version on landing and console", () => {
    render(<AppFooter testId="landing-app-footer" />);
    expect(screen.getByTestId("landing-app-footer")).toHaveTextContent("v0.1.0-test");
    render(<AppFooter testId="console-app-footer" />);
    expect(screen.getByTestId("console-app-footer")).toHaveTextContent("v0.1.0-test");
  });
});