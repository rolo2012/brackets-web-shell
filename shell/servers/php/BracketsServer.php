<?php

require_once 'BracketsServer/file_wrapper.php';
require_once 'BracketsServer/output_helper.php';
require_once 'BracketsServer/path_utils.php';

/**
 * @property OutputHelper $output
 * @property FileWrapperOpenDlg $filesystem
 */
class BracketsServer {

    protected $current_path = "";
    protected $codeigniter = "";
    protected $http_method = 0; //"POST";
    protected $func_key = "func_name"; //"POST";
    protected $output = NULL;
    protected $filesystem = NULL;

    public function __construct() {
        if (defined('FCPATH')) {
            $this->current_path = FCPATH;
        } else {
            $this->current_path = dirname(__FILE__);
            chdir($this->current_path);
        }
        $this->codeigniter = defined('CI_VERSION');
        $this->http_method = config_item("http_method");
        $this->output = new OutputHelper();
        $this->filesystem = new FileWrapperOpenDlg();
    }
    
    protected function get_post($param) {
        $GETPOST = NULL;
        if ($this->http_method === "GET") {
            $GETPOST = $_GET;
        } elseif ($this->http_method === "POST") {
            $GETPOST = $_POST;
        } else {
            $GETPOST = $_REQUEST;
        }
        if (!isset($GETPOST[$param])) {
            return FALSE;
        }
        return $GETPOST[$param];
    }

    protected function get_params($nums_params=1) {
        $params = $this->get_post('params');
        if (!$params) {
            $this->output->error(ERR_INVALID_PARAMS);
        }
        if ($nums_params === 1) {
            if (is_array($params) && isset($params[0])) {
                return $params[0];
            } else {
                return $params;
            }
        }
        if (!is_array($params)) {
            $this->output->error(ERR_INVALID_PARAMS);
        } elseif (count($params) < $nums_params) {
            $this->output->error(ERR_INVALID_PARAMS);
        }
        
        return $params;
    }

    function read_dir_call() {
        try {
            $path = $this->get_params();
            $data = $this->filesystem->file($path)->directory_map();
            $this->output->data($data);
        } catch (Exception $e) {
            $this->output->error($e->getCode());
        }
    }

    function make_dir_call() {
        try {
            $params = $this->get_params(2);
            $path = $params[0];
            $mode = $params[1];
            $data = $this->filesystem->file($path)->mkdir($mode);
            $this->output->data($data);
        } catch (Exception $e) {
            $this->output->error($e->getCode());
        }
    }

    function rename_call() {
        try {
            $params = $this->get_params(2);
            $file = $params[0];
            $newname = $params[1];
            $data = $this->filesystem->file($file)->rename($newname);
            $this->output->data($data);
        } catch (Exception $e) {
            $this->output->error($e->getCode());
        }
    }

    function get_file_modification_time_call() {
        try {
            $file = $this->get_params();
            $data = $this->filesystem->file($file)->stat();
            $this->output->data($data);
        } catch (Exception $e) {            
            $this->output->error($e->getCode());
        }
    }

    function read_file_call() {
        try {
            $params = $this->get_params(2);
            $file = $params[0];
            $encoding = $params[1];
            $data = $this->filesystem->file($file)->read_file($encoding);
            $this->output->data($data);
        } catch (Exception $e) {
            $this->output->error($e->getCode());
        }
    }

    function write_file_call() {
        try {
            $params = $this->get_params(3);
            $file = $params[0];
            $data = $params[1];
            $encoding = $params[2];            
            
            $data = $this->filesystem->file($file)->write_file($data,$encoding);
            $this->output->data($data);
        } catch (Exception $e) {
            $this->output->error($e->getCode());
        }
    }

    function delete_file_or_dir_call() {
        try {
            $file = $this->get_params();
            $data = $this->filesystem->file($file)->delete();
            $this->output->data($data);
        } catch (Exception $e) {
            $this->output->error($e->getCode());
        }
    }

    function set_posix_permissions_call() {
        try {
            $file = $this->get_params();
            $data = $this->filesystem->file($file)->chmod();
            $this->output->data($data);
        } catch (Exception $e) {
            $this->output->error($e->getCode());
        }
    }

    /**
     * GET THE TOP DIR OR UNITS OF THE OS
     */
    function get_top_dirs_call() {
        try {
            $data = $this->filesystem->get_top_dirs();
            $this->output->data($data);
        } catch (Exception $e) {
            $this->output->error($e->getCode());
        }
    }

    /**
     * FOR Opendialog
     */
    function read_dir_dirs_call() {
        try {
            $path = $this->get_params();
            //$path = str_replace("\\", "/", $path);
            //$path = rtrim($path, "/");
            $data = $this->filesystem->file($path)->read_dir_dirs();
            $this->output->data($data);
        } catch (Exception $e) {
            $this->output->error($e->getCode());
        }
    }

    function read_dir_files_call() {
        try {
            $path = $this->get_params();
            //$path = str_replace("\\", "/", $path);
            //$path = rtrim($path, "/");
            $data = $this->filesystem->file($path)->read_dir_files();
            $this->output->data($data);
        } catch (Exception $e) {
            $this->output->error($e->getCode());
        }
    }
    function read_dir_and_info_call() {
        try {
            $path = $this->get_params();
            //$path = str_replace("\\", "/", $path);
            //$path = rtrim($path, "/");
            $data = $this->filesystem->file($path)->read_dir_and_info();
            $this->output->data($data);
        } catch (Exception $e) {
            $this->output->error($e->getCode());
        }
    }
    function config_module_call(){
        $js=
        array(
            "RETURN_DATA_JSON"=>0,
            "RETURN_DATA_JSONP"=>1,
            "DATA_FORMAT" => OutputHelper::$return_data,
            "CALL_URL" => PathUtils::siteurl(),
            "SERVER_TYPE"=>'php_ajax',
            "CONEXION_HTTP"=>0,
            "CONEXION_WS"=>1,
            "CONEXION_TYPE"=>0,
            "BRACKS_DIR"=>  realpath(CURRENT_PAT."/../../../adobe-brackets/src")
        );
        header("Content-Type: application/javascript");
        die("define(".$this->output->json_unicode_encode($js).")");
    }    
    function apiCall($method_name=FALSE){
        if($method_name===FALSE){
           $method_name=$this->get_post($this->func_key);            
        }
        if($method_name && method_exists ($this,$method_name . "_call")){
            return call_user_func(array($this,$method_name . "_call"));
        }        
        $this->output->error(ERR_NOT_FOUND);
    }
    //function path_config_js() {
}