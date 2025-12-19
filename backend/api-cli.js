#!/usr/bin/env node

// No need to import 'fetch' in Node.js v18+ as it is global.

const BASE_URL = "http://localhost:3000/api";

// Example JSON data embedded in the script
const exampleData = {
    universities: [
        {
            id: 1,
            name: "Tech University",
            location: "Boston"
        },
        {
            id: 2,
            name: "State University",
            location: "New York"
        }
    ],
    students: [
        {
            id: 1,
            facultyNumber: "FN001",
            firstName: "John",
            middleName: "Michael",
            lastName: "Doe",
            universityId: 1
        },
        {
            id: 2,
            facultyNumber: "FN002",
            firstName: "Jane",
            middleName: null,
            lastName: "Smith",
            universityId: 1
        },
        {
            id: 3,
            facultyNumber: "FN003",
            firstName: "Bob",
            middleName: "David",
            lastName: "Johnson",
            universityId: 2
        }
    ]
};

function showHelp() {
    console.log(`
╔════════════════════════════════════════════════════════════════╗
║           Student-University API CLI Tool                      ║
╚════════════════════════════════════════════════════════════════╝

USAGE:
  node api-cli.js <endpoint> <method> [id]

ENDPOINTS:
  universities        Work with universities
  students            Work with students

METHODS:
  get                 GET request (list all or by ID)
  post                POST request (create new)
  put                 PUT request (update existing)
  delete              DELETE request (delete by ID)

EXAMPLES:
  node api-cli.js universities get
  node api-cli.js universities get 1   // Get by ID
  node api-cli.js universities post
  node api-cli.js universities put 1   // Update ID 1
  node api-cli.js universities delete 1 // Delete ID 1
  node api-cli.js students get 2
  node api-cli.js students post
  node api-cli.js students put 2
  node api-cli.js students delete 3

EXAMPLE DATA:
${JSON.stringify(exampleData, null, 2)}
  `);
}

async function request(method, endpoint, body = null) {
    // Check if fetch is available (for better compatibility check)
    if (typeof fetch === 'undefined') {
        throw new Error("The 'fetch' API is not available. Please use Node.js v18+ or install 'node-fetch' and update the script.");
    }
    
    try {
        const options = {
            method,
            headers: {
                "Content-Type": "application/json",
            },
        };

        if (body) {
            options.body = JSON.stringify(body);
        }

        const url = `${BASE_URL}${endpoint}`;
        const response = await fetch(url, options);

        // Check if response has a body before trying to parse JSON
        let data = null;
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
            data = await response.json();
        } else {
            // Handle case where API returns a status like 204 No Content (common for DELETE)
            data = { message: response.statusText || "Request successful, no JSON body." };
        }

        return { status: response.status, data, ok: response.ok };
    } catch (error) {
        // This catches network errors or issues with JSON parsing
        return { status: 0, data: null, ok: false, error: error.message };
    }
}

function formatOutput(endpoint, method, status, data) {
    console.log("\n" + "═".repeat(60));
    console.log(`${method.toUpperCase()} ${endpoint}`);
    console.log("═".repeat(60));
    console.log(`Status: ${status}`);
    console.log("\nResponse:");
    // Display error property if present and data is null
    if (status === 0 && data && data.error) {
        console.log(`Error: ${data.error}`);
    } else {
        console.log(JSON.stringify(data, null, 2));
    }
    console.log("═".repeat(60) + "\n");
}

async function handleEndpoint(endpoint, method, id = null) {
    endpoint = endpoint.toLowerCase();
    method = method.toLowerCase();

    // Validate endpoint
    if (!["universities", "students"].includes(endpoint)) {
        console.error(`❌ Unknown endpoint: **${endpoint}**`);
        showHelp();
        process.exit(1);
    }

    // Validate method
    if (!["get", "post", "put", "delete"].includes(method)) {
        console.error(`❌ Unknown method: **${method}**`);
        showHelp();
        process.exit(1);
    }

    let endpoint_path = `/${endpoint}`;
    let data = null;
    let target_id = id ? id : 1; // Default ID for POST/PUT/DELETE examples if not provided

    // Set example data and update path based on method
    switch (method) {
        case "get":
            // For GET with ID (e.g., GET /universities/1)
            if (id) {
                endpoint_path += `/${id}`;
            }
            break;

        case "post":
            // Use different example data for POST to avoid conflicts with ID 1
            data = endpoint === "universities"
                ? { ...exampleData.universities[0], id: 99, name: "New Uni" }
                : { ...exampleData.students[0], id: 99, facultyNumber: "FN999", firstName: "Test" };
            break;

        case "put":
            // For PUT, we need an ID in the path and body data
            endpoint_path += `/${target_id}`;
            data = endpoint === "universities"
                ? { id: target_id, name: "Updated University", location: "Remote" }
                : { id: target_id, facultyNumber: "FN_UPDATED", firstName: "UpdatedName", lastName: "UpdatedLast" };
            break;

        case "delete":
            // For DELETE, we need an ID in the path
            endpoint_path += `/${target_id}`;
            break;
    }

    // Call the actual API
    const res = await request(method.toUpperCase(), endpoint_path,
        (method === "post" || method === "put") ? data : null);

    // Pass the original endpoint path (potentially with ID) to formatOutput
    formatOutput(endpoint_path, method, res.status, res.data || { error: res.error });
}

async function main() {
    const args = process.argv.slice(2);

    if (args.length === 0 || args[0] === "-h" || args[0] === "--help") {
        showHelp();
        process.exit(args.length === 0 ? 1 : 0);
    }

    const endpoint = args[0];
    const method = args[1];
    const id = args[2]; // Optional ID argument

    if (!endpoint || !method) {
        console.error("❌ Error: endpoint and method arguments are required\n");
        showHelp();
        process.exit(1);
    }

    try {
        // Pass optional ID to handler
        await handleEndpoint(endpoint, method, id);
    } catch (error) {
        console.error(`❌ Error: ${error.message}`);
        process.exit(1);
    }
}

main();