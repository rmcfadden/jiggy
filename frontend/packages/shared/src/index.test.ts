import { expect, it } from "vitest";
import { greet } from "./index";

it("greets by name", () => {
  expect(greet("Jiggy").message).toBe("Hello, Jiggy!");
});
