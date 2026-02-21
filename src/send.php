<?php
ini_set('display_errors', 0);
error_reporting(0);
header('Content-Type: application/json');

$admin_email  = "plittex@bk.ru"; 
$sender_email = "send@plittex.ru"; 
$tg_bot_token = "8598547060:AAHYuEoPrhd3hfbcmHf-WglFFsiq3kJ4mT-g";
$tg_chat_id   = "7999311869";

if ($_SERVER["REQUEST_METHOD"] == "POST") {

    if (!empty($_POST['antispam'])) { echo json_encode(["status" => "success"]); exit; }

    $name    = isset($_POST['name']) ? strip_tags($_POST['name']) : 'Не указано';
    $phone   = isset($_POST['phone']) ? strip_tags($_POST['phone']) : 'Не указан';
    $subject = isset($_POST['form_subject']) ? strip_tags($_POST['form_subject']) : 'Заявка с сайта';
    $message = isset($_POST['message']) ? strip_tags($_POST['message']) : '';
    
    // Получаем готовый текст корзины
    $orderText = isset($_POST['orderDataText']) ? strip_tags($_POST['orderDataText']) : '';

    $txt = "🔔 <b>$subject</b>\n\n👤 Имя: $name\n📞 Тел: $phone\n";

    if (!empty($orderText)) {
        $txt .= "\n📦 ЗАКАЗ:\n$orderText\n";
    }
    if (!empty($message)) {
        $txt .= "\n💬 Сообщение:\n$message\n";
    }

    // Отправка EMAIL
    $headers = "MIME-Version: 1.0\r\nContent-type:text/html;charset=UTF-8\r\nFrom: Plittex <$sender_email>\r\n";
    mail($admin_email, $subject, nl2br($txt), $headers);

    // Отправка TELEGRAM
    if (!empty($tg_bot_token)) {
        $tg_url = "https://api.telegram.org/bot{$tg_bot_token}/sendMessage";
        $tg_data = http_build_query(['chat_id' => $tg_chat_id, 'text' => $txt, 'parse_mode' => 'HTML']);
        $tg_options = [
            'http' => ['header' => "Content-type: application/x-www-form-urlencoded\r\n", 'method' => 'POST', 'content' => $tg_data, 'timeout' => 5, 'ignore_errors' => true],
            'ssl' => ['verify_peer' => false, 'verify_peer_name' => false]
        ];
        @file_get_contents($tg_url, false, stream_context_create($tg_options));
    }

    echo json_encode(["status" => "success"]);
} else {
    http_response_code(403);
}