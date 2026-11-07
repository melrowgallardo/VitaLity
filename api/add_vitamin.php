<?php
/**
 * Vitality API - Insert New Vitamin Entry
 */

// Full CORS and JSON Response Headers
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Gracefully handle preflight OPTIONS requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/../config/db.php';

// Accept JSON payload or standard POST
$rawInput = file_get_contents('php://input');
$data = json_decode($rawInput, true);

if (!is_array($data)) {
    $data = $_POST;
}

$name = isset($data['name']) ? trim($data['name']) : '';
$date = isset($data['date']) ? trim($data['date']) : '';
$time = isset($data['time']) ? trim($data['time']) : '';
$isCompleted = isset($data['is_completed']) 
    ? filter_var($data['is_completed'], FILTER_VALIDATE_BOOLEAN) 
    : false;

// Basic validation
$errors = [];
if (empty($name)) {
    $errors[] = 'Vitamin name is required.';
}
if (empty($date)) {
    $errors[] = 'Date is required.';
} elseif (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $date)) {
    $errors[] = 'Date must be in YYYY-MM-DD format.';
}
if (empty($time)) {
    $errors[] = 'Time is required.';
} elseif (!preg_match('/^\d{2}:\d{2}(:\d{2})?$/', $time)) {
    $errors[] = 'Time must be in HH:MM or HH:MM:SS format.';
}

if (!empty($errors)) {
    http_response_code(422);
    echo json_encode([
        'success' => false,
        'errors'  => $errors,
        'message' => implode(' ', $errors)
    ]);
    exit();
}

// Normalize time to HH:MM:SS
$formattedTime = strlen($time) === 5 ? $time . ':00' : $time;

try {
    $stmt = $pdo->prepare("INSERT INTO vitamins (name, date, time, is_completed) 
                           VALUES (:name, :date, :time, :is_completed)");
    $stmt->execute([
        ':name'         => $name,
        ':date'         => $date,
        ':time'         => $formattedTime,
        ':is_completed' => $isCompleted ? 1 : 0
    ]);

    $newId = (int)$pdo->lastInsertId();

    http_response_code(201);
    echo json_encode([
        'success' => true,
        'message' => 'Vitamin record added successfully.',
        'data'    => [
            'id'           => $newId,
            'name'         => $name,
            'date'         => $date,
            'time'         => substr($formattedTime, 0, 5),
            'full_time'    => $formattedTime,
            'is_completed' => $isCompleted,
            'created_at'   => date('Y-m-d H:i:s')
        ]
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error'   => 'Failed to insert vitamin: ' . $e->getMessage()
    ]);
}
