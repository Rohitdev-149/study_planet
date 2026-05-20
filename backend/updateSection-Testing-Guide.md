# updateSection Functionality Testing Guide

## 🧪 **Complete Testing Process for updateSection**

### **Step 1: Prerequisites Setup**

Before testing updateSection, you need:

1. **Valid JWT Token** (from instructor login)
2. **Existing Course** (created by the same instructor)
3. **Existing Section** (to update)

### **Step 2: Create Test Data**

#### **2.1 Create a Course (if you don't have one)**
```bash
POST http://localhost:4000/api/v1/course/create-course
Headers:
  Authorization: Bearer YOUR_JWT_TOKEN
  Content-Type: application/json
Body:
{
  "courseName": "Test Course for Section Updates",
  "courseDescription": "This course is for testing section updates",
  "whatYouwillLearn": "Testing section functionality",
  "price": 99.99,
  "tags": "YOUR_CATEGORY_ID"
}
```

#### **2.2 Create a Section to Update**
```bash
POST http://localhost:4000/api/v1/section/create-section
Headers:
  Authorization: Bearer YOUR_JWT_TOKEN
  Content-Type: application/json
Body:
{
  "sectionName": "Original Section Name",
  "courseId": "COURSE_ID_FROM_STEP_2.1"
}
```

**Save the `sectionId` from the response for testing updates.**

### **Step 3: Test updateSection Functionality**

#### **Test Case 1: Valid Update**
```bash
PUT http://localhost:4000/api/v1/section/update-section
Headers:
  Authorization: Bearer YOUR_JWT_TOKEN
  Content-Type: application/json
Body:
{
  "sectionName": "Updated Section Name",
  "sectionId": "SECTION_ID_FROM_STEP_2.2"
}
```

**Expected Response (200):**
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
      "courseName": "Test Course for Section Updates"
    }
  }
}
```

#### **Test Case 2: Missing sectionName**
```bash
PUT http://localhost:4000/api/v1/section/update-section
Headers:
  Authorization: Bearer YOUR_JWT_TOKEN
  Content-Type: application/json
Body:
{
  "sectionId": "SECTION_ID_FROM_STEP_2.2"
}
```

**Expected Response (400):**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": ["sectionName is required"]
}
```

#### **Test Case 3: Missing sectionId**
```bash
PUT http://localhost:4000/api/v1/section/update-section
Headers:
  Authorization: Bearer YOUR_JWT_TOKEN
  Content-Type: application/json
Body:
{
  "sectionName": "Updated Section Name"
}
```

**Expected Response (400):**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": ["sectionId is required"]
}
```

#### **Test Case 4: Invalid sectionId Format**
```bash
PUT http://localhost:4000/api/v1/section/update-section
Headers:
  Authorization: Bearer YOUR_JWT_TOKEN
  Content-Type: application/json
Body:
{
  "sectionName": "Updated Section Name",
  "sectionId": "invalid-id"
}
```

**Expected Response (400):**
```json
{
  "success": false,
  "message": "Invalid section ID format"
}
```

#### **Test Case 5: Non-existent Section**
```bash
PUT http://localhost:4000/api/v1/section/update-section
Headers:
  Authorization: Bearer YOUR_JWT_TOKEN
  Content-Type: application/json
Body:
{
  "sectionName": "Updated Section Name",
  "sectionId": "64a1b2c3d4e5f6789999999"
}
```

**Expected Response (404):**
```json
{
  "success": false,
  "message": "Section not found"
}
```

#### **Test Case 6: Duplicate Section Name**
```bash
# First create another section with different name
POST http://localhost:4000/api/v1/section/create-section
Body:
{
  "sectionName": "Another Section",
  "courseId": "SAME_COURSE_ID"
}

# Then try to update first section to same name as second
PUT http://localhost:4000/api/v1/section/update-section
Body:
{
  "sectionName": "Another Section",  // Same name as second section
  "sectionId": "FIRST_SECTION_ID"
}
```

**Expected Response (409):**
```json
{
  "success": false,
  "message": "A section with this name already exists in this course"
}
```

#### **Test Case 7: Unauthorized Access (Different Instructor)**
```bash
PUT http://localhost:4000/api/v1/section/update-section
Headers:
  Authorization: Bearer OTHER_INSTRUCTOR_TOKEN
  Content-Type: application/json
Body:
{
  "sectionName": "Updated Section Name",
  "sectionId": "SECTION_FROM_DIFFERENT_INSTRUCTOR"
}
```

**Expected Response (403):**
```json
{
  "success": false,
  "message": "Access denied. You can only update sections in your own courses."
}
```

#### **Test Case 8: Empty sectionName**
```bash
PUT http://localhost:4000/api/v1/section/update-section
Headers:
  Authorization: Bearer YOUR_JWT_TOKEN
  Content-Type: application/json
Body:
{
  "sectionName": "",
  "sectionId": "SECTION_ID_FROM_STEP_2.2"
}
```

**Expected Response (400):**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": ["sectionName is required"]
}
```

#### **Test Case 9: Whitespace-only sectionName**
```bash
PUT http://localhost:4000/api/v1/section/update-section
Headers:
  Authorization: Bearer YOUR_JWT_TOKEN
  Content-Type: application/json
Body:
{
  "sectionName": "   ",
  "sectionId": "SECTION_ID_FROM_STEP_2.2"
}
```

**Expected Response (400):**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": ["sectionName is required"]
}
```

## 🔧 **Potential Issues Found & Fixes**

### **Issue 1: No Validation for Same Name Update**
**Problem**: If user updates section with the same name, it should be allowed.

**Current Behavior**: The code checks for duplicates but doesn't handle the case where the user is updating to the same name.

**Fix**: Add a check to allow same name updates:

```javascript
// Check if the new section name already exists in this course (excluding current section)
const duplicateSection = await Section.findOne({
  sectionName: sectionName.trim(),
  _id: { $ne: sectionId, $in: courseWithSection.courseContent },
});

if (duplicateSection) {
  return res.status(409).json({
    success: false,
    message: "A section with this name already exists in this course",
  });
}
```

This is actually **CORRECT** - it excludes the current section (`$ne: sectionId`) so same name updates are allowed.

### **Issue 2: No Length Validation for sectionName**
**Problem**: No maximum length validation for section names.

**Fix**: Add length validation:

```javascript
// Add this after input validation
if (sectionName.trim().length > 100) {
  return res.status(400).json({
    success: false,
    message: "Section name must be less than 100 characters",
  });
}
```

### **Issue 3: No Special Character Validation**
**Problem**: No validation for special characters that might cause issues.

**Fix**: Add character validation:

```javascript
// Add this after length validation
const allowedPattern = /^[a-zA-Z0-9\s\-_.,!?()]+$/;
if (!allowedPattern.test(sectionName.trim())) {
  return res.status(400).json({
    success: false,
    message: "Section name contains invalid characters",
  });
}
```

## 📋 **Complete Postman Collection**

### **Environment Variables**
```
base_url: http://localhost:4000/api/v1
auth_token: YOUR_JWT_TOKEN
course_id: YOUR_COURSE_ID
section_id: YOUR_SECTION_ID
```

### **Pre-request Script**
```javascript
// Generate unique section name for testing
pm.environment.set("unique_section_name", "Test Section " + Date.now());
```

### **Test Scripts**
```javascript
// For successful update
pm.test("Section updated successfully", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.success).to.be.true;
    pm.expect(jsonData.message).to.include("Section updated successfully");
    pm.expect(jsonData.data.section.sectionName).to.exist;
    pm.expect(jsonData.data.section.updatedAt).to.exist;
});

// For validation errors
pm.test("Validation error handled correctly", function () {
    if (pm.response.code === 400) {
        var jsonData = pm.response.json();
        pm.expect(jsonData.success).to.be.false;
        pm.expect(jsonData.message).to.include("Validation failed");
        pm.expect(jsonData.errors).to.be.an('array');
    }
});
```

## 🚀 **Quick Test Commands**

### **Using curl:**
```bash
# Valid update
curl -X PUT http://localhost:4000/api/v1/section/update-section \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sectionName": "Updated Section Name",
    "sectionId": "YOUR_SECTION_ID"
  }'

# Missing field test
curl -X PUT http://localhost:4000/api/v1/section/update-section \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sectionId": "YOUR_SECTION_ID"
  }'
```

## ✅ **Summary**

The `updateSection` functionality is **mostly correct** but could benefit from:

1. **Length validation** for section names
2. **Character validation** for special characters
3. **More comprehensive error messages**

The current implementation properly handles:
- ✅ Input validation
- ✅ ObjectId validation
- ✅ Section existence check
- ✅ Course ownership validation
- ✅ Duplicate name prevention
- ✅ Proper error responses
- ✅ Database updates

**The functionality works correctly as implemented!**
