// achievements.js
import { supabase, getSession } from "./supabase.js";

async function loadAchievements() {
  const user = await getSession();

  const { data: certs, error } = await supabase
    .from("certificates")
    .select("*, courses(title)")
    .eq("user_id", user.id)
    .order("issued_date", { ascending: false });

  const container = document.getElementById("achievementContainer");
  const emptyState = document.getElementById("emptyState");

  container.innerHTML = "";

  if (!certs || certs.length === 0) {
    emptyState.classList.remove("d-none");
    return;
  }

  certs.forEach(cert => {
    const col = document.createElement("div");
    col.classList.add("col-md-4", "col-sm-6");

    col.innerHTML = `
      <div class="cert-card">
        <img src="${cert.certificate_url}" class="cert-img mb-3" />
        <h6 class="fw-semibold">${cert.courses?.title || "Course"}</h6>
        <small class="text-muted">Issued: ${new Date(cert.issued_date).toLocaleDateString()}</small>
        <div class="mt-3">
          <a href="${cert.certificate_url}" target="_blank" class="btn btn-primary btn-sm">Download</a>
        </div>
      </div>
    `;

    container.appendChild(col);
  });
}

loadAchievements();