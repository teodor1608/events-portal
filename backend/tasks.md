# Student Tasks: Implement PUT and DELETE Endpoints for Students

## Overview
Complete the Student API by implementing the UPDATE (PUT) and DELETE endpoints. These operations will allow users to modify and remove student records from the database.

## Task 1: Implement PUT /api/students/:id

### Objective
Create an endpoint that updates an existing student's information.

### Requirements
1. **Route**: `PUT /api/students/:id`
2. **Request Parameters**:
   - `id` (URL parameter): The ID of the student to update
3. **Request Body** (all fields optional):
   - `facultyNumber`: Updated faculty number
   - `firstName`: Updated first name
   - `middleName`: Updated middle name
   - `lastName`: Updated last name
   - `universityId`: Updated university ID (foreign key)

### Implementation Steps
1. Open the file `src/routes/studentRoutes.js`
2. Add a new route handler for `PUT /:id`
3. Extract the student ID from `req.params.id`
4. Extract the fields to update from `req.body`
5. Get the Student repository using `AppDataSource.getRepository("Student")`
6. Find the student by ID using `findOne({ where: { id: parseInt(req.params.id) } })`
7. If the student is not found, return a 404 status with an error message
8. If `universityId` is provided:
   - Get the University repository
   - Verify the university exists
   - If not found, return a 404 status
   - Update the student's university relationship
9. Update the student's fields with the provided values
10. Save the updated student using `save()`
11. Fetch the complete student data with relations using `findOne` with relations
12. Return the updated student with a 200 status

### Example Request
```json
PUT /api/students/1
{
  "firstName": "Jane",
  "lastName": "Smith",
  "universityId": 2
}
```

### Expected Response
```json
{
  "id": 1,
  "facultyNumber": "FN12345",
  "firstName": "Jane",
  "middleName": "Marie",
  "lastName": "Smith",
  "university": {
    "id": 2,
    "name": "Tech University",
    "location": "Boston"
  }
}
```

### Error Handling
- Return 404 if student not found
- Return 404 if provided university ID doesn't exist
- Return 500 for any server errors with the error message

---

## Task 2: Implement DELETE /api/students/:id

### Objective
Create an endpoint that deletes a student record from the database.

### Requirements
1. **Route**: `DELETE /api/students/:id`
2. **Request Parameters**:
   - `id` (URL parameter): The ID of the student to delete

### Implementation Steps
1. Open the file `src/routes/studentRoutes.js`
2. Add a new route handler for `DELETE /:id`
3. Extract the student ID from `req.params.id`
4. Get the Student repository using `AppDataSource.getRepository("Student")`
5. Find the student by ID using `findOne({ where: { id: parseInt(req.params.id) } })`
6. If the student is not found, return a 404 status with an error message
7. Remove the student using the repository's `remove()` method
8. Return a 204 status (No Content) on successful deletion

### Example Request
```
DELETE /api/students/1
```

### Expected Response
- Status: 204 No Content
- Body: Empty

### Error Handling
- Return 404 if student not found with message: `{ "error": "Student not found" }`
- Return 500 for any server errors with the error message

---

## Testing Your Implementation

### Test PUT Endpoint
1. Start the server: `node src/server.js`
2. Create a test university and student first if needed
3. Use curl, Postman, or any HTTP client to test:

```bash
curl -X PUT http://localhost:3000/api/students/1 \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "UpdatedName",
    "universityId": 2
  }'
```

### Test DELETE Endpoint
```bash
curl -X DELETE http://localhost:3000/api/students/1
```

### Verification Steps
1. Create a new student using POST
2. Update the student using your PUT endpoint
3. Verify the changes by fetching the student with GET
4. Delete the student using your DELETE endpoint
5. Try to fetch the deleted student (should return 404)

---

## Reference Implementation Pattern

You can refer to the University routes (`src/routes/universityRoutes.js`) for examples of how PUT and DELETE endpoints are implemented. The Student endpoints should follow a similar pattern but include the additional complexity of the university relationship.

## Submission Checklist
- [ ] PUT endpoint handles all fields correctly
- [ ] PUT endpoint validates university existence when universityId is provided
- [ ] PUT endpoint returns proper error codes (404, 500)
- [ ] DELETE endpoint removes the student from the database
- [ ] DELETE endpoint returns proper status codes
- [ ] Both endpoints handle errors gracefully
- [ ] Tested all success scenarios
- [ ] Tested all error scenarios (student not found, invalid university)

## Additional Challenge (Optional)
Implement input validation to ensure:
- Faculty numbers remain unique when updating
- Names are not empty strings
- University ID is a valid integer

Good luck with your implementation!
