function toggleSidebar() {
      document.getElementById("sidebar").classList.toggle("active");
    }

    function showContent(sectionId) {
      // Add all your section IDs here
      const sections = ['home-section', 'services-section'];

      sections.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
          // Compare the clicked button's sectionId with the element's id
          if (sectionId + '-section' === id || (sectionId === 'home' && id === 'home-section')) {
            el.style.display = 'block';
          } else {
            el.style.display = 'none';
          }
        }
      });

      // Close sidebar if it is open
      const sidebar = document.getElementById("sidebar");
      if (sidebar.classList.contains("active")) {
        sidebar.classList.remove("active");
      }
    }


    function openModal(id) { document.getElementById(id).style.display = 'flex'; }
    function closeModal(id) { document.getElementById(id).style.display = 'none'; }


    // Open service modal
    function openService(serviceId) {
      document.getElementById('service-modal').style.display = 'flex';
      document.querySelectorAll('.detail-content').forEach(d => d.style.display = 'none');
      document.getElementById(serviceId).style.display = 'block';
      window.scrollTo(0, 0);
    }

    // Close modal
    function closeService() {
      document.getElementById('service-modal').style.display = 'none';
    }

    // Laboratory
    function bookLabTest() {
      let name = document.getElementById("labName").value;
      let test = document.getElementById("labTest").value;
      let date = document.getElementById("labDate").value;
      if (name && test && date) {
        alert(`Test "${test}" booked for ${name} on ${date}`);
        let status = document.getElementById("labStatus").children;
        for (let li of status) li.textContent = li.textContent.replace('❌', '✔️');
      } else alert("Enter all fields");
    }
    function uploadReport() { let file = document.getElementById("labReport").files[0]; if (file) alert("Report " + file.name + " uploaded"); else alert("Choose a file to upload"); }
    function downloadReport() { alert("Report downloaded (demo)"); }

    // Demo doctors
    const doctors = [
      { name: "Dr. A. Sharma", specialization: "Cardiologist", keywords: ["heart", "cardio"], experience: "10 yrs" },
      { name: "Dr. R. Mehta", specialization: "Dermatologist", keywords: ["skin", "rash", "acne"], experience: "7 yrs" },
      { name: "Dr. S. Patil", specialization: "Neurologist", keywords: ["headache", "brain", "neuro"], experience: "12 yrs" },
      { name: "Dr. P. Joshi", specialization: "Orthopedic", keywords: ["bone", "joint", "fracture"], experience: "8 yrs" },
      { name: "Dr. N. Gupta", specialization: "General Physician", keywords: ["fever", "cold", "cough"], experience: "5 yrs" }
    ];
    let selectedDoctor = "", selectedTime = "";

    function findDoctors() {
      const desc = document.getElementById("problemDescription").value.toLowerCase();
      const doctorList = document.getElementById("doctorList");
      doctorList.innerHTML = ""; document.getElementById("timeSlotSection").style.display = "none";
      if (!desc) { alert("Please describe your problem."); return; }
      const matchedDoctors = doctors.filter(doc => doc.keywords.some(k => desc.includes(k)));
      if (matchedDoctors.length === 0) { doctorList.innerHTML = "<p>No matching doctors found.</p>"; return; }
      matchedDoctors.forEach(doc => {
        const card = document.createElement("div");
        card.className = "doctor-card";
        card.innerHTML = `<div><strong>${doc.name}</strong><br>${doc.specialization} | ${doc.experience}</div>
      <button onclick="selectDoctor('${doc.name}')">Consult</button>`;
        doctorList.appendChild(card);
      });
    }

    function selectDoctor(doctorName) {
      selectedDoctor = doctorName;
      const timeSection = document.getElementById("timeSlotSection");
      const slotsDiv = document.getElementById("timeSlots");
      slotsDiv.innerHTML = "";
      const slots = ["09:00 AM", "10:00 AM", "11:00 AM", "02:00 PM", "03:00 PM", "04:00 PM"];
      slots.forEach(slot => {
        const btn = document.createElement("button");
        btn.textContent = slot;
        btn.onclick = () => { selectedTime = slot; Array.from(slotsDiv.children).forEach(b => b.style.background = "#eee"); btn.style.background = "#1a4c67"; btn.style.color = "#fff"; };
        slotsDiv.appendChild(btn);
      });
      timeSection.style.display = "block";
    }

    document.getElementById("confirmAppointment").onclick = function () {
      if (!selectedDoctor || !selectedTime) { alert("Please select a doctor and time slot."); return; }
      alert(`Appointment confirmed with ${selectedDoctor} at ${selectedTime}`);
      startConsultation(selectedDoctor);
      document.getElementById("timeSlotSection").style.display = "none";
    }

    function startConsultation(doctorName) {
      const room = document.getElementById("consultationRoom");
      const iframe = document.getElementById("jitsiFrame");
      iframe.src = `https://meet.jit.si/HMS-${doctorName.replace(/\s+/g, '')}-Room`;
      room.style.display = "block";
    }

    function endConsultation() {
      const room = document.getElementById("consultationRoom");
      const iframe = document.getElementById("jitsiFrame");
      iframe.src = ""; room.style.display = "none";
    }