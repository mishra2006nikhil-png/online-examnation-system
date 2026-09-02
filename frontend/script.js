function startExam(event) {
    event.preventDefault();

    const name = document.getElementById("name").value;

    document.getElementById("loginForm").innerHTML =
        "<h2>Exam Started!</h2>" +
        "<h3>Welcome " + name + "!</h3>" +
        "<p>Q1. What is Java?</p>" +
        "<input type='radio' name='q1'> Programming Language<br>" +
        "<input type='radio' name='q1'> Database<br><br>" +
        "<button onclick='submitExam()'>Submit Exam</button>";
}

function submitExam() {
    const result = {
        examId: "JAVA-001",
        score: 1,
        total: 1,
        percentage: 100,
        date: new Date().toLocaleDateString()
    };

    let history = JSON.parse(localStorage.getItem("examHistory")) || [];

    history.push(result);

    localStorage.setItem("examHistory", JSON.stringify(history));

    alert("Exam submitted successfully!");

    window.location.href = "history.html";
}
