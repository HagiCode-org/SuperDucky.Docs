import { describe, expect, it } from "vitest";

import {
  type DocsEditLinkRoute,
  resolveDocsEditLink,
} from "@/lib/docs-edit-link";

function createRoute(
  route: Partial<DocsEditLinkRoute> = {},
): DocsEditLinkRoute {
  return {
    id: "",
    locale: "root",
    entry: {},
    ...route,
  };
}

describe("resolveDocsEditLink", () => {
  it("points root-locale content files at the docs repository root", () => {
    const result = resolveDocsEditLink(
      createRoute({
        id: "product-overview",
        entry: {
          filePath: "src/content/docs/product-overview.mdx",
        },
      }),
    );

    expect(result).toMatchObject({
      isVisible: true,
      sourcePath: "src/content/docs/product-overview.mdx",
      repoPath: "src/content/docs/product-overview.mdx",
      href: "https://github.com/HagiCode-org/SuperDucky.Docs/edit/main/src/content/docs/product-overview.mdx",
    });
  });

  it("preserves localized English paths when building edit links", () => {
    const result = resolveDocsEditLink(
      createRoute({
        id: "en-US/blog/2026-11-22-welcome",
        locale: "en-US",
        entry: {
          filePath:
            "src/content/translations/docs/en-US/blog/2026-11-22-welcome.mdx",
        },
      }),
    );

    expect(result).toMatchObject({
      isVisible: true,
      sourcePath:
        "src/content/translations/docs/en-US/blog/2026-11-22-welcome.mdx",
      repoPath:
        "src/content/translations/docs/en-US/blog/2026-11-22-welcome.mdx",
      href: "https://github.com/HagiCode-org/SuperDucky.Docs/edit/main/src/content/translations/docs/en-US/blog/2026-11-22-welcome.mdx",
    });
  });

  it("preserves concrete index source files for root and English routes", () => {
    const rootResult = resolveDocsEditLink(
      createRoute({
        id: "release-notes",
        entry: {
          filePath: "src/content/docs/release-notes/index.mdx",
        },
      }),
    );
    const englishResult = resolveDocsEditLink(
      createRoute({
        id: "en-US/release-notes",
        locale: "en-US",
        entry: {
          filePath: "src/content/translations/docs/en-US/release-notes/index.mdx",
        },
      }),
    );

    expect(rootResult.repoPath).toBe(
      "src/content/docs/release-notes/index.mdx",
    );
    expect(englishResult.repoPath).toBe(
      "src/content/translations/docs/en-US/release-notes/index.mdx",
    );
  });

  it("falls back to a locale-aware route lookup when filePath metadata is unavailable", () => {
    const result = resolveDocsEditLink(
      createRoute({
        id: "en-US/product-overview",
        locale: "en-US",
      }),
      {
        fileExists: (sourcePath) =>
          sourcePath === "src/content/translations/docs/en-US/product-overview.mdx",
      },
    );

    expect(result).toMatchObject({
      isVisible: true,
      sourcePath: "src/content/translations/docs/en-US/product-overview.mdx",
      repoPath: "src/content/translations/docs/en-US/product-overview.mdx",
    });
  });

  it("resolves a root blog post to the real docs repository file", () => {
    const result = resolveDocsEditLink(
      createRoute({
        id: "blog/2026-11-22-welcome",
        entry: {
          filePath: "src/content/docs/blog/2026-11-22-welcome.mdx",
        },
      }),
    );

    expect(result).toMatchObject({
      isVisible: true,
      sourcePath: "src/content/docs/blog/2026-11-22-welcome.mdx",
      repoPath: "src/content/docs/blog/2026-11-22-welcome.mdx",
      href: "https://github.com/HagiCode-org/SuperDucky.Docs/edit/main/src/content/docs/blog/2026-11-22-welcome.mdx",
    });
  });

  it("hides the CTA when the route cannot be mapped to a docs markdown file", () => {
    const invalidFileResult = resolveDocsEditLink(
      createRoute({
        id: "blog/authors",
        entry: {
          filePath: "src/content/docs/blog/authors.yml",
        },
      }),
    );
    const missingRouteResult = resolveDocsEditLink(
      createRoute({
        id: "contributors",
      }),
      {
        fileExists: () => false,
      },
    );
    const syntheticRouteResult = resolveDocsEditLink(
      createRoute({
        id: "blog",
        entry: {
          filePath: "src/content/docs/blog.md",
        },
      }),
      {
        fileExists: () => false,
      },
    );

    expect(invalidFileResult).toEqual({ isVisible: false });
    expect(missingRouteResult).toEqual({ isVisible: false });
    expect(syntheticRouteResult).toEqual({ isVisible: false });
  });
});
