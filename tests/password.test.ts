import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "../lib/password";

describe("credenciais", () => {
  it("armazena senha como hash e rejeita segredo incorreto", async () => {
    const hash = await hashPassword("segredo-de-teste-comprido");
    expect(hash).not.toContain("segredo-de-teste-comprido");
    await expect(verifyPassword("segredo-de-teste-comprido", hash)).resolves.toBe(true);
    await expect(verifyPassword("outra-senha-invalida", hash)).resolves.toBe(false);
  });
});
