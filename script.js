// 🧩 Replace this with your own Firebase config from your Firebase console
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "XXXXXXX",
  appId: "XXXXXXX"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Populate dropdowns with capsules
async function loadCapsules() {
  const snapshot = await db.collection("capsules").get();
  const capsuleSelect = document.getElementById("capsuleSelect");
  const openSelect = document.getElementById("openSelect");
  capsuleSelect.innerHTML = "";
  openSelect.innerHTML = "";
  snapshot.forEach(doc => {
    const option = document.createElement("option");
    option.value = doc.id;
    option.textContent = doc.data().name;
    capsuleSelect.appendChild(option);
    openSelect.appendChild(option.cloneNode(true));
  });
}
loadCapsules();

// Create new capsule
async function createCapsule() {
  const name = document.getElementById("capsuleName").value;
  const openDate = document.getElementById("openDate").value;
  if (!name || !openDate) return alert("Please enter name and date!");

  await db.collection("capsules").add({
    name,
    openDate,
    messages: []
  });

  alert("Capsule created!");
  loadCapsules();
}

// Add a message to a capsule
async function addMessage() {
  const capsuleId = document.getElementById("capsuleSelect").value;
  const userName = document.getElementById("userName").value || "Anonymous";
  const message = document.getElementById("message").value;
  if (!capsuleId || !message) return alert("Select capsule and write a message!");

  const capsuleRef = db.collection("capsules").doc(capsuleId);
  await capsuleRef.update({
    messages: firebase.firestore.FieldValue.arrayUnion({
      user: userName,
      text: message
    })
  });

  alert("Message added!");
  document.getElementById("message").value = "";
}

// Open a capsule (show messages if date reached)
async function openCapsule() {
  const capsuleId = document.getElementById("openSelect").value;
  const doc = await db.collection("capsules").doc(capsuleId).get();
  const data = doc.data();
  const now = new Date();
  const openDate = new Date(data.openDate);
  const container = document.getElementById("capsuleContent");

  container.innerHTML = `<h3>${data.name}</h3><p>Opens on: ${data.openDate}</p>`;

  if (now < openDate) {
    const daysLeft = Math.ceil((openDate - now) / (1000 * 60 * 60 * 24));
    container.innerHTML += `<p>⏰ This capsule will open in ${daysLeft} day(s).</p>`;
  } else {
    if (data.messages.length === 0) {
      container.innerHTML += `<p>No messages yet!</p>`;
    } else {
      container.innerHTML += `<h4>Messages:</h4>`;
      data.messages.forEach(msg => {
        container.innerHTML += `<p><strong>${msg.user}:</strong> ${msg.text}</p>`;
      });
    }
  }
}
