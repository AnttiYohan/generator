<?php

include "APIConnection.php";

$body = '{"_name":"otherAPI","_tableList":[{"_name":"Users","_fieldList":[{"_key":"user_id","_size":0,"_type":"INTEGER","_typeRef":512,"_constraintList":[{"_type":"AUTO_INCREMENT","_targetTable":"Users","_targetField":"user_id","_step":1}],"_parent":"Users"},{"_key":"username","_size":64,"_type":"VARCHAR","_typeRef":1024,"_constraintList":[{"_type":"NOT NULL","_targetTable":"Users","_targetField":"username"}],"_parent":"Users"},{"_key":"password","_size":64,"_type":"VARCHAR","_typeRef":1024,"_constraintList":[{"_type":"NOT NULL","_targetTable":"Users","_targetField":"password"}],"_parent":"Users"}],"_constraintList":[{"_type":"PRIMARY KEY","_targetTable":"Users","_targetField":"user_id","_fieldList":["user_id"]}]},{"_name":"Projects","_fieldList":[{"_key":"project_id","_size":0,"_type":"INTEGER","_typeRef":512,"_constraintList":[{"_type":"AUTO_INCREMENT","_targetTable":"Projects","_targetField":"project_id","_step":1}],"_parent":"Projects"},{"_key":"name","_size":64,"_type":"VARCHAR","_typeRef":1024,"_constraintList":[{"_type":"NOT NULL","_targetTable":"Projects","_targetField":"name"}],"_parent":"Projects"},{"_key":"user_id","_size":64,"_type":"INTEGER","_typeRef":512,"_constraintList":[{"_type":"NOT NULL","_targetTable":"Projects","_targetField":"user_id"}],"_parent":"Projects"}],"_constraintList":[{"_type":"PRIMARY KEY","_targetTable":"Projects","_targetField":"project_id","_fieldList":["project_id"]},{"_type":"FOREIGN KEY","_targetTable":"Projects","_targetField":"user_id","_referenceTable":"Users","_referenceField":"user_id","_onUpdate":"CASCADE","_onDelete":"CASCADE"}]},{"_name":"Dirs","_fieldList":[{"_key":"dir_id","_size":0,"_type":"INTEGER","_typeRef":512,"_constraintList":[{"_type":"AUTO_INCREMENT","_targetTable":"Dirs","_targetField":"dir_id","_step":1}],"_parent":"Dirs"},{"_key":"name","_size":64,"_type":"VARCHAR","_typeRef":1024,"_constraintList":[{"_type":"NOT NULL","_targetTable":"Dirs","_targetField":"name"}],"_parent":"Dirs"},{"_key":"parent_id","_size":0,"_type":"INTEGER","_typeRef":512,"_constraintList":[{"_type":"NOT NULL","_targetTable":"Dirs","_targetField":"parent_id"}],"_parent":"Dirs"},{"_key":"project_id","_size":0,"_type":"INTEGER","_typeRef":512,"_constraintList":[{"_type":"NOT NULL","_targetTable":"Dirs","_targetField":"project_id"}],"_parent":"Dirs"}],"_constraintList":[{"_type":"PRIMARY KEY","_targetTable":"Dirs","_targetField":"dir_id","_fieldList":["dir_id"]},{"_type":"FOREIGN KEY","_targetTable":"Dirs","_targetField":"dir_id","_referenceTable":"Projects","_referenceField":"project_id","_onUpdate":"CASCADE","_onDelete":"CASCADE"}]}],"_modelList":[]}';


include "Api.php";

$api = new Api();
$api->load_from_json($body);

// - POST test with API
$url = "apigen.local/content/animalAPI/owners?item1=content1&item2=content2";



$path  = parse_url($url, PHP_URL_PATH);
$query = parse_url($url, PHP_URL_QUERY);

echo PHP_EOL . "path: " . PHP_EOL;
print_r($path);
echo PHP_EOL . "query: " . PHP_EOL;
print_r($query);
/*
print_r(explode("/", $url));


include "./controller/PostController.php";
$connection = new APIConnection();
$controller = new PostController($url, $connection);
echo json_encode($controller->execute($api));
*/