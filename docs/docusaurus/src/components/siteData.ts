/** Badge metadata displayed in hero and project badge strips. */
export type SiteBadge = Readonly<{
    alt: string;
    href: string;
    src: string;
}>;

/** Link-card data rendered by the docs site landing and resource pages. */
export type SiteLinkCard = Readonly<{
    cta: string;
    description: string;
    href?: string;
    icon?: string;
    title: string;
    to?: string;
}>;

/** Short explanatory reason shown in project signal lists. */
export type SiteReason = Readonly<{
    description: string;
    title: string;
}>;

/** Grouped resource links rendered by the resources page. */
export type SiteResourceGroup = Readonly<{
    items: readonly SiteLinkCard[];
    title: string;
}>;

/**
 * Resolve a Docusaurus `Link` destination from shared site-card data.
 *
 * @throws TypeError When the link card is missing both `href` and `to`.
 */
export function getSiteLinkProps(
    linkCard: SiteLinkCard
): { href: string } | { to: string } {
    if (typeof linkCard.href === "string") {
        return { href: linkCard.href };
    }

    if (typeof linkCard.to === "string") {
        return { to: linkCard.to };
    }

    throw new TypeError(
        `Link card "${linkCard.title}" is missing a destination.`
    );
}

const projectBase = "https://github.com/Nick2bad4u/eslint-plugin-codex";
const npmPackageBase =
    "https://www.npmjs.com/package/@typpi/eslint-plugin-codex";

/** Live repository and package health badges rendered on public pages. */
export const liveBadges = [
    {
        alt: "npm license",
        href: `${projectBase}/blob/main/LICENSE`,
        src: "https://flat.badgen.net/npm/license/@typpi/eslint-plugin-codex?color=6d28d9",
    },
    {
        alt: "npm downloads",
        href: npmPackageBase,
        src: "https://flat.badgen.net/npm/dt/@typpi/eslint-plugin-codex?color=ec4899",
    },
    {
        alt: "latest GitHub release",
        href: `${projectBase}/releases`,
        src: "https://flat.badgen.net/github/release/Nick2bad4u/eslint-plugin-codex?color=06b6d4",
    },
    {
        alt: "GitHub stars",
        href: `${projectBase}/stargazers`,
        src: "https://flat.badgen.net/github/stars/Nick2bad4u/eslint-plugin-codex?color=facc15",
    },
    {
        alt: "GitHub open issues",
        href: `${projectBase}/issues`,
        src: "https://flat.badgen.net/github/open-issues/Nick2bad4u/eslint-plugin-codex?color=ef4444",
    },
    {
        alt: "Codecov",
        href: "https://codecov.io/gh/Nick2bad4u/eslint-plugin-codex",
        src: "https://codecov.io/gh/Nick2bad4u/eslint-plugin-codex/branch/main/graph/badge.svg",
    },
] as const satisfies readonly SiteBadge[];

/** Primary homepage cards that route visitors into the main docs surfaces. */
export const homePrimaryCards = [
    {
        cta: "Open section",
        description:
            "Install the plugin, choose a preset, and start linting Codex customization files in a modern flat config.",
        icon: "overview",
        title: "Get Started",
        to: "/docs/rules/getting-started",
    },
    {
        cta: "Open section",
        description:
            "Compare minimal, recommended, strict, and all to pick the right baseline for your repository.",
        icon: "presets",
        title: "Presets",
        to: "/docs/rules/presets",
    },
    {
        cta: "Open section",
        description:
            "Browse the rule catalog, overview guidance, and stable documentation routes used by the plugin metadata.",
        icon: "rules",
        title: "Rule Reference",
        to: "/docs/rules/",
    },
] as const satisfies readonly SiteLinkCard[];

/** Project-level public links that demonstrate repository health and activity. */
export const projectHighlights = [
    {
        cta: "Open releases",
        description:
            "Review tagged releases, compare versions, and inspect the public release stream for the plugin.",
        href: `${projectBase}/releases`,
        icon: "🏷️",
        title: "Releases",
    },
    {
        cta: "Read changelog",
        description:
            "Track behavior changes, fixes, and user-facing improvements in the repository changelog.",
        href: `${projectBase}/blob/main/CHANGELOG.md`,
        icon: "📝",
        title: "Changelog",
    },
    {
        cta: "View package",
        description:
            "Inspect install metadata, versioning, and package distribution from npm.",
        href: npmPackageBase,
        icon: "📦",
        title: "npm package",
    },
    {
        cta: "Inspect coverage",
        description:
            "Use live Codecov reports to monitor test coverage for the repository over time.",
        href: "https://codecov.io/gh/Nick2bad4u/eslint-plugin-codex",
        icon: "📊",
        title: "Coverage",
    },
    {
        cta: "Report an issue",
        description:
            "Open or review repository issues when you need to track gaps, fixes, or docs improvements.",
        href: `${projectBase}/issues`,
        icon: "🐞",
        title: "Issues",
    },
    {
        cta: "Review security",
        description:
            "Check the public security policy and security-adjacent repository guidance.",
        href: `${projectBase}/security`,
        icon: "🔐",
        title: "Security",
    },
] as const satisfies readonly SiteLinkCard[];

/** High-level project signals used to explain the plugin's maintenance posture. */
export const projectSignals = [
    {
        description:
            "This repository treats docs as part of the product surface, not as an afterthought. Release notes, README links, preset sync, and docs link validation are already part of the broader quality story.",
        title: "Docs and metadata stay aligned",
    },
    {
        description:
            "The plugin is focused on real Codex repository customization assets, so examples and rule pages map directly to files teams already maintain.",
        title: "Built for real repository workflows",
    },
    {
        description:
            "Public signals like releases, issues, downloads, stars, and coverage are surfaced directly here so maintainers and adopters can assess project health quickly.",
        title: "Live health signals are front and center",
    },
] as const satisfies readonly SiteReason[];

/** Resource groups for contributor and adopter-oriented reference links. */
export const resourceGroups = [
    {
        items: [
            {
                cta: "Read getting started",
                description:
                    "Install the plugin and understand the Markdown, TOML, and JSON surfaces its presets configure.",
                icon: "📚",
                title: "Getting started",
                to: "/docs/rules/getting-started",
            },
            {
                cta: "Read overview",
                description:
                    "See the high-level coverage model and the design goals behind the rule set.",
                icon: "🧭",
                title: "Rule overview",
                to: "/docs/rules/",
            },
            {
                cta: "Compare presets",
                description:
                    "Use the preset matrix to decide whether your repository needs a minimal baseline or strict enforcement.",
                icon: "📦",
                title: "Preset matrix",
                to: "/docs/rules/presets",
            },
        ],
        title: "Documentation paths",
    },
    {
        items: [
            {
                cta: "Open README",
                description:
                    "Review installation, quick start, preset examples, and the public-facing rule catalog from the repository root.",
                href: `${projectBase}/blob/main/README.md`,
                icon: "📄",
                title: "README",
            },
            {
                cta: "Read contributing guide",
                description:
                    "Use the contributor guide when changing rules, docs, release surfaces, or repository workflows.",
                href: `${projectBase}/blob/main/CONTRIBUTING.md`,
                icon: "🤝",
                title: "Contributing",
            },
            {
                cta: "Browse scripts",
                description:
                    "Inspect the sync, docs, validation, and maintenance scripts that keep the repository consistent.",
                href: `${projectBase}/tree/main/scripts`,
                icon: "🧰",
                title: "Repository scripts",
            },
        ],
        title: "Implementation references",
    },
    {
        items: [
            {
                cta: "Open support policy",
                description:
                    "Understand how the repository handles support expectations and communication channels.",
                href: `${projectBase}/blob/main/SUPPORT.md`,
                icon: "💬",
                title: "Support",
            },
            {
                cta: "Review security policy",
                description:
                    "Check the security policy before reporting vulnerabilities or making security-adjacent changes.",
                href: `${projectBase}/blob/main/SECURITY.md`,
                icon: "🛡️",
                title: "Security policy",
            },
            {
                cta: "Read code of conduct",
                description:
                    "Use the project’s code of conduct and community guidance when contributing or moderating interactions.",
                href: `${projectBase}/blob/main/CODE_OF_CONDUCT.md`,
                icon: "🌐",
                title: "Code of conduct",
            },
        ],
        title: "Community and policy",
    },
] as const satisfies readonly SiteResourceGroup[];
