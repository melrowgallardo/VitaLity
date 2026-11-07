<?php
/**
 * Vitality API - Fetch All Vitamins Ordered by Date and Time
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

try {
    // Optional date filter (e.g. ?date=2026-11-07)
    $dateFilter = isset($_GET['date']) && !empty($_GET['date']) ? trim($_GET['date']) : null;

    if ($dateFilter) {
        $stmt = $pdo->prepare("SELECT id, name, date, time, is_completed, created_at 
                               FROM vitamins 
                               WHERE date = :filter_date 
                               ORDER BY date ASC, time ASC");
        $stmt->execute([':filter_date' => $dateFilter]);
    } else {
        $stmt = $pdo->query("SELECT id, name, date, time, is_completed, created_at 
                             FROM vitamins 
                             ORDER BY date ASC, time ASC");
    }

    $rawVitamins = $stmt->fetchAll();

    $vitamins = array_map(function ($item) {
        return [
            'id'           => (int)$item['id'],
            'name'         => $item['name'],
            'date'         => $item['date'],
            'time'         => substr($item['time'], 0, 5),
            'full_time'    => $item['time'],
            'is_completed' => (bool)$item['is_completed'],
            'created_at'   => $item['created_at'],
        ];
    }, $rawVitamins);

    http_response_code(200);
    echo json_encode([
        'success' => true,
        'data'    => $vitamins,
        'count'   => count($vitamins)
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error'   => 'Failed to fetch vitamins: ' . $e->getMessage()
    ]);
}

