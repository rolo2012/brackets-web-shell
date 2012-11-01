<?php

define("NO_ERROR", 0);
define("ERR_UNKNOWN", 1);
define("ERR_INVALID_PARAMS", 2);
define("ERR_NOT_FOUND", 3);
define("ERR_CANT_READ", 4);
define("ERR_UNSUPPORTED_ENCODING", 5);
define("ERR_CANT_WRITE", 6);
define("ERR_OUT_OF_SPACE", 7);
define("ERR_NOT_FILE", 8);
define("ERR_NOT_DIRECTORY", 9);
define("ERR_FILE_EXISTS", 10);

/**
 * Description of FileWrapper 
 * a wrapper to filesistem that trows errors instead a E_WARNING or return false
 * CAUTION Every time you pass a filename tha class change the contex to it
 * @author Rolando Corratge Nieves
 */
class FileWrapper {

    protected $filename = FALSE;
    protected $base_dir = FALSE; //a dir to search / entries

    public function __construct($filename=FALSE, $base_dir=FALSE) {
        $this->filename = $filename;
        $this->base_dir = $base_dir;
    }

    /**
     * Jquery like setter & getter
     * @param type $filename 
     */
    public function file($filename=FALSE) {
        if ($filename === FALSE) {
            return $this->filename;
        }
        $this->filename = utf8_decode($filename);
        return $this;
    }

    protected function _throw($code) {
        throw new Exception("File system error", $code);
    }

    public function check_file_exist($file=FALSE) {
        if ($file === FALSE) {
            $file = $this->filename;
        } else {
            $this->file($file);
        }
        if (!is_string($this->filename)) {
            $this->_throw(ERR_INVALID_PARAMS);
        }

        if (!file_exists($this->filename)) {
            $this->_throw(ERR_NOT_FOUND);
        }

        return $this;
    }

    public function check_is_dir($file=FALSE) {
        if ($file === FALSE) {
            $file = $this->filename;
        } else {
            $this->file($file);
        }
        if (!is_dir($this->filename)) {
            $this->_throw(ERR_NOT_DIRECTORY);
        }
        return $this;
    }

    public function check_parent_dir($create=TRUE, $file=FALSE) {
        if ($file === FALSE) {
            $file = $this->filename;
        } else {
            $this->file($file);
        }
        $dir = dirname($this->filename);
        if (!is_dir($dir)) {
            if ($create === TRUE) {
                if (!@mkdir($dir, 0777, true)) {
                    $this->_throw(ERR_CANT_WRITE);
                }
            } else {
                $this->_throw(ERR_INVALID_PARAMS);
            }
        }
        return $this;
    }

    public function check_is_file($file=FALSE) {

        if ($file === FALSE) {
            $file = $this->filename;
        } else {
            $this->file($file);
        }

        if (!is_file($this->filename) && !is_link($this->filename)) {
            $this->_throw(ERR_NOT_FILE);
        }

        return $this;
    }

    protected function check_file_not_exist($file=FALSE) {
        if ($file === FALSE) {
            $file = $this->filename;
        } else {
            $this->file($file);
        }
        if (file_exists($this->filename)) {
            $this->_throw(ERR_CANT_WRITE);
        }
        return $this;
    }

    protected function check_is_writable($file=FALSE) {
        if ($file === FALSE) {
            $file = $this->filename;
        } else {
            $this->file($file);
        }
        if (!is_writable($this->filename)) {
            $this->_throw(ERR_CANT_WRITE);
        }
        return $this;
    }

    public function check_is_readable($file=FALSE) {
        if ($file === FALSE) {
            $file = $this->filename;
        } else {
            $this->file($file);
        }
        if (!is_readable($this->filename)) {
            $this->_throw(ERR_CANT_READ);
        }
        return $this;
    }

    function stat($file=FALSE) {
        if ($file === FALSE) {
            $file = $this->filename;
        } else {
            $this->file($file);
        }
        $this->check_file_exist();

        $data['isDir'] = is_dir($this->filename);
        $stats = @stat($file);
        $data['modtime'] = $stats['mtime'] / 1000; //en segundos
        return $data;
    }

    /**
     *
     * @param type $file
     * @return type 
     */
    function delete($file=FALSE) {
        if ($file === FALSE) {
            $file = $this->filename;
        } else {
            $this->file($file);
        }
        $this->check_file_exist();
        if (is_dir($path)) {
            if (!@rmdir($path)) {
                $this->_throw(ERR_UNKNOWN);
            }
        } else {
            if (!@unlink($path)) {
                $this->_throw(ERR_UNKNOWN);
            }
        }
        return TRUE;
    }

    function chmod($mode="0777", $file=FALSE) {
        if ($file === FALSE) {
            $file = $this->filename;
        } else {
            $this->file($file);
        }
        $mode = octdec($mode);
        $this->check_file_exist();
        if (!@chmod($file, $mode)) {
            $this->_throw(ERR_CANT_WRITE);
        }
        return TRUE;
    }

    function rename($newname, $file=FALSE) {
        if ($file === FALSE) {
            $file = $this->filename;
        } else {
            $this->file($file);
        }
        $this->check_file_exist()
                ->check_file_not_exist($newname)
                ->file($file);
        if (!@rename($file, $newname)) {
            $this->_throw(ERR_CANT_WRITE);
        }
        $this->file($newname);
        return $this;
    }

    /**
     * CODE FROM CODEIGNITER FRAMEWORK directory_map 
     * @param type $file
     * @return type 
     */
    function aux_directory_map($source_dir, $directory_depth = 0, $hidden = FALSE) {
        $fp = @opendir($source_dir);
        if ($fp) {
            $filedata = array();
            $new_depth = $directory_depth - 1;
            $source_dir = rtrim($source_dir, DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR;

            while (FALSE !== ($file = readdir($fp))) {
                // Remove '.', '..', and hidden files [optional]
                if (!trim($file, '.') OR ($hidden == FALSE && $file[0] == '.')) {
                    continue;
                }

                if (($directory_depth < 1 OR $new_depth > 0) && @is_dir($source_dir . $file)) {
                    $filedata[$file] = $this->aux_directory_map($source_dir . $file . DIRECTORY_SEPARATOR, $new_depth, $hidden);
                } else {
                    $filedata[] = $file;
                }
            }

            closedir($fp);
            return $filedata;
        }

        return FALSE;
    }

    /**
     *
     * @param type $file
     * @param type $directory_depth
     * @param type $hidden
     * @return type 
     */
    function directory_map($file=FALSE, $directory_depth = 1, $hidden = TRUE) {
        if ($file === FALSE) {
            $file = $this->filename;
        } else {
            $this->file($file);
        }
        $this->check_file_exist()->check_is_dir()->check_is_readable();
        $fp = @opendir($file);
        if ($fp) {
            closedir($fp);
            return $this->aux_directory_map($file, $directory_depth, $hidden);
        } else {
            $this->_throw(ERR_CANT_READ);
        }
    }

    /**
     * 
     * @param type $file
     * @return type 
     */
    public function mkdir($mode="0777", $file=FALSE) {
        if ($file === FALSE) {
            $file = $this->filename;
        } else {
            $this->file($file);
        }
        $mode = octdec($mode);
        $this->check_file_not_exist()->check_parent_dir();
        if (!@mkdir($this->filename, $mode)) {
            $this->_throw(ERR_CANT_WRITE);
        }
        return TRUE;
    }

    /**
     * CODE FROM CODEIGNITER FRAMEWORK write_file + exceptions
     * @param type $file
     * @return type 
     */
    public function write_file($data, $encoding="utf-8", $file=FALSE) {
        if ($file === FALSE) {
            $file = $this->filename;
        } else {
            $this->file($file);
        }
        //$this->check_file_exist()->check_is_file()->check_is_writable();
        if (file_exists($file)) {
            $this->check_is_writable();
        }

        //$file=  realpath($file);
        $fp = @fopen($file, 'wb');
        if (!$fp) {
            $this->_throw(ERR_CANT_WRITE);
        }
        flock($fp, LOCK_EX);
        fwrite($fp, $data);
        flock($fp, LOCK_UN);
        fclose($fp);
        return TRUE;
    }

    /**
     * CODE FROM CODEIGNITER FRAMEWORK read_file + exceptions
     * @param type $file
     * @return type 
     */
    public function read_file($encoding="utf-8", $file=FALSE) {
        if ($file === FALSE) {
            $file = $this->filename;
        } else {
            $this->file($file);
        }

        $this->check_file_exist()->check_is_file()->check_is_readable();
        $data = "";
        if (function_exists('file_get_contents')) {
            $data = @file_get_contents($file);
        } else {
            if (!$fp = @fopen($file, FOPEN_READ)) {
                $this->_throw(ERR_CANT_READ);
            }

            flock($fp, LOCK_SH);

            $data = '';
            if (filesize($file) > 0) {
                $data = & fread($fp, filesize($file));
            }

            flock($fp, LOCK_UN);
            fclose($fp);
        }
        if ($data==="") {
            //empty files fail in browser don't know why
            return "  ";
        }
        $current_encoding=mb_detect_encoding($data);
        if(strcasecmp($current_encoding,$encoding)!==0){
            //$data = iconv(mb_detect_encoding($data), $encoding, $data);
        }


        return $data;
    }

}

class FileWrapperOpenDlg extends FileWrapper {

    /**
     * GET THE TOP DIR OR UNITS OF THE OS
     */
    function get_top_dirs() {

        if (isset($_SERVER['WINDIR']) || isset($_SERVER['windir'])) {
            $drive_leters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
            $drives = array();
            for ($i = 0; $i < strlen($drive_leters); $i++) {
                $drive = $drive_leters[$i] . ":\\";
                if (@is_dir($drive)) {
                    $drives[] = $drive;
                }
            }
            return($drives);
        } else {
            return array('/');
        }
    }

    /**
     * Reads the dirs of a dir
     */
    function read_dir_dirs($path=FALSE) {
        if ($path === FALSE) {
            $path = $this->filename;
        } else {
            $this->file($path);
        }
        $this->check_file_exist();

        $files = $this->directory_map($path);

        if ($files === FALSE) {
            $this->_throw(ERR_UNKNOWN);
        }

        $dirs = array();
        foreach ($files as $key => $file) {
            if (@is_dir($path . '/' . $file)) {
                $dirs[] = $path . '/' . $file;
            }
        }

        return $dirs;
    }

    /**
     * Reads the dirs and return array of pairs name,isDir
     */
    function read_dir_and_info($path=FALSE) {
        if ($path === FALSE) {
            $path = $this->filename;
        } else {
            $this->file($path);
        }
        $this->check_file_exist();

        $files = $this->directory_map($path);

        if ($files === FALSE) {
            $this->_throw(ERR_UNKNOWN);
        }

        $rstfiles = array();
        foreach ($files as $key => $file) {
            $rstfiles[] = array($path . '/' . $file, is_dir($path . '/' . $file));
        }

        return $rstfiles;
    }

    /**
     * Reads the dirs of a dir
     */
    function read_dir_files($path=FALSE) {
        if ($path === FALSE) {
            $path = $this->filename;
        } else {
            $this->file($path);
        }
        $this->check_file_exist();

        $files = $this->directory_map($path);

        if ($files === FALSE) {
            $this->_throw(ERR_UNKNOWN);
        }

        $rtr_files = array();
        foreach ($files as $key => $file) {
            $file_full = $path . '/' . $file;
            if (@is_file($file_full) || @is_link($file_full)) {
                $rtr_files[] = $file_full;
            }
        }

        return $rtr_files;
    }

}