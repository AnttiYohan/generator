import { Reference } from "./Reference";
import { Action } from "./Action";

const CONSTRAINT_REF =
{
    NONE           : 0,
    CHECK          : 1,    
    INDEX          : 2,
    UNIQUE         : 4,
    DEFAULT        : 8,    
    NOT_NULL       : 16,  
    PRIMARY_KEY    : 32,
    FOREIGN_KEY    : 64,
    AUTO_INCREMENT : 128    
}
const constraintDict =
{
    0   : "NONE",
    1   : "CHECK",
    2   : "INDEX",
    4   : "UNIQUE",
    8   : "DEFAULT",
    16  : "NOT NULL",
    32  : "PRIMARY KEY",
    64  : "FOREIGN KEY",
    128 : "AUTO_INCREMENT"
};

/**
 * Database constraint
 */
class Constraint
{
    /**
     * Creates a new constraint
     * Target may ne a table of a field name
     * 
     * @param {string} type
     * @param {string} targetTable
     * @param {string} targetField
     */
    constructor(type, targetTable = "", targetField = "")
    {
        this._apiId       = 0;
        this._type        = type;
        this._targetTable = targetTable;
        this._targetField = targetField;
    }

    /**
     * Returns the index of the instance type
     * 
     * @return {number}
     */
    get ref()
    {
        return CONSTRAINT_REF(this._type);
    }

    /**
     * Returns the value of the type property
     * 
     * @return {string}
     */
    get type()
    {
        return this._type;
    }

    /**
     * Returns the value of the targetTable property
     * 
     * @return {string}
     */
    get targetTable()
    {
        return this._targetTable;
    }

    /**
     * Returns the value of the targetField property
     * 
     * @return {string}
     */
    get targetField()
    {
        return this._targetField;
    }

    /**
     * Returns the value of the apiId property
     * 
     * @return {number}
     */
    get apiId()
    {
        return this._apiId;
    }

    /**
     * Assigns a value into targetTable property
     * 
     * @param  {string}
     */
    set targetTable(value)
    {
        this._targetTable = value;
    }

    /**
     * Assigns a value into targetField property
     * 
     * @param {string}
     */
    set targetField(value)
    {
        this._targetField = value;
    }

    /**
     * Assigns a value into apiId property
     * 
     * @param {number}
     */
    set apiId(value)
    {
        this._apiId = value;
    }

    /**
     * Returns the string representation of the base constraint data as:
     * {constraint type} on {table}::{field}
     * 
     * @return {string}
     */
    toString()
    {
        return `${this._type} on ${this._targetTable}::${this._targetField}`;
    }

    isTableSet()
    {
        return Boolean(this._targetTable.length);
    }

    isFieldSet()
    {
        return Boolean(this._targetField.length);
    }

    /**
     * Returns the type name referenced by index key
     * 
     * @param  {number} index
     * @return {string} 
     */  
    static dict(index)
    {
        let retval = "NONE";

        if (index in constraintDict)
            retval = constraintDict[index];

        return retval;
    }

    /**
     * Returns the integer index of the key string
     * 
     * @param  {string} key
     * @return {number} 
     */    
    static index(key)
    {
        let retval = 0;

        if (key in CONSTRAINT_REF)
            retval = CONSTRAINT_REF[key];

        return retval;
    }

}

/**
 * Auto Increment constraint
 */
class AutoIncrement extends Constraint
{
    constructor(targetTable, targetField, step = 1, apiId = 0)
    {
        super("AUTO_INCREMENT", targetTable, targetField);
        this._step = step;
        this._apiId = apiId;
    }

    set step(value)
    {
        this._step = value;
    }

    get step()
    {
        return this._step;
    }
}

/**
 * CHECK constraint
 */
class Check extends Constraint
{
    constructor(targetTable, targetField, expression, apiId)
    {
        super("CHECK", targetTable, targetField);
        this._expression = expression;
        this._apiId = apiId;
    }

    set expression(value)
    {
        this._condition = value;
    }

    get expression()
    {
        return this._expression;
    }
}

/**
 * NOT NULL constraint
 */
class NotNull extends Constraint
{
    constructor(targetTable, targetField, apiId = 0)
    {
        super("NOT NULL", targetTable, targetField);
        this._apiId = apiId;
    }
}

/**
 * PRIMARY KEY constraint
 */
class PrimaryKey extends Constraint
{
    constructor(targetTable, fieldList, apiId = 0)
    {
        super("PRIMARY KEY", targetTable, fieldList[0]);
        this._fieldList = [];
        if (fieldList.length)
            this.loadFields(fieldList);
        this._apiId = apiId;
    }

    addField(key)
    {
        this._fieldList.push(key);
    }

    loadFields(list)
    {
        for (const key of list)
            this.addField(key);
    }

    field(index)
    {
        return this._fieldList[index];
    }

    get first()
    {
        return this._fieldList[0];
    }

    get fieldList()
    {
        return this._fieldList;
    }

}

/**
 * FOREIGN KEY constraint
 */
class ForeignKey extends Constraint
{
    /**
     * ForeignKey constructor
     * @param {string}    targetTable
     * @param {string}    targetField
     * @param {string}    referenceTable
     * @param {string}    referenceField
     * @param {Action}    onUpdate
     * @param {Action}    onDelete 
     */
    constructor(targetTable, targetField, referenceTable, referenceField, onUpdate, onDelete, apiId = 0)
    {
        super("FOREIGN KEY", targetTable, targetField);
        this._referenceTable = referenceTable;
        this._referenceField = referenceField;
        this._onUpdate  = onUpdate;
        this._onDelete  = onDelete;
        this._apiId = apiId;
    }


    get referenceTable()
    {
        return this._referenceTable;
    }

    get referenceField()
    {
        return this._referenceField;
    }

    get referenceString()
    {
        return `${this._referenceTable}::${this._referenceField}`;
    }

    get onUpdate()
    {
        return this._onUpdate;
    }

    get onDelete()
    {
        return this._onDelete;
    }
}

export { Constraint, NotNull, AutoIncrement, Check, PrimaryKey, ForeignKey, Reference, Action }