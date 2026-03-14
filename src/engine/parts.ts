import type { FamilyStatus } from "./types";

function childParts(childrenCount: number): number {
  if (childrenCount <= 0) return 0;
  if (childrenCount === 1) return 0.5;
  if (childrenCount === 2) return 1;
  return 1 + (childrenCount - 2);
}

export function computeParts(
  familyStatus: FamilyStatus,
  isJointDeclaration: boolean,
  childrenCount: number,
  isLoneParent: boolean,
): number {
  // Married/PACS with joint declaration
  if (familyStatus === "marie_pacse" && isJointDeclaration) {
    return 2 + childParts(childrenCount);
  }

  // Widowed with children = same as married couple
  if (familyStatus === "veuf" && childrenCount > 0) {
    return 2 + childParts(childrenCount);
  }

  // Lone parent (single with exclusive custody)
  if (isLoneParent && childrenCount > 0) {
    return 1 + 0.5 + childParts(childrenCount);
  }

  // Single, widowed without children, or separate declaration
  return 1;
}

export function getBaseParts(
  familyStatus: FamilyStatus,
  isJointDeclaration: boolean,
  childrenCount: number,
): number {
  if (familyStatus === "marie_pacse" && isJointDeclaration) return 2;
  if (familyStatus === "veuf" && childrenCount > 0) return 2;
  return 1;
}
