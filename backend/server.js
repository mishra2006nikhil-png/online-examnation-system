const path =require("path");
const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
require("dotenv").config();
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "../frontend")));
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/index.html"));
});
app.get("/admin-login.html", (req,res)=> {
    res.sendFile(path.join(__dirname, "../frontend/admin-login.html"));
});

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

db.connect((err) => {
    if (err) {
        console.log("MySQL connection error:", err);
        return;
    }

    console.log("MySQL connected successfully!");
});
app.post("/login", (req, res) => {

    const { name, email } = req.body;

    const checkSql = `
        SELECT id, name
        FROM students
        WHERE email = ?
    `;

    db.query(checkSql, [email], (err, results) => {

        if (err) {
            console.log("Login error:", err);

            return res.status(500).json({
                message: "Login failed"
            });
        }

        // Student already exists
        if (results.length > 0) {

            console.log("Existing student:", results[0].id);

            return res.json({
                message: "Login successful",
                student_id: results[0].id,
                name: results[0].name
            });
        }

        // New student
        const password = "student123";

        const insertSql = `
            INSERT INTO students (name, email, password)
            VALUES (?, ?, ?)
        `;

        db.query(
            insertSql,
            [name, email, password],
            (err, result) => {

                if (err) {
                    console.log("Student creation error:", err);

                    return res.status(500).json({
                        message: "Login failed"
                    });
                }

                console.log("New student created:", result.insertId);

                res.json({
                    message: "Login successful",
                    student_id: result.insertId,
                    name: name
                });
            }
        );
    });
});
app.post("/submit-result", (req, res) => {

    const {
        student_id,
        exam_id,
        score,
        total_questions
    } = req.body;

    const percentage = ((score / total_questions) * 100).toFixed(2);

    const sql = `
        INSERT INTO results
        (student_id, exam_id, score, total_questions, percentage)
        VALUES (?, ?, ?, ?, ?)
    `;

    db.query(
        sql,
        [
            student_id,
            exam_id,
            score,
            total_questions,
            percentage
        ],
        (err, result) => {

            if (err) {
                console.log("Result save error:", err);

                return res.status(500).json({
                    message: "Result save failed"
                });
            }

            console.log("Result saved:", result.insertId);

            res.json({
                message: "Result saved successfully",
                result_id: result.insertId
            });
        }
    );
});
// =========================
// ADD QUESTION
// =========================

app.post("/questions", (req, res) => {

    const {
        exam_id,
        question,
        option_a,
        option_b,
        option_c,
        option_d,
        correct_option
    } = req.body;

    const sql = `
        INSERT INTO questions
        (exam_id, question, option_a, option_b, option_c, option_d, correct_option)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
        sql,
        [
            exam_id,
            question,
            option_a,
            option_b,
            option_c,
            option_d,
            correct_option
        ],
        (err, result) => {

            if (err) {

                console.log("Question add error:", err);

                return res.status(500).json({
                    message: "Question add failed"
                });
            }

            console.log(
                "Question added:",
                result.insertId
            );

            res.json({
                message: "Question added successfully",
                question_id: result.insertId
            });
        }
    );
});


// =========================
// GET ALL QUESTIONS
// =========================

app.get("/questions", (req, res) => {

    const sql = `
        SELECT *
        FROM questions
        ORDER BY id ASC
    `;

    db.query(sql, (err, results) => {

        if (err) {

            console.log("Questions error:", err);

            return res.status(500).json({
                message: "Questions load failed"
            });
        }

        res.json(results);
    });
});


// =========================
// DELETE QUESTION
// =========================


app.delete("/questions/:id", (req, res) => {

    const id = req.params.id;

    const sql = `
        DELETE FROM questions
        WHERE id = ?
    `;

    db.query(sql, [id], (err, result) => {

        if (err) {

            console.log("Delete question error:", err);

            return res.status(500).json({
                message: "Question delete failed"
            });
        }

        res.json({
            message: "Question deleted successfully"
        });
    });

});
// =========================
// GET ALL STUDENTS
// =========================

app.get("/students", (req, res) => {

    const sql = `
        SELECT id, name, email
        FROM students
        ORDER BY id DESC
    `;

    db.query(sql, (err, results) => {

        if (err) {
            console.log("Students error:", err);

            return res.status(500).json({
                message: "Students load failed"
            });
        }

        res.json(results);
    });

});
// =========================
// GET ALL STUDENTS
// =========================

app.get("/students", (req, res) => {

    const sql = `
        SELECT id, name, email
        FROM students
        ORDER BY id DESC
    `;

    db.query(sql, (err, results) => {

        if (err) {
            console.log("Students error:", err);

            return res.status(500).json({
                message: "Students load failed"
            });
        }

        res.json(results);
    });
});
app.get("/results", (req, res) => {

    const student_id = req.query.student_id;

    const sql = `
        SELECT *
        FROM results
        WHERE student_id = ?
        ORDER BY submitted_at DESC
    `;

    db.query(sql, [student_id], (err, results) => {

        if (err) {
            console.log("Results error:", err);

            return res.status(500).json({
                message: "Results load failed"
            });
        }

        res.json(results);
    });
});
// =========================
// GET ALL RESULTS (ADMIN)
// =========================

app.get("/all-results", (req, res) => {

    const sql = `
        SELECT *
        FROM results
        ORDER BY submitted_at DESC
    `;

    db.query(sql, (err, results) => {

        if (err) {
            console.log("All results error:", err);

            return res.status(500).json({
                message: "Results load failed"
            });
        }

        res.json(results);
    });

});
app.get("/students", (req, res) => {

    const sql = `
        SELECT id, name, email
        FROM students
        ORDER BY id DESC
    `;

    db.query(sql, (err, results) => {

        if (err) {

            console.log("Students error:", err);

            return res.status(500).json({
                message: "Students load failed"
            });
        }

        res.json(results);
    });

});
// =========================
// GET ALL RESULTS FOR ADMIN
// =========================

app.get("/all-results", (req, res) => {

    const sql = `
        SELECT
            results.id,
            students.name,
            students.email,
            results.exam_id,
            results.score,
            results.total_questions,
            results.percentage,
            results.submitted_at
        FROM results
        JOIN students
            ON results.student_id = students.id
        ORDER BY results.submitted_at DESC
    `;

    db.query(sql, (err, results) => {

        if (err) {

            console.log("All results error:", err);

            return res.status(500).json({
                message: "Results load failed"
            });
        }

        res.json(results);
    });

});
// =========================
// DELETE STUDENT
// =========================

app.delete("/students/:id", (req, res) => {

    const id = req.params.id;

    const sql = `
        DELETE FROM students
        WHERE id = ?
    `;

    db.query(sql, [id], (err, result) => {

        if (err) {

            console.log("Student delete error:", err);

            return res.status(500).json({
                message: "Student delete failed"
            });
        }

        if (result.affectedRows === 0) {

            return res.status(404).json({
                message: "Student not found"
            });
        }

        res.json({
            message: "Student deleted successfully"
        });

    });

});
// =========================
// ADMIN LOGIN
// =========================

app.post("/admin-login", (req, res) => {

    const { email, password } = req.body;

    // Demo admin credentials
    const adminEmail = "admin@exam.com";
    const adminPassword = "admin123";

    if (
        email === adminEmail &&
        password === adminPassword
    ) {

        return res.json({
            success: true,
            message: "Admin login successful"
        });

    }

    res.status(401).json({
        success: false,
        message: "Invalid admin email or password"
    });

});
const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
});