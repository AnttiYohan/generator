<?php

/**
 * Invokes a proper controller instance by detecting
 * The current HTTP Method.
 * Doing this we are able to repond correctly to the
 * HTTP Request
 */
class Dispatcher
{

    const TAG			= "dispatcher";

    /**
     * Return proper controller for request
     * 
     * @param  ApiConnection $conn
     * @param  string        $url
     * @return Controller
     */
    public static function controller( $connection, $url )
    {
        $controller = ucfirst( strtolower( $_SERVER[ 'REQUEST_METHOD' ] ) ) . 'Controller';
 
        try
        {
            if ( is_null( $connection ) )
            {
                throw new Exception( 'database connection is null' );
            }

            include './controller/' . $controller . '.php'; 
            return new $controller( $connection, $url );
        }
        catch ( Exception $e )
        {
            Logger::errlog( $e, __FILE__, __LINE__ );
            throw new Exception( $e->getMessage() );
        }
    }
}