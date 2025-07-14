 function openPopup() {
      document.getElementById("log").style.display = "flex";
    }

    function closePopup() {
      document.getElementById("log").style.display = "none";
    }

    window.onclick = function (event) {
      const log = document.getElementById("log");
      if (event.target === log) {
        closePopup();
      }
    };

document.getElementById("createUserForm").addEventListener("submit", async function (e) {
    e.preventDefault();

    const form = e.target;
    const formData = new FormData(form);

    const body = {
      username: formData.get("username"),
      email: formData.get("email"),
      password: formData.get("password"),
    };

    const res = await fetch("/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const result = await res.json();
    const msg = document.getElementById("createMessage");

    if (res.ok) {
      msg.textContent = "User created! Now login below.";
      msg.className = "text-green-600 text-sm mt-2";
      form.reset(); 
    } else {
      msg.textContent = result.message || "Error creating user.";
      msg.className = "text-red-500 text-sm mt-2";
    }
  });