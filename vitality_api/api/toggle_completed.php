<?php
/**
 * Vitality API - Update is_completed Status by ID
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

// Accept JSON payload or standard parameters
$rawInput = file_get_contents('php://input');
$data = json_decode($rawInput, true);

if (!is_array($data)) {
    $data = !empty($_POST) ? $_POST : $_GET;
}

$id = isset($data['id']) ? (int)$data['id'] : 0;

if ($id <= 0) {
    http_response_code(422);
    echo json_encode([
        'success' => false,
        'message' => 'A valid vitamin ID is required.'
    ]);
    exit();
}

try {
    // Verify record exists
    $checkStmt = $pdo->prepare("SELECT id, name, date, time, is_completed FROM vitamins WHERE id = :id");
    $checkStmt->execute([':id' => $id]);
    $existing = $checkStmt->fetch();

    if (!$existing) {
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'message' => "Vitamin record with ID {$id} was not found."
        ]);
        exit();
    }

    // Determine target completion status
    if (isset($data['is_completed'])) {
        $newStatus = filter_var($data['is_completed'], FILTER_VALIDATE_BOOLEAN) ? 1 : 0;
    } else {
        $newStatus = $existing['is_completed'] ? 0 : 1;
    }

    $updateStmt = $pdo->prepare("UPDATE vitamins SET is_completed = :status WHERE id = :id");
    $updateStmt->execute([
        ':status' => $newStatus,
        ':id'     => $id
    ]);

    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => 'Vitamin completion status updated successfully.',
        'data'    => [
            'id'           => $id,
            'name'         => $existing['name'],
            'date'         => $existing['date'],
            'time'         => substr($existing['time'], 0, 5),
            'is_completed' => (bool)$newStatus
        ]
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error'   => 'Failed to update vitamin status: ' . $e->getMessage()
    ]);
}

