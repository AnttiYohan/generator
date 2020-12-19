<?php

/**
 * PDO connection wrapper for apigen project
 */
class APIConnection
{  
    //-------------------------------//
    //- Properties:                 -//
    //- Connection pointer          -//
    //-------------------------------//
    
    protected $db   = "";
    public    $conn = NULL;
    
    /**
     * Establish a MySQL connection
     * 
     * @param  string $dbname
     */
    public function __construct($dbname = "")
    {
        $host = "127.0.0.1";
        $cset = "utf8";
        $user = "-";
        $pass = "-";
        $dsn  = "mysql:host=$host;";
        
        if( ! empty($db)) $dsn .= "dbname=$dbname";

        $dsn .= "charset=$cset";

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
                    
    }

    // -------------------------------------------------- //
    // - DDL method section                             - //
    // -------------------------------------------------- //

    /**
     * Return the truth value whether the requested
     * database exists
     * 
     * @param  {string} $dbname
     * @return {bool}
     */
    public function doesDatabaseExist($dbname)
    {
        $stmt = $this->conn->query("SELECT COUNT(*) FROM information_schema.schemata WHERE schema_name = '$dbname'");
        return (bool) $stmt->fetchColumn();
    }

    /**
     * Returns the result of database name query
     * 
     * @param  {string} $dbname
     * @return {result}
     */
    public function isDatabaseValid($dbname)
    {
        $stmt = $this->conn->query("SHOW DATABASES LIKE '$dbname'");
        return $stmt->fetchAll(PDO::FETCH_COLUMN);
    }

    /**
     * Return the truth value whether the requested
     * table exists
     * 
     * @param  {string} $tablename
     * @return {bool}
     */
    public function doesTableExist($tablename)
    {
        $stmt = $this->conn->query("SHOW TABLES LIKE '$tablename'");
        return (bool) $stmt->rowCount();
    }

    /**
     * Returns the result of table name query
     * 
     * @param  {string} $dbname
     * @return {result}
     */
    public function isTableValid($tablename)
    {
        $stmt = $this->conn->query("SHOW TABLES LIKE '$tablename'");
        return $stmt->fetchAll(PDO::FETCH_COLUMN);
    }

    /**
     * Creates a database
     * 
     * @param string $dbname
     */
    public function createDatabase($dbname)
    {
        $this->conn->exec(
            "CREATE DATABASE IF NOT EXISTS $dbname CHARACTER SET utf8 COLLATE utf8_general_ci;"
        );
    }

    public function createDatabaseWithUser($dbname, $username, $password)
    {

        $result = $this->conn->exec(
            "CREATE DATABASE IF NOT EXISTS $dbname CHARACTER SET utf8 COLLATE utf8_general_ci;"
        );
        $result = $this->conn->exec(
            "CREATE USER '$username'@'localhost' IDENTIFIED BY '$password';"
        );
        $result = $this->conn->exec(
            "GRANT ALL ON $dbname TO '$username'@'localhost';FLUSH PRIVILEGES;"
        );
   
        return $result;
    }

    public function dropDatabase($dbname)
    {
        $this->conn->exec("DROP DATABASE IF EXISTS $dbname");
    }

    /**
     * Creates table to database
     * 
     * @param  {Table} $table
     * @return {result}
     */
    public function createTable($table)
    {
        $stmt = $this->conn->query( $table->ddl() );
        return $stmt->fetchAll( PDO::FETCH_COLUMN );
    }

    /**
     * Change database
     */
    public function useDatabase($dbname)
    {
        $this->conn->exec("USE $dbname");
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
    public function write( $sql, $values )
    {
        $result = 
        [
            'affected' => 0
        ];

        try
        {
            $stmt = $this->conn->prepare( $sql ); // Prepare the statement,
            $stmt->execute( $values );            // Execute query w/ values,

            $result[ 'affected' ] = $stmt->rowCount();           // Return w/ affected row count
        }
        catch ( Exception $e )
        {
            $result[ 'error' ] = $e->getMessage();
        }

        return $result;
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
    public function inTransaction()
    {
        return $this->conn->inTransaction();
    }
    
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

