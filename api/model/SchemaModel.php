<?php

include 'Model.php';

/********************************************************************************
 *   Endpoint:
 *   https:/apigen.tech/schema/
 *   The Schema model manages the custom Apis'
 *   Database and Model structure recording and
 *   Individual database creationg, editing and retrieval.
 *   (The Api data content may be accessed with Api-model - https://apigen.tech/api)
 *   The API structure is stored in 'Apigen' Schema database, which holds records of
 *   Every apis tables, fields and constraints and the query models.
 *   It also holds a pointer to APIs own, individual, databases
 *   URL format:  https://apigen.tech/schema/username/apiname/version
 *   For example: https://apigen.tech/schema/joe/weather/v2
 * 
 *   HTTP Method to class method mapping:
 * 
 *   POST       create
 *   GET        read
 *   PUT        update
 *   DELETE     delete
 *   
 ********************************************************************************/
class SchemaModel extends Model
{
    /**
     * Schema Model constructor
     * username, apiname and version are all parts of the route:
     * https:/apigen.tech/schema/{username}/{apiname}/{version}
     * 
     * @param  ApiConnection $conn      MySQL PDO Wrapper object
     * @param  string        $username  Defines route namespace
     * @param  string        $apiname   
     * @param  integer       $version
     */
    public function __construct( $conn, $username, $apiname, $version, $query )
    {
        parent::__construct( $conn, $username, $apiname, $version, $query );
    }

    /**
     * Parses the HTTP POST request body, attempts to create
     * an Api object from the data.
     * Creates:
     * a record of the Api structure into the schema database
     * an individual database named like PREFIX + username + apiname.
     * 
     * @param  string  $input
     * @return string
     */
    public function create($input)
    {

        $api       = null;
        $dbname    = "";
        $api_title = "";
        $result    = [];
        $commit    = false;
        $didExist  = false;

        // --------------------------------------------
        // - Firstly, create an Api model instance, and
        // - Pass the request body into it.
        // - If the body is in correct format, the
        // - Api::load_from_json() method will be able
        // - to parse it and create a Api model of it 
        // --------------------------------------------

        $result[ 'msg' ][] = 'Attempting to parse an Api model from the Request payload.';

        try
        {
            include 'Api.php';

            $result[ 'msg' ][] = 'Api model class included';

            $api = new Api();
            $api->load_from_json( $input );

            $result[ 'msg' ][] = 'Api model object created and parsed from the payload';

            $api_title = $api->title();
            $dbname    = self::PREFIX . $api_title;

        } catch ( Exception $e ) {

            $result[ 'error' ][] = 'Bad request';
            $result[ 'error' ][] = $e->getMessage();

            return self::fail( $result );

        }

        // -----------------------------------------------------------------------------
        // - Here the Api model is used to create:
        // - (1) the individual database for the Api
        // - (2) the structure mapping as entry to the Apigen scema database
        // - ---------------------------------------------------------------------------
        // - If errors do occur, the transactions are rolled back
        // - ---------------------------------------------------------------------------
        // - The result object will be filled with individual function reports
        // - and these are returned as a response to the API request.
        // - On failure, the goal is to collect as much relevant information as possible
        // - without compromising the security of the system, in order to inform
        // - the user the correct path to debug the request
        // -----------------------------------------------------------------------------

        try
        {
            // --------------------------------------------------------------
            // - 
            // -    THE FIRST PHASE:
            // -
            // -    Create the individual database
            // -
            // --------------------------------------------------------------
            // - Precautions:
            // -------------------------------------------------------------------------------
            // - Check if the database already exist both:
            // - (1) as an individual database
            // - (2) in the Apigen schema database records
            // -------------------------------------------------------------------------------
            // - If the database exist, prompt the user to use
            // - update method as a PUT request, or to use the "rewrite" flag
            // - To ensure that the whole system should be rewritted.
            // - This will remove all the entries from the database, so prompt the user
            // - To dump the database before the process
            // --------------------------------------------------------------------------------
            // - If the database exist but the schema database has
            // - no records of it, prompt the user the use the
            // - PATCH with the healing methods in order to 
            // - repair the system.
            // --------------------------------------------------------------------------------
            // - If the schema records contain a pointer to the database
            // - That doesn't exist, prompt the user to:
            // - (1) Remove the entry by HTTP DELETE apigen.tech/schema/{username}/{apiname}
            // - (2) Rewrite the Api with HTTP POST and rewrite flag
            // --------------------------------------------------------------------------------

            if ( is_null( $this->conn ) ) throw new Exception( $result[ 'error' ][] = 'Database connection is null' );

            $result[ 'msg' ][] = 'testing if the database exist with name: ' . $dbname;

            try {

                $didExist = $this->conn->doesDatabaseExist( $dbname );

            } catch ( Exception $e ) {

                $result[ 'error' ][] = 'Database query failed'; 
                throw new Exception( $e->getMessage() );

            }

            $result[ 'msg' ][] = "Does the database $dbname exist: $didExist";

            if ( $didExist )
            {
                throw new Exception( "Database $dbname already exists. Use PUT to update or rwrite flag to exnforce rewrite" );
            }

            $user_id = 2; // Mock user

            // --------------------------------------------
            // - (1) Fetch the tables from the Api model
            // --------------------------------------------

            $table_list = $api->get_table_list();
            $result[ 'msg' ][] = 'Api model table count: ' . count( $table_list );

            if ( count( $table_list ) == 0 ) 
            {
                throw new Exception( $result[ 'msg' ][] = 'Incomplete request: No tables in Api' );
            }

            // --------------------------------------------
            // - (2) Create the database
            // --------------------------------------------

            if ( ! $didExist )
            {

                $result[ 'msg' ][] = "Database $dbname did not exist, attempting to create";
                $this->conn->createDatabase( $dbname );
                $didExist = $this->conn->doesDatabaseExist( $dbname ) ;

                if ( ! $didExist ) throw new Exception( "Unable to create database $dbname" );

                $result[ 'msg' ][] = "Database $dbname created, use the database";
            }

            $this->conn->useDatabase( $dbname );
            
            // --------------------------------------------
            // - CREATE the Tables
            // --------------------------------------------

            $tableCount = 0;  
            
            $result[ 'msg' ][] = "Attempting to create the tables to $dbname";

            foreach( $table_list as $table )
            {
                $result[ 'msg' ][] = 'Attemptiong to create table with: ' . $table->ddl();
                $result[ 'msg' ][] = 'Field count: ' . count( $table->field_list );

                foreach ( $table->field_list as $field ) {

                    $result[ 'msg' ][] = "Field: " . $field->title();
                    $result[ 'msg' ][] = "Type: "  . $field->type();
                    $result[ 'msg' ][] = "Size: "  . $field->size();
                    $result[ 'msg' ][] = "ddl: "   . $field->ddl();

                }

                $result[ 'msg' ][] = "Result: " . $this->conn->createTable( $table );
                $tableCount++;
            }

            $result[ 'msg' ][] = "$tableCount tables created";

            if ( count( $table_list ) != $tableCount )
            {
                $result[ 'error' ][] = 
                "The Api model has different amount of tables(" . count( $table_list ) . 
                ") that was created ($tableCount)";

                throw new Exception( 'The created table amount did not match the model' );
            }

            // --------------------------------------------------------------
            // - 
            // -    THE SECOND PHASE:
            // -
            // -    Insert records to the Apigen Schema
            // -
            // -------------------------------------------------------------
            // - Record the database name and structure to Apigen Schema db
            // - Apigen Schema acts as a dictionary for the APIs
            // --------------------------------------------------------------

            $result[ 'msg' ][] = 
            'Individual database and tables created, proceed to insert records of structure to the Apigen schema';

            $this->conn->beginTransaction();

            $result[ 'msg' ][] = 'Transaction begun, swiching database to Apigen schema';

            $this->conn->useDatabase( self::RECORD_DB );

            // ---------------------------------------------------------------
            // - Iterate through Api properties and add them to Apigen records
            // - (1) Begin with transaction
            // - (2) Insert into 'Apis' table {api name} and {user id}
            // - (3) Fetch the newly created api_id
            // ----------------------------------------------------------------            
 
            $result[ 'msg' ][] = "Writing the Api name  record with user id $dbname::$user_id";

            $write_result = $this->conn->write( $api->insert_stmt(), [ $dbname, $user_id ] );

            $result[ 'msg' ][] = 'Api Insert affected rows: ' . $write_result;
            $result[ 'msg' ][] = self::write_test
            (
                $write_result, 
                "Api record inserted succesfully",
                "Failed to insert the Api record to the Apigen schema"
            );

            $read_result = $this->conn->read( $api->select_stmt( true ), [ 'user_id' => $user_id, 'name' => $dbname ] );

            $result[ 'msg' ][] = self::read_test
            (
                $read_result,
                "api_id",
                "Api identifer read succesfully, attempting to insert the table records",
                "Failed to read the Api identified from the Apigen schema"
            );

            $api_id = $read_result[ 0 ][ 'api_id' ];

            foreach ( $api->get_table_list() as $table ) {

                // ------------------------------------------------------------
                // - Iterate through Table objects
                // - (1) Insert data into 'Tables' table
                // - (2) Fetch the new table_id
                // - (3) Iterate through Fields and Table Constraints
                // ------------------------------------------------------------

                $result[ 'msg' ][] = "Inserting table " . ( $table_name = $table->title() );

                // ------------------------------------------------------------
                // - Insert new Table with 'name' and 'api_id', which generates
                // - A new row with a new id for the table
                // - Test And log the process
                // ------------------------------------------------------------

                $write_result = $this->conn->write( $table->insert_stmt(), [ $table_name, $api_id ] );
                $result[ 'msg' ][] = self::write_test
                (
                    $write_result,
                    "Table $table_name record inserted succesfully",
                    "Failed to insert the table $table_name to the table records"
                );

                // ------------------------------------------------------------
                // - Read the newly created table_id, and test if the db read
                // - Performed as expected
                // ------------------------------------------------------------

                $read_result = $this->conn->read( $table->select_stmt(), [ $table_name, $api_id ] );

                $result[ 'msg' ][] = self::read_test
                (
                    $read_result,
                    "table_id",
                    "Table identifier read succesfully, attemting to insert the fields",
                    "Failed to read the table identifier"
                );

                // ------------------------------------------------------------
                // - Grab the table_id and begin to extract the fields from it 
                // ------------------------------------------------------------

                $table_id = $read_result[ 0 ][ 'table_id' ];

                foreach ( $table->field_list as $field ) {

                    // ---------------------------------------------------------------
                    // - Iterate through Field objects
                    // - (1) Insert data into 'Fields' table
                    // - (2) Fetch the new field_id
                    // - (3) Iterate through Field Constraints
                    // INSERT INTO Fields (`name`, `type`, `size`, `cn`, `table_id`, `nullable`, `defaultval`) 
                    // VALUES ('id', 'INTEGER', NULL, 'AUTO_INCREMENT', 4, 0, NULL);
                    //
                    // ----------------------------------------------------------------

                    $result[ 'msg' ][] = 'Field insert stmt: ' . $field->insert_stmt();
                    $result[ 'msg' ][] = 'Values: '  . $field->to_string(', ');
                    $result[ 'msg' ][] = 'notnull: ' . $field->notnull();

                    // ------------------------------------------------------------
                    // - Insert new Field with
                    // - 'name'
                    // - 'type'
                    // - 'size'
                    // - 'table_id'
                    // - 'nullable'
                    // - 'defaultval'
                    // ------------------------------------------------------------

                    $result[ 'msg' ][] = self::write_test
                    (
                        $this->conn->write( $field->insert_stmt(), $field->values( $table_id ) ),
                        "Field $field_name record inserted succesfully, attempting to insert constraints",
                        "Failed to insert the field $field_name to the field records"
                    );

                } foreach ( $table->constraint_list as $constraint ) {

                    // ---------------------------------------------------------------
                    // - Iterate through Table constraints
                    // - There are Four (4) Table constraint types
                    // - Test the constraint types and fetch data accordingly
                    // - (1) PRIMARY KEY
                    // - (2) FOREIGN KEY
                    // - (3) INDEX
                    // - (4) CHECK
                    // ----------------------------------------------------------------                    

                    $result[ 'msg' ][] = 'Inserting table constraint type: ' . $constraint->type;

                    if ( $constraint->type === Constraint::PRIMARY_KEY ) {

                        // -------------------------------------------------------------
                        // CREATE TABLE PrimaryKeys (
                        //
                        //    table_id            INT NOT NULL,
                        //    target_field        VARCHAR( 256 ) NOT NULL,
                        //    PRIMARY KEY ( table_id, target_field ),
                        //    FOREIGN KEY ( target_field )    REFERENCES Fields( name )
                        //                                    ON UPDATE CASCADE
                        //                                    ON DELETE CASCADE
                        //    );
                        // ---------------------------------------------------------------

                        $result[ 'msg' ][] = "Inserting Table $table_name PRIMARY KEY target fields to the Primary Key records";

                        foreach ( $constraint->target_field_list as $target_field ) {

                            // ----------------------------------------------
                            // - Iterate through the PRIMARY KEY fields
                            // - Insert the fields to the PrimaryKey table
                            // - One field at time
                            // - Test and log the result with 'write_test'
                            // ----------------------------------------------

                            $result[ 'msg' ][] = self::write_test
                            (
                                $this->conn->write( $constraint->insert_stmt(), [ $table_id, $target_field ] ),
                                "Table $table_name constraint PRIMARY KEY target field $target_field inserted succesfully",
                                "Failed to insert table $table_name PRIMARY KEY field $target_field records"
                            );

                        }

                    } elseif ( $constraint->type === Constraint::FOREIGN_KEY ) {


                        // -----------------------------------------------------------------
                        // CREATE TABLE ForeignKeys (
                        //
                        //    table_id            INT NOT NULL,
                        //    target_field        VARCHAR(256) NOT NULL,
                        //    reference_table     VARCHAR(256) NOT NULL,
                        //    reference_field     VARCHAR(256) NOT NULL,
                        //    on_delete           VARCHAR(256),
                        //    on_update           VARCHAR(256),
                        //
                        //    PRIMARY KEY ( table_id, target_field ),
                        //
                        //    FOREIGN KEY ( target_field )    REFERENCES Fields( name )
                        //                                    ON UPDATE CASCADE
                        //                                    ON DELETE CASCADE    
                        // );
                        // ---------------------------------------------------------------

                        $tgt_field = $constraint->target_field;
                        $ref_table = $constraint->reference_table;
                        $ref_field = $constraint->reference_field;
                        $on_update = $constraint->on_update;
                        $on_delete = $constraint->on_delete;

                        // ----------------------------
                        // - Insert the foreign key
                        // - Test and log the write result
                        // ------------------------------
                        
                        $result[ 'msg' ][] = self::write_test
                        (
                            $this->conn->write
                            (
                                $constraint->insert_stmt(),
                                [
                                    $table_id,
                                    $tgt_field,
                                    $ref_table,
                                    $ref_field,
                                    $on_update,
                                    $on_delete
                                ]
                            ),
                            "Table $table_name FOREIGN KEY target field $field_name inserted succesfully",
                            "Failed to insert Table $table_name FOREIGN KEY field $field_name to the records"
                        );

                    } elseif ($constraint->type == Constraint::INDEX) {

                        // -----------------------------------------------------------
                        // CREATE TABLE Indices (
                        //
                        //    table_id         INT NOT NULL,
                        //    target_field     VARCHAR( 256 ) NOT NULL,
                        //    name             VARCHAR( 256 ),
                        //    PRIMARY KEY( table_id, target_field ),
                        //    FOREIGN KEY( target_field ) REFERENCES Fields( name )
                        //    ON UPDATE CASCADE
                        //    ON DELETE CASCADE
                        //
                        // );
                        // -----------------------------------------------------------

                        $result[ 'msg' ][] = "Inserting Table $table_name INDEX target fields to the Indices records";

                        foreach ( $constraint->target_field_list as $target_field ) {

                            // -------------------------------
                            // - Iterate through Indexed fields
                            // - Test and log the write_result
                            // -------------------------------

                            $result[ 'msg' ][] = self::write_test
                            (
                                $this->conn->write
                                ( $constraint->insert_stmt(), [ $table_id, $table_name, $target_field ] ),
                                "Table $table_name INDEX target field $target_field inserted succesfully",
                                "Failed to insert table $table_name INDEX target field $target_field into records"
                            );                             
                        }

                    } elseif ($constraint->type == Constraint::CHECK) {

                        // -----------------------------------------------------
                        // CREATE TABLE Checks (
                        //
                        //    table_id         INT NOT NULL,
                        //    target_field     VARCHAR(256) NOT NULL,
                        //    expression       VARCHAR(512) NOT NULL,
                        //    name             VARCHAR(256),
                        //    PRIMARY KEY( table_id, target_field ),
                        //    FOREIGN KEY(target_field) REFERENCES Fields(name)
                        //    ON UPDATE CASCADE
                        //    ON DELETE CASCADE
                        //    
                        //  );
                        // -----------------------------------------------------

                        $target_field = $constraint->target_field;
                        $expression   = $constraint->expression();

                        // ------------------------------
                        // Insert the CHECK constraint
                        // Test and log the write result
                        // ------------------------------
                        
                        $result["msg"][] = self::write_test
                        (
                            $this->conn->write
                            ( $constraint->insert_stmt(), [ $table_id, $field_name, $expression ] ),
                            "Table $table_name CHECK $field_name ($expression) inserted succesfully",
                            "Failed to insert Table $table_name CHECK $field_name ($expression) to the records"
                        );

                    } //----------------------------
                     // - End IF
                    //______________________________


                } // --------------------------------------------------------------------------
                 // - End of table constraint loop - foreach ($consraint_list as $constraint)
                // ----------------------------------------------------------------------------  
                 
               
            } // ----------------------------
             // - End of foreach table_list
            // ---------------------------

            $this->conn->commit();
            $commit = true;
            $record[ 'msg' ] = "Record entries created and committed";

        } catch ( Exception $e ) {

            // -------------------------------------------
            // Exception occured, execute rollback:
            // (1) Drop the individual table
            // (2) Rollback the Apigen schema transaction
            // --------------------------------------------

            if ( ! is_null( $this->conn ) ) {

                if ( ! $didExist ) $this->conn->dropDatabase( $dbname );

                if ( $this->conn->inTransaction() ) 
                {
                    $this->conn->rollback();
                    $commit = false;
                }
            }

            $result[ 'error' ][] = 'All actions reverted';
            $result[ 'error' ][] = $e->getMessage();
        }

        // --------------------------------------------------
        // Return the result log with commit result
        // --------------------------------------------------

        return self::insert_success( $result, $commit );
    }

    /**
     * Execute SELECT statement in database, return the
     * Query result
     * 
     * @return array
     */
    public function read()
    {

        // -------------------------------------------------------
        // - Check if the user_id is defined, this is the prerequisite 
        // - For the SELECT query to work
        // -------------------------------------------------------

        if ( $this->user_id )
        {
            $hasTitle = false;
            $stmt = "SELECT * FROM Apis WHERE user_id=:user_id";

            // ---------------------------------------------------
            // - If 'title' (Api name) is defined, concatenate a 
            // - WHERE clause To the SELECT statement
            // ---------------------------------------------------

            if (strlen($this->title))
            {
                $hasTitle = true;
                $stmt .= " AND name=:name";
            }

            // ---------------------------------------------------
            // - When the 'title' is present, call:
            // - 'read_api_by_title_and_user_id'
            // ---------------------------------------------------

            if ( $hasTitle ) return $this->read_api_by_title_and_user_id( $this->user_id, $this->title );

            // ---------------------------------------------------
            // - When only 'user_id' is present, call:
            // - 'read_apis_by_user_id'
            // ---------------------------------------------------

            return $this->read_apis_by_user_id( $this->user_id ); 
        }

        // ---------------------------------------------------
        // - 'user_id' is not defined, return the default
        // - Error set, with a unique message
        // ---------------------------------------------------

        return self::fail( 'Error at SchemaModel::read: invalid user_id' );
    }


    /**
     * Retrieve all Apis indentified by user_id
     * 
     * @param  integer $user_id
     * @return array   list of Api data sets
     */
    public function read_apis_by_user_id( $user_id )
    {
        return $this->conn->read
        (
            "SELECT * FROM Apis WHERE user_id=:user_id" , [ 'user_id' => $user_id ] 
        );
    }

    /**
     * Retrieve Api indentified by title and user_id
     * 
     * @param  string  $title
     * @param  integer $user_id
     * @return array   Api data set
     */
    public function read_api_by_title_and_user_id($user_id, $title)
    {
        $result = [];

        // ------------------------------------------
        // - Fetch an Api from 'Apis' table 
        // ------------------------------------------

        $read_result = $this->conn->read
        (
            "SELECT * FROM Apis WHERE user_id=:user_id AND name=:name", 
            [ 'user_id' => $user_id, 'name' => $title]
        );

        // ------------------------------------------
        // - Test the query result
        // ------------------------------------------

        $result[ 'msg' ][] = self::read_test
        (
            $read_result,
            'api_id',
            'Api identifier "api_id" retrived succesfully, reading Tables indetified by it',
            'Failed to retrieva the Api identifier "api_id"'       
        );

        // ------------------------------------------
        // - Store
        // - Api identifier "api_id"
        // - Api title      "name"
        // ------------------------------------------

        $api_id    = $read_result[ 0 ][ 'api_id' ];
        $api_title = $read_result[ 0 ][ 'name' ];

        $api = 
        [
            "title"  => $api_title,
            "id"     => $api_id,
            "tables" => null,
            "models" => null
        ];

        // -----------------------------------------
        // - Fetch the tables from table 'Tables'
        // - Identified by the "api_id"
        // ------------------------------------------

        $table_list = $this->conn->read
        (
            "SELECT * FROM Tables WHERE api_id=:api_id",
            [ 'api_id' => $api_id ]
        );

        foreach ( $table_list as $table ) {

            // -----------------------------------------
            // - Iterate through the tables, grab fields
            // - 'table_id' and
            // - 'name'
            // - Use these in the nested queries
            // ------------------------------------------

            $table_id   = $table['table_id'];
            $table_name = $table['name'];

            $api[ 'tables' ][ $table_id ] =
            [
                "table_id"     => $table_id,
                "title"        => $table_name,
                "fields"       => null,       
                "primary_keys" => null,
                "foreign_keys" => null,
                "indices"      => null,
                "checks"       => null,
                "defaults"     => null
            ];

            // -----------------------------------------
            // - Fetch the fields from table 'Fields'
            // - Identified by the current 'table_id'
            // ------------------------------------------

            $api[ 'tables' ][ $table_id ][ 'fields' ] = $this->fetch_table
            (
                'Fields', 
                [ 'table_id', $table_id ], 
                [ 
                    'key', 
                    'type', 
                    'size', 
                    'notnull', 
                    'default_value', 
                    'autoinc' 
                ]
            );

            // ------------------------------------------
            // - Fetch the table constraints from tables:
            // - PrimaryKeys
            // - ForeignKeys
            // - Indices
            // - Checks
            // - Defaults
            // - Identified by current 'table_id'
            // ------------------------------------------
            // ------------------------------------------
            // - Begin with PrimaryKeys
            // - Fetch them from 'PrimaryKeys' table
            // ------------------------------------------

            $api[ 'tables' ][ $table_id ][ 'primary_keys' ] 
            = fetch_table( 'PrimaryKeys', [ 'table_id', $table_id ], [ 'table_id', 'target_field' ] );

            // --------------------------------------------------
            // - Fetch Foreign Keys from the 'ForeignKeys' table
            // --------------------------------------------------

            $api[ 'tables' ][ $table_id ][ 'foreign_keys' ] = fetch_table
            (
                'ForeignKeys', 
                [ 'table_id', $table_id ], 
                [ 
                    'table_id', 
                    'target_field', 
                    'reference_table', 
                    'reference_field', 
                    'on_delete', 
                    'on_update' 
                ]
            );

            // --------------------------------------------------
            // - Fetch Indices from the 'Indices table
            // --------------------------------------------------

            $api[ 'tables' ][ $table_id ][ 'indices' ] 
            = fetch_table( 'Indices', [ 'table_id', $table_id ], [ 'table_id', 'target_field', 'name' ] );
            
            // --------------------------------------------------
            // - Fetch Checks from the 'Checks' table
            // --------------------------------------------------

            $api[ 'tables' ][ $table_id ][ 'checks' ] 
            = fetch_table( 'Checks', [ 'table_id', $table_id ], [ 'table_id', 'target_field', 'expression', 'name' ] );
          

        } // ----------------------------------------
         // - End foreach ( $table_list as $table )
        // ------------------------------------------

        $result[ 'api' ] = $api;

        return self::select_success( $result );

    } // --------------------------------------------
     // -
    // - End of method 'read_api_by_title_and_user_id'
   //________________________________________________


    /**
     * 
     */
    public function readAll($user_id)
    {

        $apiMapObj = null;

        // - (1) Fetch Api, api_id by Api.title, 
        $apiList = 
        $this->conn->read(
            "SELECT * FROM Apis WHERE user_id=:user_id", 
            [ "user_id" => $user_id ]
        );

        foreach ($apiList as $api)
        {
            $api_title = $api['name'];
            $api_id    = $api['api_id'];

            $apiMapObj[$api_title] =
            [
                "title"  => $api_title,
                "id"     => $api_id,
                "tables" => null,
                "models" => null
            ];

            // - (2) Fetch Tables by api_id
            $tableList = 
            $this->conn->read
            (
                "SELECT * FROM Tables WHERE api_id=:api_id",
                [ "api_id" => $api_id ]
            );

            foreach ($tableList as $table)
            {
                $table_id   = $table['table_id'];
                $table_name = $table['name'];

                $apiMapObj[$api_title]["tables"][$table_id] =
                [
                    "table_id"    => $table_id,
                    "title"       => $table_name,
                    "pk"          => null,
                    "fields"      => null,       
                    "fks"         => null,
                    "constraints" => null
                ];

                $fieldList =
                $this->conn->read
                (
                    "SELECT * FROM Fields WHERE table_id=:table_id",
                    ["table_id" => $table_id]
                );

                foreach ($fieldList as $field)
                {
                    $apiMapObj[$api_title]["tables"][$table_id]["fields"][] =
                    [
                        "key"        => $field['name'],
                        "type"       => $field['type'],
                        "size"       => $field['size'],
                        "constraint" => $field['cn'],
                        "nullable"   => $field['nullable']
                    ];
                }

                $constraintList =
                $this->conn->read
                (
                    "SELECT * FROM Constraints WHERE table_id=:table_id",
                    [ "table_id" => $table_id ]
                );

                foreach ($constraintList as $constraint)
                {
                    $apiMapObj[$api_title]["tables"][$table_id]["constraints"][] =
                    [
                        "type"       => $constraint['type'],
                        "target"     => $constraint['target']
                    ];                
                }

                $pkFields =
                $this->conn->read
                (
                    "SELECT field_id FROM PrimaryKeys WHERE table_id=:table_id",
                    ["table_id" => $table_id]
                );

                foreach ($pkFields as $pk) 
                {
                    $apiMapObj[$api_title]["tables"][$table_id]["pk"][] = $pk['field_id'];
                }

                $fkList =
                $this->conn->read
                (
                    "SELECT * FROM ForeignKeys WHERE table_id=:table_id",
                    ["table_id" => $table_id]
                );

                foreach ($fkList as $fk) 
                {
                    $apiMapObj[$api_title]["tables"][$table_id]["fks"][] = 
                    [
                        "field_id" => $fk["field_id"],
                        "reference_table" => $fk["reference_table"],
                        "reference_field" => $fk["reference_field"],
                        "on_delete" => $fk["on_delete"],
                        "on_update" => $fk["on_update"]
                    ];
                }
            }
        }

        return $apiMapObj;
    }

    /**
     * Parses the HTTP PUT request body, attempts to create
     * an Api object from the data.
     * Updates the individual database
     * 
     * @param  string  $input
     * @return array   $result
     */
    public function update($input)
    {

        // ---------------------------------------------------
        // -
        // - Begin by parsing the update action.
        // -
        // - The list of the possible update actions:
        // - ----------------------------------------
        // - (1) Add a table
        // - (2) Rename a table
        // - (3) Remove a table
        // - ----------------
        // - (4) Add a field to a table
        // - (5) Modify a field name, datatype, field constraint
        // - (6) Remove a field
        // ----------------------------------------------------
        // - (7) Add a table constraint
        // - (8) Modify a table constraint
        // - (9) Remove a table constraint
        // --------------------------------
        // - (10) Add a model
        // - (11) Modify a model
        // - (12) Remove a model
        // -----------------------------------------------------

        $result[ 'msg' ][] = "Begin to parse HTTP PUT Request to Apigen schema model";

        $action = '';

        try
        {
            include 'Api.php';

            $data = json_decode( $input, $true );
            $result[ 'msg' ][] = "Request payload parsed, trying to retrive to update action";

            // -------------------------------------------------------------------
            // - No table entry found in payload
            // -------------------------------------------------------------------

            if ( ! isset ( $data[ '_table' ] ) )
            {
                throw new Exception( 'Bad request: no table pointer found' );
            } 
 
            $table_data = $data[ '_table' ];

            // -------------------------------------------------------------------
            // - No table name found in payload
            // -------------------------------------------------------------------
            
            if ( ! isset( $table_data[ '_name' ] ) )
            {
                throw new Exception( 'Bad request: no table name given' );
            }

            $table_name = $table_data[ '_name' ];


            if ( isset( $table_data[ '_action' ] ) )
            {

                // -------------------------------------------------------------------
                // - Action under table data
                // -------------------------------------------------------------------

                $action = $data[ '_action' ];
                $result[ 'msg' ][] = "Table action found: " . $data[ '_action' ];


            } else {

                // -------------------------------------------------------------------
                // - No action found in table section, look for action
                // - In field list or in table constraint list
                // -------------------------------------------------------------------  

                $result[ 'msg' ][] = 'No table action found, search for field action';

                if ( isset ( $table_data[ '_fieldList' ] ) ) {

                    // ------------------------------------------------
                    // - Field list found, look for action entry
                    // ------------------------------------------------

                    $field_data = $table_data[ '_fieldList' ];
                    $result[ 'msg' ][] = 'Field list found, search for action';

                    // -------------------------------------------------
                    // - No action entry found
                    // -------------------------------------------------

                    if ( ! isset( $field_data[ '_action' ] ) ) throw new Exception( 'No action found' );

                    //$action = $field_data[ '_action' ];
                    $result[ 'msg' ][] = "Field action found: " . ( $action = $field_data[ '_action' ] ); 

                    if ( 'add'    === $action ) {

                        // ---------------------------------------------
                        // - Execute "add" action for Field
                        // --------------------------------------------- 

                        $this->add_field_list( $table_name, $field_data );

                    } elseif ( 'modify' === $action ) {

                        // ---------------------------------------------
                        // - Look for "modify" action
                        // ---------------------------------------------

                    } elseif ( 'remove' === $action ) {

                        // ---------------------------------------------
                        // - Look for "remove" action
                        // ---------------------------------------------   

                    } else {

                        // ---------------------------------------------
                        // - Action value unknown, throw an Exception
                        // ---------------------------------------------

                        throw new Exception( ( $result[ 'error' ][] = 'Unknow action' ) );

                    }
                    
                } elseif ( isset( $table_data[ '_constraintList' ] ) ) {

                    // ---------------------------------------------------------------
                    // - Constraint list found, look for action entry
                    // ---------------------------------------------------------------

                    $constraint_data   = $table_data[ '_constraintList' ];
                    $result[ 'msg' ][] = 'Constraint list found, search for action';

                    if ( ! isset( $field_data[ '_action' ] ) ) throw new Exception( 'No action found' );

                    $action = $constraint_data[ '_action' ];
                    $result[ 'msg' ][] = "Constraint action found: $action"; 

                } else throw new Exception( 'No action found' );

                
            }


        } catch ( Exception $e ) {



        }
    }

    /**
     * Removes an API resource from the Apigen schema record database
     * And drops the individual database
     * 
     * @param  string  $params
     */ 
    public function delete($params = "")
    {
        return "id=10";
    }

    /**
     * Writes a list of Field objects into Schema database
     * 
     * @param  array   $field_list
     * @param  integer $table_id
     * @return array
     */
    protected function add_field_list_to_schema( $field_list, $table_id )
    {

        $result = [];

        try {

            $this->conn->beginTransaction();

            foreach ( $field_list as $field_array ) 
            {

                $field = Field::create_from_array( $field_array );

                // --------------------------------------------
                // - Check that the field does not exist
                // --------------------------------------------

                $read_result = $this->conn->read( $field->select_stmt(), [ $field->title(), $table_id ] );

                $result[ 'msg' ][] = self::read_test
                (
                    $read_result, 
                    'field_id', 
                    'field '  .  $field->title() . ' was created',
                    'field '  .  $field->title() . ' already existed'
                );

                // --------------------------------------------
                // - Write a field into table
                // --------------------------------------------

                $write_result = $this->conn->write
                (
                    $field->insert_stmt(), 
                    [
                        $field->title(), 
                        $field->type(), 
                        $field->size(), 
                        $table_id, 
                        $field->notnull(), 
                        $field->default_value(),
                        $field->autoinc()
                    ]
                );

                // --------------------------------------------
                // - Write a field into table
                // --------------------------------------------

                $result[ 'msg' ][] = self::write_test
                (
                    $write_result,
                    'Field' . $field->title() . ' recorded to schema',
                    'Failed to add field' . $field->title() . ' into schema records'
                );
            }

            $this->conn->commit();
            $result[ 'transactions' ] = 'committed';

        } catch ( Exception $e ) {

            $result[ 'error' ] = $e->getMessage();
                        
            if( $this->conn->inTransaction() )
            {
                $this->conn->rollback();
                $result[ 'transactions' ] = "rolled back";
            }
        }

        return $result;
    }

    /**
     * 
     * 
     * 
     */
    protected function add_field_list_to_api($field_list, $table_name)
    {
        $dbname = self::PREFIX . $this->username . "::" . $this->apiname;

        $result = [];

        try 
        {

            if ( ! $this->conn->doesTableExist($table_name) ) 
            {
                throw new Exception("Table $table_name does not exist");
            }

            $this->conn->beginTransaction();

            foreach ($field_list as $field) 
            {
                $read_result = $this->conn->query( "SELECT $field FROM $table_name" );
                $result[ 'msg' ][] = self::read_test
                (
                    $read_result, 
                    'field_id', 
                    'field '  .  $field->title() . ' was created',
                    'field '  .  $field->title() . ' already existed'
                );

                $stmt = "ALTER TABLE $table_name ADD COLUMN " . $field->ddl();
            }

            $this->conn->commit();
            $result[ 'transactions' ] = 'Committed';

        } catch ( Exception $e ) {

            $result[ 'error' ] = $e->getMessage();

            if ( $this->conn->inTransaction() )
            {
                $this->conn->rollback();
                $result[ 'transactions' ] = "Rolled back";
            }

        }
    }

    /**
     * Reads from a table using one identifier,
     * Stores results to a storage array, 
     * using the field names provided in field_list
     * 
     * @param  string  $table
     * @param  array   $identifier_set
     * @param  array   $field_list
     * @return array   $results
     */
    protected function fetch_table( $table, $identifier_set, $field_list )
    {

        $return_list = [];

        // --------------------------------------------------
        // - Fetch Checks from the 'Checks' table
        // --------------------------------------------------

        $id_title = $identifier_set[ 'title' ];
        $id_value = $identifier_set[ 'value' ];

        $result_list = $this->conn->read
        (
            "SELECT * FROM $table WHERE $id_title=:$id_title",
            [ $id_title => $id_value ]
        );

        // ------------------------------------------
        // - Store the results
        // ------------------------------------------

        foreach ( $result_list as $result ) 
        {

            $list = [];
            foreach ( $field_list as $field )
            {
                $list[ $field ] = $result[ $field ];
            }

            $return_list[] = $list;
        }
        
        return $result_list;
    }

    /**
     * 
     */
    protected static function find_action($source)
    {
        if ( ! isset( $source[ '_action' ] ) )
        {
            throw new Exception( 'No action found' );
        }

        return $source[ '_action' ];
    }
  
    
    /**
     * Tests the result of an INSERT query
     * Outcome:
     * On success does return the $on_success string
     * On error throws exception with $on_error string
     * 
     * @param  {array}   $write_result
     * @param  {string}  $on_success
     * @param  {string}  $on_error
     * @return {string}
     * @throws Exception
     */
    public static function write_test( $write_result, $on_success, $on_error )
    {
        if ( isset( $write_result[ 'error' ] ) )
        {
            throw new Exception( $on_error . $write_result[ 'error' ] );
        }

        return $on_success . PHP_EOL . 'Affected rows: ' . $write_result[ 'affected' ];
    }

    /**
     * Tests the result of a SELECT query
     * Outcome:
     * On success does return the $on_success string
     * On error throws exception with $on_error string
     * 
     * @param  {array}   $read_result
     * @param  {string}  $column_key
     * @param  {string}  $on_success
     * @param  {string}  $on_error
     * @return {string}
     * @throws Exception
     */ 
    public static function read_test( $read_result, $column_key, $on_success, $on_error )
    {
        if ( count( $read_result ) == 0 || ! isset( $read_result[ 0 ][ $column_key ] ) )
        {
            throw new Exception( $on_error ); 
        }

        return $on_success;
    }


    /**
     * Default success return function
     * For insert method
     * 
     * @param  array   $result
     * @param  boolean $commit
     * @return array
     */
    public static function insert_success( $result, $commit )
    {
        return [

            "transaction" => $commit ? "committed" : "rolled back",
            "result"      => $result

        ];
    }

    /**
     * Default success return function
     * For SELECT method
     * 
     * @param  array   $result
     * @return array
     */
    public static function select_success( $result )
    {
        return [

            'result'      => $result,
            'success'     => true

        ];
    }

    /**
     * Default error return function
     * 
     * @param  string $msg
     * @return array 
     */
    public static function fail( $msg )
    {
        return [ 'msg' => $msg, 'success' => 'fail' ];
    }    
}