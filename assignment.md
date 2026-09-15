---
title: "Code Review and Refactoring"
subtitle: "Case Study 2: Laboratory Equipment Loan Service"
author: "COMP3028 — Software Construction"
date: ""
---

**Assessment mode:** Individual implementation with paired peer review  
**Total marks:** 20  
**Submission:** Source code, tests, pull-request evidence, and a concise review report  
**Deadline and target branch:** As announced by the instructor

# Context

A university laboratory lends equipment, such as digital multimeters and oscilloscopes, to eligible students. A prototype service records a loan and calculates the date on which the equipment must be returned.

The prototype was developed quickly. Although a typical seven-day request appears to work, it does not consistently enforce lending rules or communicate failures. You have been assigned to review and improve the service. Your changes must undergo peer review before integration into the designated development branch.

This exercise uses fictional records and an in-memory repository. No database, credentials, network access, or external packages are required. Changes are not retained after the process exits.

# Intended learning outcomes

On completion, students should be able to:

1. Identify defects and maintainability concerns in asynchronous JavaScript.
2. Implement validation and enforce explicit domain rules.
3. Calculate deterministic dates without mutating caller-owned objects.
4. Preserve successful outcomes while documenting intentional behaviour changes.
5. Test success, failure, and boundary conditions using mocks.
6. Provide constructive, evidence-based feedback through a pull request.

# Supplied implementation

The primary review target is `src/loanService.js`. The following listing is the supplied implementation.

```javascript
// Intentionally incomplete student starter. See docs/assignment.md.
// Repository and clock dependencies are provided by the caller.
export async function borrowEquipment(request, repository, clock = () => new Date()) {
    const student = await repository.findStudent(request.studentId);
    const equipment = await repository.findEquipment(request.equipmentId);

    const dueDate = clock();
    dueDate.setUTCDate(dueDate.getUTCDate() + 7);

    try {
        const loan = await repository.createLoan({
            studentId: student.id,
            equipmentId: equipment.id,
            dueAt: dueDate.toISOString()
        });
        return loan;
    } catch (error) {
        return null;
    }
}
```

The implementation already awaits repository operations, returns a stored record on success, and accepts substitutable dependencies. Reviewers must acknowledge these strengths rather than assuming that every part of the code is defective.

# Interface and repository contract

Preserve the public interface:

```javascript
borrowEquipment(request, repository, clock)
```

The request contains `studentId`, `equipmentId`, and `days`. The optional clock returns a valid Date and defaults to the current time. It is trusted infrastructure; students need not validate arbitrary clock implementations.

| Repository method | Contract |
| --- | --- |
| findStudent(id) | Resolves to a record containing id and active, or null if absent. |
| findEquipment(id) | Resolves to a record containing id and available, or null if absent. |
| createLoan(data) | Resolves to the stored loan, including its generated id; rejects on storage failure or unavailable equipment. |

Creation receives exactly the business fields `studentId`, `equipmentId`, and `dueAt`. The repository owns the atomic operation that checks availability, creates the loan, and marks the equipment unavailable. The service must not implement a separate availability update.

The service must check eligibility before attempting creation. A repository may still reject creation if availability changes subsequently; such an error must reach the caller.

# Task A: Initial code review

Identify at least five concerns. For each concern, report the relevant location, the observed issue, its possible consequence, and a justified improvement.

Consider input types, missing records, eligibility, requested duration, ownership of mutable Date objects, and the treatment of repository failures. Distinguish an actual defect from a stylistic preference.

Record your findings before implementation. Do not limit your review to the failures already exposed by the provided tests.

# Task B: Required behaviour

Apply validation and eligibility checks in the order specified below. Where more than one condition fails, report the first applicable error.

| Order | Condition | Required result |
| --- | --- | --- |
| 1 | Request is missing, null, an array, or not an object | Reject with INVALID_INPUT; no repository access. |
| 1 | Either ID is not a positive JavaScript safe integer, or days is not an integer from 1 to 14 inclusive | Reject with INVALID_INPUT; no repository access. |
| 2 | Student is absent | Reject with STUDENT_NOT_FOUND. |
| 3 | Student is not active | Reject with STUDENT_INACTIVE. |
| 4 | Equipment is absent | Reject with EQUIPMENT_NOT_FOUND. |
| 5 | Equipment is unavailable | Reject with EQUIPMENT_UNAVAILABLE. |
| 6 | All conditions pass | Calculate the due date, await one creation operation, and return the stored loan. |

For valid records, active and available are Boolean fields. Numeric strings such as "1" must be rejected rather than converted. Ignore additional request fields; do not pass them to storage.

Each specified domain or validation error must be an Error instance with a `code` property matching the table and a meaningful message. Exact wording is not prescribed.

Additional requirements:

- Do not attempt loan creation after any failed validation or eligibility check.
- Read the clock once for a successful eligibility path. Calculate dueAt as exactly the requested number of 24-hour days after that instant, represented as an ISO UTC string.
- Do not mutate the request, repository records, or Date returned by the clock.
- Propagate failures from any repository method. Rethrow the original error or preserve it as the cause of a new error. Do not replace failure with null or a successful result.
- Preserve the successful return contract: the stored loan is returned only after creation completes.
- Preserve the public signature and the provided repository contract. Internal helper functions may be introduced.
- Do not add database setup, external services, or unrelated functionality.

# Task C: Refactoring rationale

Explain the purpose and behavioural impact of the changes.

Separating validation into a helper or improving names may preserve behaviour. Rejecting invalid requests, enforcing eligibility, respecting requested duration, and exposing previously swallowed errors intentionally change behaviour. Identify these changes explicitly.

Discuss why mutation of a caller-owned Date can cause surprising behaviour in repeated calls. Explain why dependency substitution supports deterministic tests and independent code review.

# Task D: Testing

Run the supplied tests and add coverage for requirements not yet exercised. Do not delete, skip, or weaken supplied assertions to obtain a passing result.

The unmodified starter is expected to produce **2 passing smoke tests and 8 failing acceptance tests**. The final submission should pass all supplied tests and the additional tests you write.

At minimum, extend coverage to include:

1. Duration boundaries 1 and 14, values outside the range, fractional values, and numeric strings.
2. Invalid IDs, including unsafe integers, and invalid request shapes; verify no repository access.
3. Missing equipment and cases where multiple eligibility checks fail, demonstrating error precedence.
4. Failures in student lookup and equipment lookup, in addition to creation failure.
5. An exact due date across a month or year boundary and preservation of the input Date.
6. Exactly one creation for an accepted request, with only the required fields.
7. A deferred creation promise, demonstrating that success is not returned prematurely.
8. Repeated calls with a deterministic clock and unchanged caller-owned inputs.

Use fresh fixtures for independent tests. Assertions should verify relevant behaviour rather than private helper names or formatting. The supplied suite is a starting point, not a complete specification.

# Task E: Peer review

Each student must complete one author role and one reviewer role.

1. Create a dedicated branch and complete a self-review.
2. Commit logical changes with meaningful messages.
3. Open a pull request against the instructor-designated target branch. Use the provided template.
4. Review a peer's code, rationale, and tests against this brief.
5. Label feedback as a required change, suggestion, or question. Explain the observation and consequence; propose an action where appropriate.
6. Respond to substantive feedback through revision or a reasoned explanation.
7. Request re-review and record the reviewer's final decision. Follow the instructor's merge rules.

The reviewer should verify correctness, readability, error propagation, date ownership, and test quality. Avoid inventing defects or imposing undocumented personal style preferences.

An example of constructive feedback is:

> The due-date variable refers to the Date returned by the clock. Updating it also changes the caller's object, which can shift later calculations. Please avoid mutating that object and add a test confirming that its timestamp remains unchanged.

# Deliverables

Submit:

1. The improved service and any justified internal helpers.
2. Supplied and additional tests, with execution instructions and actual results.
3. An initial review and implementation rationale.
4. A link to the authored pull request and evidence of the peer review performed.
5. A completed review record and a brief reflection on feedback received.

Use the provided review-record template where helpful. Follow the course's academic integrity policy and attribute external material. Report only verification that you actually performed.

# Assessment rubric

| Criterion | Marks |
| --- | ---: |
| Accurate initial review identifying strengths and defects with consequences | 4 |
| Correct validation, eligibility, duration calculation, and failure propagation | 6 |
| Maintainable structure, clear names, and preservation of interfaces and ownership | 3 |
| Meaningful additional tests covering boundaries and asynchronous failure behaviour | 4 |
| Constructive peer review, justified responses, and documented revisions | 3 |
| **Total** | **20** |

# Scope limitations

Authentication, authorisation, fees, notifications, renewals, student loan quotas, and production database transactions are outside the assessment. The repository contract provides atomic creation; implementing production concurrency control is not required.

**Reflection question:** Why can a successful demonstration with one valid request provide insufficient evidence that a service is ready to merge?
