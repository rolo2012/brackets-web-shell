<?php

/**
 * Description of Utils
 *
 * @author yo
 */
class PathUtils {

    static function add_slash($str) {
        return rtrim($str, "/") . "/";
    }
    
    static function siteurl() {
        return self::baseurl().config_item('index_page');
    }
    /**
     * CODE TAKEN FROM CODEIGNITER
     */
    static function baseurl() {
        if (isset($_SERVER['HTTP_HOST'])) {
            $base_url = isset($_SERVER['HTTPS']) && strtolower($_SERVER['HTTPS']) !== 'off' ? 'https' : 'http';
            $base_url .= '://' . $_SERVER['HTTP_HOST'];
            $base_url .= str_replace(basename($_SERVER['SCRIPT_NAME']), '', $_SERVER['SCRIPT_NAME']);
        } else {
            $base_url = 'http://localhost/';
        }
        return self::add_slash($base_url);
    }

}

?>
