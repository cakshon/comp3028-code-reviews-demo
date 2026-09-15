# Instructor setup

## Publish the starter

1. Create an empty GitHub repository or use your intended coursework repository.
2. Extract the archive and upload the contents of its `equipment-loan-code-review` folder to the repository root, including `.github` and `.gitignore`.
3. Keep an unchanged starter branch or tag before distributing student copies.
4. Tell students their deadline, assigned reviewer, submission channel, and target branch. These institution-specific details are intentionally not invented in the brief.
5. Use individual copies or forks so one student's solution does not replace the shared starter.

No repository has been created or published by this package. No CI workflow is included. If you add CI, the starter acceptance suite should initially be red.

## Expected baseline

- `npm run demo`: succeeds using in-memory records.
- `npm run test:smoke`: 2 pass.
- `npm run test:acceptance`: 8 fail intentionally.
- `npm test`: 2 pass, 8 fail intentionally.

An initial failing acceptance suite is part of the exercise. Students must not delete, skip, or weaken supplied tests to obtain a green result.

## Facilitation

Have students first inspect the code without running tests, then compare their review with observed failures. Pair students and exchange author/reviewer roles. Require a second review after changes.

The original code already awaits storage operations, returns the stored record on success, and permits dependency substitution. Reviewers should acknowledge these strengths.

No completed solution or private marking key is included. The assessment rubric is in the student brief.

## Boundaries

The supplied in-memory adapter owns atomic availability checking during creation. The service performs an earlier eligibility check and must still propagate repository errors. Students are not asked to implement database transactions, authentication, concurrent database access, fees, reservations, renewals, or notifications.

The clock is trusted to return a valid Date. Explicit errors use an Error object with a `code` property. Error wording and helper/class structure may vary.
