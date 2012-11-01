<?php

/**
 * Description of OutPutHelper
 *
 * @author yo
 */
define("RETURN_DATA_JSON", 0);
define("RETURN_DATA_JSONP", 1);
//Zend JSON Thats escape unicode
require_once 'BracketsServer/Json/Encoder.php';

class OutputHelper {

    static public $return_data = RETURN_DATA_JSON;
    static public $do_echo = TRUE;
    static public $do_die = TRUE;
    static public $RETURN_DATA_JSON = RETURN_DATA_JSON;
    static public $RETURN_DATA_JSONP = RETURN_DATA_JSONP;
    static public $json_callback = "callback";

    static function error($error=NO_ERROR) {
        return self::do_output($error);
    }
    static function _walkfn(&$item, $key) {
            if (is_string($item)) {
                $item = htmlentities($item);
            }
        }        
    
    static public function json_unicode_encode($data) {        
        return Zend_Json_Encoder::encode($data);        
    }

    static function do_output($error=NO_ERROR, $data=FALSE) {
        $out['error'] = $error;
        $out_str = "";
        if ($data !== FALSE) {
            $out['data'] = $data;
        }
        /**
         * @todo ADD no utf8 support
         */
        $json = self::json_unicode_encode($out);
        if (self::$return_data === RETURN_DATA_JSONP) {
            if (isset($_GET[self::json_callback])) {
                $out_str = "{$_GET[self::json_callback]}($json);";
            }
        } else {
            $out_str = $json;
        }
        if (self::$do_echo) {
            echo($out_str);
        }
        if (self::$do_die) {
            die();
        } else {
            return $out_str;
        }
    }

    static function data($data=FALSE) {
        return self::do_output(NO_ERROR, $data);
    }

}

?>
