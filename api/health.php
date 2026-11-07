<?php
/**
 * Vitality API - Health Check & Diagnostics
 * Used to verify PHP runtime and MySQL database connectivity
 */

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$diagnostic = [
    'api_status'   => 'online',
    'php_version'  => phpversion(),
    'timestamp'    => date('Y-m-d H:i:s'),
    'database'     => 'disconnected',
    'table_exists' => false,
    'row_count'    => 0,
    'message'      => ''
];

try {
    require_once __DIR__ . '/../config/db.php';
    $diagnostic['database'] = 'connected';

    // Verify vitamins table exists
    $tableCheck = $pdo->query("SHOW TABLES LIKE 'vitamins'");
    if ($tableCheck->rowCount() > 0) {
        $diagnostic['table_exists'] = true;
        $countQuery = $pdo->query("SELECT COUNT(*) as total FROM vitamins");
        $count = $countQuery->fetch();
        $diagnostic['row_count'] = (int)$count['total'];
        $diagnostic['message'] = "System healthy. 'vitamins' table found with {$diagnostic['row_count']} records.";
    } else {
        $diagnostic['table_exists'] = false;
        $diagnostic['message'] = "Connected to MySQL, but 'vitamins' table is missing. Please import schema.sql into 'vitality_db'.";
    }

    http_response_code(200);
    echo json_encode($diagnostic);
} catch (Exception $e) {
    $diagnostic['database'] = 'error';
    $diagnostic['message'] = 'Database error: ' . $e->getMessage();
    http_response_code(500);
    echo json_encode($diagnostic);
}

