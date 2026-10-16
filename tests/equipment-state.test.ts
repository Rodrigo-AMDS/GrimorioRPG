import { describe, expect, it } from "vitest";
import { conflictingEquipmentSlots, updateEquippedItems } from "../lib/equipment-state";

describe("equipamento otimista", () => {
  it("libera as duas mãos quando uma arma de duas mãos é equipada", () => {
    const items = [
      { id: "sword", equippedSlot: "PRIMARY_MAIN" },
      { id: "shield", equippedSlot: "PRIMARY_OFF" },
      { id: "bow", equippedSlot: null }
    ];
    expect(conflictingEquipmentSlots("PRIMARY_TWO_HANDS")).toEqual(["PRIMARY_MAIN", "PRIMARY_OFF", "PRIMARY_TWO_HANDS"]);
    expect(updateEquippedItems(items, "bow", "PRIMARY_TWO_HANDS")).toEqual([
      { id: "sword", equippedSlot: null },
      { id: "shield", equippedSlot: null },
      { id: "bow", equippedSlot: "PRIMARY_TWO_HANDS" }
    ]);
  });

  it("ao desequipar, mantém os outros itens no lugar", () => {
    const items = [{ id: "sword", equippedSlot: "PRIMARY_MAIN" }, { id: "helm", equippedSlot: "HEAD" }];
    expect(updateEquippedItems(items, "sword", null)).toEqual([
      { id: "sword", equippedSlot: null },
      { id: "helm", equippedSlot: "HEAD" }
    ]);
  });
});
