<?php


function read_user_api_list()
{
    include_once "APIConnection.php";
    $db  = new APIConnection();  

    $sql = "SELECT * FROM Apis WHERE user_id=1"; // WHERE user_id=";

    $res = $db->query($sql);

    //print_r($res);
    return $res;
}
