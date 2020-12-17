import 
{
    Field,
    Type,
    Constraint,
    NotNull, AutoIncrement, Check, PrimaryKey, ForeignKey,
    Reference,
    Action
}
from "./Field";

/**
 * Database table
 */
class Table
{
    /**
     * Creates a new table
     * 
     * @param {string}       name
     * @param {[Field]}      fieldData
     * @param {[Constraint]} constraintData
     */
    constructor(name, fieldData = [], constraintData = [])
    {
        this._name           = name;
        this._pk             = "";
        this._fieldList      = {};
        this._constraintList = [];
        this._parent         = "";

        if (Array.isArray(fieldData))
        {
            this.loadFields(fieldData);
        }

        if (Array.isArray(constraintData))
        {
            this.loadConstraints(constraintData);
        }
    }

    // ----------------------------------
    // Accessor methods
    // ----------------------------------
    get title()     { return this._name; }
    set title(name) { this._name = name; }    
    get pk()        { return this._pk;  }    
    set pk(key)     { this._pk = key;   } 

    loadFields(fieldList)
    {
        for (const field of fieldList)
        {
            this.addField(field);
        }
    }

    loadConstraints(constraintList)
    {
        for (const constraint of constraintList)
        {
            this.addConstraint(constraint);
        }
    }

    /**
     * Adds a Field to the table
     * 
     * @param  {Field}   field
     * @return {boolean}
     */
    addField(field, rewrite = false)
    {
        let result = false;

        if (rewrite || ! this._fieldList.hasOwnProperty(field.title))
        {
            if ( ! field.isParentSet())
            {
                field.parent = this._name;
            }

            this._fieldList[field.key] = field; 

            result = true;
        }

        return result;
    }


    /**
     * Returns a Field if exists
     * 
     * @param  {string} key
     * @return {Field} 
     */
    getField(key)
    {
        let resultObj = null;

        if (this._fieldList.hasOwnProperty(key))
        {
            resultObj = this._fieldList[key];
        }

        return resultObj;
    }

    /**
     * Adds a Constraint to the table
     * 
     * @param {Constraint} constraint 
     */
    addConstraint(constraint)
    {
        if (!constraint.isTableSet())
        {
            constraint.targetTable = this._name;
        }

        this._constraintList.push(constraint);
    }

    /**
     * Retrieves a Field by key
     * 
     * @param {string} key 
     */
    field(key)
    {
        return this._fieldList[key];
    }

    fieldArray()
    {
        const list = [];

        for (const key in this._fieldList)
        {
            list.push(this._fieldList[key]);
        }

        return list;
    }

    /**
     * Retrieves a Constraint by index
     * 
     * @param {number} index 
     */
    constraint(index)
    {
        return this._constraintList[index];
    }

    get fieldList()
    {
        return this._fieldList;
    }

    get constraintList()
    {
        return this._constraintList;
    }

    get parent()
    {
        return this._parent;
    }

    set parent(parent)
    {
        this._parent = parent;
    }

    static createFromJson(json)
    {
        const table = new Table(json.title);

        if (Array.isArray(json.fields))
            for (const field of json.fields) 
            {
                table.addField(Field.createFromJson(field));
            }

        if (Array.isArray(json.constraints))
            for (const constraint of json.constraints)
            {
                table.addConstraint(new Constraint(constraint.target, constraint.type));
            }

        return table;
    }
}

export 
{ 
    Table, 
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
