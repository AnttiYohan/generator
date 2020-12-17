<?php

class Model
{
    // ---------------------------------
    // - 1) User defined api prefix
    // - 2) REcord database name
    protected const PREFIX    = "AGDB__";
    protected const RECORD_DB = "Apigen";

    // -------------------------------
    // - Properties
    // -------------------------------
    public $conn     = NULL; 
    public $username = "";
    public $apiname  = ""; 
    public $version  = 1; 
    public $query    = [];

    public $result_log = [];

    /**
     * Model constructor
     * 
     * @param  ApiConnection $conn
     * @param  string        $username
     * @param  string        $apiname
     * @param  integer       $version
     * @param  array         $query
     */
    public function __construct( $conn, $username, $apiname = "", $version = 1, $query = [] )
    {
        $this->conn     = $conn;
        $this->username = $username;
        $this->apiname  = $apiname;
        $this->version  = $version;
        $this->query    = $query;
    }

    /**
     * Checks if the properties
     * $username
     * $apiname
     * $version
     * are set properly and returns the truth value of it
     * 
     * @return bool
     */
    public function validate_properties()
    {
        $result = TRUE;

        if ( ! strlen($this->username) || ! strlen($this->apiname) || $this->version == 0) 
        {
            $result = FALSE;
        }

        return $result;
    }

    /**
     * Checks from the Apigen Schema that the
     * username
     * apiname
     * version
     * Exist and match with eachother
     * 
     * Returns the truth value of this statemtent
     * 
     * @return bool
     */
    public function validate_database()
    {
        $result = 
        [
            "success" => TRUE,
            "msg"     => []
        ];

        // ------------------------------------------------------------
        // - Firstly, test if the username exists in the record schema
        // - 'Users' table
        // ------------------------------------------------------------

        $this->conn->useDatabase(self::RECORD_DB);

        $read_result = $this->conn->read
        (
            "SELECT * FROM Users WHERE username=:username",
            [ "username" => $this->username ]
        );

        if (self::has_entry($read_result, "user_id"))
        {
            $user_id = $read_result["user_id"];
            $result["msg"][] = "Username found in record schema";

            // ------------------------------------------------------------
            // - Secondly, test if the apiname exists in the record schema
            // - 'Apis' referenced by user_id
            // ------------------------------------------------------------

            $read_result = $this->conn->read
            (
                "SELECT * FROM Apis WHERE user_id=:user_id AND name=:name",
                [
                    "user_id" => $user_id,
                    "name"    => $this->apiname
                ]
            );

            if (self::has_entry($read_result, "api_id"))
            {
                $result["msg"][] = "Api found in record schema";

                // ---------------------------------------------------------
                // - Lastly, check the version
                // ---------------------------------------------------------
            }
            else
            {
                $result["error"][] = "Api $this->apiname not found in the record schema";
                $result["success"] = FALSE;               
            }
        }
        else
        {
            $result["error"][] = "Username not found";
            $result["success"] = FALSE;
        }

        return $result;
    }

    /**
     * Checks if the array has a key and returns the truth value of it
     * 
     * @param  array  $array
     * @param  string $key
     * @return bool
     */
    protected static function has_entry($array, $key)
    {
        $result = FALSE;

        if (count($array) && isset($array[$key])) $result = TRUE;
        
        return $result;
    }

    protected function clear_log()
    {
        $this->result_log = [];
    }

    protected function append_log( $msg, $key = 'msg' )
    {
        return $this->result_log[ $key ][] = $msg;
    }

    protected function error_log( $msg )
    {
        return $this->result_log[ 'error' ] = $msg;
    }

    protected function get_log()
    {
        return $this->result_log;
    }

}

 