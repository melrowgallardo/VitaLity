<?php
/**
 * Vitality API - Delete Vitamin Entry by ID
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

// Accept JSON payload or query / POST parameters
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
        'message' => 'A valid vitamin ID is required to delete.'
    ]);
    exit();
}

try {
    $stmt = $pdo->prepare("DELETE FROM vitamins WHERE id = :id");
    $stmt->execute([':id' => $id]);

    if ($stmt->rowCount() > 0) {
        http_response_code(200);
        echo json_encode([
            'success'    => true,
            'message'    => "Vitamin record with ID {$id} was deleted successfully.",
            'deleted_id' => $id
        ]);
    } else {
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'message' => "Vitamin record with ID {$id} was not found."
        ]);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error'   => 'Failed to delete vitamin record: ' . $e->getMessage()
    ]);
}
