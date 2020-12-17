<?php

class DB
{
    // -----------------------------
    // - Class constants
    // -----------------------------
    protected const KEY_VALUES  = "values";  
    protected const KEY_WHERE   = "where";
    protected const KEY_TABLE   = "table";
    protected const KEY_COLS    = "columns";
    protected const KEY_SET     = "set";    
    protected const KEY_MSG     = "msg";
    protected const KEY_STMT    = "stmt";
    protected const OK          = "success";
    protected const ERR         = "error";

    // -----------------------------
    // - DB IO
    // -----------------------------

    public static function read_users()
    {
        include_once "DBManager.php";
        $db  = new DBManager();
        $sql = "SELECT * FROM Users";

        $res = $db->query($sql);

        print_r($res);
    }

    public static function read_user_by_id($id)
    {
        include_once "DBManager.php";
        $db  = new DBManager();
        $sql = "SELECT * FROM Users WHERE user_id=?";
        $values = [ $id ];
        $res = $db->read($sql, $values);

        print_r($res);
    }    

    public static function read_files_by_pr_id($id)
    {
        include_once "DBManager.php";
        $db  = new DBManager();
        $sql = "SELECT name FROM Files WHERE pr_id=?";
        $values = [ $id ];
        $res = $db->read($sql, $values);

        print_r($res);
    }
    
    public static function read_project_by_user_id($id)
    {
        include_once "DBManager.php";
        $db  = new DBManager();
        $sql = "SELECT * FROM Projects WHERE user_id=?";
        $values = [ $id ];
        $res = $db->read($sql, $values);

        print_r($res);
    }     
    
    public static function read_dir_by_pr_id($id)
    {
        include_once "DBManager.php";
        $db  = new DBManager();
        $sql = "SELECT * FROM Dirs WHERE pr_id=?";
        $values = [ $id ];
        $res = $db->read($sql, $values);

        print_r($res);
    }      
    // -----------------------------
    // - Model generator for user defined models
    // -----------------------------

    public static function create_model($table, $method_list)
    {
        $name = $table . "Model";

        // - get model data
        $data = json_decode($method_list, true)['method'];

        print (PHP_EOL . "Method list of " . $name . PHP_EOL);

        foreach ($data as $item)
        {
            print ("verb: "   . $item['verb']);
            print (", name: " . $item['name']);
            print (", stmt: " . $item['stmt']) . PHP_EOL;    
        }
        //$src = self::generate_model_src($name); 
    }

    protected static function generate_model_src($name)
    {

    }

    protected static function read_file($path)
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

    // -----------------------------
    // - Data Manipulation Language statement generator for
    // - SELECT statement
    // - INSERT statement
    // - UPDATE statement
    // - DELETE statement
    // -----------------------------

    /**
     * Generates a SELECT statement from input
     * 
     * @param  array  $params
     * @return array
     */
    public static function select_stmt($params)
    {

        $retobj = [];

        // - Test the validation of $params
        if (self::validate_select_params($params))
        {
            // - Generate stmt with from clause
            $stmt = "select ";
            
            // - Append a column list clause when it is present
            if (self::has_columns($params))
            {
                $c = 0;

                foreach($params[self::KEY_COLS] as $col)
                {
                    if ($c) $stmt .= ", ";
                    $stmt .= $col;
                    $c = 1; 
                }
            }
            else
            {
                $stmt .= "*";
            }

            $stmt .= " from " . $params[self::KEY_TABLE];

            // - Append a where clause when it is present
            if (self::has_where($params))
            {
                $stmt .= " where " . $params[self::KEY_WHERE];
            }

            // - Setup the return array with success message
            // - And the statement
            $retobj = [
                self::KEY_MSG  => self::OK,
                self::KEY_STMT => $stmt
            ];
        }
        else 
        {   // - $params not valid, setup an return array with error msg
            $retobj = [ self::KEY_MSG => self::ERR ];
        }

        return $retobj;
    }

    /**
     * Generates a INSERT statement from input
     * 
     * @param  array  $params
     * @return array
     */
    public static function insert_stmt($params)
    {

        $retobj = [];

        // - Test the validation of $params
        if (self::validate_insert_params($params))
        {
            // - Generate stmt with from clause
            $stmt = "insert into " . $params[self::KEY_TABLE];

            // - Append a column list clause when it is present
            if (self::has_columns($params))
            {
                $stmt .= " (";
                $c = 0;

                foreach($params[self::KEY_COLS] as $col)
                {
                    if ($c) $stmt .= ", ";
                    $stmt .= $col;
                    $c = 1; 
                }

                $stmt .= ")";
            }

            $stmt .= " values (";
            $c = 0;

            foreach ($params[self::KEY_VALUES] as $value)
            {
                if ($c) $stmt .= ", ";
                $stmt .= $value;
                $c = 1;
            }

            $stmt .= ")";

            // - Setup the return array with success message
            // - And the statement
            $retobj = [
                self::KEY_MSG  => self::OK,
                self::KEY_STMT => $stmt
            ];
            //$retobj[self::KEY_MSG] = self::OK;
        }
        else 
        {   // - $params not valid, setup an return array with error msg
            $retobj = [ self::KEY_MSG => self::ERR ];
        }

        return $retobj;
    }


    /**
     * Generates a UPDATE statement from input
     * 
     * @param  array  $params
     * @return array
     */
    public static function update_stmt($params)
    {

        $retobj = [];

        // - Test the validation of $params
        if (self::validate_update_params($params))
        {
            // - Generate UPDATE statement with table
            $stmt = "update " . $params[self::KEY_TABLE] . " set ";

            $c = 0;

            // - Append SET clause as column:value pairs
            foreach ($params[self::KEY_SET] as $col => $value)
            {
                if ($c) $stmt .= ", ";
                $stmt .= $col . " = '" . $value . "'";
                $c = 1;
            }

            // - Append WHERE clause as a string
            $stmt .= " where " . $params[self::KEY_WHERE];

            // - Setup the return array with success message
            // - And the statement
            $retobj = [
                self::KEY_MSG  => self::OK,
                self::KEY_STMT => $stmt
            ];
            //$retobj[self::KEY_MSG] = self::OK;
        }
        else 
        {   // - $params not valid, setup an return array with error msg
            $retobj = [ self::KEY_MSG => self::ERR ];
        }

        return $retobj;
    }


    /**
     * Generates a DELETE statement from input
     * 
     * @param  array  $params
     * @return array
     */
    public static function delete_stmt($params)
    {

        $retobj = [];

        // - Test the validation of $params
        if (self::validate_delete_params($params))
        {
            // - Generate UPDATE statement with table
            $stmt = 
            "delete from " . $params[self::KEY_TABLE] .
            " where " . $params[self::KEY_WHERE];

            // - Setup the return array with success message
            // - And the statement
            $retobj = [
                self::KEY_MSG  => self::OK,
                self::KEY_STMT => $stmt
            ];
        }
        else 
        {   // - $params not valid, setup an return array with error msg
            $retobj = [ self::KEY_MSG => self::ERR ];
        }

        return $retobj;
    }    

    // ------------------------------
    // - Validation methods
    // ------------------------------

    /**
     * Return TRUE if $params has required SELECT stmt keys 
     * 
     * @param  array $params
     * @return boolean
     */
    protected static function validate_select_params($params)
    {
        $retval = FALSE;

        if (is_array($params) && self::has_table($params)) $retval = TRUE;

        return $retval;
    }

    /**
     * Return TRUE if $params has required INSERT stmt keys 
     * 
     * @param  array $params
     * @return boolean
     */
    protected static function validate_insert_params($params)
    {
        $retval = FALSE;

        if (
            self::validate_select_params($params) && 
            self::has_values($params)
        ) $retval = TRUE;

        return $retval;
    }

    /**
     * Return TRUE if $params has required UPDATE stmt keys 
     * 
     * @param  array $params
     * @return boolean
     */
    protected static function validate_update_params($params)
    {
        $retval = FALSE;

        if (
            self::validate_delete_params($params) && 
            self::has_set($params)
        ) $retval = TRUE;

        return $retval;
    }

    /**
     * Return TRUE if $params has required DELETE stmt keys 
     * 
     * @param  array $params
     * @return boolean
     */
    protected static function validate_delete_params($params)
    {
        $retval = FALSE;

        if (
            self::validate_select_params($params) && 
            self::has_where($params)
        ) $retval = TRUE;

        return $retval;
    }

    /**
     * Returns TRUE when $params array contains KEY_TABLE
     * The validation tests
     * 
     * @param   array   $params
     * @return  boolean 
     */
    protected static function has_table($params)
    {
        $retval = FALSE;

        if (isset($params[self::KEY_TABLE])) $retval = TRUE;

        return $retval;
    }

    /**
     * Returns TRUE when $params array contains KEY_VALUES
     * The validation tests
     * 
     * @param   array   $params
     * @return  boolean 
     */
    protected static function has_values($params)
    {
        $retval = FALSE;

        if (is_array($params[self::KEY_VALUES])) $retval = TRUE;

        return $retval;
    }

    /**
     * Returns TRUE when $params array contains KEY_WHERE
     * 
     * @param   array   $params
     * @return  boolean 
     */
    protected static function has_where($params)
    {
        $retval = FALSE;

        if (isset($params[self::KEY_WHERE])) $retval = TRUE;

        return $retval;
    }

   /**
     * Returns TRUE when $params array contains KEY_SET
     * 
     * @param   array   $params
     * @return  boolean 
     */
    protected static function has_set($params)
    {
        $retval = FALSE;

        if (is_array($params[self::KEY_SET])) $retval = TRUE;

        return $retval;
    }

   /**
     * Returns TRUE when $params array contains KEY_COLS
     * 
     * @param   array   $params
     * @return  boolean 
     */
    protected static function has_columns($params)
    {
        $retval = FALSE;

        if (is_array($params[self::KEY_COLS])) $retval = TRUE;

        return $retval;
    }

    protected static function error_msg()
    {
        return "error at";
    }

}