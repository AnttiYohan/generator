<?php

/**
 * User model class
 * Generates queries to user data
 */
class User
{
    protected $conn = null;

    /**
     * Class constructor
     * Usage: Pass Database manager object as parameter
     * 
     * @param  {APIConnection} $conn
     */
    public function __construct($conn)
    {
        $this->conn = $conn;
    }

    public function readAll()
    {
        $sql = "SELECT * FROM Users";

        return $this->conn->query($sql);
    }

    public function readById($id)
    {
        $sql = "SELECT * FROM Users WHERE user_id=:id";

        return $this->conn->read($sql, ['id' => $id]);
    }

}