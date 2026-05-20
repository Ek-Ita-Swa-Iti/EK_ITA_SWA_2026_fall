# Session 19: CI/CD and Deployment Architecture

**ITA Software Architecture 2026 Fall | 3 hours**

> How code gets from a developer's laptop to production is itself an architectural concern. A system that takes a week to deploy is a system that's afraid of itself. Today: pipelines, environments, infrastructure-as-code, and the deployment patterns (blue/green, canary, feature flags) that make changes safe.

---

## Learning Goals

- Describe the stages of a typical CI/CD pipeline.
- Plan an environment strategy (dev, staging, prod) and the promotion path between them.
- Recognise the trade-offs of blue/green, canary, and rolling deployments.
- Reason about feature flags as a deployment-decoupling tool.

---

## Before Class

- Look at the CI configuration of an open-source project you know (`.github/workflows/`, `.gitlab-ci.yml`, etc.). Try to read it.

---

## Today's Teachings

### Part 1 — A CI/CD pipeline, end to end (45 min)
Stages of a typical pipeline:
1. **Lint** — style, formatting.
2. **Build** — compile, package, container build.
3. **Test** — unit, integration, end-to-end.
4. **Scan** — security, dependency audit.
5. **Deploy to staging**.
6. **Smoke tests** in staging.
7. **Deploy to production** (with approval, automatic, or both).
8. **Verification** in production.

Where can each step fail? What does each step prevent?

### Part 2 — Environments (30 min)
- Dev / staging / production — the minimum.
- "Staging is production" — the only thing that matters is whether staging is *like* production.
- Production-like data — and the privacy problem with copying real data into staging.
- The "everyone deploys to production all day" model (real, for some teams).

### Part 3 — Deployment patterns (45 min)
- **Rolling**: replace instances one by one. Default for k8s. Simple, slow.
- **Blue/green**: two full environments; switch traffic. Easy rollback, double the cost.
- **Canary**: small slice of traffic to new version first; expand if healthy. Smartest, most complex.
- **Recreate**: take it all down, bring it all up. Sometimes the right choice.
- **Expand–contract** (schema evolution as a deployment pattern): change a database schema in production without downtime by deploying in stages — first expand the schema to tolerate both old and new shapes, migrate data, then contract by removing the old shape. The same "deploy ≠ release" idea that feature flags give to code, applied to data. Introduced in session 9.
- Feature flags as decoupling: deploy ≠ release.

### Part 4 — Infrastructure-as-code (45 min)
- Terraform, Pulumi, CloudFormation, Helm — what each is and is not.
- "Pets vs. cattle" — and why this metaphor still matters.
- The architectural principle: infrastructure is a versioned artefact, reviewed like code.
- Why click-ops in production is a long-term problem even when it's a short-term win.

### Part 5 — Workshop (15 min)
Take the project from sessions 13–16. Sketch what its CI/CD pipeline would look like — five stages, no more. What would each stage check?

---

## Exercise

Add to your sessions-13–16 sketch: an environment strategy and a deployment pattern. Defend the choice in two sentences each.

---

## After Class

- Session 20 (ADRs) is partly about how to record the decision you just made.

## References

- Forsgren, Humble, Kim — *Accelerate* (the DORA metrics are introduced here).
- *Continuous Delivery* — Humble & Farley.
