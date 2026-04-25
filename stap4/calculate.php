<?php
header('Content-Type: application/json');

$host = 'localhost';
$db   = 'gpa_db';
$user = 'root';
$pass = '';

$conn = new mysqli($host, $user, $pass, $db);
if ($conn->connect_error) {
    echo json_encode(['success' => false, 'message' => 'Database connection failed.']);
    exit;
}

if (isset($_POST['course'], $_POST['credits'], $_POST['grade'])) {
    $courses     = $_POST['course'];
    $credits     = $_POST['credits'];
    $grades      = $_POST['grade'];
    $studentName = $_POST['studentName'] ?? '';
    $semester    = $_POST['semester'] ?? '';
    $totalPoints  = 0;
    $totalCredits = 0;

    $tableHtml  = '<table class="table table-bordered mt-3">';
    $tableHtml .= '<thead class="thead-dark"><tr>
                    <th>Course</th><th>Credits</th>
                    <th>Grade</th><th>Grade Points</th>
                   </tr></thead><tbody>';

    for ($i = 0; $i < count($courses); $i++) {
        $course = htmlspecialchars($courses[$i]);
        $cr = floatval($credits[$i]);
        $g  = floatval($grades[$i]);
        if ($cr <= 0) continue;
        $pts = $cr * $g;
        $totalPoints  += $pts;
        $totalCredits += $cr;
        $tableHtml .= "<tr>
                         <td>$course</td><td>$cr</td>
                         <td>$g</td><td>$pts</td>
                       </tr>";
    }
    $tableHtml .= '</tbody></table>';

    if ($totalCredits > 0) {
        $gpa = $totalPoints / $totalCredits;
        if      ($gpa >= 3.7) $interpretation = "Distinction";
        elseif  ($gpa >= 3.0) $interpretation = "Merit";
        elseif  ($gpa >= 2.0) $interpretation = "Pass";
        else                  $interpretation = "Fail";

        // Save to database
        if ($studentName !== '' && $semester !== '') {
            $stmt = $conn->prepare("INSERT INTO records (student_name, semester, gpa) VALUES (?, ?, ?)");
            $stmt->bind_param("ssd", $studentName, $semester, $gpa);
            $stmt->execute();
            $stmt->close();
        }

        $message = "Your GPA is " . number_format($gpa, 2) . " ($interpretation).";
        echo json_encode([
            'success'   => true,
            'gpa'       => $gpa,
            'message'   => $message,
            'tableHtml' => $tableHtml,
        ]);
    } else {
        echo json_encode(['success' => false, 'message' => 'No valid courses entered.']);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Data not received.']);
}
$conn->close();
exit;
?>
