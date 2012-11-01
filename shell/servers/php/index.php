<?php

$config['bracks_folder'] = "../../../adobe-brackets";
$config['index_page'] = "index.php";

define('CURRENT_PAT', dirname(__FILE__));
chdir(CURRENT_PAT);

$config['bracks_folder'] = realpath($config['bracks_folder']);
if (!function_exists('config_item')) {

    function config_item($item) {
        global $config;
        if (!isset($config[$item])) {
            return FALSE;
        }
        return $config[$item];
    }

}
require_once 'BracketsServer.php';
$server = new BracketsServer();
$server->apiCall();


