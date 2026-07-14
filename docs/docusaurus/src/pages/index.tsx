import Head from "@docusaurus/Head";
import Link from "@docusaurus/Link";
import useBaseUrl from "@docusaurus/useBaseUrl";
import Layout from "@theme/Layout";

import {
    getSiteLinkProps,
    homePrimaryCards,
    liveBadges,
} from "../components/siteData";

/** Render the public landing page for \@typpi/eslint-plugin-codex documentation. */
export default function Home(): React.JSX.Element {
    const logoSource = useBaseUrl("/img/logo.svg");

    return (
        <Layout>
            <Head>
                <title>
                    @typpi/eslint-plugin-codex | Codex repository linting
                </title>
                <meta
                    content="@typpi/eslint-plugin-codex validates Codex instructions, skills, agents, TOML configuration, MCP servers, and lifecycle hooks with flat-config-native presets."
                    name="description"
                />
            </Head>
            <main className="site-shell site-shell--home">
                <section className="home-hero">
                    <div className="container home-hero__inner home-hero__layout">
                        <div className="home-hero__content">
                            <div className="home-hero__brand">
                                <img
                                    alt="@typpi/eslint-plugin-codex logo"
                                    className="home-hero__logo"
                                    src={logoSource}
                                />
                                <p className="site-kicker">
                                    Codex repository linting
                                </p>
                            </div>
                            {/* eslint-disable-next-line @docusaurus/prefer-docusaurus-heading -- The docs workspace does not expose @theme/Heading types to TypeScript in this repo setup. */}
                            <h1 className="home-hero__title">
                                @typpi/eslint-plugin-codex
                            </h1>
                            <p className="home-hero__subtitle">
                                Objective ESLint checks for Codex instructions,
                                skills, agents, configuration, MCP servers, and
                                lifecycle hooks.
                            </p>
                            <div className="site-actions home-hero__actions">
                                <Link
                                    className="button button--primary button--lg home-button"
                                    to="/docs/rules/getting-started"
                                >
                                    <span className="home-button__content">
                                        <OverviewIcon />
                                        <span>Start with Overview</span>
                                    </span>
                                </Link>
                                <Link
                                    className="button button--secondary button--lg home-button"
                                    to="/docs/rules/presets"
                                >
                                    <span className="home-button__content">
                                        <PresetsIcon />
                                        <span>Compare Presets</span>
                                    </span>
                                </Link>
                            </div>
                        </div>
                        <aside
                            aria-label="@typpi/eslint-plugin-codex project mark"
                            className="home-hero__visual"
                        >
                            <div className="home-hero__art">
                                <div className="home-hero__artGlow" />
                                <img
                                    alt="@typpi/eslint-plugin-codex terminal and lint-check mark"
                                    className="home-hero__artImage"
                                    src={logoSource}
                                />
                            </div>
                        </aside>
                        <div className="site-badge-strip home-hero__badges home-hero__badges--fullwidth">
                            {liveBadges.map((badge) => (
                                <Link
                                    className="site-badge"
                                    href={badge.href}
                                    key={badge.alt}
                                >
                                    <img
                                        alt={badge.alt}
                                        loading="lazy"
                                        src={badge.src}
                                    />
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="container home-card-grid">
                    {homePrimaryCards.map((card) => (
                        <article className="home-card" key={card.title}>
                            <div className="home-card__heading">
                                <span aria-hidden className="home-card__icon">
                                    {getHomeIcon(card.icon)}
                                </span>
                                {/* eslint-disable-next-line @docusaurus/prefer-docusaurus-heading -- The docs workspace does not expose @theme/Heading types to TypeScript in this repo setup. */}
                                <h2 className="home-card__title">
                                    {card.title}
                                </h2>
                            </div>
                            <p className="home-card__description">
                                {card.description}
                            </p>
                            <Link
                                className="home-card__link"
                                {...getSiteLinkProps(card)}
                            >
                                <span>{card.cta}</span>
                                <ArrowRightIcon />
                            </Link>
                        </article>
                    ))}
                </section>
            </main>
        </Layout>
    );
}

function ArrowRightIcon(): React.JSX.Element {
    return (
        <svg aria-hidden className="ui-icon ui-icon--sm" viewBox="0 0 24 24">
            <path
                d="M5.25 12h13.5m-5.25-5.25 5.25 5.25-5.25 5.25"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.8"
            />
        </svg>
    );
}

function getHomeIcon(icon: string | undefined): React.JSX.Element {
    switch (icon) {
        case "overview": {
            return <OverviewIcon />;
        }

        case "presets": {
            return <PresetsIcon />;
        }

        case "rules": {
            return <RulesIcon />;
        }

        default: {
            return <ArrowRightIcon />;
        }
    }
}

function OverviewIcon(): React.JSX.Element {
    return (
        <svg aria-hidden className="ui-icon" viewBox="0 0 24 24">
            <path
                d="M5.25 6.75h13.5m-13.5 5.25h13.5m-13.5 5.25h8.25"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.8"
            />
        </svg>
    );
}

function PresetsIcon(): React.JSX.Element {
    return (
        <svg aria-hidden className="ui-icon" viewBox="0 0 24 24">
            <path
                d="M4.5 7.5h15m-15 4.5h15m-15 4.5h15"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.8"
            />
            <circle cx="8.25" cy="7.5" fill="currentColor" r="1.1" />
            <circle cx="12" cy="12" fill="currentColor" r="1.1" />
            <circle cx="15.75" cy="16.5" fill="currentColor" r="1.1" />
        </svg>
    );
}

function RulesIcon(): React.JSX.Element {
    return (
        <svg aria-hidden className="ui-icon" viewBox="0 0 24 24">
            <path
                d="M7.5 5.25h7.25l3.75 3.75v9.75a1.5 1.5 0 0 1-1.5 1.5h-9.5a1.5 1.5 0 0 1-1.5-1.5v-12a1.5 1.5 0 0 1 1.5-1.5Z"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.8"
            />
            <path
                d="M14.75 5.25V9h3.75M8.75 12.75h6.5m-6.5 3h4.5"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.8"
            />
        </svg>
    );
}
