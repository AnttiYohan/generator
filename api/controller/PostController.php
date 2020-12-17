<?php

include 'Controller.php';

/**
 * HTTP Web Server Controller for POST request handling
 */
class PostController extends Controller
{

    /**
     * Pass the request uri to the parent constructor
     * A proper Model instance is invoked and set
     * into class property $this->model
     * The HTTP Request body data is passed into model
     * 
     * @param  ApiConnection  $connection
     * @param  string         $url
     *
     *
     * 
     */
    
    public function __construct( $connection, $url )
    {
        parent::__construct( $connection, $url );
    }
    

    /**
     * Calls the model instances POST/create method
     * And returns the result
     * 
     * @return object
     */    
    public function execute( $dataModel = '' )
    {

        // Pass the input to the model
        $input = file_get_contents( 'php://input' );
        return $this->model->create( $input );
    }

    public function executeWithMockBody($body)
    {
        return $this->model->create($body);
    }
}