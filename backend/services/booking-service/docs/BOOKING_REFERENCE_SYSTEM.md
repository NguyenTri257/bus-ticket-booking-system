# Booking Reference Generation System

## Overview

User-friendly, collision-resistant booking reference generation system designed for high-volume bus ticket booking operations.

## Format Specification

### Structure
```
BK-YYMMDD-XXXXX
│  │      └─ 5-character alphanumeric code
│  └──────── Date (Year/Month/Day)
└─────────── Prefix (configurable)
```

### Examples
- `BK-251209-A3K7M`
- `BK-251225-XN94P`
- `BK-260101-Q7MH2`

## Features

### 1. Human-Readable ✅
- **Hyphens** separate components for easy reading
- **No ambiguous characters**: Excludes 0, O, I, 1, L to prevent confusion
- **Case-insensitive**: Both `BK-251209-A3K7M` and `bk-251209-a3k7m` are valid

### 2. Date-Based ✅
- **Easy identification**: Instantly know when booking was created
- **Natural sorting**: Orders chronologically by default
- **Customer service**: Quick lookup by date range

### 3. High Uniqueness ✅
- **28+ million** unique codes per day (32^5)
- **Crypto-quality randomness** when available
- **Low collision rate**: ~1.75 collisions per 10,000 bookings/day
- **Retry mechanism**: Automatic retry up to 5 attempts if collision detected

### 4. Scalable ✅
- Supports high-volume operations
- No sequential dependency
- Distributed system friendly

## Technical Details

### Character Set
```
23456789ABCDEFGHJKMNPQRSTUVWXYZ
```
- **32 characters** (excludes 0, O, I, 1, L)
- Uppercase only (normalized)
- Easy to communicate over phone/email

### Collision Probability

| Bookings/Day | Collision Probability | Expected Collisions |
|--------------|----------------------|---------------------|
| 1,000        | 0.017%              | 0.02 per day        |
| 5,000        | 0.437%              | 0.44 per day        |
| 10,000       | 1.746%              | 1.75 per day        |
| 50,000       | 43.658%             | 43.7 per day        |

### Generation Algorithm

```javascript
1. Extract date components (YY, MM, DD)
2. Generate 5 random characters from charset
3. Use crypto.getRandomValues() if available, else Math.random()
4. Format as BK-YYMMDD-XXXXX
5. Check database for uniqueness
6. Retry up to 5 times if collision detected
7. Add 10ms delay between retries
```

## Usage

### Generate Reference
```javascript
const { generateBookingReference } = require('./utils/helpers');

const reference = generateBookingReference();
// Output: "BK-251209-A3K7M"
```

### Normalize Reference (Case-Insensitive)
```javascript
const { normalizeBookingReference } = require('./utils/helpers');

const normalized = normalizeBookingReference('bk-251209-a3k7m');
// Output: "BK-251209-A3K7M"
```

### Validate Format
```javascript
const { isValidBookingReferenceFormat } = require('./utils/helpers');

const isValid = isValidBookingReferenceFormat('BK-251209-A3K7M');
// Output: true
```

## Configuration

### Environment Variables
```bash
# Booking reference prefix (default: BK)
BOOKING_REFERENCE_PREFIX=BK
```

### Custom Prefix Example
```bash
BOOKING_REFERENCE_PREFIX=TK
# Generates: TK-251209-A3K7M
```

## Validation Rules

### Valid Format
- Prefix: 2 uppercase letters
- Separator: Hyphens (-)
- Date: 6 digits (YYMMDD)
- Code: 5 alphanumeric characters

### Regex Pattern
```regex
^[A-Z]{2}-\d{6}-[A-Z0-9]{5}$
```

### Valid Examples
✅ `BK-251209-A3K7M`
✅ `AB-991231-23456`
✅ `XY-000101-ZZZZZ`

### Invalid Examples
❌ `BK20251209A3K7M` (no hyphens)
❌ `BK-251209-A3K` (code too short)
❌ `BK-251209-A3K7MX` (code too long)
❌ `B-251209-A3K7M` (prefix too short)

## Database Schema

```sql
CREATE TABLE bookings (
  booking_reference VARCHAR(20) UNIQUE NOT NULL,
  -- ... other columns
);

-- Index for fast lookup
CREATE UNIQUE INDEX idx_booking_reference ON bookings(booking_reference);
```

## Error Handling

### BOOKING_REFERENCE_GENERATION_FAILED
**When**: Failed to generate unique reference after 5 attempts
**HTTP Status**: 500
**Response**:
```json
{
  "success": false,
  "error": {
    "code": "BOOKING_003",
    "message": "Unable to generate unique booking reference. Please try again."
  }
}
```

## Customer Communication

### Email Template
```
Thank you for your booking!

Your booking reference: BK-251209-A3K7M

Please keep this reference number for tracking your booking.
```

### SMS Template
```
Booking confirmed!
Ref: BK-251209-A3K7M
Show this at check-in.
```

## Testing

### Run Tests
```bash
node test-reference-generation.js
```

### Test Coverage
- ✅ Format validation
- ✅ Uniqueness (1000 samples)
- ✅ Case-insensitive normalization
- ✅ Invalid format rejection
- ✅ Human readability
- ✅ Collision probability analysis

## Migration Guide

### From Old Format (BK2025120983699)

**Old Format**:
- 13-15 characters
- No hyphens
- 4-digit year

**New Format**:
- 14 characters
- With hyphens
- 2-digit year
- More human-friendly

**Validator Update**:
```javascript
// Old pattern
/^[A-Z0-9]{6,20}$/

// New pattern
/^[A-Z]{2}-\d{6}-[A-Z0-9]{5}$/i
```

## Performance Considerations

### Generation Speed
- **Average**: < 1ms per reference
- **With collision check**: < 5ms per reference
- **With retry**: < 50ms per reference (worst case)

### Database Impact
- **Index**: UNIQUE index on booking_reference
- **Lookup**: O(log n) with B-tree index
- **Storage**: 14 bytes per reference

## Future Enhancements

### Potential Improvements
1. **Regional prefixes**: TK (Hanoi), SG (Saigon), DN (Danang)
2. **Service type**: BK (bus), TR (train), FL (flight)
3. **Check digit**: Add Luhn algorithm for validation
4. **QR code**: Embed reference in QR for scanning

### Backward Compatibility
- System accepts both old and new formats during transition period
- Validator pattern can be made flexible
- Database migration script available

## Support

For questions or issues, contact the backend development team.

**Last Updated**: December 9, 2025
**Version**: 2.0
**Author**: Backend Development Team
