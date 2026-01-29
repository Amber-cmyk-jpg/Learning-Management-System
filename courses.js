import { supabase } from "./config.js";

let courses = [];
let currentEditId = null;

// ===============================
// DOM ELEMENTS
// ===============================
const createModal = document.getElementById("createModal");
const editModal = document.getElementById("editModal");

const createCourseBtn = document.getElementById("createCourseBtn");
const closeCreateModalBtn = document.getElementById("closeModal");
const closeEditModalBtn = document.getElementById("closeEditModal");
const cancelBtn = document.getElementById("cancelBtn");
const cancelEditBtn = document.getElementById("cancelEditBtn");

const courseForm = document.getElementById("courseForm");
const editCourseForm = document.getElementById("editCourseForm");

const coursesList = document.getElementById("coursesList");
const searchInput = document.getElementById("searchCourses");

const courseColor = document.getElementById("courseColor");
const colorPreview = document.getElementById("colorPreview");

// ===============================
// MODALS
// ===============================
function openCreateModal() {
  courseForm.reset();
  courseColor.value = "#4ECDC4";
  colorPreview.style.background = "#4ECDC4";
  createModal.classList.add("active");
}

function closeCreateModal() {
  createModal.classList.remove("active");
}

function openEditModal(id) {
  const course = courses.find(c => c.id === id);
  if (!course) return;

  currentEditId = id;

  document.getElementById("editCourseTitle").value = course.title;
  document.getElementById("editCourseDescription").value = course.description;
  document.getElementById("editCourseInstructor").value = course.instructor;
  document.getElementById("editCourseLevel").value = course.level;

  editModal.classList.add("active");
}

function closeEditModal() {
  editModal.classList.remove("active");
  currentEditId = null;
}

// ===============================
// LOAD COURSES
// ===============================
async function loadCourses() {
  const { data, error } = await supabase
    .from("courses")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    showNotification("Failed to load courses", "error");
    return;
  }

  courses = data || [];
  renderCourses(courses);
}

// ===============================
// RENDER COURSES
// ===============================
function renderCourses(list) {
  coursesList.innerHTML = "";

  if (!list.length) {
    coursesList.innerHTML = `
      <div class="empty-state" style="grid-column:1/-1">
        <h3>No Courses Yet</h3>
        <button id="emptyCreateBtn">Create Course</button>
      </div>
    `;
    document.getElementById("emptyCreateBtn").onclick = openCreateModal;
    return;
  }

  list.forEach(course => {
    const card = document.createElement("div");
    card.className = "course-item";

    card.innerHTML = `
      <div class="course-header" style="background:${course.image || "#4ECDC4"}"></div>
      <div class="course-body">
        <h3>${course.title}</h3>
        <p>${course.description}</p>
        <div class="course-actions">
          <button class="btn-edit">Edit</button>
          <button class="btn-delete">Delete</button>
        </div>
      </div>
    `;

    card.querySelector(".btn-edit").onclick = () => openEditModal(course.id);
    card.querySelector(".btn-delete").onclick = () => deleteCourse(course.id);

    coursesList.appendChild(card);
  });
}

// ===============================
// CREATE COURSE
// ===============================
courseForm.addEventListener("submit", async e => {
  e.preventDefault();

  const newCourse = {
    title: courseForm.title.value,
    description: courseForm.description.value,
    instructor: courseForm.instructor.value,
    level: courseForm.level.value,
    duration: courseForm.duration.value,
    image: courseForm.color.value
  };

  const { error } = await supabase.from("courses").insert([newCourse]);

  if (error) {
    showNotification(error.message, "error");
    return;
  }

  closeCreateModal();
  loadCourses();
  showNotification("Course created successfully");
});

// ===============================
// UPDATE COURSE
// ===============================
editCourseForm.addEventListener("submit", async e => {
  e.preventDefault();
  if (!currentEditId) return;

  const updatedCourse = {
    title: document.getElementById("editCourseTitle").value,
    description: document.getElementById("editCourseDescription").value,
    instructor: document.getElementById("editCourseInstructor").value,
    level: document.getElementById("editCourseLevel").value
  };

  const { error } = await supabase
    .from("courses")
    .update(updatedCourse)
    .eq("id", currentEditId);

  if (error) {
    showNotification("Update failed", "error");
    return;
  }

  closeEditModal();
  loadCourses();
  showNotification("Course updated");
});

// ===============================
// DELETE COURSE
// ===============================
async function deleteCourse(id) {
  if (!confirm("Delete this course?")) return;

  try {
    console.log("Attempting to delete course:", id);
    
    const { data, error } = await supabase
      .from("courses")
      .delete()
      .eq("id", id);

    console.log("Delete response:", { data, error });

    if (error) {
      throw new Error(`Supabase Error: ${error.message} (Code: ${error.code})`);
    }

    // Remove from local array immediately
    courses = courses.filter(c => c.id !== id);
    
    // Re-render courses
    renderCourses(courses);
    
    showNotification("Course deleted successfully");
  } catch (err) {
    console.error("Delete error details:", err);
    showNotification("Failed to delete course: " + err.message, "error");
  }
}

// ===============================
// SEARCH
// ===============================
searchInput.addEventListener("input", e => {
  const v = e.target.value.toLowerCase();
  renderCourses(courses.filter(c =>
    c.title.toLowerCase().includes(v) ||
    c.description.toLowerCase().includes(v)
  ));
});

// ===============================
// COLOR PREVIEW
// ===============================
courseColor.addEventListener("input", () => {
  colorPreview.style.background = courseColor.value;
});

// ===============================
// NOTIFICATION
// ===============================
function showNotification(msg, type = "success") {
  const n = document.createElement("div");
  n.textContent = msg;
  n.style.cssText = `
    position:fixed;top:20px;right:20px;
    background:${type === "success" ? "#4bbfa3" : "#ff6b6b"};
    color:#fff;padding:12px 18px;border-radius:6px;z-index:9999;
  `;
  document.body.appendChild(n);
  setTimeout(() => n.remove(), 3000);
}

// ===============================
// EVENTS
// ===============================
createCourseBtn.onclick = openCreateModal;
closeCreateModalBtn.onclick = closeCreateModal;
cancelBtn.onclick = closeCreateModal;
closeEditModalBtn.onclick = closeEditModal;
cancelEditBtn.onclick = closeEditModal;

window.onclick = e => {
  if (e.target === createModal) closeCreateModal();
  if (e.target === editModal) closeEditModal();
};

// ===============================
// INIT
// ===============================
loadCourses();
