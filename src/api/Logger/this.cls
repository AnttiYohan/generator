{
    "class" : 
    {
        "name" : "Logger",
        "const" : 
        [
            { 
                "name"       : "FILE",
                "visibility" : "protected",
                "value"      : "log.txt"
            }    
        ],
        "method" :
        [
            {
                "visibility" : "public",
                "scope"      : "static",
                "name"       : "errlog",
                "params"     : 
                [
                    "e", "f", "l"
                ]
            },
            {
                "visibility" : "public",
                "scope"      : "static",
                "name"       : "errstr",
                "params"     : 
                [
                    "e", "f", "l"
                ]
            },          
            {
                "visibility" : "public",
                "scope"      : "static",
                "name"       : "errmsg",
                "params"     : 
                [
                    "e", "f", "l"
                ]
            }
        ]
    }
}