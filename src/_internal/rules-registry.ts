/**
 * @packageDocumentation
 * Canonical runtime registry for every `@typpi/eslint-plugin-codex` rule.
 */
import type { CodexRuleModule } from "./create-codex-rule.js";
import type { CodexRuleNamePattern } from "./rule-catalog.js";

import maxAgentsInstructionChainBytesRule from "../rules/max-agents-instruction-chain-bytes.js";
import noConflictingMcpToolListsRule from "../rules/no-conflicting-mcp-tool-lists.js";
import noDeprecatedConfigFeaturesRule from "../rules/no-deprecated-config-features.js";
import noDeprecatedCustomPromptsRule from "../rules/no-deprecated-custom-prompts.js";
import noDuplicateSkillNamesRule from "../rules/no-duplicate-skill-names.js";
import noEmptyAgentsMdRule from "../rules/no-empty-agents-md.js";
import noEmptySkillBodyRule from "../rules/no-empty-skill-body.js";
import noFullAccessWithoutApprovalRule from "../rules/no-full-access-without-approval.js";
import noIgnoredHookMatcherRule from "../rules/no-ignored-hook-matcher.js";
import noIgnoredProjectConfigKeysRule from "../rules/no-ignored-project-config-keys.js";
import noLegacyProfileConfigRule from "../rules/no-legacy-profile-config.js";
import noMixedHookRepresentationsRule from "../rules/no-mixed-hook-representations.js";
import noMixedPermissionModelsRule from "../rules/no-mixed-permission-models.js";
import noUnsupportedHookHandlerRule from "../rules/no-unsupported-hook-handler.js";
import preferEnvironmentMcpCredentialsRule from "../rules/prefer-environment-mcp-credentials.js";
import requireCustomAgentFieldsRule from "../rules/require-custom-agent-fields.js";
import requireExistingRelativeSkillLinksRule from "../rules/require-existing-relative-skill-links.js";
import requireRelativeSkillLinksRule from "../rules/require-relative-skill-links.js";
import requireSkillFrontmatterRule from "../rules/require-skill-frontmatter.js";
import requireSkillLocationRule from "../rules/require-skill-location.js";
import requireSkillMdFilenameRule from "../rules/require-skill-md-filename.js";
import requireSkillNameMatchDirectoryRule from "../rules/require-skill-name-match-directory.js";
import requireValidAgentNicknameCandidatesRule from "../rules/require-valid-agent-nickname-candidates.js";
import requireValidHookEventsRule from "../rules/require-valid-hook-events.js";
import requireValidHookStructureRule from "../rules/require-valid-hook-structure.js";
import requireValidMcpApprovalModeRule from "../rules/require-valid-mcp-approval-mode.js";
import requireValidMcpTransportRule from "../rules/require-valid-mcp-transport.js";
import requireValidSkillCompatibilityRule from "../rules/require-valid-skill-compatibility.js";
import requireValidSkillDescriptionRule from "../rules/require-valid-skill-description.js";
import requireValidSkillDirectoryNameRule from "../rules/require-valid-skill-directory-name.js";
import requireValidSkillLicenseRule from "../rules/require-valid-skill-license.js";
import requireValidSkillNameRule from "../rules/require-valid-skill-name.js";

/** Public rule-module shape exposed through the registry. */
export type RuleWithDocs = CodexRuleModule;

/* eslint-disable canonical/no-re-export -- An ESLint plugin registry intentionally exposes imported rule modules by public rule ID. */
/** Runtime map of rule modules keyed by unqualified rule name. */
export const codexRules: Readonly<Record<CodexRuleNamePattern, RuleWithDocs>> =
    {
        "max-agents-instruction-chain-bytes":
            maxAgentsInstructionChainBytesRule,
        "no-conflicting-mcp-tool-lists": noConflictingMcpToolListsRule,
        "no-deprecated-config-features": noDeprecatedConfigFeaturesRule,
        "no-deprecated-custom-prompts": noDeprecatedCustomPromptsRule,
        "no-duplicate-skill-names": noDuplicateSkillNamesRule,
        "no-empty-agents-md": noEmptyAgentsMdRule,
        "no-empty-skill-body": noEmptySkillBodyRule,
        "no-full-access-without-approval": noFullAccessWithoutApprovalRule,
        "no-ignored-hook-matcher": noIgnoredHookMatcherRule,
        "no-ignored-project-config-keys": noIgnoredProjectConfigKeysRule,
        "no-legacy-profile-config": noLegacyProfileConfigRule,
        "no-mixed-hook-representations": noMixedHookRepresentationsRule,
        "no-mixed-permission-models": noMixedPermissionModelsRule,
        "no-unsupported-hook-handler": noUnsupportedHookHandlerRule,
        "prefer-environment-mcp-credentials":
            preferEnvironmentMcpCredentialsRule,
        "require-custom-agent-fields": requireCustomAgentFieldsRule,
        "require-existing-relative-skill-links":
            requireExistingRelativeSkillLinksRule,
        "require-relative-skill-links": requireRelativeSkillLinksRule,
        "require-skill-frontmatter": requireSkillFrontmatterRule,
        "require-skill-location": requireSkillLocationRule,
        "require-skill-md-filename": requireSkillMdFilenameRule,
        "require-skill-name-match-directory":
            requireSkillNameMatchDirectoryRule,
        "require-valid-agent-nickname-candidates":
            requireValidAgentNicknameCandidatesRule,
        "require-valid-hook-events": requireValidHookEventsRule,
        "require-valid-hook-structure": requireValidHookStructureRule,
        "require-valid-mcp-approval-mode": requireValidMcpApprovalModeRule,
        "require-valid-mcp-transport": requireValidMcpTransportRule,
        "require-valid-skill-compatibility": requireValidSkillCompatibilityRule,
        "require-valid-skill-description": requireValidSkillDescriptionRule,
        "require-valid-skill-directory-name":
            requireValidSkillDirectoryNameRule,
        "require-valid-skill-license": requireValidSkillLicenseRule,
        "require-valid-skill-name": requireValidSkillNameRule,
    };
/* eslint-enable canonical/no-re-export -- End the intentional plugin registry mapping. */
