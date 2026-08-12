export type GitCliffArgumentsContext = {
    readonly additionalArguments: readonly string[];
    readonly headParent: string | null;
    readonly headSubject: string;
    readonly headTags: readonly string[];
    readonly previousTag: string | null;
};

export function buildGitCliffArguments(
    context: GitCliffArgumentsContext
): string[];

export function resolvePackageVersionTag(packageJsonContent: string): string;
