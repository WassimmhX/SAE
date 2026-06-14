<?php
require_once __DIR__ . '/../config/database.php';

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

function json_response($payload, int $status = 200): void
{
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function read_json_body(): array
{
    $raw = file_get_contents('php://input');
    if ($raw === false || trim($raw) === '') {
        return [];
    }

    $data = json_decode($raw, true);
    if (!is_array($data)) {
        json_response(['success' => false, 'message' => 'JSON invalide.'], 400);
    }
    return $data;
}

function is_column_name(string $name): bool
{
    return (bool) preg_match('/^[a-zA-Z_][a-zA-Z0-9_]*$/', $name);
}

function ensure_safe_config(array $config): void
{
    $names = array_merge([$config['table']], $config['columns'], $config['primaryKey']);
    foreach ($names as $name) {
        if (!is_column_name($name)) {
            json_response(['success' => false, 'message' => 'Configuration API invalide.'], 500);
        }
    }
}

function normalize_value($value, string $column, array $nullable)
{
    if ($value === '') {
        return in_array($column, $nullable, true) ? null : $value;
    }
    return $value;
}

function payload_for_columns(array $input, array $columns, array $nullable, array $autoIncrement = []): array
{
    $payload = [];
    foreach ($columns as $column) {
        if (array_key_exists($column, $input)) {
            $value = normalize_value($input[$column], $column, $nullable);
            if (in_array($column, $autoIncrement, true) && ($value === null || $value === '')) {
                continue;
            }
            $payload[$column] = $value;
        }
    }
    return $payload;
}

function require_primary_key(array $input, array $primaryKey): array
{
    $where = [];
    foreach ($primaryKey as $key) {
        if (!array_key_exists($key, $input) || $input[$key] === '') {
            json_response(['success' => false, 'message' => "Clé primaire manquante : $key."], 400);
        }
        $where[$key] = $input[$key];
    }
    return $where;
}

function fetch_row(PDO $pdo, string $table, array $primaryKey, array $where): ?array
{
    $conditions = array_map(fn($key) => "$key = :pk_$key", $primaryKey);
    $sql = "SELECT * FROM $table WHERE " . implode(' AND ', $conditions) . ' LIMIT 1';
    $stmt = $pdo->prepare($sql);
    foreach ($primaryKey as $key) {
        $stmt->bindValue(":pk_$key", $where[$key]);
    }
    $stmt->execute();
    $row = $stmt->fetch();
    return $row ?: null;
}

function handle_crud(PDO $pdo, array $config): void
{
    ensure_safe_config($config);

    $table = $config['table'];
    $columns = $config['columns'];
    $primaryKey = $config['primaryKey'];
    $nullable = $config['nullable'] ?? [];
    $autoIncrement = $config['autoIncrement'] ?? [];
    $orderBy = $config['orderBy'] ?? implode(', ', $primaryKey);
    $method = $_SERVER['REQUEST_METHOD'];

    try {
        if ($method === 'GET') {
            $filters = [];
            $params = [];
            foreach ($primaryKey as $key) {
                if (isset($_GET[$key]) && $_GET[$key] !== '') {
                    $filters[] = "$key = :$key";
                    $params[":$key"] = $_GET[$key];
                }
            }
            $sql = "SELECT * FROM $table" . ($filters ? ' WHERE ' . implode(' AND ', $filters) : '') . " ORDER BY $orderBy";
            $stmt = $pdo->prepare($sql);
            $stmt->execute($params);
            json_response($stmt->fetchAll());
        }

        if ($method === 'POST') {
            $input = read_json_body();
            $payload = payload_for_columns($input, $columns, $nullable, $autoIncrement);
            foreach ($columns as $column) {
                if (in_array($column, $nullable, true) || in_array($column, $autoIncrement, true)) {
                    continue;
                }
                if (!array_key_exists($column, $payload) || $payload[$column] === '') {
                    json_response(['success' => false, 'message' => "Champ obligatoire manquant : $column."], 400);
                }
            }

            $cols = array_keys($payload);
            $placeholders = array_map(fn($c) => ":$c", $cols);
            $sql = "INSERT INTO $table (" . implode(', ', $cols) . ") VALUES (" . implode(', ', $placeholders) . ")";
            $stmt = $pdo->prepare($sql);
            $stmt->execute($payload);

            if ($autoIncrement) {
                $payload[$autoIncrement[0]] = $pdo->lastInsertId();
            }
            json_response(['success' => true, 'message' => 'Création effectuée.', 'data' => $payload], 201);
        }

        if ($method === 'PUT') {
            $input = read_json_body();
            $where = require_primary_key($input, $primaryKey);
            $payload = payload_for_columns($input, $columns, $nullable, $autoIncrement);
            $updateColumns = array_values(array_filter(array_keys($payload), fn($c) => !in_array($c, $primaryKey, true)));

            if (!$updateColumns) {
                json_response(['success' => false, 'message' => 'Aucun champ modifiable fourni.'], 400);
            }

            $setSql = implode(', ', array_map(fn($c) => "$c = :$c", $updateColumns));
            $whereSql = implode(' AND ', array_map(fn($c) => "$c = :pk_$c", $primaryKey));
            $sql = "UPDATE $table SET $setSql WHERE $whereSql";
            $stmt = $pdo->prepare($sql);
            foreach ($updateColumns as $column) {
                $stmt->bindValue(":$column", $payload[$column]);
            }
            foreach ($primaryKey as $key) {
                $stmt->bindValue(":pk_$key", $where[$key]);
            }
            $stmt->execute();

            json_response(['success' => true, 'message' => 'Mise à jour effectuée.', 'data' => fetch_row($pdo, $table, $primaryKey, $where)]);
        }

        if ($method === 'DELETE') {
            $input = read_json_body();
            $where = require_primary_key($input, $primaryKey);
            $whereSql = implode(' AND ', array_map(fn($c) => "$c = :pk_$c", $primaryKey));
            $sql = "DELETE FROM $table WHERE $whereSql";
            $stmt = $pdo->prepare($sql);
            foreach ($primaryKey as $key) {
                $stmt->bindValue(":pk_$key", $where[$key]);
            }
            $stmt->execute();
            json_response(['success' => true, 'message' => 'Suppression effectuée.']);
        }

        json_response(['success' => false, 'message' => 'Méthode non autorisée.'], 405);
    } catch (PDOException $e) {
        $code = $e->getCode();
        $status = strpos((string) $code, '23') === 0 ? 409 : 500;
        json_response([
            'success' => false,
            'message' => $status === 409
                ? 'Opération impossible : contrainte de base de données non respectée.'
                : 'Erreur serveur pendant l’opération.',
            'detail' => $e->getMessage(),
        ], $status);
    }
}
