import Head from "@docusaurus/Head";
import Link from "@docusaurus/Link";
import Layout from "@theme/Layout";
import clsx from "clsx";

import {
    getSiteLinkProps,
    liveBadges,
    projectHighlights,
    projectSignals,
} from "../components/siteData";

/** Render the project-signal page for releases, quality, and package links. */
export default function ProjectPage(): React.JSX.Element {
    const relatedPages = [
        {
            description:
                "Jump to contributor-facing implementation references, policies, and repo standards.",
            title: "Resources",
            to: "/resources",
        },
        {
            description:
                "Open the maintainer page for docs architecture, sync flows, ADR topics, and TypeDoc status.",
            title: "Developer",
            to: "/developer",
        },
        {
            description:
                "Return to the public rule overview and preset docs after checking project trust signals.",
            title: "Rule docs",
            to: "/docs/rules/",
        },
    ] as const;

    return (
        <Layout>
            <Head>
                <title>Project | eslint-plugin-codex</title>
                <meta
                    content="Project-level information for eslint-plugin-codex, including releases, changelog, package links, issues, security, and live quality badges."
                    name="description"
                />
            </Head>
            <main className="site-shell">
                <section className="site-hero site-hero--compact">
                    <div className="container site-hero__grid">
                        <div className="site-hero__copy">
                            <p className="site-kicker">Project</p>
                            {/* eslint-disable-next-line @docusaurus/prefer-docusaurus-heading -- The docs workspace does not expose @theme/Heading types to TypeScript in this repo setup. */}
                            <h1 className="site-hero__title">
                                Live package, release, and repository signals in
                                one place.
                            </h1>
                            <p className="site-page-intro">
                                This page collects the public project surfaces
                                that matter when evaluating, adopting, or
                                contributing to <code>eslint-plugin-codex</code>
                                .
                            </p>
                            <div className="site-actions">
                                <Link
                                    className="button button--primary button--lg"
                                    href="https://github.com/Nick2bad4u/eslint-plugin-codex"
                                >
                                    Open repository
                                </Link>
                                <Link
                                    className="button button--secondary button--lg"
                                    href="https://www.npmjs.com/package/eslint-plugin-codex"
                                >
                                    Open npm package
                                </Link>
                            </div>
                            <div className="site-badge-strip">
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
                        <aside className="site-hero__panel">
                            <p className="site-panel__label">
                                What this surfaces
                            </p>
                            {/* eslint-disable-next-line @docusaurus/prefer-docusaurus-heading -- The docs workspace does not expose @theme/Heading types to TypeScript in this repo setup. */}
                            <h2 className="site-panel__title">
                                Repository trust signals for adopters and
                                maintainers
                            </h2>
                            <ul className="site-checklist">
                                {projectSignals.map((signal) => (
                                    <li key={signal.title}>
                                        <strong>{signal.title}</strong>
                                        <span>{signal.description}</span>
                                    </li>
                                ))}
                            </ul>
                        </aside>
                    </div>
                </section>

                <section className="container site-section">
                    <div className="site-section__header">
                        <div>
                            <p className="site-section__eyebrow">Signals</p>
                            {/* eslint-disable-next-line @docusaurus/prefer-docusaurus-heading -- The docs workspace does not expose @theme/Heading types to TypeScript in this repo setup. */}
                            <h2 className="site-section__title">
                                Open the surfaces that answer real evaluation
                                questions
                            </h2>
                        </div>
                        <p className="site-inline-note">
                            When a user asks whether the project is active,
                            stable, or well-documented, these are the links that
                            matter.
                        </p>
                    </div>
                    <div className="site-grid site-grid--3">
                        {projectHighlights.map((highlight) => (
                            <article
                                className="site-link-tile"
                                key={highlight.title}
                            >
                                <span
                                    aria-hidden
                                    className="site-link-tile__icon"
                                >
                                    {highlight.icon}
                                </span>
                                {/* eslint-disable-next-line @docusaurus/prefer-docusaurus-heading -- The docs workspace does not expose @theme/Heading types to TypeScript in this repo setup. */}
                                <h3 className="site-link-tile__title">
                                    {highlight.title}
                                </h3>
                                <p className="site-link-tile__description">
                                    {highlight.description}
                                </p>
                                <Link
                                    className={clsx(
                                        "site-link-tile__link",
                                        "link",
                                        "link--primary"
                                    )}
                                    {...getSiteLinkProps(highlight)}
                                >
                                    {highlight.cta} →
                                </Link>
                            </article>
                        ))}
                    </div>
                </section>

                <section className="container site-section">
                    <div className="site-section__header">
                        <div>
                            <p className="site-section__eyebrow">Next</p>
                            {/* eslint-disable-next-line @docusaurus/prefer-docusaurus-heading -- The docs workspace does not expose @theme/Heading types to TypeScript in this repo setup. */}
                            <h2 className="site-section__title">
                                Keep moving through the docs surfaces
                            </h2>
                        </div>
                    </div>
                    <div className="site-grid site-grid--3">
                        {relatedPages.map((page) => (
                            <article
                                className="site-link-tile"
                                key={page.title}
                            >
                                {/* eslint-disable-next-line @docusaurus/prefer-docusaurus-heading -- The docs workspace does not expose @theme/Heading types to TypeScript in this repo setup. */}
                                <h3 className="site-link-tile__title">
                                    {page.title}
                                </h3>
                                <p className="site-link-tile__description">
                                    {page.description}
                                </p>
                                <Link
                                    className={clsx(
                                        "site-link-tile__link",
                                        "link",
                                        "link--primary"
                                    )}
                                    to={page.to}
                                >
                                    Open page →
                                </Link>
                            </article>
                        ))}
                    </div>
                </section>
            </main>
        </Layout>
    );
}
