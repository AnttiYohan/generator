<?php

/**
 * PDO Database connection wrapper class
 */
class DBManager
{  
    //-------------------------------//
    //- Properties:                 -//
    //- Connection pointer          -//
    //-------------------------------//
    
    public $conn = NULL;
    
    /**
     * Establish connection at constructor
     */
    public function __construct()
    {
        $db   = "Prototyper";
        $host = "127.0.0.1";
        $cset = "utf8";
        $user = "protouser";
        $pass = "2009";

        $dsn  = "mysql:host=$host;dbname=$db;charset=$cset";

        print (PHP_EOL . "DSN: " . $dsn . PHP_EOL);
        $opts =
        [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => FALSE
        ];

        try
        {
            $this->conn = new PDO($dsn, $user, $pass, $opts);
        }
        catch (PDOException $e)
        {    
            throw new PDOException($e->getMessage(), (int)$e->getCode());
        }
                    
        echo "\n" . $dbname . " Connected to Database "
        . $this->conn->query("SELECT database()")->fetchColumn() .
        PHP_EOL . PHP_EOL;
    }


    // -------------------------------------------------- //
    // - I/O method section                             - //
    // -------------------------------------------------- //

    /**
     * Prepares a statement by binding $values to
     * Unprepared statement $sql
     * Returns affected row count
     * NOTE! Use method only for input operations
     * 
     * @param   string   $sql     Unprepared statement
     * @param   array    $values  Values to bind
     * @return  integer  Affected row amount
     */
    public function write($sql, $values)
    {
        $stmt = $this->conn->prepare($sql); // Prepare the statement,
        $stmt->execute($values);            // Execute query w/ values,

        return $stmt->rowCount();           // Return w/ affected row count
    }
    
    /**
     * Prepares a statement by binding $values to
     * Unprepared statement $sql
     * Returns selected rows
     * Note: Use this only with SELECT
     * 
     * @param   string   $sql
     * @param   array    $values
     * @return  array
     */
    public function read($sql, $values)
    { 
        $stmt = $this->conn->prepare($sql); // Prepare statement,
        $stmt->execute($values);            // Execute query w/ values,

        return $stmt->fetchAll();           // Return w/ fetched result
    }
    
    /**
     * Read database without preparing statement
     * Use only without query params,
     * E.g. with SELECT {} FROM {table};
     * 
     * @param   string   $sql 
     * @return  array    Rows fetced
     */
    public function query($sql)
    {  
        return $this->conn->query($sql)     // Execute query,
                          ->fetchAll();     // Returns w/ fetched result
    }

    /**
     * Creates an array from $stmt and returns it
     * 
     * @param   PDOStatement $stmt 
     * @return  array
     */
    protected function fetchRows($stmt)
    {
        $rows = [];
                    
        while ($row = $stmt->fetch()) $rows[] = $row;
        
        return $rows; 
    }    
    
    // ------------------------------------------------- //
    // - TRANSACTION/ERROR HANDLING FUNCTIONALITY      - //
    // ------------------------------------------------- //
    
    public function beginTransaction()
    {
        $this->conn->beginTransaction();
    }
    
    public function commit()
    {
        $this->conn->commit();
    }
    
    public function rollBack()
    {
        $this->conn->rollBack();
    }
    
    public function errmodeSilent()
    {
        $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_SILENT);
    }
    
    public function errmodeException()
    {
        $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    }
    
// ------------------------------------------ //
// - End of class                           - //
// ------------------------------------------ //
}

