import Head from "@docusaurus/Head";
import Link from "@docusaurus/Link";
import Layout from "@theme/Layout";
import clsx from "clsx";

import { getSiteLinkProps, resourceGroups } from "../components/siteData";

/** Render the contributor-facing resources index for the docs site. */
export default function ResourcesPage(): React.JSX.Element {
    const relatedPages = [
        {
            description:
                "Go back to the rule overview and grouped sidebar when you need the public reference tree.",
            title: "Rule docs",
            to: "/docs/rules/overview",
        },
        {
            description:
                "Open the maintainer-facing guide for docs architecture, sync workflows, charts, and TypeDoc status.",
            title: "Developer",
            to: "/developer",
        },
        {
            description:
                "Review live releases, package links, issues, and other project health surfaces.",
            title: "Project",
            to: "/project",
        },
    ] as const;

    return (
        <Layout>
            <Head>
                <title>Resources | eslint-plugin-codex</title>
                <meta
                    content="Developer resources for eslint-plugin-codex, including docs routes, contribution references, repository scripts, and community policies."
                    name="description"
                />
            </Head>
            <main className="site-shell">
                <section className="site-hero site-hero--compact">
                    <div className="container site-hero__grid">
                        <div className="site-hero__copy">
                            <p className="site-kicker">Resources</p>
                            {/* eslint-disable-next-line @docusaurus/prefer-docusaurus-heading -- The docs workspace does not expose @theme/Heading types to TypeScript in this repo setup. */}
                            <h1 className="site-hero__title">
                                Contributor and integrator references without
                                the scavenger hunt.
                            </h1>
                            <p className="site-page-intro">
                                Use this page when you need the fastest path to
                                rule docs, preset guidance, repository
                                standards, scripts, and contributor-facing
                                references.
                            </p>
                            <div className="site-actions">
                                <Link
                                    className="button button--primary button--lg"
                                    to="/docs/rules/overview"
                                >
                                    Browse docs
                                </Link>
                                <Link
                                    className="button button--secondary button--lg"
                                    href="https://github.com/Nick2bad4u/eslint-plugin-codex/blob/main/CONTRIBUTING.md"
                                >
                                    Read contributing guide
                                </Link>
                            </div>
                        </div>
                        <aside className="site-hero__panel">
                            <p className="site-panel__label">Who this is for</p>
                            {/* eslint-disable-next-line @docusaurus/prefer-docusaurus-heading -- The docs workspace does not expose @theme/Heading types to TypeScript in this repo setup. */}
                            <h2 className="site-panel__title">
                                Better entry points for maintainers and advanced
                                adopters
                            </h2>
                            <ul className="site-checklist">
                                <li>
                                    <strong>Integrators</strong>
                                    <span>
                                        Find the docs you need to wire the
                                        plugin into an existing flat config
                                        quickly.
                                    </span>
                                </li>
                                <li>
                                    <strong>Contributors</strong>
                                    <span>
                                        Jump straight to the repo policies,
                                        scripts, and sync surfaces that shape a
                                        high-quality change.
                                    </span>
                                </li>
                                <li>
                                    <strong>Maintainers</strong>
                                    <span>
                                        Keep the docs site aligned with the rest
                                        of the project instead of treating it as
                                        a disconnected app.
                                    </span>
                                </li>
                            </ul>
                        </aside>
                    </div>
                </section>

                {resourceGroups.map((group) => (
                    <section
                        className="container site-section"
                        key={group.title}
                    >
                        <div className="site-section__header">
                            <div>
                                <p className="site-section__eyebrow">
                                    Resources
                                </p>
                                {/* eslint-disable-next-line @docusaurus/prefer-docusaurus-heading -- The docs workspace does not expose @theme/Heading types to TypeScript in this repo setup. */}
                                <h2 className="site-section__title">
                                    {group.title}
                                </h2>
                            </div>
                        </div>
                        <div className="site-grid site-grid--3">
                            {group.items.map((item) => (
                                <article
                                    className="site-link-tile"
                                    key={item.title}
                                >
                                    <span
                                        aria-hidden
                                        className="site-link-tile__icon"
                                    >
                                        {item.icon}
                                    </span>
                                    {/* eslint-disable-next-line @docusaurus/prefer-docusaurus-heading -- The docs workspace does not expose @theme/Heading types to TypeScript in this repo setup. */}
                                    <h3 className="site-link-tile__title">
                                        {item.title}
                                    </h3>
                                    <p className="site-link-tile__description">
                                        {item.description}
                                    </p>
                                    <Link
                                        className={clsx(
                                            "site-link-tile__link",
                                            "link",
                                            "link--primary"
                                        )}
                                        {...getSiteLinkProps(item)}
                                    >
                                        {item.cta} →
                                    </Link>
                                </article>
                            ))}
                        </div>
                    </section>
                ))}

                <section className="container site-section">
                    <div className="site-section__header">
                        <div>
                            <p className="site-section__eyebrow">Related</p>
                            {/* eslint-disable-next-line @docusaurus/prefer-docusaurus-heading -- The docs workspace does not expose @theme/Heading types to TypeScript in this repo setup. */}
                            <h2 className="site-section__title">
                                Keep the pages connected
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
