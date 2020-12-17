<?php

$response   = [];
$controller = NULL;
$success    = TRUE;

try 
{
    include 'Dispatcher.php';
    include 'APIConnection.php';
    $connection = new APIConnection();
    $controller = Dispatcher::controller( $connection, $_SERVER[ 'REQUEST_URI' ] );
}
catch ( Exception $e )
{
    $success = FALSE;
    $response[ 'error' ] = $e->getMessage();
}
finally
{
    if ( $success )
    {
        try
        {
            $response[ 'data' ] = $controller->execute();
        }
        catch (Exception $e)
        {
            $response[ 'error' ] = $e->getMessage();
        }
    }

    echo json_encode( $response );
}

