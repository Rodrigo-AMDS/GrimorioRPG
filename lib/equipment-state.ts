export type EquippedItem = { id: string; equippedSlot?: string | null };

export function conflictingEquipmentSlots(slot: string): string[] {
  const primary = ["PRIMARY_MAIN", "PRIMARY_OFF", "PRIMARY_TWO_HANDS"];
  const secondary = ["SECONDARY_MAIN", "SECONDARY_OFF", "SECONDARY_TWO_HANDS"];
  if (slot === "PRIMARY_TWO_HANDS") return primary;
  if (slot === "SECONDARY_TWO_HANDS") return secondary;
  if (primary.includes(slot)) return [slot, "PRIMARY_TWO_HANDS"];
  if (secondary.includes(slot)) return [slot, "SECONDARY_TWO_HANDS"];
  return [slot];
}

export function updateEquippedItems<T extends EquippedItem>(items: T[], itemId: string, slot: string | null): T[] {
  const conflicts = slot ? conflictingEquipmentSlots(slot) : [];
  return items.map((item) => {
    if (item.id === itemId) return { ...item, equippedSlot: slot };
    if (item.equippedSlot && conflicts.includes(item.equippedSlot)) return { ...item, equippedSlot: null };
    return item;
  });
}
