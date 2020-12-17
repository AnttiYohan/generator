import
{
    Type
}
from "./Type";

import
{
    Constraint,
    NotNull,
    AutoIncrement,
    Check,
    PrimaryKey,
    ForeignKey,
    Reference,
    Action
}
from "./Constraint";

/**
 * Database table field
 */
class Field
{
    /**
     * Creates a new field
     * 
     * @param {string}  key 
     * @param {string}  type
     * @param {number}  size
     * @param {boolean} notnull
     * @param {string}  defaultValue
     * @param {number}  autoIncrement
     * @param {string}  parent 
     */
    constructor(key, type, size, notnull, defaultValue, autoinc, parent = "")
    {
        this._key            = key;
        this._size           = size;
        this._type           = type;
        this._typeRef        = Type.index(type);
        this._notnull        = notnull;
        this._defaultValue   = defaultValue; 
        this._autoinc        = autoinc;
        this._constraintList = [];
        this._parent         = parent;
        //this.loadConstraints(constraintData);
    }

    setupType(type)
    {
        this._type = type; 
        this._typeRef = Type.index(type);
    }
    
    addConstraint(constraint)
    {
        // - If constraint has no target, assign
        // - this field as its target
        if (!constraint.isTableSet())
        {
            constraint.targetTable = this._parent;
        }

        if (!constraint.isFieldSet())
        {
            constraint.targetField = this._key;
        }

        this._constraintList.push(constraint);
    }

    loadConstraints(list)
    {
        if (Array.isArray(list))
            for (const item of list)
                this.addConstraint(item);

    }

    isParentSet()
    {
        return Boolean(this._parent.length);
    }
    
    get parent()
    {
        return this._parent;
    }

    get constraintList()
    {
        return this._constraintList;
    }

    get constraintAmount()
    {
        return this._constraintList.length;
    }

    get title()
    {
        return this._key;
    }

    get key()
    {
        return this._key;
    }

    get type()
    {
        return this._type;
    }

    get typeRef()
    {
        return this._typeRef;
    }

    get size()
    {
        return this._size;
    }

    get notnull()
    {
        return this._notnull;
    }

    get defaultValue()
    {
        return this._defaultValue;
    }

    get autoinc()
    {
        return this._autoinc;
    }

    set title(value)
    {
        this._key = value;
    }

    set key(value)
    {
        this._key = value;
    }

    set type(value)
    {
        this.setupType(value);
    }

    set size(value)
    {
        this._size = value;
    }

    set notnull(value)
    {
        this._notnull = value;
    }

    set defaultValue(value)
    {
        this._defaultValue = value;
    }

    set autoinc(value)
    {
        this._autoinc = value;
    }

    set parent(value)
    {
        this._parent = value;
    }
        
    static createFromJson(json)
    {
        return new Field
        (
            json.key, 
            json.type, 
            json.size, 
            json.nullable,
            json.defaultValue,
            json.constraintList
        );
    }
}

export 
{
    Field, 
    Type, 
    Constraint, 
    NotNull, 
    AutoIncrement, 
    Check, 
    PrimaryKey, 
    ForeignKey,
    Reference,
    Action
}