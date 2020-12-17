<?php

class Controller
{
    // -------------------------------
    // - Properties
    // -------------------------------

    protected $model  = "";
    protected $action = "";


    /**
     * Controller constructor
     * 
     * @param  ApiConnection  $conn
     * @param  string         $url
     * @throws Exception
     */
    public function __construct( $connection, $url )
    {
        $path    = parse_url( $url, PHP_URL_PATH );
        $query   = parse_url( $url, PHP_URL_QUERY );
        $subpath = explode( '/', $path );

        $action   = '';
        $username = '';
        $apiname  = '';
        $version  = 1; 

        // --------------------------------------------------------------
        // - Parse the required parts from the url path.
        // - Path parts consist of:
        // - (1) Model
        // - (2) Username
        // - (3) Api
        // - (4) Version
        // - https://apigen.tech/{model}/{username}/{apiname}/{version}
        // - https://apigen.tech/schema/joe/weather/v2
        // --------------------------------------------------------------

        if ( isset( $subpath[1] ) )
        {
            $action = $subpath[1];

            if ( isset($subpath[2]) ) $username = $subpath[2];
            if ( isset($subpath[3]) ) $apiname  = $subpath[3];
            if ( isset($subpath[4]) ) $version  = $subpath[4];          
        }
        else
        {
            throw new Exception( 'Malformed path, no action found' );
        }

        $this->create_model( $connection, $action, $username, $apiname, $version, $query );
    }

    /**
     * Creates a model from the path parameters
     * Pass the ApiConnection obect to the model
     * 
     * @param  ApiConnection $conn
     * @param  string        $action
     * @param  string        $username
     * @param  string        $apiname
     * @param  integer       $version
     * @param  array         $query
     * @throws Exception
     */
    public function create_model( $connection, $action, $username, $apiname, $version, $query )
    {
        $model = ucfirst( strtolower( $action ) ) . 'Model';
 
        try
        {
            include 'model/' . $model . '.php';
            $this->model = new $model( $connection, $username, $apiname, $version, $query );
        }
        catch ( Exception $e )
        {
            throw new Exception( 'Error at Controller::create_model - ' . __FILE__ . ':' . __LINE__ );
        }
    }
}