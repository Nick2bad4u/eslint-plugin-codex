/**
 * @packageDocumentation
 * Shared duplicate-name helpers for Codex customization files.
 */

/** A named Codex customization file paired with its normalized display name. */
export type NamedCustomizationFile = Readonly<{
    filePath: string;
    name: string;
}>;

/** Group files by normalized name and keep only duplicate groups. */
export const collectDuplicateNameGroups = (
    entries: readonly NamedCustomizationFile[],
    normalizeName: (value: string) => string
): ReadonlyMap<string, readonly NamedCustomizationFile[]> => {
    const groups = new Map<string, NamedCustomizationFile[]>();

    for (const entry of entries) {
        const normalizedName = normalizeName(entry.name);

        if (normalizedName.length === 0) {
            continue;
        }

        const group = groups.get(normalizedName) ?? [];
        group.push(entry);
        groups.set(normalizedName, group);
    }

    return new Map(
        [...groups]
            .filter(([, group]) => group.length > 1)
            .map(([name, group]) => [
                name,
                group.toSorted((left, right) =>
                    left.filePath.localeCompare(right.filePath)
                ),
            ])
    );
};
