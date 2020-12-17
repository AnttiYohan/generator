<?php

include "Controller.php";

/**
 * HTTP Web Server Controller for GET request handling
 */
class GetController extends Controller
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
    /*
    public function __construct($connection, $url)
    {
        parent::__construct($connection, $url);
    }
    */

    /**
     * Calls the model instance read method
     * Returns the result
     * 
     * @return array
     */
    public function execute()
    {
        return $this->model->read();
    }
}