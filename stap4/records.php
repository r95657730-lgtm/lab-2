<?php
header('Content-Type: application/json');

$host = 'localhost';
$db   = 'gpa_db';
$user = 'root';
$pass = '';

$conn = new mysqli($host, $user, $pass, $db);
if ($conn->connect_error) {
    echo json_encode([]);
    exit;
}

$result = $conn->query("SELECT * FROM records ORDER BY created_at DESC LIMIT 6");
$records = [];
while ($row = $result->fetch_assoc()) {
    $records[] = $row;
}

echo json_encode($records);
$conn->close();
?>
