<?php

/**
 * 
 */
class Req 
{
    // ------------------------
    // - Class constants
    // ------------------------

    protected const PUB_FN = "public function ";
    protected const PRO_FU = "protected function ";
    protected const PRV_FU = "private function ";
    protected const RETURN = PHP_EOL . 'return $response' . PHP_EOL;

    protected $rules = NULL;
    protected $r_case;
    protected $conn_obj;
    protected $query_method;

    // ------------------------
    // - Class constants
    // ------------------------    
    public function __construct($rules)
    {
        $this->rules = $rules;
    }
    // -------------------------------------------------
    // -
    // -  Map file parsing methods
    // -
    // -------------------------------------------------

    public function create_filesys_from_map($path)
    {
        $file = "/apiclasses.map";
        $data = json_decode(self::read_datafile($path . $file), true);


        self::parse_dir_from_map($data['map'], $path);
    }

    protected static function parse_dir_from_map($data, $path)
    {
        $dir     = $data['dir'];
        print("Dir: " . $dir . PHP_EOL);
        print_r($data['files']);
        $files   = self::parse_map_array($data, 'files', $path);
        $classes = self::parse_map_array($data, 'class', $path);
        $subdirs = [];

       
        /*
        foreach ($data['children'] as $node)
        {
            self::parse_dir_from_map($node, $path);
        }

        
        return
        [
            "dir"     => $dir,
            "files"   => $files,
            "classes" => $classes,
            "subdirs" => $subdirs
        ];*/
    }

    protected static function parse_map_array($data, $key, $path)
    {
        $method = "create_map_" . $key;
        //print("Current dir: " . getcwd() . PHP_EOL);
        if (is_array($data[$key])) foreach($data[$key] as $node)
        {
            self::{$method}($node, $path);
        }
    }

    protected static function create_map_files($data, $path)
    {
        $dest = './' . $path . '/dest';
        $src  = './' . $path . '/' . $data['name'] . '/this.src';
        $code = self::read_srcfile($src, "");

        if ($code) 
        {
            $home = $dest . '/' . $data['name'];
            print("Dest: " . $home . PHP_EOL);
            print("Code: " . $code . PHP_EOL);
            //mkdir($home);
            //self::write_textfile($home, $code);
        }
        
    }

    protected static function create_map_class($data, $path)
    {
        $dest = './' . $path . '/dest';
        $src  = './' . $path . '/' . $data['name'];
        $code = self::generate_class($src);
 
        if ($code) 
        {
            $home = $dest . '/' . $data['name'];
            print("Dest: " . $home . PHP_EOL);
            print("Code: " . $code . PHP_EOL);
            //mkdir($home);
            //self::write_textfile($home, $code);
        }
    }


    // -------------------------------------------------
    // -
    // - File struct from map methods
    // -
    // -------------------------------------------------

    // -------------------------------------------------
    // -
    // - class source code generator methods
    // -
    // -------------------------------------------------

    public function generate_class($path)
    {
        // - Read class data from file
        $content = self::read_datafile($path . '/this.cls');
        $src = "";

        if (!empty($content))
        {
            // - Convert content from json to array struct
            $data = json_decode( $content, true )['class'];

            //var_dump($data);
            // - Parse class name, properties and methods
            $name = $data['name'];
            $pty_list    = self::parse_class('property', $data);
            $const_list  = self::parse_class('const'   , $data);
            $method_list = self::parse_class('method'  , $data);

            // - Generate source code with parsed data
            $src = self::generate_class_source($name, $pty_list, $const_list, $method_list, $path);
        }

        return $src;
    }

    /**
     * Parses an array from $data, which is denoted by key ['class'][$target]
     * Use cases for target key: 'const', 'property' and 'method' 
     * in json-decoded 'class' array struct
     * 
     * @param  string $key
     * @param  array  $data
     * @return array
     */
    protected static function parse_class($key, $data)
    {
        $list = [];

        if (is_array($data[$key])) 
            foreach($data[$key] as $item) $list[] = $item;

        return $list;
    }

    /**
     * Generates constant source code from const array data
     * 
     * @param  array  $pty
     * @param  string $tab
     * @return string
     */
    protected static function generate_field($field, $tab)
    {
        $src = $tab . $field['visibility'] . " " . $field['name'];

        if (isset($field['value'])) $src .= " = " . $field['value'];

        $src .= ";" . PHP_EOL;

        return $src;
    }    

    /**
     * Generates method source code from method array data
     * 
     * @param  array  $method
     * @param  string $tab
     * @return string
     */    
    protected static function generate_method($method, $tab, $path)
    {
        $src = $tab . $method['visibility'];

        if (isset($method['scope']))
            $src .= " " . $method['scope'];

        $src .= " function " . $method['name'] . "(";
        $c = 0;

        foreach ($method['params'] as $param)
        {
            if ($c) $src .= ", ";
            $src .= $param;
            $c = 1;
        }

        $src .= ")" . PHP_EOL . $tab . "{" . PHP_EOL;

        $src .= self::method_src($method['name'] . ".src", $tab . $tab, $path);

        if (isset($method['return']))
            $src .= PHP_EOL . PHP_EOL . $tab . $tab . "return $" . $method['return'];

        $src .= PHP_EOL . $tab . "}" . PHP_EOL;

        return $src;
    }

    /**
     * Reads method source code from file $name
     * Prepends $tab to each line as an indentation
     *  
     * @param  string  $name
     * @param  string  $tab
     * @return string
     */      
    protected static function method_src($name, $tab, $path)
    {
        //print (PHP_EOL . "PATH: " . $path . "/" . $name . ", NAME: " . $name . PHP_EOL);
        return self::read_srcfile($path . "/" . $name, $tab);
    }

    /**
     * Generates class source code from params
     * 
     * @param  string $name
     * @param  array  $const_list
     * @param  array  $pty_list
     * @param  array  $method_list
     * @param  string $path
     * @return string
     */      
    protected static function generate_class_source($name, $const_list, $pty_list, $method_list, $path)
    {
        $src = "class " . $name . PHP_EOL. "{" . PHP_EOL;
        $tab = "    ";

        foreach($const_list as $const)
            $src .= self::generate_field($const, $tab);

        $src .= PHP_EOL;

        foreach($pty_list as $pty)
            $src .= self::generate_field($pty, $tab);

        $src .= PHP_EOL;

        foreach($method_list as $method)
            $src .= self::generate_method($method, $tab, $path) . PHP_EOL;

        $src .= "}" . PHP_EOL;

        return $src;

    }

    // -------------------------------------------------
    // -
    // - Debug print methods
    // -
    // -------------------------------------------------

    protected static function print_pty($pty)
    {
        print ("    " . $pty['visibility'] . " " . $pty['name'] . PHP_EOL);
    }

    protected static function print_method($method)
    {
        print (PHP_EOL . "    " . $method['visibility'] . " function " . $method['name'] . "(");

        $c = 0;

        foreach ($method['params'] as $param)
        {
            if ($c) print (", ");
            print ($param);
            $c = 1;
        }

        print (")" . PHP_EOL . "    {" . PHP_EOL);
        
        print ("        " . self::method_src($method['src']) . PHP_EOL);

        if (isset($method['return']))
            print(PHP_EOL . "        return $" . $method['return']);

        print (PHP_EOL . "    }" . PHP_EOL);
    }

    protected static function print_class_data($name, $pty_list, $method_list)
    {
        print (PHP_EOL . "class " . $name . PHP_EOL);
        print ("{" . PHP_EOL);
        
        foreach($pty_list as $pty)
            self::print_pty($pty);

        foreach($method_list as $method)
            self::print_method($method);

        print (PHP_EOL . "}" . PHP_EOL);

    }

    /**
     * Returns the data file content
     * 
     * @param string name
     * @return string
     */
    protected static function read_datafile($path)
    {
        $content = "";

        if (is_readable($path))
        {
            $f = fopen( $path, "r" );
            $content = fread($f, filesize($path));
            fclose( $f );
        }
    
        return $content;
    }

    /**
     * Writes text content to a file
     * 
     * @param  string  $path
     * @param  string  $content
     * @return string
     */
    protected static function write_textfile($path, $content)
    {
        $f = fopen($path, "w");
        fwrite($f, $content);
        fclose( $f );
    }

    /**
     * Returns the source file content with
     * indentation prepended into each line
     * 
     * @param  string  $path
     * @param  string  $tab
     * @return string
     */
    protected static function read_srcfile($path, $tab = "")
    {
        $content = "";

        if (is_readable($path))
        {
            $f = fopen( $path, "r" );

            // - Read file line by line to $content with $tab
            if ($f) while(($line = fgets($f)) !== false)
            {
                $content .= $tab . $line;
            }

            fclose($f);            
        }
    
        return $content;
    }     

}

/**
 * 
 */
class GET extends Req
{
    public function __construct($rules)
    {

    }

    public function request_method($params, $authdata)
    {
        $src = self::PUB_FN . 
        $this->generate_method_name() . ' (' . $this->generate_method_params($params) . 
        ')' . 
        $this->open_scope() .
        '$response = $this->conn->query(' . $this->generate_stmt() . ');' .
        self::RETURN . 
        '}';

        return $src;
    }

    protected function generate_method_name()
    {

    }

    protected function generate_stmt()
    {

    }
}