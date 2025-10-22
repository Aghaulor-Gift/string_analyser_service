# 🚀 String Analyzer Service API

## Overview
A robust Node.js Express API designed to process and analyze strings, computing properties such as length, palindrome status, word count, and character frequency, storing them in an in-memory database.

## Features
- **Node.js**: Asynchronous event-driven JavaScript runtime for efficient backend operations.
- **Express.js**: Fast, unopinionated, minimalist web framework for building RESTful APIs.
- **CORS**: Middleware for enabling Cross-Origin Resource Sharing.
- **dotenv**: Module to load environment variables from a `.env` file.
- **Crypto**: Node.js built-in module for cryptographic functionalities, specifically SHA256 hashing for string identification.
- **In-memory Map**: Efficient, transient data storage for string analysis results.

## Getting Started
To get this String Analyzer Service running locally, follow these steps.

### Installation
Before you begin, ensure you have Node.js and npm installed on your system.

*   **Clone the Repository**:
    ```bash
    git clone https://github.com/Aghaulor-Gift/string_analyser_service.git
    cd string_analyser_service
    ```
*   **Install Dependencies**:
    ```bash
    npm install
    ```
*   **Start the Service**:
    ```bash
    node index.js
    ```
    The service will start on the configured port, typically `http://localhost:3000`.

### Environment Variables
Create a `.env` file in the root directory of the project.
| Variable | Description                                     | Example |
| :------- | :---------------------------------------------- | :------ |
| `PORT`   | The port number on which the server will listen | `3000`  |

**Example `.env` file:**
```
PORT=3000
```

## API Documentation
This section details all available API endpoints, their expected requests, and potential responses.

### Base URL
`http://localhost:<PORT>` (e.g., `http://localhost:3000`)

### Endpoints

#### `POST /strings`
Analyzes a given string, stores its properties, and returns the analyzed data. If the string already exists, it returns a conflict error.

**Request**:
```json
{
  "value": "Your string to analyze"
}
```
**Response**:
```json
{
  "id": "a9e223d6a4c2f6d2e8b2a1c2d4e6f8a9b0c2d4e6f8a9b0c2d4e6f8a9b0c2d4e6",
  "value": "Hello World",
  "properties": {
    "length": 11,
    "is_palindrome": false,
    "unique_characters": 8,
    "word_count": 2,
    "sha256_hash": "a9e223d6a4c2f6d2e8b2a1c2d4e6f8a9b0c2d4e6f8a9b0c2d4e6f8a9b0c2d4e6",
    "character_frequency_map": {
      "H": 1,
      "e": 1,
      "l": 3,
      "o": 2,
      " ": 1,
      "W": 1,
      "r": 1,
      "d": 1
    }
  },
  "created_at": "2023-10-27T10:00:00.000Z"
}
```
**Errors**:
- `400 Bad Request`: Invalid request body or missing "value" field.
- `422 Unprocessable Entity`: "Value must be a string".
- `409 Conflict`: "String already exists".

#### `GET /strings`
Retrieves all stored strings with optional filtering capabilities.

**Request**:
Query parameters can be combined.
- `is_palindrome`: `true` or `false`
- `min_length`: Minimum length (integer)
- `max_length`: Maximum length (integer)
- `word_count`: Exact word count (integer)
- `contains_character`: A single character to check for inclusion

**Example Request**: `GET /strings?is_palindrome=true&min_length=5`

**Response**:
```json
{
  "data": [
    {
      "id": "...",
      "value": "madam",
      "properties": {
        "length": 5,
        "is_palindrome": true,
        "unique_characters": 3,
        "word_count": 1,
        "sha256_hash": "...",
        "character_frequency_map": { "m": 2, "a": 2, "d": 1 }
      },
      "created_at": "2023-10-27T10:05:00.000Z"
    }
  ],
  "count": 1,
  "filters_applied": {
    "is_palindrome": "true",
    "min_length": "5"
  }
}
```
**Errors**:
- `400 Bad Request`: "Invalid query parameter values or types" if no valid filter is provided.

#### `GET /strings/filter-by-natural-language`
Filters strings based on a natural language query.

**Request**:
- `query`: A natural language phrase describing the filter criteria.
  **Supported phrases**:
  - `single word`
  - `two word`
  - `palindromic`
  - `longer than X` (where X is a number)
  - `shorter than X` (where X is a number)
  - `containing the letter Y` (where Y is a single character)

**Example Request**: `GET /strings/filter-by-natural-language?query=palindromic and longer than 3`

**Response**:
```json
{
  "data": [
    {
      "id": "...",
      "value": "level",
      "properties": {
        "length": 5,
        "is_palindrome": true,
        "unique_characters": 3,
        "word_count": 1,
        "sha256_hash": "...",
        "character_frequency_map": { "l": 2, "e": 2, "v": 1 }
      },
      "created_at": "2023-10-27T10:10:00.000Z"
    }
  ],
  "count": 1,
  "interpreted_query": {
    "original": "palindromic and longer than 3",
    "parsed_filters": {
      "is_palindrome": true,
      "min_length": 3
    }
  }
}
```
**Errors**:
- `400 Bad Request`: "Missing query parameter" or "Unable to parse natural language query".
- `422 Unprocessable Entity`: "Query resulted in conflicting length filters." (e.g., "longer than 10 and shorter than 5").

#### `GET /strings/:value`
Retrieves a specific string's analysis data by its original `value`.

**Request**:
Path parameter `value`: The actual string that was analyzed.

**Example Request**: `GET /strings/Hello%20World`

**Response**:
```json
{
  "id": "a9e223d6a4c2f6d2e8b2a1c2d4e6f8a9b0c2d4e6f8a9b0c2d4e6f8a9b0c2d4e6",
  "value": "Hello World",
  "properties": {
    "length": 11,
    "is_palindrome": false,
    "unique_characters": 8,
    "word_count": 2,
    "sha256_hash": "a9e223d6a4c2f6d2e8b2a1c2d4e6f8a9b0c2d4e6f8a9b0c2d4e6f8a9b0c2d4e6",
    "character_frequency_map": {
      "H": 1,
      "e": 1,
      "l": 3,
      "o": 2,
      " ": 1,
      "W": 1,
      "r": 1,
      "d": 1
    }
  },
  "created_at": "2023-10-27T10:00:00.000Z"
}
```
**Errors**:
- `404 Not Found`: "String not found".

#### `DELETE /strings/:value`
Deletes a specific string's analysis data by its original `value`.

**Request**:
Path parameter `value`: The actual string to delete.

**Example Request**: `DELETE /strings/Hello%20World`

**Response**:
`204 No Content`

**Errors**:
- `404 Not Found`: "String not found".

## Usage
Once the server is running, you can interact with the API using tools like `curl`, Postman, Insomnia, or any HTTP client.

1.  **Analyze a New String**:
    ```bash
    curl -X POST -H "Content-Type: application/json" -d '{"value": "madam"}' http://localhost:3000/strings
    ```
    This will return the detailed analysis of "madam".

2.  **Retrieve All Stored Strings**:
    ```bash
    curl http://localhost:3000/strings
    ```
    This will return an array of all analyzed strings and their properties.

3.  **Filter Strings (e.g., palindromes longer than 4 characters)**:
    ```bash
    curl 'http://localhost:3000/strings?is_palindrome=true&min_length=4'
    ```
    This fetches palindromic strings that have a length of 4 or more.

4.  **Filter Strings Using Natural Language**:
    ```bash
    curl 'http://localhost:3000/strings/filter-by-natural-language?query=single%20word%20and%20palindromic'
    ```
    This will return all single-word palindromes.

5.  **Get Details for a Specific String**:
    ```bash
    curl 'http://localhost:3000/strings/madam'
    ```
    (Note: The `value` in the path needs to be URL-encoded if it contains spaces or special characters, e.g., `Hello%20World`).

6.  **Delete a String**:
    ```bash
    curl -X DELETE http://localhost:3000/strings/madam
    ```
    This will remove the analysis for "madam" from the system.

## Key Functionalities
*   **Comprehensive String Analysis**: Automatically calculates length, identifies palindromes, counts words, and maps character frequencies for any input string.
*   **Unique String Identification**: Utilizes SHA256 hashing to ensure each unique string has a consistent identifier, preventing duplicate storage.
*   **Flexible Data Retrieval**: Offers robust filtering capabilities based on various string properties like length, palindrome status, word count, or character inclusion.
*   **Natural Language Querying**: Allows filtering of strings using intuitive, human-readable phrases, enhancing usability.
*   **RESTful API Design**: Implements standard HTTP methods for clear and predictable interactions (Create, Retrieve, Delete).
*   **In-Memory Persistence**: Efficiently stores and retrieves analyzed string data in an in-memory database, ideal for temporary or session-based analysis.

## Technologies Used

| Technology | Category       |
| :--------- | :------------- |
| `Node.js`  | Runtime        |
| `Express`  | Web Framework  |
| `dotenv`   | Config Mgmt    |
| `cors`     | Middleware     |
| `crypto`   | Hashing        |

## License
This project is licensed under the ISC License.

## Author
**Aghaulor Gift**
-   LinkedIn: [https://linkedin.com/in/AghaulorGift](https://linkedin.com/in/AghaulorGift)
-   Twitter: [@YourTwitterHandle](https://twitter.com/YourTwitterHandle)
-   Portfolio: [YourPortfolio.com](https://yourportfolio.com)

## Badges
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)

[![Readme was generated by Dokugen](https://img.shields.io/badge/Readme%20was%20generated%20by-Dokugen-brightgreen)](https://www.npmjs.com/package/dokugen)