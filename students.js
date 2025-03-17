const express = require('express');
const jwt = require('jsonwebtoken');
const db = require('../db');
const router = express.Router();

// Middleware to verify JWT
const authenticate = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });
  jwt.verify(token, 'your-secret-key', (err, decoded) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.user = decoded;
    next();
  });
};

// Get all students
router.get('/', authenticate, (req, res) => {
  db.all("SELECT * FROM students", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows.map(row => ({
      id: row.id,
      name: row.name,
      grade: row.grade,
      courses: JSON.parse(row.courses)
    })));
  });
});

// Add student(s)
router.post('/', authenticate, (req, res) => {
  const students = Array.isArray(req.body) ? req.body : [req.body];
  const stmt = db.prepare("INSERT INTO students (name, grade, courses) VALUES (?, ?, ?)");
  let errorOccurred = false;

  students.forEach(student => {
    stmt.run(student.name, student.grade, JSON.stringify(student.courses), (err) => {
      if (err) errorOccurred = true;
    });
  });

  stmt.finalize(err => {
    if (err || errorOccurred) return res.status(500).json({ error: 'Failed to add students' });
    res.status(201).json({ message: 'Students added' });
  });
});

// Update student
router.put('/:id', authenticate, (req, res) => {
  const { name, grade, courses } = req.body;
  db.run(
    "UPDATE students SET name = ?, grade = ?, courses = ? WHERE id = ?",
    [name, grade, JSON.stringify(courses), req.params.id],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Student updated' });
    }
  );
});

// Delete student
router.delete('/:id', authenticate, (req, res) => {
  db.run("DELETE FROM students WHERE id = ?", [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Student deleted' });
  });
});

module.exports = router;