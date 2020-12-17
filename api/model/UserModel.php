<?php

class UserModel
{
    // -------------------------------
    // - Properties:
    // - 1) Database connection manager reference "APIConnection.php"
    // - 2) The user id
    // -------------------------------
    protected $conn = null;
    protected $id   = "";
    protected $args = [];


    // -------------------------------
    // - Methods
    // -------------------------------

    /**
     * Schema Model constructor
     * 
     * @param  ApiConnection $conn
     * @param  string        $username
     * @param  string        $apiname
     * @param  integer       $version
     */
    public function __construct($conn, $username, $apiname, $version, $query)
    {
        parent::__construct($conn, $username, $apiname, $version, $query);
    }

    /**
     * Execute INSERT statement in database, return the
     * Query result
     * 
     * @param  array  $params
     * @return string
     */
    public function create($params = "")
    {
        return "{'msg':'user created','id':'12'}";
    }

    /**
     * Execute SELECT statement in database, return the
     * Query result
     * 
     * @param  array  $params
     * @return string
     */
    public function read()
    {
        $hasWhereClause = false;

        $stmt = "SELECT * FROM Users";

        // - If id defined, concatenate a WHERE clause
        // - To the SELECT statement
        if (strlen($this->id))
        {
            $hasWhereClause = true;
            $stmt .= " WHERE user_id=:user_id";
        }

        //echo "<p>UserModel::read stats: whereClause? " .
        //$hasWhereClause ? "true" : "false";

        //echo "</p><p>stmt: " . $stmt . ", user_id: " . $this->id . "</p>";

        if ($hasWhereClause)
        {
            return $this->conn->read($stmt, ['user_id' => $this->id]);
        }

        return $this->conn->query($stmt);
    }

    /**
     * Execute UPDATE statement in database, return the
     * Query result
     * 
     * @param  array  $params
     * @return string
     */
    public function update($params = "")
    {
        return "id=11;name=Pentti";
    }

    /**
     * Execute DELETE statement in database, return the
     * Query result
     * 
     * @param  array  $params
     * @return string
     */    
    public function delete($params = "")
    {
        return "id=10";
    }    
}