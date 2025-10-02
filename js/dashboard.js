document.addEventListener("DOMContentLoaded", () => {
    // ---- CONFIG ----
    // Ensure json-server is running on localhost:3000
    // Command: json-server --watch db.json
    const API_BASE = "http://localhost:3000"; // Change to your ngrok URL or localhost URL
   // const API_BASE = "http://localhost:3000"; //URL for local testing
    
   // ---- DOM REFS ----
    const navBtns = document.querySelectorAll("nav button");
    const sections = document.querySelectorAll("main > .section");


    // Tables
    const patientTableBody = document.querySelector("#patientTable tbody");
    const doctorTableBody = document.querySelector("#doctorTable tbody");
    const appointmentTableBody = document.querySelector("#appointmentTable tbody");
    const billingTableBody = document.querySelector("#billingTable tbody");
    const telehealthTableBody = document.querySelector("#telehealthTable tbody");
    const requestTableBody = document.querySelector("#requestTable tbody");

    // Forms & Containers
    const showPatientFormBtn = document.getElementById("showPatientFormBtn");
    const patientFormContainer = document.getElementById("patientFormContainer");
    const patientForm = document.getElementById("patientForm");
    const showDoctorFormBtn = document.getElementById("showDoctorFormBtn");
    const doctorFormContainer = document.getElementById("doctorFormContainer");
    const doctorForm = document.getElementById("doctorForm");
    const showAppointmentFormBtn = document.getElementById("showAppointmentFormBtn");
    const appointmentFormContainer = document.getElementById("appointmentFormContainer");
    const appointmentForm = document.getElementById("appointmentForm");
    const recordsContainer = document.getElementById("recordsContainer");

    // Dashboard Stats
    const totalPatientsStat = document.getElementById("totalPatientsStat");
    const totalDoctorsStat = document.getElementById("totalDoctorsStat");
    const totalAppointmentsStat = document.getElementById("totalAppointmentsStat");

    // QR Modal
    const qrModal = document.getElementById("qrModal");
    const qrModalContent = document.getElementById("modal-content-container");
    const qrModalCaption = document.getElementById("caption");
    const closeModalBtn = document.querySelector("#qrModal .close");


    // ---- NAVIGATION ----
    navBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            const targetId = btn.getAttribute("data-target");
            navBtns.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            sections.forEach(sec => sec.classList.remove("is-active"));
            document.getElementById(targetId).classList.add("is-active");
        });
    });


    // ---- API HELPERS ----
    async function apiFetch(path, options = {}) {
        try {
            const res = await fetch(API_BASE + path, options);
            if (!res.ok) throw new Error(`API Error: ${res.status} ${res.statusText}`);
            return res.json();
        } catch (err) {
            console.error(`Failed to fetch ${path}:`, err);
            alert("Could not connect to the API server. Please make sure it's running.");
            throw err;
        }
    }

    async function apiPost(path, body) {
        return apiFetch(path, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(body)
        });
    }

    async function apiPatch(path, body) {
        return apiFetch(path, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(body)
        });
    }
    async function apiDelete(path) {
        return apiFetch(path, {
            method: "DELETE"
        });
    }


    // ---- RENDER FUNCTIONS ----
    function renderDashboardStats(patients, doctors, appointments) {
        totalPatientsStat.innerText = patients.length;
        totalDoctorsStat.innerText = doctors.length;
        totalAppointmentsStat.innerText = appointments.filter(a => a.status !== "Cancelled").length;
    }

    function renderPatients(patients) {
        patientTableBody.innerHTML = "";
        patients.forEach(p => {
            const row = patientTableBody.insertRow();
            row.insertCell(0).innerText = p.name || "";
            row.insertCell(1).innerText = p.age || "";
            row.insertCell(2).innerText = p.gender || "";
            row.insertCell(3).innerText = p.phone || "";
            row.insertCell(4).innerText = p.bedNumber || "N/A";
            row.insertCell(5).innerText = p.diagnosis || "N/A";

            const reportCell = row.insertCell(6);
            if (p.reportData) {
                const a = document.createElement("a");
                a.href = p.reportData;
                a.download = p.reportName || `${p.name}_report`;
                a.textContent = "Download";
                a.className = "btn btn--sm btn--success";
                a.style.color = "var(--color-btn-primary-text)";
                reportCell.appendChild(a);
            } else {
                reportCell.innerHTML = '<button class="btn btn--sm btn--outline" disabled>No Report</button>';
            }

            const qrCell = row.insertCell(7);
            const qrDiv = document.createElement("div");
            qrDiv.style.padding = "5px";
            qrDiv.style.cursor = "pointer";
            qrCell.appendChild(qrDiv);

            const qrData = JSON.stringify({
                id: p.id,
                name: p.name,
                diagnosis: p.diagnosis
            });
            new QRCode(qrDiv, {
                text: qrData,
                width: 60,
                height: 60
            });

            qrDiv.addEventListener("click", () => showQrModal(p.name, qrData));
        });
    }

    function renderDoctors(doctors) {
        doctorTableBody.innerHTML = "";
        doctors.forEach(d => {
            const row = doctorTableBody.insertRow();
            row.insertCell(0).innerText = d.name || "";
            row.insertCell(1).innerText = d.specialization || "";
            row.insertCell(2).innerText = d.phone || "";
            row.insertCell(3).innerText = d.email || "";
            row.insertCell(4).innerText = d.experience || "";
            row.insertCell(5).innerText = d.availability || "";
        });
    }

    function renderAppointments(appointments) {
        appointmentTableBody.innerHTML = "";
        appointments.forEach(a => {
            const row = appointmentTableBody.insertRow();
            row.insertCell(0).innerText = a.patient || "";
            row.insertCell(1).innerText = a.doctor || "";
            row.insertCell(2).innerText = a.date || "";
            row.insertCell(3).innerText = a.time || "";
            row.insertCell(4).innerHTML = `<span class="status ${a.status === 'Cancelled' ? 'status--error' : 'status--success'}">${a.status || "Scheduled"}</span>`;
            const actionsCell = row.insertCell(5);
            if (a.status !== "Cancelled") {
                const cancelBtn = document.createElement("button");
                cancelBtn.className = "btn btn--sm btn--outline";
                cancelBtn.innerText = "Cancel";
                cancelBtn.onclick = async () => {
                    try {
                        await apiPatch(`/appointments/${a.id}`, {
                            status: "Cancelled"
                        });
                        loadAndRenderData();
                    } catch (err) {
                        alert("Failed to cancel appointment.");
                    }
                };
                actionsCell.appendChild(cancelBtn);
            } else {
                actionsCell.innerHTML = "<em>—</em>";
            }
        });
    }

    function renderBilling(patients) {
        billingTableBody.innerHTML = "";

        patients.forEach(p => {
            const row = billingTableBody.insertRow();
            const dueAmount = (Math.random() * (50000 - 500) + 500).toFixed(2);
            const status = Math.random() > 0.3 ? "Paid" : "Unpaid";

            row.insertCell(0).innerText = p.name || "";
            row.insertCell(1).innerText = p.bedNumber || "N/A";
            row.insertCell(2).innerText = `₹${dueAmount}`;
            row.insertCell(3).innerHTML = `<span class="status ${status === 'Paid' ? 'status--success' : 'status--error'}">${status}</span>`;
            row.insertCell(4).innerHTML = `<button class="btn btn--sm btn--primary">Generate Bill</button>`;
        });
    }

    function renderRequests(requests) {
        requestTableBody.innerHTML = "";
        requests.forEach(r => {
            const row = requestTableBody.insertRow();
            row.insertCell(0).innerText = r.name || "";
            row.insertCell(1).innerText = r.age || "";
            row.insertCell(2).innerText = r.gender || "";
            row.insertCell(3).innerText = r.phone || "";
            row.insertCell(4).innerText = r.diagnosis || "N/A";

            const actionsCell = row.insertCell(5);

            const admitBtn = document.createElement("button");
            admitBtn.className = "btn btn--sm btn--success";
            admitBtn.innerText = "Admit";
            admitBtn.onclick = async () => {
                try {
                    await apiPost("/patients", { ...r, id: undefined }); // Admit patient
                    await apiDelete(`/requests/${r.id}`); // Remove request
                    loadAndRenderData();
                } catch (err) {
                    alert("Failed to admit patient.");
                }
            };

            const denyBtn = document.createElement("button");
denyBtn.className = "btn btn--sm btn--error"; // Use a class for error/deny buttons
denyBtn.innerText = "Deny";
denyBtn.style.marginLeft = "8px";
denyBtn.onclick = async () => {
    try {
        await apiDelete(`/requests/${r.id}`); // Just delete the request
        loadAndRenderData();
    } catch (err) {
        alert("Failed to deny request.");
    }
};


            actionsCell.appendChild(admitBtn);
            actionsCell.appendChild(denyBtn);
        });
    }

    function renderRecords(patients) {
        recordsContainer.innerHTML = "";
        const patientsWithReports = patients.filter(p => p.reportData);

        if (patientsWithReports.length === 0) {
            recordsContainer.innerHTML = `
            <div class="card">
              <div class="card__body text-center py-32">
                <i class="fa-solid fa-file-circle-xmark fa-3x text-secondary mb-16"></i>
                <h3 class="text-secondary">No Records Available</h3>
                <p>Medical records will appear here once they are uploaded via the patient management section.</p>
              </div>
            </div>`;
            return;
        }

        patientsWithReports.forEach(p => {
            const recordCard = document.createElement("div");
            recordCard.className = "card mb-16";
            recordCard.innerHTML = `
            <div class="card__body flex items-center justify-between">
                <div>
                    <h4>${p.name}</h4>
                    <p class="text-secondary m-0">Diagnosis: ${p.diagnosis || 'N/A'}</p>
                    <small class="text-secondary">Report: ${p.reportName || 'file'}</small>
                </div>
                <a href="${p.reportData}" download="${p.reportName || `${p.name}_report`}" class="btn btn--primary">
                    <i class="fa-solid fa-download mr-8"></i> Download
                </a>
            </div>`;
            recordsContainer.appendChild(recordCard);
        });
    }

    function renderTeleHealth(appointments) {
        telehealthTableBody.innerHTML = "";
        const scheduledAppointments = appointments.filter(a => a.status === "Scheduled");

        if (scheduledAppointments.length === 0) {
            const row = telehealthTableBody.insertRow();
            const cell = row.insertCell(0);
            cell.colSpan = 6; // Span across all 6 columns
            cell.innerHTML = "<em>No upcoming telehealth appointments.</em>";
            cell.style.textAlign = "center";
            return;
        }

        scheduledAppointments.forEach(a => {
            const row = telehealthTableBody.insertRow();
            row.insertCell(0).innerText = a.patient || "";
            row.insertCell(1).innerText = a.doctor || "";
            row.insertCell(2).innerText = a.date || "";
            row.insertCell(3).innerText = a.time || "";
            const linkCell = row.insertCell(4);
            const link = document.createElement("a");
            link.href = `../TeleAppointment/new.html`; // Link to the telehealth page
            link.textContent = "Join Call";
            link.className = "btn btn--sm btn--primary";
            link.target = "_blank"; // Open in a new tab
            linkCell.appendChild(link);
            row.insertCell(5).innerHTML = `<span class="status status--success">${a.status || "Scheduled"}</span>`;
        });
    }


    // ---- MAIN DATA HANDLER ----
    async function loadAndRenderData() {
        try {
            const [patients, doctors, appointments, requests] = await Promise.all([
    apiFetch("/patients"),
    apiFetch("/doctors"),
    apiFetch("/appointments"),
    apiFetch("/requests") // Fetch requests
]);
            renderDashboardStats(patients, doctors, appointments);
            renderPatients(patients);
            renderDoctors(doctors);
            renderAppointments(appointments);
            renderBilling(patients);
            renderRecords(patients);
            renderTeleHealth(appointments);
            renderRequests(requests);
        } catch (err) {
            console.error("Failed to load and render initial data.", err);
        }
    }


    // ---- FILE & MODAL HELPERS ----
    function readFileAsDataURL(file) {
        return new Promise((resolve, reject) => {
            if (!file) return resolve(null);
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = () => reject(new Error("File read error"));
            reader.readAsDataURL(file);
        });
    }

    function showQrModal(name, qrData) {
        qrModalContent.innerHTML = "";
        new QRCode(qrModalContent, {
            text: qrData,
            width: 256,
            height: 256
        });
        qrModalCaption.innerText = `QR Code for ${name}`;
        qrModal.style.display = "block";
    }

    closeModalBtn.addEventListener("click", () => {
        qrModal.style.display = "none";
    });

    window.addEventListener("click", (event) => {
        if (event.target === qrModal) {
            qrModal.style.display = "none";
        }
    });


    // ---- FORM EVENT LISTENERS ----
    // Patient Form
    showPatientFormBtn.addEventListener("click", () => {
        patientFormContainer.style.display = patientFormContainer.style.display === "block" ? "none" : "block";
    });

    patientForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const pImageInput = document.getElementById("pImage");
        const selectedFile = pImageInput.files[0] || null;

        try {
            const dataUrl = await readFileAsDataURL(selectedFile);
            const patientObj = {
                name: document.getElementById("pName").value.trim(),
                age: document.getElementById("pAge").value,
                gender: document.getElementById("pGender").value,
                phone: document.getElementById("pPhone").value.trim(),
                bedNumber: document.getElementById("pBN").value.trim() || "N/A",
                diagnosis: document.getElementById("pReason").value.trim() || "N/A",
                notes: document.getElementById("pNotes").value.trim(),
                reportData: dataUrl,
                reportName: selectedFile ? selectedFile.name : null,
                createdAt: new Date().toISOString()
            };
            await apiPost("/patients", patientObj);
            await apiPost("/requests", patientObj);
            patientForm.reset();
            patientFormContainer.style.display = "none";
            loadAndRenderData();
        } catch (err) {
            alert("Could not save patient. See console for details.");
        }
    });

    // Doctor Form
    showDoctorFormBtn.addEventListener("click", () => {
        doctorFormContainer.style.display = doctorFormContainer.style.display === "block" ? "none" : "block";
    });

    doctorForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const experienceValue = document.getElementById("dExperience").value.trim();
        try {
            const doctorObj = {
                name: document.getElementById("dName").value.trim(),
                specialization: document.getElementById("dSpecialization").value.trim(),
                phone: document.getElementById("dPhone").value.trim(),
                email: document.getElementById("dEmail").value.trim(),
                experience: experienceValue ? `${experienceValue} Years` : "",
                availability: document.getElementById("dAvailability").value.trim()
            };
            await apiPost("/doctors", doctorObj);
            doctorForm.reset();
            doctorFormContainer.style.display = "none";
            loadAndRenderData();
        } catch (err) {
            alert("Could not save doctor. See console for details.");
        }
    });

    // Appointment Form
    async function populateAppointmentDropdowns() {
        try {
            const [patients, doctors] = await Promise.all([apiFetch("/patients"), apiFetch("/doctors")]);
            const patientSelect = document.getElementById("aPatient");
            const doctorSelect = document.getElementById("aDoctor");
            patientSelect.innerHTML = "<option value=''>Select Patient</option>";
            doctorSelect.innerHTML = "<option value=''>Select Doctor</option>";
            patients.forEach(p => {
                patientSelect.innerHTML += `<option value="${p.name}">${p.name}</option>`;
            });
            doctors.forEach(d => {
                doctorSelect.innerHTML += `<option value="${d.name}">${d.name}</option>`;
            });
        } catch (err) {
            alert("Could not load doctors/patients for the appointment form.");
        }
    }

    showAppointmentFormBtn.addEventListener("click", () => {
        const isVisible = appointmentFormContainer.style.display === "block";
        if (!isVisible) {
            populateAppointmentDropdowns();
        }
        appointmentFormContainer.style.display = isVisible ? "none" : "block";
    });

    appointmentForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        try {
            const appointmentObj = {
                patient: document.getElementById("aPatient").value,
                doctor: document.getElementById("aDoctor").value,
                date: document.getElementById("aDate").value,
                time: document.getElementById("aTime").value,
                reason: document.getElementById("aReason").value.trim(),
                status: "Scheduled",
                createdAt: new Date().toISOString()
            };
            await apiPost("/appointments", appointmentObj);
            appointmentForm.reset();
            appointmentFormContainer.style.display = "none";
            loadAndRenderData();
        } catch (err) {
            alert("Could not save appointment. See console for details.");
        }
    });


    // ---- INITIALIZATION ----
    loadAndRenderData();

});