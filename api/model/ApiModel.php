<?php

/**
 * Model for the Api database data creation, retrieval, update and removal
 * The path for requests:
 * https://apigen.tech/api/{username}/{apiname}/{version}?{querystring}
 * 
 * example:
 * https://apigen.tech/api/joe/weatherapi/v2?model=default
 */
class ApiModel extends Model
{


    // -------------------------------
    // - Properties:
    // - 1) Database connection manager reference "APIConnection.php"
    // - 2) The user id
    // -------------------------------

    protected $conn       = null;
    protected $query      = "";
    protected $apiName    = "";
    protected $tableName  = "";
    protected $queryModel = "";


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
        // ----------------------------------------------------------
        // - Check that the username, apiname and the version
        // - Are valid, otherwise throw en Exception
        // ----------------------------------------------------------


        //if (empty($username)) throw new Exception("Malformed username");

        parent::__construct($conn, $username, $apiname, $version, $query);
    }


    /**
     * Returns the truth value of database and table existence
     * 
     * @return bool
     */
    public function validateRequestAndUseDb()
    {
        $retval = FALSE;

        if ($this->conn->doesDatabaseExist($this->apiname))
        {
            $this->conn->useDatabase($this->apiName);

            if ($this->conn->doesDatabaseExist($this->tableName))
            {
                $retval = TRUE;
            }
        }

        return $retval;
    }

    /**
     * Uses database if it exists, returns the existence truth value
     * 
     * @return bool
     */
    public function useDatabase()
    {
        $result = false;

        if ( $this->conn->doesDatabaseExist( $this->apiname ) )
        {
            $this->conn->useDatabase( $this->apiname );

            $result = true;
        }

        return $result;
    }


    /**
     * Create new entries to a user defined AGDB__ databases
     * 
     * @param  string $content
     * @return string IOStatus
     */
    public function create( $input )
    {

        $this->append_log( 'Begin to parse HTTP POST payload at ApiModel::create()' );

        try {

            include "RequestParser.php";
            include "ContentReader.php";

            $this->append_log( 'Parser files included' );
    
            $blockList = RequestParser::getMultipartBlocks( $input );
            array_shift( $blockList );
            
            $reader = new ContentReader();
            
            $this->append_log( 'Content reader instantiated' );

            if ( $blockList[ 0 ][ "Content-Type" ] === "application/json" )
            {

                $this->append_log( 'First part content type is "application/json"' );

                $contentStruct = json_decode( $blockList[ 0 ][ "content" ], true) ;
            
                if ( $contentStruct )
                {

                    $this->append_log( 'content parsed from JSON' );

                    $reader->loadFileList( $blockList );
                    $reader->parseApi( $contentStruct );
                    

                } else throw new Exception( 'JSON content parsing failed' );

            } else throw new Exception( 'Application type is not "application/json' );
  
        } catch ( Exception $e ) {

            return $this->append_log( $e->getMessage(), 'error' );

        }

        // --------------------------------------------
        // - Wrap every statement into a transacction
        // - So we can roll back if an error occurs
        // -------------------------------------------- 

        $commit = false;

        if ( $this->useDatabase() )
        {
            $this->append_log( 'Database changed: ' . $this->apiname );

            try {

                $this->conn->beginTransaction();
                $this->append_log( 'Transaction begun' );

                foreach( $reader->tableList() as $table )
                {

                    // ---------------------------------------
                    // - Iterate through the tables
                    // ---------------------------------------

                    $this->append_log( 'Working with table: ' . $table->tableName );
                    $affectedRows = 0;

                    foreach( $table->pdo_insert_list() as $stmt )
                    {
                        $this->append_log( 'Statement: ' . $stmt[ 'prepare' ] );
                        $write_result = $this->conn->write($stmt["prepare"], $stmt["execute"]);
                        $this->append_log( 'Affected rows: ' . $write_result );

                        $attectedRows += $result;
                    }

                    $this->append_log( $affected_rows . ' rows inserted into ' . $table->tableName );

                }

                $this->conn->commit();
                $commit = true;
                $this->append_log( 'Transacion committed' );


            } catch(Exception $e) {

                $this->conn->rollback();
                $commit = false;

                $this->append_log( $e->getMessage(), 'error' );

            }

        } else $this->append_log( 'database cannot be used: ' . $this->apiname, 'error' );

        
        return
        [
            "transaction" => $commit ? "committed" : "rolled back",
            "result"      => $this->get_log()
        ];
    }

    /**
     * GET Requet handler
     * Retrives the Api model and executes the queries that are
     * Stored into it
     * 
     * 
     * @return string
     */
    public function read()
    {
        $result = [];

        $json =
        '{
            "name":     "project",
            "table":    "Users",
            "group-by": "username",
            "display":
            [
               {
                   "field": "username"
               }
            ],
            "result": "user_id",
            "children":
            [
                {
                    "result-alias": "author_id",
                    "table":    "Projects",
                    "group-by": "author_id",
                    "display":
                    [
                        {
                            "field": "name"
                        }
                    ],
                    "result":   "project_id",
                    "children":
                    [
                        {
                            "table":     "Dirs",
                            "group-by":  "project_id",
                            "result":    "dir_id",
                            "children":
                            [
                                {
                                    "table":    "Files",
                                    "group-by": "dir_id",
                                    "result"  : "*",
                                    "display":
                                    [
                                       
                                    ]
                                }
                            ]
                        }
                    ]
                }
            ]
        }';

        if ( ! $this->useDatabase() ) {
            
            $this->error_log( 'Database ' . $this->apiname . ' does not exist' );

        } else {

            $this->append_log( 'Database ' . $this->apiname . 'found, begin to parse the json' );

            try {

                include "ModelParser.php";
                $model_parser   = new ModelParser( $json, $this->username );
                $result["data"] = $this->readModel( $model_parser->model );

            } catch ( Exception $e ) {  $this->error_log( $e->getMessage() ); }
        }

        return $result;
    }


    /**
     * Depth First Search traversal for database model
     * in order to perform nested queries
     * 
     * @param {ModelTable} $model
     */
    public function readModelDfs($model)
    {
        $key = $model->result;
        $result_list = $this->conn->read($model->query, [ $model->param ]);

        if (count($result_list)) foreach ($result_list as $result)
        {
            $childParam = isset($result[$key]) ? $result[$key] : "";
            
            if (count($model->children)) foreach ($model->children as $child)
            {
                $child->setParam($childParam);
                $this->readModel($child);
            }    
        }

        return $result_list;
    }

    /**
     * Execute UPDATE statement in database, return the
     * Query result
     * 
     * @param  array  $params
     * @return string
     */
    public function update($table)
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