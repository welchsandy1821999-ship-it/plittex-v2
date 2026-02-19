<?php
// send.php - Полная версия со всеми твоими полями и улучшенной безопасностью

$admin_email = "plittex@bk.ru";
$tg_bot_token = "8598547060:AAHYuEoPrhd3hfbcmHf-WglFFsiq3kJ4mT-g";
$tg_chat_id = "7999311869";

header('Content-Type: application/json');

if ($_SERVER["REQUEST_METHOD"] == "POST") {

    // 1. Защита от ботов
    if (!empty($_POST['antispam'])) {
        echo json_encode(["status" => "success", "message" => "Bot detected"]);
        exit;
    }

    // 2. Сбор всех твоих полей
    $name    = isset($_POST['name']) ? trim(htmlspecialchars($_POST['name'])) : 'Не указано';
    $phone   = isset($_POST['phone']) ? trim(htmlspecialchars($_POST['phone'])) : 'Не указан';
    $subject = isset($_POST['form_subject']) ? trim(htmlspecialchars($_POST['form_subject'])) : 'Новая заявка';
    $city    = isset($_POST['city']) ? trim(htmlspecialchars($_POST['city'])) : '';
    $message = isset($_POST['message']) ? trim(htmlspecialchars($_POST['message'])) : '';
    $rating  = isset($_POST['rating']) ? trim(htmlspecialchars($_POST['rating'])) : '';
    $orderData = isset($_POST['orderData']) ? $_POST['orderData'] : '';

    // 3. Формирование текста
    $txt = "<b>🔔 " . $subject . "</b>\n\n";
    $txt .= "👤 <b>Имя:</b> " . $name . "\n";
    $txt .= "📞 <b>Телефон:</b> " . $phone . "\n";

    if (!empty($city)) $txt .= "📍 <b>Город/Компания:</b> " . $city . "\n";

    // Обработка корзины как в оригинале
    if (!empty($orderData)) {
        $txt .= "\n📦 <b>ДАННЫЕ ЗАКАЗА:</b>\n";
        $cart = json_decode($orderData, true);
        if (is_array($cart)) {
            $totalSum = 0;
            foreach ($cart as $item) {
                $iSum = $item['sum'] ?? 0;
                $totalSum += $iSum;
                $txt .= "• " . ($item['name'] ?? 'Товар') . " (" . ($item['color'] ?? '-') . "): " . ($item['qty'] ?? 0) . " " . ($item['unit'] ?? 'шт') . " = " . number_format($iSum, 0, '.', ' ') . " руб.\n";
            }
            $txt .= "\n💰 <b>ИТОГО: " . number_format($totalSum, 0, '.', ' ') . " руб.</b>\n";
        }
    }

    if (!empty($rating)) $txt .= "⭐ <b>Оценка:</b> " . $rating . " из 5\n";
    if (!empty($message)) $txt .= "\n💬 <b>Сообщение:</b>\n" . $message . "\n";
    $txt .= "\n📅 " . date('d.m.Y H:i');

    // 4. Отправка в Telegram
    $tg_success = false;
    $ch = curl_init("https://api.telegram.org/bot{$tg_bot_token}/sendMessage");
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, ['chat_id' => $tg_chat_id, 'text' => $txt, 'parse_mode' => 'HTML']);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true); 
    $result = curl_exec($ch);
    if (curl_getinfo($ch, CURLINFO_HTTP_CODE) == 200) $tg_success = true;
    curl_close($ch);

    // 5. Отправка на Email
    $headers = "MIME-Version: 1.0\r\nContent-type:text/html;charset=UTF-8\r\n";
    $headers .= "From: Plittex Site <noreply@" . $_SERVER['HTTP_HOST'] . ">\r\n";
    $mail_success = mail($admin_email, $subject, str_replace("\n", "<br>", $txt), $headers);

    echo json_encode(["status" => ($tg_success || $mail_success) ? "success" : "error"]);

} else {
    http_response_code(403);
}