# Section API - Corrected Implementation Testing Guide

## ✅ **What Was Fixed**

### **1. Enhanced Validation**
- ✅ Input sanitization (trim whitespace)
- ✅ ObjectId format validation
- ✅ Required field validation with detailed error messages
- ✅ Duplicate section name prevention within courses

### **2. Security Improvements**
- ✅ Instructor ownership validation (users can only modify their own courses)
- ✅ Proper authentication and authorization checks
- ✅ Access control for all operations

### **3. Error Handling**
- ✅ Comprehensive error messages
- ✅ Proper HTTP status codes
- ✅ Development vs production error responses
- ✅ Database relationship validation

### **4. Data Integrity**
- ✅ Course-section relationship maintenance
- ✅ Subsection dependency checks before deletion
- ✅ Automatic course cleanup when sections are deleted

## 🚀 **API Endpoints**

### **1. Create Section**
**POST** `/api/v1/section/create-section`

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

**Request Body:**
```json
{
  "sectionName": "Introduction to Programming",
  "courseId": "64a1b2c3d4e5f6789012345"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Section created successfully",
  "data": {
    "section": {
      "_id": "64a1b2c3d4e5f6789012346",
      "sectionName": "Introduction to Programming",
      "subSection": [],
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    },
    "course": {
      "id": "64a1b2c3d4e5f6789012345",
      "courseName": "Test Course",
      "totalSections": 1
    }
  }
}
```

**Error Responses:**
- **400**: Validation failed, Invalid course ID format
- **403**: Access denied (not course owner)
- **404**: Course not found
- **409**: Section name already exists
- **500**: Internal server error

### **2. Update Section**
**PUT** `/api/v1/section/update-section`

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

**Request Body:**
```json
{
  "sectionName": "Updated Section Name",
  "sectionId": "64a1b2c3d4e5f6789012346"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Section updated successfully",
  "data": {
    "section": {
      "_id": "64a1b2c3d4e5f6789012346",
      "sectionName": "Updated Section Name",
      "subSection": [],
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:35:00.000Z"
    },
    "course": {
      "id": "64a1b2c3d4e5f6789012345",
      "courseName": "Test Course"
    }
  }
}
```

### **3. Delete Section**
**DELETE** `/api/v1/section/delete-section/:sectionId`

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**URL Example:**
```
DELETE /api/v1/section/delete-section/64a1b2c3d4e5f6789012346
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Section deleted successfully",
  "data": {
    "deletedSection": {
      "id": "64a1b2c3d4e5f6789012346",
      "sectionName": "Introduction to Programming"
    },
    "course": {
      "id": "64a1b2c3d4e5f6789012345",
      "courseName": "Test Course",
      "remainingSections": 0
    }
  }
}
```

## 🧪 **Test Cases**

### **Test Case 1: Valid Section Creation**
```bash
curl -X POST http://localhost:4000/api/v1/section/create-section \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sectionName": "Introduction to JavaScript",
    "courseId": "YOUR_COURSE_ID"
  }'
```

### **Test Case 2: Missing Fields**
```bash
curl -X POST http://localhost:4000/api/v1/section/create-section \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sectionName": "Introduction to JavaScript"
  }'
```
**Expected:** 400 Bad Request with validation errors

### **Test Case 3: Invalid Course ID**
```bash
curl -X POST http://localhost:4000/api/v1/section/create-section \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sectionName": "Introduction to JavaScript",
    "courseId": "invalid-id"
  }'
```
**Expected:** 400 Bad Request - Invalid course ID format

### **Test Case 4: Non-existent Course**
```bash
curl -X POST http://localhost:4000/api/v1/section/create-section \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sectionName": "Introduction to JavaScript",
    "courseId": "64a1b2c3d4e5f6789999999"
  }'
```
**Expected:** 404 Not Found - Course not found

### **Test Case 5: Duplicate Section Name**
```bash
# First create a section
curl -X POST http://localhost:4000/api/v1/section/create-section \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sectionName": "Introduction to JavaScript",
    "courseId": "YOUR_COURSE_ID"
  }'

# Then try to create another with same name
curl -X POST http://localhost:4000/api/v1/section/create-section \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sectionName": "Introduction to JavaScript",
    "courseId": "YOUR_COURSE_ID"
  }'
```
**Expected:** 409 Conflict - Section name already exists

### **Test Case 6: Unauthorized Access**
```bash
# Use token from different instructor
curl -X POST http://localhost:4000/api/v1/section/create-section \
  -H "Authorization: Bearer OTHER_INSTRUCTOR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sectionName": "Introduction to JavaScript",
    "courseId": "COURSE_FROM_DIFFERENT_INSTRUCTOR"
  }'
```
**Expected:** 403 Forbidden - Access denied

## 📋 **Postman Collection**

### **Environment Variables**
```
base_url: http://localhost:4000/api/v1
auth_token: YOUR_JWT_TOKEN_HERE
course_id: YOUR_COURSE_ID_HERE
section_id: YOUR_SECTION_ID_HERE
```

### **Pre-request Scripts**
```javascript
// Set timestamp for unique section names
pm.environment.set("timestamp", Date.now());
```

### **Test Scripts**
```javascript
// For createSection
pm.test("Section created successfully", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.success).to.be.true;
    pm.expect(jsonData.message).to.include("Section created successfully");
    pm.expect(jsonData.data.section.sectionName).to.exist;
    
    // Save section ID for next requests
    pm.environment.set("section_id", jsonData.data.section._id);
});

// For updateSection
pm.test("Section updated successfully", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.success).to.be.true;
    pm.expect(jsonData.message).to.include("Section updated successfully");
});

// For deleteSection
pm.test("Section deleted successfully", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.success).to.be.true;
    pm.expect(jsonData.message).to.include("Section deleted successfully");
});
```

## 🔍 **Validation Rules**

### **Input Validation**
- ✅ `sectionName`: Required, non-empty string, trimmed
- ✅ `courseId`: Required, valid MongoDB ObjectId format
- ✅ `sectionId`: Required, valid MongoDB ObjectId format

### **Business Logic Validation**
- ✅ Course must exist
- ✅ User must be instructor of the course
- ✅ Section name must be unique within the course
- ✅ Cannot delete section with subsections

### **Security Validation**
- ✅ Valid JWT token required
- ✅ User must have "Instructor" account type
- ✅ User can only modify their own courses

## 🚨 **Error Handling**

### **HTTP Status Codes**
- **200**: Success (update, delete)
- **201**: Created (create)
- **400**: Bad Request (validation errors)
- **401**: Unauthorized (invalid/missing token)
- **403**: Forbidden (access denied)
- **404**: Not Found (resource doesn't exist)
- **409**: Conflict (duplicate resource)
- **500**: Internal Server Error

### **Error Response Format**
```json
{
  "success": false,
  "message": "Error description",
  "errors": ["Detailed error 1", "Detailed error 2"], // For validation errors
  "error": "Technical error details" // Only in development
}
```

## 🎯 **Best Practices Implemented**

1. **Input Sanitization**: All string inputs are trimmed
2. **ObjectId Validation**: Proper MongoDB ObjectId format checking
3. **Ownership Validation**: Users can only modify their own resources
4. **Duplicate Prevention**: Section names must be unique within courses
5. **Dependency Checking**: Cannot delete sections with subsections
6. **Proper HTTP Status Codes**: RESTful API design
7. **Detailed Error Messages**: Helpful error responses
8. **Database Consistency**: Automatic cleanup of relationships

## 🔧 **Troubleshooting**

### **Common Issues**
1. **401 Unauthorized**: Check JWT token validity
2. **403 Forbidden**: Verify user is instructor and owns the course
3. **404 Not Found**: Ensure course/section exists
4. **409 Conflict**: Section name already exists in course
5. **400 Bad Request**: Check input validation errors

### **Debug Tips**
- Check server logs for detailed error information
- Verify JWT token expiration (1 hour)
- Ensure course ID is valid ObjectId format
- Check if user account type is "Instructor"

This corrected implementation provides robust validation, security, and error handling for all section operations!
