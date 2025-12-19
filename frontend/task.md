# Lab tasks — Angular form & table

Below are suggested tasks for students to complete using the current project. Each task is designed to be completed in ~30–40 minutes. For each task you'll find a short description, acceptance criteria, suggested files to edit, and hints.

---

## Task 1 — Add "Remove" (delete) row functionality

Description

- Add a Delete button to each row in the `p-table` which removes that user from the `users` array.

Acceptance criteria

- Each table row shows a Delete button at the end of the row.
- Clicking Delete removes the row immediately from the table and from the `users` array.
- Deletion is confirmed via a console.log statement with the removed user's email.

Files to edit

- `src/app/app.component.html` (add button inside table body template)
- `src/app/app.component.ts` (implement remove method)

Hints

- Add a new column in the template with a `p-button` (label `Delete`).
- Create a method `removeUser(index: number)` or `removeUser(email: string)` that uses `Array.splice` or `filter`.
- Update the table body template to call the method with the current index or user identifier.

Stretch

- Use `confirm()` browser dialog to ask for confirmation before deleting.

---

## Task 2 — Add custom validation: allow only specific email domains

Description

- Add a custom validator that allows only emails from a set of allowed domains (for example: `@edu.com`, `@university.edu`). Show a custom error message when invalid.

Acceptance criteria

- Submissions with a disallowed domain do not add the user to `users` and show an error message under the email field.
- The error message should say: "Email domain not allowed" (or similar).

Files to edit

- `src/app/app.component.ts` (implement custom validator and add it to the `email` FormControl)
- `src/app/app.component.html` (add handling to display the new validator message)

Hints

- Implement a validator function: `function allowedDomainValidator(domains: string[]): ValidatorFn { return (control) => { ... }; }`
- Use `control.errors?.['domain']` or similar to detect the custom error and update `getFieldError` if you prefer.

Stretch

- Make allowed domains configurable via a variable in the component.

---

## Task 3 — Prevent duplicate emails

Description

- Prevent adding a user whose email already exists in `users`. Show a helpful message and keep the form data intact so the student can fix it.

Acceptance criteria

- When trying to add a user with an email that already exists, do not add the user and show an error message near the email field like: "This email is already registered.".
- The form remains populated so the user can correct the email.

Files to edit

- `src/app.app.component.ts` (update `onSubmit` to check duplicates and set an error)
- `src/app.app.component.html` (display the duplicate error)

Hints

- Check `users.some(u => u.email === email)` before pushing.
- You can set a control error with `this.registrationForm.get('email')?.setErrors({ duplicate: true })` and display it in `getFieldError` or directly in the template.

---

## Task 4 — Add filters for all table fields

Description

- Add a small filter UI above the `p-table` that lets the student filter rows by First Name, Last Name, Email and University. For text fields (First Name, Last Name, Email) use plain text inputs. For University use a dropdown select populated from the existing `universities` options.

Acceptance criteria

- There are four filter controls above the table: three text inputs for First Name, Last Name and Email, and one dropdown for University.
- Typing into any text filter restricts rows to those where the corresponding field contains the filter string (case-insensitive).
- Selecting a university from the dropdown restricts rows to exact matches for that university.
- Filters combine (i.e., multiple filters apply together) — the table shows users matching all active filters.
- Clearing a filter control restores rows matching the remaining filters (or all rows if none remain).

Files to edit

- `src/app.app.component.html` (add filter controls above the table and bind them)
- `src/app.app.component.ts` (add filter properties and a `filteredUsers` getter or method that returns the filtered list)

Hints

- Add component properties: `firstNameFilter = ''`, `lastNameFilter = ''`, `emailFilter = ''`, `universityFilter: string | null = null`.
- Implement a getter: `get filteredUsers() { return this.users.filter(u => matchesFirst && matchesLast && matchesEmail && matchesUniversity); }` and bind the table to `[value]="filteredUsers"`.
- For the university dropdown reuse the existing `universities` array as options for a `p-select` or native `<select>`.
- Keep the filtering logic simple and case-insensitive (use `.toLowerCase().includes(...)`).

Stretch

- Debounce text inputs to avoid filtering on every keystroke (not required).

---
