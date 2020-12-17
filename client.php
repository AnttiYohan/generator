<?php

include "dbgen.php";

$param_test = "";
$param_test2 = NULL;
$param_test = ["this" => "nice", "that" => "cool"];

$params = [
    "table" => "Users"
];

$params2 = [
    "table" => "Users",
    "columns" => [
        "col1", "col2", "col3"
    ],    
    "where" => "id=1"
];

$p_insert = [
    "table"  => "Users",
    "values" => [
        "val1", "val2", "val3"
    ]
];

$p_insert2 = [
    "table"  => "Users",
    "values" => [
        "val1", "val2", "val3"
    ],
    "columns" => [
        "col1", "col2", "col3"
    ]
];

$p_update = [
    "table"  => "Users",
    "set" => [
        "name" => "Antti",
        "last" => "Lappalainen"
    ],
    "where" => "id=1"
];

$p_delete = [
    "table" => "Users",
    "where" => "id=1"
];

$res = DB::select_stmt($params);

print_res($res);

$res = DB::select_stmt($params2);

print_res($res);

$res = DB::insert_stmt($p_insert);

print_res($res);

$res = DB::insert_stmt($p_insert2);

print_res($res);

$res = DB::update_stmt($p_update);

print_res($res);

$res = DB::delete_stmt($p_delete);

print_res($res);

$list = '{
    "method" :
    [
        {
            "verb" : "GET",
            "name" : "read",
            "stmt" : "select * from _ where id=:id"
        },
        {
            "verb" : "POST",
            "name" : "create",
            "stmt" : "insert into _ values name=:name"
        }   
    ]
}';

$api_json=<<<'NOWW'
{
    "api" :
    {
        "name" : "prototyper",
        "table" :
        [
            {
                "name"  : "Users",
                "pk"    : "id",
                "field" :
                [
                    {
                        "name" : "id",
                        "type" : "INTEGERR",
                        "size" : "",
                        "constraint" :
                        [
                            {
                                "target" : "id",
                                "type"   : "AUTO_INCREMENT"
                            }
                        ]
                    },
                    {
                        "name" : "name",
                        "type" : "VARCHAR",
                        "size" : "64",
                        "constraint" :
                        [
                            {
                                "target" : "name",
                                "type"   : "NOT_NULL"
                            }
                        ]
                    },
                    {
                        "name" : "email",
                        "type" : "VARCHAR",
                        "size" : "256",
                        "constraint" :
                        [
                            {
                                "target" : "email",
                                "type"   : "NOT_NULL"
                            }
                        ]
                    },
                    {
                        "name" : "password",
                        "type" : "VARCHAR",
                        "size" : "64",
                        "constraint" :
                        [
                            {
                                "target" : "password",
                                "type"   : "NOT_NULL"
                            }
                        ]
                    }                     
                ]
            },
            {
                "name"  : "Projects",
                "pk"    : "id",
                "constraint" :
                [
                    {
                        "type"   : "FOREIGN_KEY",
                        "target" : "author",
                        "rules"  :
                        {
                            "references" : { "table" : "Users", "field" : "id" },
                            "on_update" : "cascade",
                            "on_delete" : "cascade" 
                        }
                    }
                ],
                "field" :
                [
                    {
                        "name" : "id",
                        "type" : "INTEGERR",
                        "size" : "",
                        "constraint" :
                        [
                            {
                                "target" : "id",
                                "type"   : "AUTO_INCREMENT"
                            }
                        ]
                    },
                    {
                        "name" : "name",
                        "type" : "VARCHAR",
                        "size" : "64",
                        "constraint" :
                        [
                            {
                                "target" : "name",
                                "type"   : "NOT_NULL"
                            }
                        ]
                    },
                    {
                        "name" : "author",
                        "type" : "INTEGERR",
                        "constraint" :
                        [
                            {
                                "target" : "author",
                                "type"   : "NOT_NULL"
                            }
                        ]
                    }                  
                ]
            },
            {
                "name"  : "Dirs",
                "pk"    : "id",
                "constraint" :
                [
                    {
                        "type"   : "FOREIGN_KEY",
                        "target" : "pr_id",
                        "rules"  :
                        {
                            "references" : { "table" : "Projects", "field" : "id" },
                            "on_update" : "cascade",
                            "on_delete" : "cascade" 
                        }
                    }
                ],
                "field" :
                [
                    {
                        "name" : "id",
                        "type" : "INTEGERR",
                        "size" : "",
                        "constraint" :
                        [
                            {
                                "target" : "id",
                                "type"   : "AUTO_INCREMENT"
                            }
                        ]
                    },
                    {
                        "name" : "name",
                        "type" : "VARCHAR",
                        "size" : "256",
                        "constraint" :
                        [
                            {
                                "target" : "name",
                                "type"   : "NOT_NULL"
                            }
                        ]
                    },
                    {
                        "name" : "parent_id",
                        "type" : "INTEGERR",
                        "constraint" :
                        [
                            {
                                "target" : "parent_id",
                                "type"   : "NOT_NULL"
                            }
                        ]
                    }
                ]
            },
            {
                "name"  : "Files",
                "pk"    : "id",
                "constraint" :
                [
                    {
                        "type"   : "FOREIGN_KEY",
                        "target" : "parent_dir",
                        "rules"  :
                        {
                            "references" : { "table" : "Dirs", "field" : "id" },
                            "on_update" : "cascade",
                            "on_delete" : "cascade" 
                        }
                    }
                ],
                "field" :
                [
                    {
                        "name" : "id",
                        "type" : "INTEGERR",
                        "size" : "",
                        "constraint" :
                        [
                            {
                                "target" : "id",
                                "type"   : "AUTO_INCREMENT"
                            }
                        ]
                    },
                    {
                        "name" : "name",
                        "type" : "VARCHAR",
                        "size" : "256",
                        "constraint" :
                        [
                            {
                                "target" : "name",
                                "type"   : "NOT_NULL"
                            }
                        ]
                    },
                    {
                        "name" : "parent_dir",
                        "type" : "INTEGERR",
                        "constraint" :
                        [
                            {
                                "target" : "parent_dir",
                                "type"   : "NOT_NULL"
                            }
                        ]
                    },
                    {
                        "name" : "content",
                        "type" : "MEDIUMTEXT"
                    }                   
                ]
            }             
        ]
    }
}
NOWW;

include "User.php";
include "APIConnection.php";



// - Create conncetion object and user model
$connection = new APIConnection();
$userModel  = new User($connection);

// - Fetch all users from Users table
//$res = $userModel->readAll();

// - Output query result
//print_r($res);
// - Fetch user by id from Users table

$res = $userModel->readById(3);

print_r($res);
//DB::create_model("User", $list);

/*
DB::read_files_by_pr_id(2);
DB::read_project_by_user_id(1);
DB::read_dir_by_pr_id(2);*/
/*
include "apigen.php";

$x = new Req("ff");


$class = $x->generate_class("./src/api/apisrc.txt");

print($class);
*/
//$x->create_filesys_from_map("src/api");

function print_res($r)
{
    //print_r($r);
    foreach($r as $k => $v)
    {
        print($k . " : " . $v);
        print(PHP_EOL);
    }
}