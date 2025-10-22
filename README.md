# String Analyzer Service API

A RESTful API that analyzes strings and stores their computed properties such as length, palindrome status, word count, and character frequency.  

---

## Features

For every analyzed string, the service computes and stores the following properties:

| Property | Description |
|-----------|--------------|
| **length** | Number of characters in the string |
| **is_palindrome** | Boolean value — `true` if the string reads the same forwards and backwards (case-insensitive) |
| **unique_characters** | Count of distinct characters in the string |
| **word_count** | Number of words separated by whitespace |
| **sha256_hash** | Unique SHA-256 hash of the string (used as ID) |
| **character_frequency_map** | Object mapping each character to the number of occurrences |

---

## API Endpoints

### 1. Create / Analyze String
**POST** `/strings`

#### Request Body
```json
{
  "value": "string to analyze"
}

```
#### Success Response (201 Created)
```
{
  "id": "sha256_hash_value",
  "value": "string to analyze",
  "properties": {
    "length": 16,
    "is_palindrome": false,
    "unique_characters": 12,
    "word_count": 3,
    "sha256_hash": "abc123...",
    "character_frequency_map": {
      "s": 2,
      "t": 3,
      "r": 2
    }
  },
  "created_at": "2025-08-27T10:00:00Z"
}
```
#### Error Responses

**409 Conflict**: String already exists in the system  
**400 Bad Request**: Invalid request body or missing "value" field  
**422 Unprocessable Entity**: Invalid data type for "value" (must be string)

## 2. Get Specific String

### GET /strings/{string_value}

#### Success Response (200 OK)
```
{
  "id": "sha256_hash_value",
  "value": "requested string",
  "properties": { /* same as above */ },
  "created_at": "2025-08-27T10:00:00Z"
}

```

#### Error Response
**404 Not Found**: String does not exist in the system

## 3. Get All Strings (with Filtering)

### GET /strings

**Query Parameters:**

**Parameter	Type	Description**

**is_palindrome:** boolean (true/false)  
**min_length:** integer (minimum string length)  
**max_length:** integer (maximum string length)  
**word_count:** integer (exact word count)  
**contains_character:** string (single character to search for)  


Success Response (200 OK)
```
{
  "data": [
    {
      "id": "hash1",
      "value": "string1",
      "properties": { /* ... */ },
      "created_at": "2025-08-27T10:00:00Z"
    }
  ],
  "count": 15,
  "filters_applied": {
    "is_palindrome": true,
    "min_length": 5,
    "max_length": 20,
    "word_count": 2,
    "contains_character": "a"
  }
}
```

#### Error Response
| Code|	Message|
|------|--------|
|400	|Invalid query parameter values or types |

### 4. Natural Language Filtering

### GET /strings/filter-by-natural-language?query=<your_query>

#### Example Queries
#### Example Query	Parsed Filters
"all single word palindromic strings"	word_count=1, is_palindrome=true  
"strings longer than 10 characters"	min_length=11  
"strings containing the letter z"	contains_character=z  

#### Success Response
```
{
  "data": [ /* array of matching strings */ ],
  "count": 3,
  "interpreted_query": {
    "original": "all single word palindromic strings",
    "parsed_filters": {
      "word_count": 1,
      "is_palindrome": true
    }
  }
}
```

#### Error Responses
|Code	|Message|
|------|------|
|400	|Unable to parse natural language query|
|422	|Conflicting filters detected|

## 5. Delete String

### DELETE /strings/{string_value}

#### Success Response 
(204 No Content): (Empty response body)

#### Error Response
Code	Message
404	String not found

## Tech Stack

- Language: Node.js (JavaScript)

- Framework: Express.js

- Hashing: Built-in crypto module (SHA-256)

- Data Storage: In-memory (for demo; can be upgraded to a DB)

- Deployment Options: Railway 

## Installation and Setup
### 1. Clone the Repository
```
git clone https://github.com/<your-username>/string-analyzer-service.git 
cd string-analyzer-service
```
### 2. Install Dependencies
```
npm install
```
### 3. Run Locally
```
npm start
```

or
```
node index.js
```
### 4. Environment Variables

No special environment variables are required for this stage.
Optionally, you can define a custom port:
```
PORT=4000
```
## Testing the API

Use Postman, Insomnia, or curl to test your endpoints.
```
Example:
curl -X POST http://localhost:3000/strings \
     -H "Content-Type: application/json" \
     -d '{"value":"racecar"}'
```

### Example Repo Structure
string-analyzer/  
├── index.js  
├── package.json  
├── utils/  
│   └── analyzeString.js  
├── routes/  
│   └── stringRoutes.js  
├── controllers/  
│   └── stringController.js  
└── README.md  

## Author

Name: Aghaulor Gift  
Email: [Aghaulor Gift](aghaulor.gift@gmail.com)   
GitHub: [GitHub-Link](https://github.com/Aghaulor-Gift/) 
