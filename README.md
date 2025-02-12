# Contact Consolidation Service

A robust backend service that provides intelligent contact linking and consolidation based on matching email addresses and phone numbers. The service uses recursive CTEs (Common Table Expressions) to efficiently handle contact relationships and maintain data consistency.

## 🚀 Features

- Recursive contact linking using CTEs for efficient relationship traversal
- Transaction-safe database operations to maintain data integrity
- Strong type validation for email and phone number formats
- Optimized database indexes for high-performance lookups
- Graceful service shutdown handling
- Built with TypeScript for type safety

## ⚙️ Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure your environment variables in `.env`:
   ```
   DATABASE_URL=postgres://user:pass@localhost:5432/dbname
   PORT=3000
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

## 📡 API Reference

### Identify Contact

Identifies and consolidates contact information based on provided email and phone number.

**Endpoint:** `POST /identify`

**Request Format:**
```json
{
  "email": "a@test.com",
  "phoneNumber": "123456"
}
```

**Response Format:**
```json
{
  "contact": {
    "primaryContactId": 1,
    "emails": ["a@test.com", "b@test.com"],
    "phoneNumbers": ["123456", "789012"],
    "secondaryContactIds": [2, 3]
  }
}
```

## 🔄 Implementation Details

The service follows a structured flow for processing contact information:

1. **Request Processing**
   - Incoming requests are handled by the `identify` controller
   - Robust input validation ensures proper email and phone number formats

2. **Contact Service Logic**
   - Uses recursive CTEs to discover all linked contacts
   - Creates new contacts when no matches are found
   - Manages primary/secondary contact relationships
   - Handles partial matches by creating appropriate links

3. **Response Generation**
   - Aggregates all unique email addresses and phone numbers
   - Maintains consistent ordering of contact information
   - Returns comprehensive contact details including all related IDs

## 🗄️ Database Design

The database is optimized for fast contact lookups with the following indexes:
- Single column index on `phoneNumber`
- Single column index on `email`
- Composite index on `(phoneNumber, email)`

## 🛠️ Available Commands

```bash
# Start development server with hot reload
npm run dev

# Build TypeScript files
npm run build

# Start production server
npm start
```

## 📦 Dependencies

- Node.js
- PostgreSQL
- TypeScript
- Express.js

## 🔒 Security Considerations

- Input validation for all API endpoints
- Prepared statements for database queries
- Rate limiting on API endpoints
- Proper error handling and logging

## 🤝 Contributing

Please read our contributing guidelines before submitting pull requests.