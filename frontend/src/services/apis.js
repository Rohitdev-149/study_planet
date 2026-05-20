const BASE_URL = process.env.REACT_APP_BASE_URL || "http://localhost:4000/api/v1";

// AUTH ENDPOINTS
export const endpoints = {
  SENDOTP_API: BASE_URL + "/auth/sendotp",
  SIGNUP_API: BASE_URL + "/auth/signup",
  LOGIN_API: BASE_URL + "/auth/login",
  RESETPASSTOKEN_API: BASE_URL + "/auth/reset-password-token",
  RESETPASSWORD_API: BASE_URL + "/auth/reset-password",
};

// PROFILE ENDPOINTS
export const profileEndpoints = {
  GET_USER_DETAILS_API: BASE_URL + "/profile/get-user-details",
  GET_USER_ENROLLED_COURSES_API: BASE_URL + "/profile/enrolled-courses",
  GET_INSTRUCTOR_DATA_API: BASE_URL + "/profile/instructorDashboard",
};

// STUDENTS ENDPOINTS
export const studentEndpoints = {
  COURSE_PAYMENT_API: BASE_URL + "/payment/capture-payment",
  COURSE_VERIFY_API: BASE_URL + "/payment/verify-signature",
};

// COURSE ENDPOINTS
export const courseEndpoints = {
  GET_ALL_COURSE_API: BASE_URL + "/course/all-courses",
  COURSE_DETAILS_API: BASE_URL + "/course/course-details",
  EDIT_COURSE_API: BASE_URL + "/course/editCourse",
  COURSE_CATEGORIES_API: BASE_URL + "/course/all-categories",
  CREATE_COURSE_API: BASE_URL + "/course/create-course",
  CREATE_SECTION_API: BASE_URL + "/section/create-section",
  CREATE_SUBSECTION_API: BASE_URL + "/course/create-sub-section",
  UPDATE_SECTION_API: BASE_URL + "/section/update-section",
  UPDATE_SUBSECTION_API: BASE_URL + "/course/update-sub-section",
  GET_ALL_INSTRUCTOR_COURSES_API: BASE_URL + "/course/getInstructorCourses",
  DELETE_SECTION_API: BASE_URL + "/section/delete-section",
  DELETE_SUBSECTION_API: BASE_URL + "/course/delete-sub-section",
  DELETE_COURSE_API: BASE_URL + "/course/deleteCourse",
  GET_FULL_COURSE_DETAILS_AUTHENTICATED:
    BASE_URL + "/course/getFullCourseDetails",
  LECTURE_COMPLETION_API: BASE_URL + "/course/updateCourseProgress",
  CREATE_RATING_API: BASE_URL + "/course/create-rating",
};

// RATINGS AND REVIEWS
export const ratingsEndpoints = {
  REVIEWS_DETAILS_API: BASE_URL + "/course/getReviews",
};

// CATAGORIES API
export const categories = {
  CATEGORIES_API: BASE_URL + "/course/all-categories",
};

// CATALOG PAGE DATA
export const catalogData = {
  CATALOGPAGEDATA_API: BASE_URL + "/course/category-page-details",
};
// CONTACT-US API
export const contactusEndpoint = {
  CONTACT_US_API: BASE_URL + "/reach/contact",
};

// SETTINGS PAGE API
export const settingsEndpoints = {
  UPDATE_DISPLAY_PICTURE_API: BASE_URL + "/profile/update-display-picture",
  UPDATE_PROFILE_API: BASE_URL + "/profile/update-profile",
  CHANGE_PASSWORD_API: BASE_URL + "/auth/change-password",
  DELETE_PROFILE_API: BASE_URL + "/profile/delete-account",
};
