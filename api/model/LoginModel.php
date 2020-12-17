<?php

/**
 * The Login Model
 * 
 * @method create
 */
class LoginModel extends Model
{


    /**
     * Login Model constructor
     * 
     * @param  ApiConnection $conn
     * @param  string        $username
     * @param  string        $apiname
     * @param  integer       $version
     */
    public function __construct($conn, $username, $apiname, $version, $query)
    {
        parent::__construct($conn, $username, $apiname, $version, $query);
    }

    /**
     * Reads the user from the Apigen Shchema, returns the user data
     * When the email and password are valid for the user
     * 
     * @param  array  $params
     * @return array  $result
     */
    public function create($input)
    {
        $result = [];
        $auth   = json_decode( $input, true );

        if ($auth !== NULL)
        {
            if ( isset( $auth[ 'email' ] )  && isset( $auth[ 'password' ] ) )
            {
                try {

                    // ------------------------------------------
                    // - Attempt to read the Apigen record database
                    // - Users table in order to authenticate
                    // ------------------------------------------


                    $this->conn->useDb( 'Apigen' );

                    $read_result = $this->conn->read
                    (
                        "SELECT user_id, username, email FROM Users WHERE email=:email AND password=:password", 
                        [ 
                            'email'    => $auth[ 'email' ], 
                            'password' => $auth[ 'password' ]
                        ] 
                    );

                    $result[ 'auth' ] = count( $read_result ) ? $read_result[ 0 ] : 'No authentication';

                } catch(Exception $e) {

                    $result[ 'msg' ][] = "Server error, try again";
                    $result[ 'error' ] = $e->getMessage();

                }

            } else {

                // ------------------------------------------
                // - Email and Password were not present 
                // - in the request payload
                // ------------------------------------------

                $result[ 'msg' ][] = "Please enter both Email and Password";
            }

        } else {

            // ------------------------------------------
            // - Request payload JSON Parsing didn't work
            // - Send an error message
            // ------------------------------------------

            $result[ 'msg' ][] = "No action";
            $result[ 'error' ] = "Malformed HTTP Request";
        }

        return $result;
    }

    /**
     * Method not in use, throws bad request Exception
     * 
     * @param  array  $input
     * @throws Exception
     */  
    public function read()
    {
        throw new Exception( 'Bad request' );
    }

    /**
     * Method not in user, throws bad request Exception
     * 
     * @param  array  $input
     * @throws Exception
     */    
    public function update($params)
    {
        throw new Exception( 'Bad request' );
    }

    /**
     * Method not in user, throws bad request Exception
     * 
     * @param  array  $params
     * @throws Exception
     */    
    public function delete($params)
    {
        throw new Exception( 'Bad request' );
    }    
}