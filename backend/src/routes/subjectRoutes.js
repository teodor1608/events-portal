const express = require("express");
const router = express.Router();
const AppDataSource = require("../config/database");

// TODO: Implement all CRUD operations for subjects
// Reference: Look at studentRoutes.js and universityRoutes.js for patterns

// POST / - Create a new subject
router.post("/", async (req, res) => {
  try {
    // TODO: Extract name, code, credits from req.body
    // TODO: Validate that name, code, and credits are provided
    // TODO: Check if code already exists (must be unique)
    // TODO: Create and save the subject
    // TODO: Return the created subject with 201 status
    // TODO: Handle errors appropriately
  } catch (error) {
    // TODO: Return appropriate error response
  }
});

// GET / - Get all subjects
router.get("/", async (req, res) => {
  try {
    // TODO: Get the Subject repository
    // TODO: Find all subjects (optionally with students relation)
    // TODO: Return the subjects array
    // TODO: Handle errors appropriately
  } catch (error) {
    // TODO: Return appropriate error response
  }
});

// GET /:id - Get a subject by ID
router.get("/:id", async (req, res) => {
  try {
    // TODO: Parse the id from req.params.id
    // TODO: Get the Subject repository
    // TODO: Find the subject by id (with students relation)
    // TODO: If not found, return 404
    // TODO: Return the subject
    // TODO: Handle errors appropriately
  } catch (error) {
    // TODO: Return appropriate error response
  }
});

// PUT /:id - Update a subject
router.put("/:id", async (req, res) => {
  try {
    // TODO: Extract name, code, credits from req.body
    // TODO: Parse the id from req.params.id
    // TODO: Get the Subject repository
    // TODO: Find the subject by id
    // TODO: If not found, return 404
    // TODO: Update the fields if provided
    // TODO: If code is being updated, check for uniqueness
    // TODO: Save the updated subject
    // TODO: Return the updated subject
    // TODO: Handle errors appropriately
  } catch (error) {
    // TODO: Return appropriate error response
  }
});

// DELETE /:id - Delete a subject
router.delete("/:id", async (req, res) => {
  try {
    // TODO: Parse the id from req.params.id
    // TODO: Get the Subject repository
    // TODO: Find the subject by id
    // TODO: If not found, return 404
    // TODO: Delete the subject
    // TODO: Return 204 status (no content)
    // TODO: Handle errors appropriately
  } catch (error) {
    // TODO: Return appropriate error response
  }
});

module.exports = router;

