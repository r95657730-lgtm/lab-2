<?php
$host = 'localhost';
$db   = 'gpa_db';
$user = 'root';
$pass = '';

$conn = new mysqli($host, $user, $pass, $db);

$studentName = $_GET['studentName'] ?? '';
$semester    = $_GET['semester'] ?? '';

$stmt = $conn->prepare("SELECT * FROM records WHERE student_name = ? AND semester = ?");
$stmt->bind_param("ss", $studentName, $semester);
$stmt->execute();
$result = $stmt->get_result();

header('Content-Type: text/csv');
header('Content-Disposition: attachment; filename="gpa_export.csv"');

$output = fopen('php://output', 'w');
fputcsv($output, ['Student Name', 'Semester', 'GPA', 'Date']);

while ($row = $result->fetch_assoc()) {
    fputcsv($output, [
        $row['student_name'],
        $row['semester'],
        $row['gpa'],
        $row['created_at']
    ]);
}

fclose($output);
$conn->close();
exit;
?>
