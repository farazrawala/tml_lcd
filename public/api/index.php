<?php
header("Content-Type: application/json");

$root = dirname(__DIR__);
$slidesFile = $root . "/slides/slides.json";
$imageDir = $root . "/slides/images";
$allowed = ["jpg", "jpeg", "png", "webp", "gif", "svg", "mp4", "webm"];
$types = ["welcome", "featured", "latest", "offers", "why", "brands", "contact", "gallery", "fullscreen", "employees", "employees-v1", "employees-v2", "employees-v3", "employees-v4", "employees-v5", "employees-v6", "employees-v7", "employees-v8", "employees-v9", "employees-v11", "employees-v12", "video"];

function fail($status, $message) {
  http_response_code($status);
  echo json_encode(["ok" => false, "error" => $message]);
  exit;
}

function safeName($raw) {
  global $allowed;
  $base = basename(str_replace("\\", "/", (string) $raw));
  $base = preg_replace("/[^a-zA-Z0-9._-]+/", "-", $base);
  $base = ltrim($base, "-");
  $ext = strtolower(pathinfo($base, PATHINFO_EXTENSION));
  $stem = substr(pathinfo($base, PATHINFO_FILENAME), 0, 80);
  if ($stem === "") $stem = "image-" . time();
  if (!in_array($ext, $GLOBALS["allowed"], true)) return "";
  return $stem . "." . $ext;
}

function sheetCsvUrl($value) {
  $text = trim((string) $value);
  if (preg_match("#/spreadsheets/d/([a-zA-Z0-9-_]+)#", $text, $match)) {
    $gid = "";
    if (preg_match("/[?#&]gid=(\\d+)/", $text, $gidMatch)) $gid = "&gid=" . $gidMatch[1];
    return "https://docs.google.com/spreadsheets/d/" . $match[1] . "/export?format=csv" . $gid;
  }
  if (preg_match("#^https://docs\\.google\\.com/spreadsheets/d/.+/export#i", $text)) return $text;
  return "";
}

function splitCsv($line) {
  $cells = [];
  $current = "";
  $quoted = false;
  $length = strlen($line);
  for ($i = 0; $i < $length; $i++) {
    $char = $line[$i];
    if ($char === '"') {
      if ($quoted && isset($line[$i + 1]) && $line[$i + 1] === '"') {
        $current .= '"';
        $i++;
      } else $quoted = !$quoted;
    } elseif ($char === "," && !$quoted) {
      $cells[] = $current;
      $current = "";
    } else $current .= $char;
  }
  $cells[] = $current;
  return $cells;
}

function columnIndex($headers, $names) {
  foreach ($headers as $index => $header) {
    if (in_array($header, $names, true)) return $index;
  }
  return -1;
}

function cellValue($cells, $index) {
  return $index >= 0 && isset($cells[$index]) ? trim($cells[$index]) : "";
}

function parseSheet($csv) {
  $csv = preg_replace("/^\\xEF\\xBB\\xBF/", "", (string) $csv);
  $lines = preg_split("/\\r\\n|\\n|\\r/", trim($csv));
  $lines = array_values(array_filter($lines, function ($line) { return trim($line) !== ""; }));
  if (count($lines) < 2) return [];
  $headers = array_map(function ($cell) {
    return preg_replace("/\\s+/", " ", strtolower(trim($cell)));
  }, splitCsv($lines[0]));
  $nameIndex = columnIndex($headers, ["names", "name", "employee"]);
  $monthlyTarget = columnIndex($headers, ["monthly target", "target"]);
  $monthlyAchieved = columnIndex($headers, ["achieved monthly", "acheived monthly"]);
  $quarterlyTarget = columnIndex($headers, ["quarterly target", "quaterly target", "quarterly", "quaterly"]);
  $quarterlyAchieved = columnIndex($headers, ["achieved quarterly", "acheived quarterly", "achieved", "acheived"]);
  $yearlyTarget = columnIndex($headers, ["yearly target"]);
  $yearlyAchieved = columnIndex($headers, ["achieved yearly", "acheived yearly"]);
  $imageIndex = columnIndex($headers, ["image path", "image", "photo", "picture"]);
  $percentIndex = columnIndex($headers, ["achieve percent", "achieved percent", "achievement percent", "percent"]);
  $statusIndex = columnIndex($headers, ["status"]);
  $rows = [];
  for ($i = 1; $i < count($lines); $i++) {
    $cells = splitCsv($lines[$i]);
    $name = cellValue($cells, $nameIndex);
    $status = cellValue($cells, $statusIndex);
    if ($name === "") continue;
    if ($statusIndex >= 0 && strcasecmp($status, "Active") !== 0) continue;
    $monthlyTargetValue = cellValue($cells, $monthlyTarget);
    $quarterlyTargetValue = cellValue($cells, $quarterlyTarget);
    $quarterlyAchievedValue = cellValue($cells, $quarterlyAchieved);
    $rows[] = [
      "name" => $name,
      "monthlyTarget" => $monthlyTargetValue,
      "monthlyAchieved" => cellValue($cells, $monthlyAchieved),
      "quarterlyTarget" => $quarterlyTargetValue,
      "quarterlyAchieved" => $quarterlyAchievedValue,
      "yearlyTarget" => cellValue($cells, $yearlyTarget),
      "yearlyAchieved" => cellValue($cells, $yearlyAchieved),
      "target" => $monthlyTargetValue,
      "quarterly" => $quarterlyTargetValue,
      "achieved" => $quarterlyAchievedValue,
      "image" => cellValue($cells, $imageIndex),
      "achievePercent" => cellValue($cells, $percentIndex),
    ];
  }
  return $rows;
}

$path = parse_url($_SERVER["REQUEST_URI"] ?? "/", PHP_URL_PATH);
$method = $_SERVER["REQUEST_METHOD"] ?? "GET";
$screensFile = $root . "/data/screens.json";

function screenStore() {
  global $screensFile;
  if (!is_file($screensFile)) return [];
  $data = json_decode(file_get_contents($screensFile), true);
  return is_array($data) ? $data : [];
}

function saveScreens($data) {
  global $screensFile;
  if (!is_dir(dirname($screensFile))) mkdir(dirname($screensFile), 0775, true);
  file_put_contents($screensFile, json_encode($data));
}

function liveScreens($data) {
  $now = (int) (microtime(true) * 1000);
  $list = [];
  foreach ($data as $screen) {
    if (is_array($screen) && $now - (int) ($screen["seen"] ?? 0) < 12000) $list[] = $screen;
  }
  return $list;
}

if ($path === "/api/screens" && $method === "GET") {
  echo json_encode(["ok" => true, "screens" => liveScreens(screenStore())]);
  exit;
}

if ($path === "/api/screens" && $method === "POST") {
  $body = json_decode(file_get_contents("php://input"), true);
  $id = substr(preg_replace("/[^a-zA-Z0-9-]/", "", (string) ($body["id"] ?? "")), 0, 40);
  if ($id === "") fail(400, "Missing screen.");
  $data = screenStore();
  $reload = !empty($data[$id]["reload"]);
  $started = (int) ($body["started"] ?? ($data[$id]["started"] ?? (microtime(true) * 1000)));
  $data[$id] = [
    "id" => $id,
    "path" => substr((string) ($body["path"] ?? "/"), 0, 80),
    "url" => substr((string) ($body["url"] ?? ""), 0, 200),
    "browser" => substr((string) ($body["browser"] ?? ""), 0, 80),
    "screen" => substr((string) ($body["screen"] ?? ""), 0, 20),
    "viewport" => substr((string) ($body["viewport"] ?? ""), 0, 20),
    "started" => $started,
    "seen" => (int) (microtime(true) * 1000),
    "reload" => false,
  ];
  saveScreens($data);
  echo json_encode(["ok" => true, "reload" => $reload]);
  exit;
}

if ($path === "/api/screens/reload" && $method === "POST") {
  $body = json_decode(file_get_contents("php://input"), true);
  $data = screenStore();
  if (!empty($body["all"])) {
    foreach ($data as $key => $screen) $data[$key]["reload"] = true;
  } elseif (!empty($body["id"]) && isset($data[$body["id"]])) {
    $data[$body["id"]]["reload"] = true;
  }
  saveScreens($data);
  echo json_encode(["ok" => true]);
  exit;
}

if ($path === "/api/sheet" && $method === "GET") {
  $csvUrl = sheetCsvUrl($_GET["url"] ?? "");
  if ($csvUrl === "") {
    echo json_encode(["ok" => true, "employees" => []]);
    exit;
  }
  $csv = @file_get_contents($csvUrl);
  if ($csv === false) fail(502, "Google Sheet could not be read.");
  echo json_encode(["ok" => true, "employees" => parseSheet($csv)]);
  exit;
}

if ($path === "/api/slides" && $method === "GET") {
  if (!is_file($slidesFile)) {
    echo json_encode(["slides" => []]);
    exit;
  }
  readfile($slidesFile);
  exit;
}

if ($path === "/api/slides" && $method === "PUT") {
  $body = json_decode(file_get_contents("php://input"), true);
  if (!is_array($body) || !isset($body["slides"]) || !is_array($body["slides"])) fail(400, "Slides must be a list.");
  $slides = [];
  foreach ($body["slides"] as $index => $slide) {
    if (!is_array($slide) || !in_array($slide["type"] ?? "", $types, true)) fail(400, "Unknown slide type.");
    $images = [];
    foreach ($slide["images"] ?? [] as $name) {
      $safe = safeName($name);
      if ($safe !== "") $images[] = $safe;
    }
    $employees = [];
    foreach ($slide["employees"] ?? [] as $person) {
      if (!is_array($person)) continue;
      $row = [
        "name" => substr((string) ($person["name"] ?? ""), 0, 80),
        "image" => safeName($person["image"] ?? ""),
        "target" => substr((string) ($person["target"] ?? ""), 0, 40),
        "quarterly" => substr((string) ($person["quarterly"] ?? ""), 0, 40),
        "achieved" => substr((string) ($person["achieved"] ?? ""), 0, 40),
      ];
      if ($row["name"] || $row["image"] || $row["target"] || $row["quarterly"] || $row["achieved"]) $employees[] = $row;
    }
    $id = preg_replace("/[^a-zA-Z0-9_-]+/", "-", (string) ($slide["id"] ?? ($slide["type"] . "-" . ($index + 1))));
    $slides[] = [
      "id" => substr($id, 0, 40),
      "type" => $slide["type"],
      "images" => $images,
      "employees" => $employees,
      "kicker" => (string) ($slide["kicker"] ?? ""),
      "title" => (string) ($slide["title"] ?? ""),
      "subtitle" => (string) ($slide["subtitle"] ?? ""),
      "supporting" => (string) ($slide["supporting"] ?? ""),
      "cta" => (string) ($slide["cta"] ?? ""),
      "footer" => (string) ($slide["footer"] ?? ""),
      "sheetUrl" => substr(trim((string) ($slide["sheetUrl"] ?? "")), 0, 500),
    ];
  }
  $saved = [
    "intervalMs" => min(120000, max(3000, (int) ($body["intervalMs"] ?? 12000))),
    "imageMs" => min(60000, max(1000, (int) ($body["imageMs"] ?? 4000))),
    "slides" => $slides,
  ];
  if (!is_dir(dirname($slidesFile))) mkdir(dirname($slidesFile), 0775, true);
  if (file_put_contents($slidesFile, json_encode($saved, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES) . "\n") === false) {
    fail(500, "Could not save slides.");
  }
  echo json_encode(["ok" => true]);
  exit;
}

if ($path === "/api/images" && $method === "GET") {
  if (!is_dir($imageDir)) mkdir($imageDir, 0775, true);
  $files = [];
  foreach (scandir($imageDir) as $name) {
    $ext = strtolower(pathinfo($name, PATHINFO_EXTENSION));
    if (in_array($ext, $allowed, true)) $files[] = $name;
  }
  sort($files);
  echo json_encode(["ok" => true, "files" => $files]);
  exit;
}

if ($path === "/api/images" && $method === "DELETE") {
  $name = safeName($_GET["name"] ?? "");
  $target = $name ? $imageDir . "/" . $name : "";
  if ($name === "" || !is_file($target)) fail(404, "Image not found.");
  unlink($target);
  echo json_encode(["ok" => true]);
  exit;
}

if ($path === "/api/upload" && $method === "POST") {
  $name = safeName($_GET["name"] ?? "");
  if ($name === "") fail(400, "Use a jpg, png, webp, gif, or svg file.");
  $ext = strtolower(pathinfo($name, PATHINFO_EXTENSION));
  $folder = in_array($ext, ["mp4", "webm"], true) ? $root . "/videos" : $imageDir;
  if (!is_dir($folder)) mkdir($folder, 0775, true);
  $file = pathinfo($name, PATHINFO_FILENAME) . "-" . time() . "." . $ext;
  $body = file_get_contents("php://input");
  if ($body === false || strlen($body) > 80 * 1024 * 1024) fail(413, "File must be 80 MB or smaller.");
  if (file_put_contents($folder . "/" . $file, $body) === false) fail(500, "Upload failed.");
  echo json_encode(["ok" => true, "file" => $file, "folder" => "public/slides/images"]);
  exit;
}

fail(404, "Not found.");
