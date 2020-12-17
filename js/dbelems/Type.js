const TYPE_REF =
{
    UNDEFINED   : 0,
    BIT         : 1,   
    BLOB        : 2,         
    CLOB        : 4,
    CHAR        : 8,    
    TEXT        : 16,
    FLOAT       : 32,
    BINARY      : 64,
    DECIMAL     : 128,    
    DOUBLE      : 256,
    INTEGER     : 512,
    VARCHAR     : 1024,        
    BOOLEAN     : 2048,
    LONGTEXT    : 4096,
    VARBINARY   : 8192,   
    MEDIUMTEXT  : 16384,
    DATETIME    : 32768,
    TIMESTAMP   : 65536
}

const typeDict =
{
    0     : "UNDEFINED",
    1     : "BIT", 
    2     : "BLOB",       
    4     : "CLOB",
    8     : "CHAR",    
    16    : "TEXT",
    32    : "FLOAT",
    64    : "BINARY",
    128   : "DECIMAL",   
    256   : "DOUBLE",
    512   : "INTEGER",
    1024  : "VARCHAR",
    2048  : "BOOLEAN",
    4096  : "LONGTEXT",
    8192  : "VARBINARY",
    16384 : "MEDIUMTEXT",
    32768 : "DATETIME",
    65536 : "TIMESTAMP"
};

/**
 * Database field standard type
 */
class Type
{
    /**
     * Creates a new standard type
     * 
     * @param {string} type
     */
    constructor(name)
    {
        this._name = name;
    }

    /**
     * Returns the type name referenced by index key
     * 
     * @param  {number} key
     * @return {string} 
     */    
    static dict(index)
    {
        let retval = "UNDEFINED";

        if (index in typeDict)
            retval = typeDict[index];

        return retval;
    }
    
    /**
     * Returns the integer refernce of the type string
     * 
     * @param  {string} key
     * @return {number} 
     */
    static index(key)
    {
        let retval = 0;

        if (key in TYPE_REF)
            retval = TYPE_REF[key];

        return retval;
    }    
}

export { Type }