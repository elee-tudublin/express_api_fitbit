async function fetchFitbitData() {
    try {
        const response = await fetch('http://localhost:3000/api/profile');
        if (!response.ok) throw new Error("Failed to fetch data");
        const data = await response.json();
        console.log('data: ', data.user);

        document.getElementById("name").textContent = data.user.fullName;
        document.getElementById("age").textContent = data.user.age;
        document.getElementById("country").textContent = data.user.country || "N/A";
    } catch (error) {
        console.error("Error fetching data:", error);
        alert("Error fetching Fitbit data. Check console for details.");
    }
}
